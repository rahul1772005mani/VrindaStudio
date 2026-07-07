-- ==========================================
-- VRINDA STUDIO SUPABASE POSTGRESQL SCHEMA
-- Paste this script into your Supabase SQL Editor
-- (Supabase -> Project -> SQL Editor -> New Query)
--
-- NOTE FOR EXISTING TABLES:
-- If you already created the stickers table, run this command to add the imageUrl column:
-- ALTER TABLE stickers ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
-- ==========================================

-- 1. DROP EXISTING TABLES IF MIGRATING
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS stickers;
DROP TABLE IF EXISTS categories;

-- 1.5 CREATE CATEGORIES TABLE
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT
);

-- 2. CREATE STICKERS TABLE
CREATE TABLE stickers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  "bgColor" TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  "originalPrice" INTEGER,
  rating NUMERIC DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 100,
  "isNew" BOOLEAN DEFAULT false,
  "isTrending" BOOLEAN DEFAULT false,
  description TEXT,
  "imageUrl" TEXT,
  "images" TEXT[],
  tags TEXT[]
);

-- 3. CREATE ORDERS TABLE
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  phone TEXT,
  address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  "deliveryCharge" INTEGER NOT NULL,
  total INTEGER NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  status TEXT DEFAULT 'placed',
  date TEXT NOT NULL,
  "courierAgency" TEXT,
  "trackingId" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 CREATE NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SEED INITIAL 20 STICKER ITEMS
INSERT INTO stickers (id, name, emoji, "bgColor", category, price, "originalPrice", rating, reviews, stock, "isNew", "isTrending", description, tags) VALUES
(1, 'LOL Face', '😂', '#FFF9C4', 'Funny', 49, 69, 4.8, 234, 50, false, true, 'Express pure laughter! Perfect for WhatsApp sticker packs. High-quality vinyl sticker.', ARRAY['whatsapp', 'laughter', 'funny']),
(2, 'Rolling Laugh', '🤣', '#FFF3CD', 'Funny', 39, NULL, 4.6, 189, 75, false, true, 'When something is SO funny you fall down laughing!', ARRAY['funny', 'laugh', 'meme']),
(3, 'Party Time!', '🥳', '#F3E5F5', 'Funny', 52, 65, 4.7, 345, 55, true, true, 'Every day is a party with this sticker! Great for birthday cards.', ARRAY['party', 'birthday', 'celebration']),
(4, 'Panda Hug', '🐼', '#E8F5E9', 'Cute', 59, 79, 4.9, 456, 30, true, true, 'Everyone loves a cute panda! Perfect for kids and adults alike.', ARRAY['panda', 'cute', 'animal']),
(5, 'Clever Fox', '🦊', '#FFF3E0', 'Cute', 45, NULL, 4.7, 312, 45, true, false, 'Cute and clever! This fox sticker brings good vibes.', ARRAY['fox', 'cute', 'clever']),
(6, 'Kawaii Cat', '😺', '#FCE4EC', 'Cute', 49, NULL, 4.9, 678, 25, false, true, 'The most loved sticker in our store! Japanese kawaii style cat.', ARRAY['cat', 'kawaii', 'cute', 'japan']),
(7, 'Cherry Blossom', '🌸', '#FCE4EC', 'Anime', 69, 89, 4.9, 567, 20, false, true, 'Inspired by Japanese anime! Beautiful sakura blossom design.', ARRAY['sakura', 'anime', 'japan', 'beautiful']),
(8, 'Ramen Time', '🍜', '#FFF8E1', 'Anime', 55, NULL, 4.5, 234, 60, true, false, 'For anime fans who also love ramen! Naruto vibes.', ARRAY['ramen', 'anime', 'naruto', 'food']),
(9, 'Epic Sword', '⚔️', '#EDE7F6', 'Anime', 75, 99, 4.8, 445, 35, false, true, 'For anime battle fans! Demon Slayer / Sword Art style.', ARRAY['sword', 'battle', 'anime', 'demon slayer']),
(10, 'Blue Butterfly', '🦋', '#E3F2FD', 'Nature', 45, NULL, 4.7, 178, 85, false, false, 'Beautiful blue butterfly in full flight! Nature lover''s dream.', ARRAY['butterfly', 'nature', 'blue', 'beautiful']),
(11, 'Ocean Wave', '🌊', '#E0F7FA', 'Nature', 35, NULL, 4.4, 145, 100, false, false, 'Feel the ocean breeze! Great for beach lovers.', ARRAY['ocean', 'wave', 'beach', 'nature']),
(12, 'Rainbow Joy', '🌈', '#E3F2FD', 'Nature', 45, 55, 4.8, 389, 50, false, true, 'Spread the colors of joy! Makes everything brighter.', ARRAY['rainbow', 'colorful', 'joy', 'nature']),
(13, 'Pizza Lover', '🍕', '#FFF3E0', 'Food', 42, NULL, 4.6, 289, 65, false, true, 'Life is better with pizza! For every pizza lover.', ARRAY['pizza', 'food', 'italian', 'cheese']),
(14, 'Fresh Sushi', '🍣', '#E8F5E9', 'Food', 65, 85, 4.8, 398, 40, true, true, 'Fresh sushi vibes! For Japanese food lovers.', ARRAY['sushi', 'japanese', 'food', 'fish']),
(15, 'King Mango', '🥭', '#FFF8E1', 'Food', 39, NULL, 4.9, 567, 60, true, false, 'India''s favourite fruit! Special Karnataka mango edition.', ARRAY['mango', 'india', 'karnataka', 'fruit']),
(16, 'Football Fan', '⚽', '#E8F5E9', 'Sports', 38, NULL, 4.5, 223, 90, false, false, 'For every football (soccer) fan out there!', ARRAY['football', 'soccer', 'sports', 'game']),
(17, 'Hoop Dreams', '🏀', '#FFF3E0', 'Sports', 38, NULL, 4.4, 167, 85, false, false, 'Basketball sticker for every hoop fan!', ARRAY['basketball', 'NBA', 'sports', 'hoop']),
(18, 'Namma Karnataka', '🏛️', '#FFF3E0', 'Kannada', 79, 99, 5.0, 234, 50, true, true, 'Proud to be from Karnataka! Namma ooru namma style. Special Puttūr edition!', ARRAY['karnataka', 'kannada', 'pride', 'south india']),
(19, 'Jasmine Flower', '🌺', '#FCE4EC', 'Kannada', 55, 69, 4.9, 189, 40, true, true, 'Mallige (Jasmine) - Karnataka''s favourite flower!', ARRAY['jasmine', 'mallige', 'karnataka', 'flower']),
(20, 'Coffee King', '☕', '#EFEBE9', 'Kannada', 45, NULL, 4.8, 345, 70, false, true, 'Coorg coffee is the best! Karnataka is famous for its coffee.', ARRAY['coffee', 'coorg', 'karnataka', 'south india']);

