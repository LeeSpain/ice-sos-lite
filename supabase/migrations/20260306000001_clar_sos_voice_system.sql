-- Clar AI Voice System: SOS Incident Tracking + Emergency Contact Preferences
-- Migration: 20260306000001

-- 1. Add notification/call preference toggles to emergency_contacts
ALTER TABLE emergency_contacts
  ADD COLUMN IF NOT EXISTS allow_calls boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_notifications boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN emergency_contacts.allow_calls IS 'If true, Clar will call this contact during an SOS emergency';
COMMENT ON COLUMN emergency_contacts.allow_notifications IS 'If true, contact receives push notification and WhatsApp message during SOS';

-- 2. SOS Incidents - one row per emergency activation
-- Drop old table if it exists with the legacy schema (calls_initiated, triggered_via, etc.)
DROP TABLE IF EXISTS sos_incidents CASCADE;

CREATE TABLE sos_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE,
  triggered_at timestamptz NOT NULL DEFAULT now(),
  trigger_method text NOT NULL DEFAULT 'app_button', -- 'app_button' | 'pendant'
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
  situation_summary text,
  member_call_sid text, -- Twilio call SID for the member's call
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Incident Contacts - which contacts were reached and their response
CREATE TABLE IF NOT EXISTS incident_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid REFERENCES sos_incidents(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES emergency_contacts(id) ON DELETE SET NULL,
  contact_phone text NOT NULL,
  contact_name text NOT NULL,
  notified_at timestamptz NOT NULL DEFAULT now(),
  notification_methods text[] NOT NULL DEFAULT '{}', -- ['call', 'whatsapp', 'push']
  call_sid text,
  response_status text NOT NULL DEFAULT 'notified' CHECK (
    response_status IN ('notified', 'no_answer', 'on_route', 'arrived', 'declined')
  ),
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Incident Timeline - full event log per incident
CREATE TABLE IF NOT EXISTS incident_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid REFERENCES sos_incidents(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'sos_triggered' | 'clar_called_member' | 'clar_connected' | 'false_alarm' | 'escalated' | 'contact_called' | 'contact_answered' | 'contact_confirmed_route' | 'contact_arrived' | 'resolved'
  event_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Add new keys to ai_model_settings via seed (handled in edge function defaults)
-- These will be inserted if not present:
-- voice_persona, false_alarm_timeout_seconds, context_prompts

-- RLS Policies

ALTER TABLE sos_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_timeline ENABLE ROW LEVEL SECURITY;

-- Members can view their own incidents
DROP POLICY IF EXISTS "members_view_own_incidents" ON sos_incidents;
CREATE POLICY "members_view_own_incidents"
  ON sos_incidents FOR SELECT
  USING (auth.uid() = member_id);

-- Service role can do everything (edge functions use service role)
DROP POLICY IF EXISTS "service_role_all_incidents" ON sos_incidents;
CREATE POLICY "service_role_all_incidents"
  ON sos_incidents FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_incident_contacts" ON incident_contacts;
CREATE POLICY "service_role_all_incident_contacts"
  ON incident_contacts FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_incident_timeline" ON incident_timeline;
CREATE POLICY "service_role_all_incident_timeline"
  ON incident_timeline FOR ALL
  USING (auth.role() = 'service_role');

-- Members can view timeline for their incidents
DROP POLICY IF EXISTS "members_view_own_timeline" ON incident_timeline;
CREATE POLICY "members_view_own_timeline"
  ON incident_timeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sos_incidents
      WHERE sos_incidents.id = incident_timeline.incident_id
      AND sos_incidents.member_id = auth.uid()
    )
  );

-- Members can view their own incident contacts
DROP POLICY IF EXISTS "members_view_own_incident_contacts" ON incident_contacts;
CREATE POLICY "members_view_own_incident_contacts"
  ON incident_contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sos_incidents
      WHERE sos_incidents.id = incident_contacts.incident_id
      AND sos_incidents.member_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sos_incidents_member_id ON sos_incidents(member_id);
CREATE INDEX IF NOT EXISTS idx_sos_incidents_status ON sos_incidents(status);
CREATE INDEX IF NOT EXISTS idx_incident_contacts_incident_id ON incident_contacts(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_timeline_incident_id ON incident_timeline(incident_id);

-- Updated_at trigger for sos_incidents
CREATE OR REPLACE FUNCTION update_sos_incident_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sos_incidents_updated_at ON sos_incidents;
CREATE TRIGGER sos_incidents_updated_at
  BEFORE UPDATE ON sos_incidents
  FOR EACH ROW EXECUTE FUNCTION update_sos_incident_updated_at();
