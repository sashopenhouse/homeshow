-- Admin sign-up with approval.
--
-- Until now every policy granted admin access to anyone who was signed in
-- (auth.role() = 'authenticated'). With public sign-up that would hand the
-- admin area to anyone, so this migration:
--   1. Adds admin_users, one row per auth user, with an `approved` flag.
--   2. Creates a row automatically (approved = false) whenever someone signs up.
--   3. Marks every account that already exists as approved.
--   4. Rewrites every public-schema policy that checked "is signed in" to check
--      public.is_admin() (signed in AND approved) instead.
--
-- Safe to re-run.

-- 1. Approval table ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER so policies on admin_users itself can call it without recursing.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND approved
  );
$$;

DROP POLICY IF EXISTS "Users can read their own admin status" ON admin_users;
DROP POLICY IF EXISTS "Admins can read all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can delete admin users" ON admin_users;

CREATE POLICY "Users can read their own admin status"
  ON admin_users FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can read all admin users"
  ON admin_users FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update admin users"
  ON admin_users FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete admin users"
  ON admin_users FOR DELETE USING (public.is_admin());
-- No INSERT policy: rows are only created by the trigger below.

-- 2. New sign-ups start unapproved -----------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_users (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();

-- 3. Existing accounts keep their access -----------------------------------
INSERT INTO admin_users (user_id, email, approved, approved_at)
SELECT id, email, true, now() FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 4. Swap "signed in" for "approved admin" in every existing policy --------
DO $$
DECLARE
  p RECORD;
  new_qual TEXT;
  new_check TEXT;
  stmt TEXT;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (qual LIKE '%auth.role()%' OR with_check LIKE '%auth.role()%')
  LOOP
    new_qual := regexp_replace(p.qual, '\(?auth\.role\(\) = ''authenticated''::text\)?', 'public.is_admin()', 'g');
    new_check := regexp_replace(p.with_check, '\(?auth\.role\(\) = ''authenticated''::text\)?', 'public.is_admin()', 'g');

    stmt := format('ALTER POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
    IF new_qual IS NOT NULL THEN
      stmt := stmt || format(' USING (%s)', new_qual);
    END IF;
    IF new_check IS NOT NULL THEN
      stmt := stmt || format(' WITH CHECK (%s)', new_check);
    END IF;

    RAISE NOTICE '%', stmt;
    EXECUTE stmt;
  END LOOP;
END $$;

-- Older schema versions left a few admin actions open to everyone; lock them
-- down and make sure each admin action has an admin-only policy.
DROP POLICY IF EXISTS "Posts are insertable by everyone" ON posts;
DROP POLICY IF EXISTS "Posts are insertable by admins" ON posts;
DROP POLICY IF EXISTS "Posts are deletable by admins" ON posts;
CREATE POLICY "Posts are insertable by admins" ON posts FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Posts are deletable by admins" ON posts FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Sponsors are insertable by everyone" ON sponsors;
DROP POLICY IF EXISTS "Sponsors are deletable by everyone" ON sponsors;
DROP POLICY IF EXISTS "Sponsors are insertable by admins" ON sponsors;
DROP POLICY IF EXISTS "Sponsors are deletable by admins" ON sponsors;
CREATE POLICY "Sponsors are insertable by admins" ON sponsors FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Sponsors are deletable by admins" ON sponsors FOR DELETE USING (public.is_admin());

-- Check: this should list no policy that still uses auth.role().
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
