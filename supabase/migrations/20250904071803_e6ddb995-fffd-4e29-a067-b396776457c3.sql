-- Enable realtime for regional emergency tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'regional_sos_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE regional_sos_events;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'family_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE family_notifications;
  END IF;
END $$;

-- Set REPLICA IDENTITY FULL for real-time updates
ALTER TABLE regional_sos_events REPLICA IDENTITY FULL;
ALTER TABLE family_notifications REPLICA IDENTITY FULL;