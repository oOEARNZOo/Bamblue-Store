-- Harden public schema access after Supabase Security Advisor warnings.
-- - Ensure every current public table has RLS enabled.
-- - Remove broad Data API grants and add explicit app grants.
-- - Keep checkout order creation on the existing SECURITY DEFINER RPC path.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
      table_record.schemaname,
      table_record.tablename
    );
  END LOOP;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.products1') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.products1 FROM PUBLIC, anon, authenticated;
    GRANT SELECT ON TABLE public.products1 TO anon, authenticated;
    GRANT INSERT, UPDATE, DELETE ON TABLE public.products1 TO authenticated;
  END IF;

  IF to_regclass('public.orders') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.orders FROM PUBLIC, anon, authenticated;
    GRANT SELECT, UPDATE ON TABLE public.orders TO authenticated;
  END IF;

  IF to_regclass('public.order_items') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.order_items FROM PUBLIC, anon, authenticated;
    GRANT SELECT ON TABLE public.order_items TO authenticated;
  END IF;

  IF to_regclass('public.reviews') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.reviews FROM PUBLIC, anon, authenticated;
    GRANT SELECT ON TABLE public.reviews TO anon, authenticated;
    GRANT INSERT, UPDATE, DELETE ON TABLE public.reviews TO authenticated;
  END IF;

  IF to_regclass('public.review_helpful') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.review_helpful FROM PUBLIC, anon, authenticated;
    GRANT SELECT ON TABLE public.review_helpful TO anon, authenticated;
    GRANT INSERT, DELETE ON TABLE public.review_helpful TO authenticated;
  END IF;

  IF to_regclass('public.admin_users') IS NOT NULL THEN
    REVOKE ALL ON TABLE public.admin_users FROM PUBLIC, anon, authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_users TO authenticated;
  END IF;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.products1') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Public can read storefront products" ON public.products1;
    DROP POLICY IF EXISTS "Admins can manage storefront products" ON public.products1;

    CREATE POLICY "Public can read storefront products"
      ON public.products1 FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF to_regclass('public.products1') IS NOT NULL AND to_regclass('public.admin_users') IS NOT NULL THEN
    CREATE POLICY "Admins can manage storefront products"
      ON public.products1 FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.admin_users
          WHERE admin_users.user_id = (SELECT auth.uid())
            AND admin_users.is_admin = true
        ) OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
        COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.admin_users
          WHERE admin_users.user_id = (SELECT auth.uid())
            AND admin_users.is_admin = true
        ) OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
        COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
      );
  END IF;

  IF to_regclass('public.reviews') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
    DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
    DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
    DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

    CREATE POLICY "Anyone can view approved reviews"
      ON public.reviews FOR SELECT
      TO anon, authenticated
      USING (is_approved = true);

    CREATE POLICY "Users can create reviews"
      ON public.reviews FOR INSERT
      TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);

    CREATE POLICY "Users can update their own reviews"
      ON public.reviews FOR UPDATE
      TO authenticated
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);

    CREATE POLICY "Users can delete their own reviews"
      ON public.reviews FOR DELETE
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF to_regclass('public.review_helpful') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Anyone can view helpful votes" ON public.review_helpful;
    DROP POLICY IF EXISTS "Users can mark reviews as helpful" ON public.review_helpful;
    DROP POLICY IF EXISTS "Users can delete their helpful votes" ON public.review_helpful;

    CREATE POLICY "Anyone can view helpful votes"
      ON public.review_helpful FOR SELECT
      TO anon, authenticated
      USING (true);

    CREATE POLICY "Users can mark reviews as helpful"
      ON public.review_helpful FOR INSERT
      TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);

    CREATE POLICY "Users can delete their helpful votes"
      ON public.review_helpful FOR DELETE
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;
END;
$$;

DO $$
DECLARE
  sequence_record RECORD;
BEGIN
  FOR sequence_record IN
    SELECT sequence_schema, sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  LOOP
    EXECUTE format(
      'REVOKE ALL ON SEQUENCE %I.%I FROM PUBLIC, anon, authenticated',
      sequence_record.sequence_schema,
      sequence_record.sequence_name
    );
    EXECUTE format(
      'GRANT USAGE, SELECT ON SEQUENCE %I.%I TO authenticated',
      sequence_record.sequence_schema,
      sequence_record.sequence_name
    );
  END LOOP;
END;
$$;

DO $$
BEGIN
  IF to_regprocedure('public.increment_helpful_count(UUID)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.increment_helpful_count(UUID) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.increment_helpful_count(UUID) TO authenticated;
  END IF;

  IF to_regprocedure('public.decrement_helpful_count(UUID)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.decrement_helpful_count(UUID) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.decrement_helpful_count(UUID) TO authenticated;
  END IF;

  IF to_regprocedure('public.get_product_rating(INTEGER)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.get_product_rating(INTEGER) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.get_product_rating(INTEGER) TO anon, authenticated;
  END IF;

  IF to_regprocedure('public.get_review_count(INTEGER)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.get_review_count(INTEGER) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.get_review_count(INTEGER) TO anon, authenticated;
  END IF;

  IF to_regprocedure('public.has_user_reviewed(INTEGER, UUID)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.has_user_reviewed(INTEGER, UUID) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.has_user_reviewed(INTEGER, UUID) TO authenticated;
  END IF;

  IF to_regprocedure('public.has_user_marked_helpful(UUID, UUID)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.has_user_marked_helpful(UUID, UUID) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.has_user_marked_helpful(UUID, UUID) TO authenticated;
  END IF;

  IF to_regprocedure('public.create_checkout_order(JSONB, JSONB, TEXT)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.create_checkout_order(JSONB, JSONB, TEXT) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.create_checkout_order(JSONB, JSONB, TEXT) TO authenticated;
  END IF;

  IF to_regprocedure('public.create_checkout_order(JSONB, JSONB, TEXT, TEXT)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.create_checkout_order(JSONB, JSONB, TEXT, TEXT) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.create_checkout_order(JSONB, JSONB, TEXT, TEXT) TO authenticated;
  END IF;

  IF to_regprocedure('public.confirm_order_payment(UUID, JSONB, BOOLEAN)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.confirm_order_payment(UUID, JSONB, BOOLEAN) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.confirm_order_payment(UUID, JSONB, BOOLEAN) TO authenticated;
  END IF;
END;
$$;

NOTIFY pgrst, 'reload schema';
