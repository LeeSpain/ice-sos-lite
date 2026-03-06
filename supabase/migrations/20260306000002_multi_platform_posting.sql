-- ============================================================
-- Multi-Platform Posting Schema
-- ============================================================
-- Adds platform-adapted content columns to the posting queue,
-- Instagram Business user ID tracking, a performance index,
-- and a view for per-content cross-platform status.
-- ============================================================

-- Add adapted_text column to social_media_posting_queue
-- Stores the platform-rewritten version of content from platform-content-adapter
ALTER TABLE social_media_posting_queue
  ADD COLUMN IF NOT EXISTS adapted_text TEXT,
  ADD COLUMN IF NOT EXISTS adapted_hashtags TEXT[];

-- Track Instagram Business User ID separately from Facebook User ID
-- This is the IG Business account ID needed for the 2-step container posting API
ALTER TABLE social_media_oauth
  ADD COLUMN IF NOT EXISTS instagram_business_user_id TEXT;

-- Index for faster queue processing: filter by platform + status + scheduled_time
CREATE INDEX IF NOT EXISTS idx_posting_queue_platform_status
  ON social_media_posting_queue(platform, status, scheduled_time);

-- View: per-content cross-platform post status (for UI dashboard widget)
CREATE OR REPLACE VIEW content_platform_status AS
SELECT
  q.content_id,
  q.platform,
  q.status,
  q.posted_at,
  q.platform_post_id,
  q.error_message,
  q.retry_count,
  q.adapted_text,
  q.scheduled_time
FROM social_media_posting_queue q
ORDER BY q.content_id, q.platform;
