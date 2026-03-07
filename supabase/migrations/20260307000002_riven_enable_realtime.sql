-- Enable Supabase Realtime for all riven_* tables
-- Required for live pipeline progress, video job status, and publishing queue updates

ALTER PUBLICATION supabase_realtime ADD TABLE riven_campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE riven_pipeline_stages;
ALTER PUBLICATION supabase_realtime ADD TABLE riven_assets;
ALTER PUBLICATION supabase_realtime ADD TABLE riven_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE riven_video_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE riven_publish_queue;
