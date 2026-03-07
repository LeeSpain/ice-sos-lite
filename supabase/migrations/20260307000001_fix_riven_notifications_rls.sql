-- Fix: riven_notifications RLS was blocking all reads/updates from the frontend.
-- Notifications are inserted without user_id (by edge functions and frontend),
-- so the original policies (auth.uid() = user_id) returned zero rows.
--
-- Replace with open admin policies matching all other riven_* tables.

DROP POLICY IF EXISTS "Users can see own notifications" ON riven_notifications;
DROP POLICY IF EXISTS "Service can insert notifications" ON riven_notifications;
DROP POLICY IF EXISTS "Users can mark own notifications read" ON riven_notifications;

CREATE POLICY "Admin can manage riven_notifications"
  ON riven_notifications FOR ALL
  USING (true);
