-- Add admin RLS policies to profiles table
DROP POLICY IF EXISTS "admin_select_all_profiles" ON public.profiles;
CREATE POLICY "admin_select_all_profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_all_profiles" ON public.profiles;
CREATE POLICY "admin_update_all_profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_all_profiles" ON public.profiles;
CREATE POLICY "admin_delete_all_profiles" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (public.is_admin());