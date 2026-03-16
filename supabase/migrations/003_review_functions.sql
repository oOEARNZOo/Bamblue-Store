-- สร้าง Functions สำหรับจัดการ helpful_count

-- Function: เพิ่ม helpful_count
CREATE OR REPLACE FUNCTION increment_helpful_count(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE reviews 
  SET helpful_count = helpful_count + 1
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: ลด helpful_count
CREATE OR REPLACE FUNCTION decrement_helpful_count(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE reviews 
  SET helpful_count = GREATEST(helpful_count - 1, 0)
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: คำนวณคะแนนเฉลี่ยของสินค้า
CREATE OR REPLACE FUNCTION get_product_rating(product_id INTEGER)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  SELECT COALESCE(AVG(rating), 0) INTO avg_rating
  FROM reviews
  WHERE product_id = product_id
  AND is_approved = TRUE;
  
  RETURN ROUND(avg_rating, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: นับจำนวนรีวิวของสินค้า
CREATE OR REPLACE FUNCTION get_review_count(product_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  review_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO review_count
  FROM reviews
  WHERE product_id = product_id
  AND is_approved = TRUE;
  
  RETURN review_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: ตรวจสอบว่าผู้ใช้รีวิวสินค้านี้หรือยัง
CREATE OR REPLACE FUNCTION has_user_reviewed(product_id_param INTEGER, user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_reviewed BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM reviews
    WHERE product_id = product_id_param
    AND user_id = user_id_param
  ) INTO has_reviewed;
  
  RETURN has_reviewed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: ตรวจสอบว่าผู้ใช้กด "ช่วยเหลือ" รีวิวนี้หรือยัง
CREATE OR REPLACE FUNCTION has_user_marked_helpful(review_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_marked BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM review_helpful
    WHERE review_id = review_id_param
    AND user_id = user_id_param
  ) INTO has_marked;
  
  RETURN has_marked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions สำหรับ Functions
GRANT EXECUTE ON FUNCTION increment_helpful_count TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_helpful_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_rating TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_review_count TO authenticated, anon;
GRANT EXECUTE ON FUNCTION has_user_reviewed TO authenticated, anon;
GRANT EXECUTE ON FUNCTION has_user_marked_helpful TO authenticated, anon;

-- Comment สำหรับ documentation
COMMENT ON FUNCTION increment_helpful_count IS 'เพิ่มจำนวนคนกด "ช่วยเหลือ" รีวิว';
COMMENT ON FUNCTION decrement_helpful_count IS 'ลดจำนวนคนกด "ช่วยเหลือ" รีวิว';
COMMENT ON FUNCTION get_product_rating IS 'คำนวณคะแนนเฉลี่ยของสินค้า';
COMMENT ON FUNCTION get_review_count IS 'นับจำนวนรีวิวของสินค้า';
COMMENT ON FUNCTION has_user_reviewed IS 'ตรวจสอบว่าผู้ใช้รีวิวสินค้านี้หรือยัง';
COMMENT ON FUNCTION has_user_marked_helpful IS 'ตรวจสอบว่าผู้ใช้กด "ช่วยเหลือ" รีวิวนี้หรือยัง';
