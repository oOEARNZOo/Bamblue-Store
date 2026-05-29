-- Keep checkout totals aligned with product cards/details by using the same sale-price formula.

CREATE OR REPLACE FUNCTION create_checkout_order(
  p_items JSONB,
  p_customer JSONB,
  p_payment_method TEXT,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_order_id UUID;
  v_order_number TEXT;
  v_subtotal NUMERIC(10, 2) := 0;
  v_shipping_fee NUMERIC(10, 2) := 0;
  v_total NUMERIC(10, 2) := 0;
  v_unit_price NUMERIC(10, 2) := 0;
  v_item RECORD;
  v_product RECORD;
  v_existing_order RECORD;
  v_available_stock INTEGER;
  v_new_size_stock JSONB;
  v_uses_size_stock BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_idempotency_key IS NULL OR p_idempotency_key !~ '^[a-zA-Z0-9_-]{8,120}$' THEN
    RAISE EXCEPTION 'Invalid checkout request';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(v_user_id::TEXT), hashtext(p_idempotency_key));

  SELECT id, order_number, subtotal, shipping_fee, total, payment_method, status
  INTO v_existing_order
  FROM orders
  WHERE user_id = v_user_id
    AND idempotency_key = p_idempotency_key
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'id', v_existing_order.id,
      'order_number', v_existing_order.order_number,
      'subtotal', v_existing_order.subtotal,
      'shipping_fee', v_existing_order.shipping_fee,
      'total', v_existing_order.total,
      'payment_method', v_existing_order.payment_method,
      'status', v_existing_order.status,
      'idempotent', true
    );
  END IF;

  IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  IF p_payment_method NOT IN ('qr', 'cod') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  IF COALESCE(p_customer ->> 'email', '') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;

  IF length(trim(COALESCE(p_customer ->> 'first_name', ''))) < 2 THEN
    RAISE EXCEPTION 'First name is required';
  END IF;

  IF length(trim(COALESCE(p_customer ->> 'last_name', ''))) < 1 THEN
    RAISE EXCEPTION 'Last name is required';
  END IF;

  IF length(trim(COALESCE(p_customer ->> 'shipping_address', ''))) < 10 THEN
    RAISE EXCEPTION 'Shipping address is too short';
  END IF;

  IF length(trim(COALESCE(p_customer ->> 'shipping_province', ''))) < 1 THEN
    RAISE EXCEPTION 'Shipping province is required';
  END IF;

  IF COALESCE(p_customer ->> 'shipping_zipcode', '') !~ '^[0-9]{5}$' THEN
    RAISE EXCEPTION 'Invalid zipcode';
  END IF;

  IF COALESCE(p_customer ->> 'phone', '') !~ '^0[0-9]{9}$' THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;

  CREATE TEMP TABLE IF NOT EXISTS checkout_items_tmp (
    product_id INTEGER NOT NULL,
    size TEXT NOT NULL,
    quantity INTEGER NOT NULL
  ) ON COMMIT DROP;

  TRUNCATE checkout_items_tmp;

  INSERT INTO checkout_items_tmp (product_id, size, quantity)
  SELECT
    product_id,
    upper(COALESCE(size, 'M')),
    SUM(quantity)::INTEGER
  FROM jsonb_to_recordset(p_items) AS item(product_id INTEGER, size TEXT, quantity INTEGER)
  GROUP BY product_id, upper(COALESCE(size, 'M'));

  IF EXISTS (
    SELECT 1
    FROM checkout_items_tmp
    WHERE product_id IS NULL
      OR product_id <= 0
      OR quantity IS NULL
      OR quantity <= 0
      OR quantity > 99
      OR size NOT IN ('S', 'M', 'L', 'XL')
  ) THEN
    RAISE EXCEPTION 'Invalid cart item';
  END IF;

  FOR v_item IN
    SELECT product_id, size, quantity
    FROM checkout_items_tmp
    ORDER BY product_id, size
  LOOP
    SELECT id, "nameEN", "nameTH", image, price, discount_percent, stock, size_stock
    INTO v_product
    FROM products1
    WHERE id = v_item.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_item.product_id;
    END IF;

    v_uses_size_stock := (
      COALESCE((COALESCE(v_product.size_stock, '{}'::jsonb) ->> 'S')::INTEGER, 0) +
      COALESCE((COALESCE(v_product.size_stock, '{}'::jsonb) ->> 'M')::INTEGER, 0) +
      COALESCE((COALESCE(v_product.size_stock, '{}'::jsonb) ->> 'L')::INTEGER, 0) +
      COALESCE((COALESCE(v_product.size_stock, '{}'::jsonb) ->> 'XL')::INTEGER, 0)
    ) > 0 AND COALESCE(v_product.size_stock, '{}'::jsonb) ? v_item.size;

    IF v_uses_size_stock THEN
      v_available_stock := COALESCE((COALESCE(v_product.size_stock, '{}'::jsonb) ->> v_item.size)::INTEGER, 0);
    ELSE
      v_available_stock := COALESCE(v_product.stock, 0);
    END IF;

    IF v_available_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for % size %. Available: %',
        v_product."nameEN", v_item.size, v_available_stock;
    END IF;

    v_unit_price := CASE
      WHEN COALESCE(v_product.discount_percent, 0) > 0 THEN
        round(COALESCE(v_product.price, 0)::NUMERIC * (1 - COALESCE(v_product.discount_percent, 0)::NUMERIC / 100))
      ELSE COALESCE(v_product.price, 0)::NUMERIC
    END;
    v_subtotal := v_subtotal + (v_unit_price * v_item.quantity);
  END LOOP;

  v_shipping_fee := CASE WHEN v_subtotal > 2000 THEN 0 ELSE 50 END;
  v_total := v_subtotal + v_shipping_fee;
  v_order_number := 'ORD-' || to_char(clock_timestamp(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::TEXT, '-', ''), 1, 10));

  INSERT INTO orders (
    user_id,
    order_number,
    status,
    email,
    first_name,
    last_name,
    phone,
    shipping_address,
    shipping_province,
    shipping_zipcode,
    payment_method,
    subtotal,
    shipping_fee,
    total,
    idempotency_key
  )
  VALUES (
    v_user_id,
    v_order_number,
    'pending',
    lower(trim(p_customer ->> 'email')),
    trim(p_customer ->> 'first_name'),
    trim(p_customer ->> 'last_name'),
    trim(p_customer ->> 'phone'),
    trim(p_customer ->> 'shipping_address'),
    trim(p_customer ->> 'shipping_province'),
    trim(p_customer ->> 'shipping_zipcode'),
    p_payment_method,
    v_subtotal,
    v_shipping_fee,
    v_total,
    p_idempotency_key
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN
    SELECT product_id, size, quantity
    FROM checkout_items_tmp
    ORDER BY product_id, size
  LOOP
    SELECT id, "nameEN", "nameTH", image, price, discount_percent, stock, size_stock
    INTO v_product
    FROM products1
    WHERE id = v_item.product_id
    FOR UPDATE;

    v_unit_price := CASE
      WHEN COALESCE(v_product.discount_percent, 0) > 0 THEN
        round(COALESCE(v_product.price, 0)::NUMERIC * (1 - COALESCE(v_product.discount_percent, 0)::NUMERIC / 100))
      ELSE COALESCE(v_product.price, 0)::NUMERIC
    END;

    INSERT INTO order_items (
      order_id,
      product_id,
      product_name_en,
      product_name_th,
      product_image,
      price,
      quantity,
      size
    )
    VALUES (
      v_order_id,
      v_product.id,
      v_product."nameEN",
      v_product."nameTH",
      v_product.image,
      v_unit_price,
      v_item.quantity,
      v_item.size
    );

    IF p_payment_method = 'cod' THEN
      v_uses_size_stock := (
        COALESCE((COALESCE(v_product.size_stock, '{}'::jsonb) ->> 'S')::INTEGER, 0) +
        COALESCE((COALESCE(v_product.size_stock, '{}'::jsonb) ->> 'M')::INTEGER, 0) +
        COALESCE((COALESCE(v_product.size_stock, '{}'::jsonb) ->> 'L')::INTEGER, 0) +
        COALESCE((COALESCE(v_product.size_stock, '{}'::jsonb) ->> 'XL')::INTEGER, 0)
      ) > 0 AND COALESCE(v_product.size_stock, '{}'::jsonb) ? v_item.size;

      IF v_uses_size_stock THEN
        v_new_size_stock := jsonb_set(
          COALESCE(v_product.size_stock, '{"S": 0, "M": 0, "L": 0, "XL": 0}'::jsonb),
          ARRAY[v_item.size],
          to_jsonb(((COALESCE(v_product.size_stock, '{}'::jsonb) ->> v_item.size)::INTEGER - v_item.quantity)),
          true
        );

        UPDATE products1
        SET
          size_stock = v_new_size_stock,
          stock = GREATEST(COALESCE(stock, 0) - v_item.quantity, 0)
        WHERE id = v_product.id;
      ELSE
        UPDATE products1
        SET stock = GREATEST(COALESCE(stock, 0) - v_item.quantity, 0)
        WHERE id = v_product.id;
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_fee', v_shipping_fee,
    'total', v_total,
    'payment_method', p_payment_method,
    'status', 'pending',
    'idempotent', false
  );
END;
$$;

REVOKE ALL ON FUNCTION create_checkout_order(JSONB, JSONB, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_checkout_order(JSONB, JSONB, TEXT, TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
