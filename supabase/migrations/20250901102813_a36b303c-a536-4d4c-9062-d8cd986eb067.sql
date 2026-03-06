-- Enable Supabase Realtime for Live Map tables
-- This allows real-time subscriptions to location and place event updates

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'live_presence'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE live_presence;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'place_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE place_events;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'location_pings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE location_pings;
  END IF;
END $$;

-- Ensure tables have replica identity for realtime updates
ALTER TABLE live_presence REPLICA IDENTITY FULL;
ALTER TABLE place_events REPLICA IDENTITY FULL;
ALTER TABLE location_pings REPLICA IDENTITY FULL;