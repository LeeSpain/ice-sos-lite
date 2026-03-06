-- ============================================================
-- Automation Runner Cron Schedule
-- ============================================================
-- This migration sets up pg_cron jobs to call automation-runner
-- every 15 minutes and daily cleanup tasks.
--
-- REQUIREMENTS:
--   1. Enable pg_cron extension in your Supabase project dashboard:
--      Database -> Extensions -> pg_cron (enable it)
--   2. Set CRON_SECRET in Supabase Edge Function secrets:
--      Dashboard -> Edge Functions -> Manage secrets -> CRON_SECRET
--   3. Replace <YOUR_SUPABASE_URL> and <YOUR_CRON_SECRET> below,
--      OR set them as Supabase Vault secrets and reference them.
--
-- To run ad-hoc: SELECT cron.schedule(...)
-- To list jobs:  SELECT * FROM cron.job;
-- To remove:     SELECT cron.unschedule(<job_id>);
-- ============================================================

-- Enable pg_cron if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net for HTTP calls from cron
CREATE EXTENSION IF NOT EXISTS pg_net;

-- --------------------------------------------------------
-- 1. Run automation-runner every 15 minutes
--    Processes: email queue, social posting queue,
--    followup sequences, and Riven feedback metrics
-- --------------------------------------------------------
SELECT cron.schedule(
  'automation-runner-every-15min',   -- unique job name
  '*/15 * * * *',                    -- every 15 minutes
  $$
  SELECT net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/automation-runner',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'x-cron-secret', current_setting('app.cron_secret')
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- --------------------------------------------------------
-- 2. Daily inactive user check at 02:00 UTC
--    Triggers re-engagement emails for inactive users
-- --------------------------------------------------------
SELECT cron.schedule(
  'automation-triggers-inactive-check-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/automation-triggers',
    headers := jsonb_build_object(
      'Content-Type',   'application/json',
      'apikey',         current_setting('app.service_role_key')
    ),
    body    := '{"event":"user_inactive_check"}'::jsonb
  );
  $$
);

-- --------------------------------------------------------
-- HOW TO SET app.supabase_url AND app.cron_secret
-- Run these once in the SQL editor (replace values):
-- --------------------------------------------------------
-- ALTER DATABASE postgres SET app.supabase_url = 'https://YOUR_REF.supabase.co';
-- ALTER DATABASE postgres SET app.cron_secret  = 'YOUR_CRON_SECRET_VALUE';
-- ALTER DATABASE postgres SET app.service_role_key = 'YOUR_SERVICE_ROLE_KEY';
--
-- After setting, reconnect to the DB for settings to take effect.
-- --------------------------------------------------------

-- --------------------------------------------------------
-- 3. Create marketing-images Storage bucket for content-generator
--    The content-generator function uploads AI-generated images here
--    instead of storing raw base64 in the database.
-- --------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketing-images',
  'marketing-images',
  true,
  10485760,   -- 10 MB max per image
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow the service role to upload to marketing-images
CREATE POLICY "Service role can upload marketing images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'marketing-images');

-- Allow anyone to read marketing images (they are public)
CREATE POLICY "Public can read marketing images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'marketing-images');

-- --------------------------------------------------------
-- Verify scheduled jobs were created
-- --------------------------------------------------------
-- SELECT jobid, jobname, schedule, command, active
-- FROM cron.job
-- ORDER BY jobid;
