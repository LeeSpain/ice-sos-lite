-- Riven Phase 3: A/B Variants + Repurpose Jobs
-- Tracks alternative content versions for split testing

CREATE TABLE IF NOT EXISTS riven_ab_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES riven_campaigns(id) ON DELETE CASCADE,
  original_asset_id UUID REFERENCES riven_assets(id) ON DELETE CASCADE,
  variant_asset_id UUID REFERENCES riven_assets(id) ON DELETE SET NULL,
  variant_label TEXT NOT NULL,             -- 'A' | 'B' | 'C' etc.
  hypothesis TEXT,                         -- what difference is being tested
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','running','paused','completed','cancelled')),
  winner_asset_id UUID REFERENCES riven_assets(id) ON DELETE SET NULL,
  -- Performance metrics (populated by analytics ingestion)
  impressions_a INTEGER DEFAULT 0,
  impressions_b INTEGER DEFAULT 0,
  clicks_a INTEGER DEFAULT 0,
  clicks_b INTEGER DEFAULT 0,
  conversions_a INTEGER DEFAULT 0,
  conversions_b INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_riven_ab_variants_campaign  ON riven_ab_variants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_riven_ab_variants_original  ON riven_ab_variants(original_asset_id);
CREATE INDEX IF NOT EXISTS idx_riven_ab_variants_status    ON riven_ab_variants(status);

CREATE TRIGGER trigger_riven_ab_variants_updated_at
  BEFORE UPDATE ON riven_ab_variants
  FOR EACH ROW EXECUTE FUNCTION update_riven_updated_at();

ALTER TABLE riven_ab_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage riven_ab_variants"
  ON riven_ab_variants FOR ALL USING (true);

-- Repurpose jobs: long → short, video → post, blog → social, etc.
CREATE TABLE IF NOT EXISTS riven_repurpose_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES riven_campaigns(id) ON DELETE SET NULL,
  source_asset_id UUID REFERENCES riven_assets(id) ON DELETE SET NULL,
  repurpose_type TEXT NOT NULL,
    -- long_to_short | video_to_post | blog_to_social | email_to_post
    -- post_to_thread | long_to_reel | blog_to_email | ad_to_organic
  target_platform TEXT,                    -- target channel for output
  target_format TEXT,                      -- 9:16 | 16:9 | 1:1 etc.
  instructions TEXT,                       -- additional guidance
  status TEXT DEFAULT 'queued'
    CHECK (status IN ('queued','running','complete','failed')),
  output_asset_id UUID REFERENCES riven_assets(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_riven_repurpose_jobs_campaign ON riven_repurpose_jobs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_riven_repurpose_jobs_status   ON riven_repurpose_jobs(status);

CREATE TRIGGER trigger_riven_repurpose_jobs_updated_at
  BEFORE UPDATE ON riven_repurpose_jobs
  FOR EACH ROW EXECUTE FUNCTION update_riven_updated_at();

ALTER TABLE riven_repurpose_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage riven_repurpose_jobs"
  ON riven_repurpose_jobs FOR ALL USING (true);
