-- Cron job setup — skipped if pg_cron not enabled (enable via Supabase Dashboard > Extensions)
DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM 1; -- pg_cron exists, jobs will be set up below
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $cron$;

-- NOTE: Run this manually after enabling pg_cron + pg_net in Supabase Dashboard
-- -- Set up cron job for email scheduler to run every hour
-- SELECT cron.schedule(
--     'email-scheduler-hourly',
--     '0 * * * *', -- every hour at minute 0
--     $$
--     SELECT
--       net.http_post(
--           url:='https://giwutaakuserseigeuch.supabase.co/functions/v1/email-scheduler',
--           headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcm96aWdnYWFsbHR1em95eWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTIwOTIsImV4cCI6MjA2OTQ2ODA5Mn0.B8RH5FtncIduK9XTRNnsMn1PeScam2MFIvqjdOKO6Ds"}'::jsonb,
--           body:='{"trigger": "scheduled"}'::jsonb
--       ) as request_id;
--     $$
-- );