-- 4.5 RESET SEQUENCE FOR AUTO-INCREMENT IDS
-- This ensures postgres sequence generator stays in sync with seed IDs
SELECT setval('stickers_id_seq', (SELECT MAX(id) FROM stickers));

-- 4.6 SEED INITIAL CATEGORIES
INSERT INTO categories (id, name, emoji, color, description) VALUES
('funny', 'Funny', '😂', '#FF6B6B', 'Hilarious stickers'),
('cute', 'Cute', '🐼', '#FF8FAB', 'Adorable stickers'),
('anime', 'Anime', '🌸', '#A78BFA', 'Japanese anime style'),
('nature', 'Nature', '🦋', '#10B981', 'Natural world stickers'),
('food', 'Food', '🍕', '#F59E0B', 'Delicious food stickers'),
('sports', 'Sports', '⚽', '#3B82F6', 'Sports & games stickers'),
('kannada', 'Kannada', '🏛️', '#EF4444', 'Karnataka special stickers'),
('gaming', 'Gaming', '🎮', '#10B981', 'Gaming & console stickers'),
('meme', 'Meme', '🤡', '#F59E0B', 'Internet memes & jokes')
ON CONFLICT (id) DO NOTHING;

-- 5. ENABLE ROW LEVEL SECURITY (RLS) FOR LIVE PROTECTION
-- Allow public select queries for storefront, but secure write operations
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Stickers RLS Policies
CREATE POLICY "Allow public read of stickers" ON stickers FOR SELECT TO public USING (true);
CREATE POLICY "Allow admin write of stickers" ON stickers FOR ALL TO public USING (true); -- simplify for local start, can narrow to admin claim later

-- Orders RLS Policies
CREATE POLICY "Allow public inserts of orders" ON orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow select user orders" ON orders FOR SELECT TO public USING (true);
CREATE POLICY "Allow update of orders" ON orders FOR UPDATE TO public USING (true);

-- Categories RLS Policies
CREATE POLICY "Allow public read of categories" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "Allow admin write of categories" ON categories FOR ALL TO public USING (true);

-- Notifications RLS Policies
CREATE POLICY "Allow public insert of notifications" ON notifications FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow select user notifications" ON notifications FOR SELECT TO public USING (true);
CREATE POLICY "Allow update of notifications" ON notifications FOR UPDATE TO public USING (true);
