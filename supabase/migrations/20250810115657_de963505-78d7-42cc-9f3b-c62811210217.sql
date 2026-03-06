-- Secure RLS for whatsapp_messages and homepage_analytics

-- 1) Tighten RLS for public.whatsapp_messages
DO $$
DECLARE pol RECORD;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'whatsapp_messages'
  ) THEN
    -- Enable RLS
    EXECUTE 'ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY';

    -- Drop all existing policies to replace with safer ones
    FOR pol IN (
      SELECT policyname FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'whatsapp_messages'
    ) LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.whatsapp_messages', pol.policyname);
    END LOOP;

    -- Create admin-only policy (whatsapp_messages has no user_id column — system/admin access only)
DROP POLICY IF EXISTS "Admin can manage whatsapp messages" ON public.whatsapp_messages;
    CREATE POLICY "Admin can manage whatsapp messages"
      ON public.whatsapp_messages
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 2) Restrict homepage_analytics: admin-only reads, insert allowed (anonymous or authenticated) for event capture
DO $$
DECLARE pol RECORD;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'homepage_analytics'
  ) THEN
    -- Enable RLS
    EXECUTE 'ALTER TABLE public.homepage_analytics ENABLE ROW LEVEL SECURITY';

    -- Drop existing policies to avoid permissive ones
    FOR pol IN (
      SELECT policyname FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'homepage_analytics'
    ) LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.homepage_analytics', pol.policyname);
    END LOOP;

    -- Only admins can select analytics
DROP POLICY IF EXISTS "Admins can read homepage analytics" ON public.homepage_analytics;
    CREATE POLICY "Admins can read homepage analytics"
      ON public.homepage_analytics
      FOR SELECT
      TO authenticated
      USING (public.is_admin());

    -- Allow inserts from unauthenticated visitors (anon) for event capture
DROP POLICY IF EXISTS "Allow anon insert for homepage analytics events" ON public.homepage_analytics;
    CREATE POLICY "Allow anon insert for homepage analytics events"
      ON public.homepage_analytics
      FOR INSERT
      TO anon
      WITH CHECK (true);

    -- Allow inserts from authenticated users as well (e.g. SSR, app users)
DROP POLICY IF EXISTS "Allow authenticated insert for homepage analytics events" ON public.homepage_analytics;
    CREATE POLICY "Allow authenticated insert for homepage analytics events"
      ON public.homepage_analytics
      FOR INSERT
      TO authenticated
      WITH CHECK (true);

    -- Only admins may update/delete (if ever needed)
DROP POLICY IF EXISTS "Admins can update homepage analytics" ON public.homepage_analytics;
    CREATE POLICY "Admins can update homepage analytics"
      ON public.homepage_analytics
      FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete homepage analytics" ON public.homepage_analytics;
    CREATE POLICY "Admins can delete homepage analytics"
      ON public.homepage_analytics
      FOR DELETE
      TO authenticated
      USING (public.is_admin());
  END IF;
END $$;
