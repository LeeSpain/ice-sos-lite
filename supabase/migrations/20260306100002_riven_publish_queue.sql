-- Riven Phase 2: Publishing Queue
-- Tracks scheduled and published assets across all social/content platforms

CREATE TABLE IF NOT EXISTS riven_publish_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES riven_campaigns(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES riven_assets(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
    -- youtube | instagram | tiktok | linkedin | facebook | twitter | newsletter | blog | instagram_reels
  caption_override TEXT,             -- optional override for the asset content
  hashtags TEXT[],                   -- platform-specific hashtag list
  scheduled_at TIMESTAMPTZ,          -- NULL = publish immediately when triggered
  published_at TIMESTAMPTZ,
  status TEXT DEFAULT 'queued'
    CHECK (status IN ('queued','scheduled','publishing','published','failed','cancelled')),
  platform_post_id TEXT,             -- external ID returned by platform API
  platform_url TEXT,                 -- public URL after publishing
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_riven_publish_queue_campaign_id ON riven_publish_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_riven_publish_queue_asset_id    ON riven_publish_queue(asset_id);
CREATE INDEX IF NOT EXISTS idx_riven_publish_queue_status      ON riven_publish_queue(status);
CREATE INDEX IF NOT EXISTS idx_riven_publish_queue_scheduled   ON riven_publish_queue(scheduled_at);

CREATE TRIGGER trigger_riven_publish_queue_updated_at
  BEFORE UPDATE ON riven_publish_queue
  FOR EACH ROW EXECUTE FUNCTION update_riven_updated_at();

ALTER TABLE riven_publish_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage riven_publish_queue"
  ON riven_publish_queue FOR ALL
  USING (true);

-- Platform connection config (stores per-platform OAuth tokens / API keys)
CREATE TABLE IF NOT EXISTS riven_platform_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  connected BOOLEAN DEFAULT false,
  access_token TEXT,                 -- encrypted in production via Vault
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  account_name TEXT,                 -- e.g. YouTube channel name, Instagram handle
  account_id TEXT,                   -- platform-specific account/channel ID
  scopes TEXT[],
  last_tested_at TIMESTAMPTZ,
  test_status TEXT,                  -- ok | failed | untested
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trigger_riven_platform_connections_updated_at
  BEFORE UPDATE ON riven_platform_connections
  FOR EACH ROW EXECUTE FUNCTION update_riven_updated_at();

ALTER TABLE riven_platform_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage riven_platform_connections"
  ON riven_platform_connections FOR ALL
  USING (true);

-- Seed default platform rows (unconnected)
INSERT INTO riven_platform_connections (platform, display_name, connected) VALUES
  ('youtube',          'YouTube',          false),
  ('instagram',        'Instagram',        false),
  ('instagram_reels',  'Instagram Reels',  false),
  ('tiktok',           'TikTok',           false),
  ('linkedin',         'LinkedIn',         false),
  ('facebook',         'Facebook',         false),
  ('twitter',          'X / Twitter',      false),
  ('newsletter',       'Email Newsletter', false),
  ('blog',             'Blog / Website',   false)
ON CONFLICT (platform) DO NOTHING;
