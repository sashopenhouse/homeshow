-- Migration: Vendor Business Feed moderation
-- Run this in your Supabase SQL Editor if the `vendor_posts` table already
-- exists from an earlier run of supabase_schema.sql.
--
-- Why: the original schema only had ONE SELECT policy on vendor_posts
-- (status = 'approved'), so authenticated admins could not read pending or
-- rejected posts and the moderation queue at /admin/vendor-posts came back empty.
-- RLS policies are OR'd together, so adding an authenticated-only SELECT policy
-- lets admins see everything while the public still only sees approved posts.

CREATE POLICY "Admins can view all vendor posts"
  ON vendor_posts FOR SELECT USING (auth.role() = 'authenticated');
