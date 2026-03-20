-- 🚀 Performance Optimization: Database Indexes
-- เพิ่ม Index เพื่อเพิ่มความเร็วในการ Query

-- =============================================
-- 📦 Products Table Indexes
-- =============================================

-- Index สำหรับค้นหาตาม category (ใช้บ่อยในหน้า Products)
CREATE INDEX IF NOT EXISTS idx_products1_category ON products1(category);

-- Index สำหรับเรียงตามราคา
CREATE INDEX IF NOT EXISTS idx_products1_price ON products1(price);

-- Index สำหรับค้นหาตามชื่อ (ใช้ lowercase ตาม Supabase)
CREATE INDEX IF NOT EXISTS idx_products1_name_en ON products1("nameEN");
CREATE INDEX IF NOT EXISTS idx_products1_name_th ON products1("nameTH");

-- Composite Index สำหรับ category + price (ใช้ในการ filter + sort)
CREATE INDEX IF NOT EXISTS idx_products1_category_price ON products1(category, price);

-- =============================================
-- 📋 Orders Table Indexes
-- =============================================

-- Index สำหรับค้นหาตาม user_id (ใช้ในหน้า Order History)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Index สำหรับค้นหาตาม status (ใช้ในหน้า Admin Orders)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Index สำหรับเรียงตามวันที่สร้าง
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Composite Index สำหรับ user_id + status
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- =============================================
-- 📝 Order Items Table Indexes
-- =============================================

-- Index สำหรับค้นหาตาม order_id
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Index สำหรับค้นหาตาม product_id (ใช้ในการตรวจสอบการซื้อก่อนรีวิว)
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- =============================================
-- ⭐ Reviews Table Indexes
-- =============================================

-- Index สำหรับค้นหาตาม product_id (ใช้ในหน้า Product Detail)
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

-- Index สำหรับค้นหาตาม user_id
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Index สำหรับกรองตาม is_approved (ใช้บ่อยมาก)
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);

-- Composite Index สำหรับ product_id + is_approved (ใช้บ่อยที่สุด)
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved ON reviews(product_id, is_approved);

-- Index สำหรับเรียงตามวันที่
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- =============================================
-- 💖 Review Helpful Table Indexes
-- =============================================

-- Index สำหรับค้นหาตาม review_id
CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id ON review_helpful(review_id);

-- Index สำหรับค้นหาตาม user_id
CREATE INDEX IF NOT EXISTS idx_review_helpful_user_id ON review_helpful(user_id);

-- =============================================
-- 📊 Statistics: Analyze Tables
-- =============================================

-- อัปเดต statistics สำหรับ query planner
ANALYZE products1;
ANALYZE orders;
ANALYZE order_items;
ANALYZE reviews;
ANALYZE review_helpful;
