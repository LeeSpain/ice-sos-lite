-- Drop the existing view since it lacks proper access controls
DROP VIEW IF EXISTS public.communication_metrics_summary;

-- Create a security definer function that returns communication metrics summary
-- This ensures only admins can access the sensitive business metrics
CREATE OR REPLACE FUNCTION public.get_communication_metrics_summary()
RETURNS TABLE (
    date date,
    channel text,
    total_conversations bigint,
    total_messages bigint,
    avg_response_time numeric,
    avg_resolution_time numeric
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT date(uc.created_at) AS date,
         uc.channel,
         count(DISTINCT uc.id) AS total_conversations,
         count(*) AS total_messages,
         avg((EXTRACT(epoch FROM (uc.updated_at - uc.created_at)) / 60)) AS avg_response_time,
         avg((EXTRACT(epoch FROM (uc.updated_at - uc.created_at)) / 60)) AS avg_resolution_time
  FROM unified_conversations uc
  WHERE public.is_admin()
  GROUP BY date(uc.created_at), uc.channel
  ORDER BY 1, 2;
$$;