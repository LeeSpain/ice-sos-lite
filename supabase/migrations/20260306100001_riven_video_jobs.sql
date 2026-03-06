-- Riven Phase 2 Prep: Video Jobs table
-- Stores video generation requests and their status

CREATE TABLE IF NOT EXISTS riven_video_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES riven_campaigns(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  video_type TEXT NOT NULL,       -- product_promo | walkthrough | explainer | social_reel | educational | trust | onboarding | announcement
  format TEXT DEFAULT '16:9',     -- 16:9 | 9:16 | 1:1
  duration_target TEXT DEFAULT '60s',  -- 30s | 60s | 90s | 3-5min | 5min+
  source_type TEXT DEFAULT 'brief',    -- brief | url | existing
  source_url TEXT,
  script TEXT,                    -- user brief or generated script
  storyboard JSONB,               -- generated storyboard scenes
  render_config JSONB DEFAULT '{}',    -- remotion/ffmpeg render settings
  status TEXT DEFAULT 'queued'
    CHECK (status IN ('queued','scripting','storyboard','assets','rendering','complete','failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  output_url TEXT,                -- final rendered video URL
  thumbnail_url TEXT,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_riven_video_jobs_campaign_id ON riven_video_jobs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_riven_video_jobs_status ON riven_video_jobs(status);
CREATE INDEX IF NOT EXISTS idx_riven_video_jobs_created_at ON riven_video_jobs(created_at DESC);

CREATE TRIGGER trigger_riven_video_jobs_updated_at
  BEFORE UPDATE ON riven_video_jobs
  FOR EACH ROW EXECUTE FUNCTION update_riven_updated_at();

ALTER TABLE riven_video_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage riven_video_jobs"
  ON riven_video_jobs FOR ALL
  USING (true);
