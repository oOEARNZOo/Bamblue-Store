-- สร้างตาราง reviews สำหรับเก็บรีวิวสินค้า
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- ข้อมูลรีวิว
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  
  -- ข้อมูลสินค้า snapshot (กรณีสินค้าถูกแก้ไข)
  product_name_en VARCHAR(255) NOT NULL,
  product_name_th VARCHAR(255),
  product_image TEXT,
  
  -- ข้อมูลผู้รีวิว snapshot
  reviewer_name VARCHAR(100),
  reviewer_email VARCHAR(255),
  
  -- สถานะและเวลา
  is_verified BOOLEAN DEFAULT FALSE, -- ซื้อสินค้าจริงหรือไม่
  is_approved BOOLEAN DEFAULT TRUE, -- อนุมัติแล้วหรือไม่
  helpful_count INTEGER DEFAULT 0, -- จำนวนคนกด "ช่วยเหลือ"
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง Index เพื่อเพิ่มประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);

-- สร้าง Function สำหรับอัพเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- สร้าง Trigger สำหรับตาราง reviews
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- ตั้งค่า Row Level Security (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: ผู้ใช้สามารถดูรีวิวทั้งหมดได้
CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = TRUE);

-- Policy: ผู้ใช้สามารถสร้างรีวิวของตัวเองได้
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: ผู้ใช้สามารถแก้ไขรีวิวของตัวเองได้
CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: ผู้ใช้สามารถลบรีวิวของตัวเองได้
CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- สร้างตาราง review_helpful สำหรับเก็บว่าใครกด "ช่วยเหลือ" รีวิวไหนบ้าง
CREATE TABLE IF NOT EXISTS review_helpful (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id) -- แต่ละคนกด "ช่วยเหลือ" รีวิวเดียวได้ครั้งเดียว
);

-- สร้าง Index สำหรับ review_helpful
CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id ON review_helpful(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_user_id ON review_helpful(user_id);

-- ตั้งค่า RLS สำหรับ review_helpful
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;

-- Policy: ผู้ใช้สามารถดูว่าใครกด "ช่วยเหลือ" ได้
CREATE POLICY "Anyone can view helpful votes"
  ON review_helpful FOR SELECT
  USING (TRUE);

-- Policy: ผู้ใช้สามารถกด "ช่วยเหลือ" ได้
CREATE POLICY "Users can mark reviews as helpful"
  ON review_helpful FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: ผู้ใช้สามารถลบการกด "ช่วยเหลือ" ของตัวเองได้
CREATE POLICY "Users can delete their helpful votes"
  ON review_helpful FOR DELETE
  USING (auth.uid() = user_id);

-- Comment สำหรับ documentation
COMMENT ON TABLE reviews IS 'ตารางเก็บรีวิวสินค้า';
COMMENT ON TABLE review_helpful IS 'ตารางเก็บการกด "ช่วยเหลือ" รีวิว';
COMMENT ON COLUMN reviews.rating IS 'คะแนนรีวิว 1-5 ดาว';
COMMENT ON COLUMN reviews.is_verified IS 'ซื้อสินค้าจริงหรือไม่ (จาก order history)';
COMMENT ON COLUMN reviews.is_approved IS 'อนุมัติให้แสดงรีวิวหรือไม่';

-- ตรวจสอบว่าตารางถูกสร้างแล้ว
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('reviews', 'review_helpful');
