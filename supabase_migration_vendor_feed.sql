-- Migration: Vendor Business Feed (vendor_posts)
-- Run this in your Supabase SQL Editor. Safe to re-run: it creates the table
-- if it is missing and (re)creates every policy.
--
-- Vendors submit posts from /vendors/feed/submit; they stay 'pending' until an
-- admin approves them at /admin/vendor-posts. The public only sees approved posts.
-- RLS policies are OR'd together, so the authenticated-only SELECT policy lets
-- admins see pending/rejected posts without exposing them to the public.

CREATE TABLE IF NOT EXISTS vendor_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  vendor_name VARCHAR(255), -- denormalized for display when vendor_id is not set
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  post_type VARCHAR(50) DEFAULT 'update', -- 'update', 'promotion', 'announcement'
  status VARCHAR(20) DEFAULT 'pending',   -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vendor_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved vendor posts are viewable by everyone" ON vendor_posts;
DROP POLICY IF EXISTS "Admins can view all vendor posts" ON vendor_posts;
DROP POLICY IF EXISTS "Anyone can submit a vendor post" ON vendor_posts;
DROP POLICY IF EXISTS "Admins can update vendor posts" ON vendor_posts;
DROP POLICY IF EXISTS "Admins can delete vendor posts" ON vendor_posts;

CREATE POLICY "Approved vendor posts are viewable by everyone"
  ON vendor_posts FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins can view all vendor posts"
  ON vendor_posts FOR SELECT USING (auth.role() = 'authenticated');

-- New posts must start as pending so nobody can publish around moderation.
CREATE POLICY "Anyone can submit a vendor post"
  ON vendor_posts FOR INSERT WITH CHECK (status = 'pending' OR auth.role() = 'authenticated');

CREATE POLICY "Admins can update vendor posts"
  ON vendor_posts FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete vendor posts"
  ON vendor_posts FOR DELETE USING (auth.role() = 'authenticated');

-- Make the API see the table right away.
NOTIFY pgrst, 'reload schema';
