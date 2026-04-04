CREATE TABLE IF NOT EXISTS cms_documents (
  id TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_updates (
  id TEXT PRIMARY KEY,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'acquaintance')),
  is_published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  date_label TEXT NOT NULL,
  zh_text TEXT NOT NULL,
  en_text TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'acquaintance')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  published_at TEXT,
  updated_at TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_zh TEXT NOT NULL,
  excerpt_en TEXT NOT NULL,
  content_zh TEXT NOT NULL,
  content_en TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]'
);
