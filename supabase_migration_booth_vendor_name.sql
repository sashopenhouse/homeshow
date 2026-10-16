-- Migration: store a free-text vendor name on each booth.
-- Run this in your Supabase SQL Editor.
--
-- The admin booth editor lets you type a vendor name instead of picking one
-- from the vendor pool. Before this column existed, that typed name had
-- nowhere to go: the booth was marked 'sold' with vendor_id NULL and the name
-- was lost, so the public map showed the booth as sold with no vendor.
--
-- vendor_name is the display label. When vendor_id is set, the map prefers
-- the linked vendor's company_name and uses this only as a fallback.

ALTER TABLE booths ADD COLUMN IF NOT EXISTS vendor_name TEXT;
