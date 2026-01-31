-- =============================================
-- TheON 강릉 - Supabase Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. REGIONS (지역)
-- =============================================
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 데이터
INSERT INTO regions (name, slug, is_active) VALUES
  ('강릉', 'gangneung', true),
  ('속초', 'sokcho', false),
  ('동해', 'donghae', false),
  ('양양', 'yangyang', false),
  ('삼척', 'samcheok', false),
  ('정선', 'jeongseon', false);

-- =============================================
-- 2. CATEGORIES (카테고리)
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 데이터
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('뉴스/현안', 'news', '📰', 1),
  ('정치/행정', 'politics', '🏛️', 2),
  ('경제/산업', 'economy', '💼', 3),
  ('문화/여가', 'culture', '🎭', 4),
  ('생활/정보', 'life', '🏠', 5),
  ('구인/구직', 'jobs', '💼', 6),
  ('커뮤니티', 'community', '💬', 7);

-- =============================================
-- 3. USERS (회원)
-- =============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nickname TEXT,
  profile_image TEXT,
  region_id UUID REFERENCES regions(id),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. TAGS (태그)
-- =============================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 태그
INSERT INTO tags (name, slug) VALUES
  ('#로컬추천', 'local-pick'),
  ('#축제', 'festival'),
  ('#맛집', 'restaurant'),
  ('#관광', 'tourism'),
  ('#행사', 'event');

-- =============================================
-- 5. ARTICLES (콘텐츠)
-- =============================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  source_url TEXT,
  source_name TEXT,
  source_type TEXT DEFAULT 'crawled' CHECK (source_type IN ('crawled', 'original')),
  thumbnail_url TEXT,
  category_id UUID NOT NULL REFERENCES categories(id),
  region_id UUID NOT NULL REFERENCES regions(id),
  author_id UUID REFERENCES users(id),
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_region ON articles(region_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_is_featured ON articles(is_featured) WHERE is_featured = true;
CREATE INDEX idx_articles_is_active ON articles(is_active) WHERE is_active = true;

-- =============================================
-- 6. ARTICLE_TAGS (콘텐츠-태그 연결)
-- =============================================
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- =============================================
-- RLS (Row Level Security) 정책
-- =============================================

-- Regions: 누구나 읽기 가능
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Regions are viewable by everyone" ON regions FOR SELECT USING (true);
CREATE POLICY "Regions are editable by admins" ON regions FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Categories: 누구나 읽기 가능
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories are editable by admins" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Users: 본인 정보만 수정 가능
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Tags: 누구나 읽기 가능
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags are viewable by everyone" ON tags FOR SELECT USING (true);
CREATE POLICY "Tags are editable by editors and admins" ON tags FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('editor', 'admin'))
);

-- Articles: 공개된 것만 읽기, 에디터/관리자만 수정
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles are viewable by everyone" ON articles 
  FOR SELECT USING (is_active = true);
CREATE POLICY "Editors can manage articles" ON articles FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('editor', 'admin'))
);

-- Article Tags: 콘텐츠와 동일한 권한
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Article tags are viewable by everyone" ON article_tags FOR SELECT USING (true);
CREATE POLICY "Editors can manage article tags" ON article_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('editor', 'admin'))
);

-- =============================================
-- Functions
-- =============================================

-- 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_view_count(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE articles SET view_count = view_count + 1 WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 새 사용자 생성 시 users 테이블에 자동 추가
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth 트리거
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
