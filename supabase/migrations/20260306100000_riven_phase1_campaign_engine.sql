-- Riven Phase 1: Campaign Engine Tables
-- Core tables for the structured campaign flow, pipeline tracking, approval, and notifications

-- Main campaigns table (replaces/extends marketing_campaigns for Riven-specific flow)
CREATE TABLE IF NOT EXISTS riven_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT,
  goal TEXT,
  cta TEXT,
  target_audience TEXT,
  tone TEXT DEFAULT 'professional',
  primary_language TEXT DEFAULT 'en',
  extra_languages TEXT[] DEFAULT '{}',
  output_types TEXT[] DEFAULT '{}',        -- video, social_post, email, blog, ad, thumbnail, etc.
  channels TEXT[] DEFAULT '{}',            -- youtube, instagram, facebook, tiktok, linkedin, email, blog, etc.
  format_preferences JSONB DEFAULT '{}',   -- landscape, portrait, square, short-form, long-form, etc.
  asset_sources JSONB DEFAULT '{}',        -- existing_website, uploaded_images, ai_generated, etc.
  status TEXT DEFAULT 'draft'              -- draft | generating | approval_needed | approved | publishing | published | failed | paused
    CHECK (status IN ('draft','generating','approval_needed','approved','publishing','published','failed','paused')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Pipeline stages for each campaign (visible progress tracking)
CREATE TABLE IF NOT EXISTS riven_pipeline_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES riven_campaigns(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,                -- brief_accepted | script | storyboard | asset_gather | ai_assets | voice | subtitles | render | social_gen | email_gen | qa | approval_ready | publishing | complete
  stage_order INTEGER NOT NULL,
  status TEXT DEFAULT 'pending'            -- pending | running | completed | failed | skipped
    CHECK (status IN ('pending','running','completed','failed','skipped')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  output_summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Generated assets awaiting approval
CREATE TABLE IF NOT EXISTS riven_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES riven_campaigns(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL                 -- video | social_post | email | blog | ad | thumbnail | subtitle | short_clip
    CHECK (asset_type IN ('video','social_post','email','blog','ad','thumbnail','subtitle','short_clip','script','storyboard')),
  platform TEXT,                           -- youtube, instagram, facebook, tiktok, linkedin, email, blog, etc.
  title TEXT,
  content TEXT,                            -- body text / script / copy
  media_url TEXT,                          -- rendered video, image, etc.
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'generating'         -- generating | ready | approved | rejected | published | archived
    CHECK (status IN ('generating','ready','approved','rejected','published','archived')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  published_at TIMESTAMPTZ,
  published_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- In-app notifications for the Riven system
CREATE TABLE IF NOT EXISTS riven_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES riven_campaigns(id) ON DELETE CASCADE,
  type TEXT NOT NULL                       -- generation_started | generation_complete | approval_needed | published | failed | whatsapp_sent
    CHECK (type IN ('generation_started','generation_complete','approval_needed','published','failed','whatsapp_sent','info')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_riven_campaigns_status ON riven_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_riven_campaigns_created_at ON riven_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_riven_pipeline_stages_campaign_id ON riven_pipeline_stages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_riven_assets_campaign_id ON riven_assets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_riven_assets_status ON riven_assets(status);
CREATE INDEX IF NOT EXISTS idx_riven_notifications_user_id ON riven_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_riven_notifications_read ON riven_notifications(read);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_riven_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_riven_campaigns_updated_at
  BEFORE UPDATE ON riven_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_riven_updated_at();

CREATE TRIGGER trigger_riven_pipeline_stages_updated_at
  BEFORE UPDATE ON riven_pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION update_riven_updated_at();

CREATE TRIGGER trigger_riven_assets_updated_at
  BEFORE UPDATE ON riven_assets
  FOR EACH ROW EXECUTE FUNCTION update_riven_updated_at();

-- RLS policies
ALTER TABLE riven_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE riven_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE riven_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE riven_notifications ENABLE ROW LEVEL SECURITY;

-- Admin-only access (service role bypasses RLS)
CREATE POLICY "Admin can manage riven_campaigns"
  ON riven_campaigns FOR ALL
  USING (true);

CREATE POLICY "Admin can manage riven_pipeline_stages"
  ON riven_pipeline_stages FOR ALL
  USING (true);

CREATE POLICY "Admin can manage riven_assets"
  ON riven_assets FOR ALL
  USING (true);

CREATE POLICY "Users can see own notifications"
  ON riven_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications"
  ON riven_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can mark own notifications read"
  ON riven_notifications FOR UPDATE
  USING (auth.uid() = user_id);
