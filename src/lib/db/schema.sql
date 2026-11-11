CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
  id VARCHAR(64) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  byte_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  is_draft_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(120) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(64) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  status VARCHAR(30) DEFAULT 'published',
  draft_name VARCHAR(255),
  draft_description TEXT,
  draft_icon VARCHAR(64),
  draft_display_order INTEGER,
  draft_is_visible BOOLEAN,
  has_draft_changes BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resources (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(150) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  description_markdown TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  topic_id VARCHAR(64) NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  tags JSONB DEFAULT '[]'::jsonb,
  source_url TEXT,
  curation_note TEXT,
  download_asset_id VARCHAR(64) REFERENCES assets(id) ON DELETE SET NULL,
  featured_order INTEGER,
  status VARCHAR(30) DEFAULT 'published',
  published_at TIMESTAMP WITH TIME ZONE,
  
  draft_title VARCHAR(255),
  draft_summary TEXT,
  draft_description_markdown TEXT,
  draft_type VARCHAR(50),
  draft_difficulty VARCHAR(50),
  draft_topic_id VARCHAR(64),
  draft_tags JSONB DEFAULT '[]'::jsonb,
  draft_source_url TEXT,
  draft_curation_note TEXT,
  draft_download_asset_id VARCHAR(64),
  draft_featured_order INTEGER,
  has_draft_changes BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chapters (
  id VARCHAR(64) PRIMARY KEY,
  resource_id VARCHAR(64) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  slug VARCHAR(150) NOT NULL,
  title VARCHAR(255) NOT NULL,
  chapter_order INTEGER NOT NULL DEFAULT 1,
  content_markdown TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'published',
  
  draft_title VARCHAR(255),
  draft_content_markdown TEXT,
  draft_chapter_order INTEGER,
  has_draft_changes BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (resource_id, slug)
);

CREATE TABLE IF NOT EXISTS learning_paths (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(150) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  outcome TEXT NOT NULL,
  prerequisites JSONB DEFAULT '[]'::jsonb,
  final_task_title VARCHAR(255) NOT NULL,
  final_task_description TEXT NOT NULL,
  topic_id VARCHAR(64) REFERENCES topics(id) ON DELETE SET NULL,
  featured_order INTEGER,
  status VARCHAR(30) DEFAULT 'published',
  
  draft_title VARCHAR(255),
  draft_summary TEXT,
  draft_outcome TEXT,
  draft_prerequisites JSONB DEFAULT '[]'::jsonb,
  draft_final_task_title VARCHAR(255),
  draft_final_task_description TEXT,
  draft_topic_id VARCHAR(64),
  draft_featured_order INTEGER,
  has_draft_changes BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_path_steps (
  id VARCHAR(64) PRIMARY KEY,
  path_id VARCHAR(64) NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL DEFAULT 1,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  resource_id VARCHAR(64) REFERENCES resources(id) ON DELETE SET NULL,
  external_url TEXT,
  estimated_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pages (
  key VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  published_content JSONB NOT NULL,
  draft_content JSONB NOT NULL,
  status VARCHAR(30) DEFAULT 'published',
  has_draft_changes BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS navigation_items (
  id VARCHAR(64) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  position VARCHAR(30) NOT NULL DEFAULT 'header',
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(64) PRIMARY KEY,
  site_name VARCHAR(255) NOT NULL,
  site_description TEXT NOT NULL,
  logo_url TEXT,
  favicon_url TEXT,
  default_social_image TEXT,
  footer_copy TEXT,
  meta_titles JSONB DEFAULT '{}'::jsonb,
  meta_descriptions JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resources_slug ON resources(slug);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_topic ON resources(topic_id);
CREATE INDEX IF NOT EXISTS idx_chapters_resource_order ON chapters(resource_id, chapter_order);
CREATE INDEX IF NOT EXISTS idx_learning_paths_slug ON learning_paths(slug);
CREATE INDEX IF NOT EXISTS idx_steps_path_order ON learning_path_steps(path_id, step_order);
