-- Migration: RegFox field mapping v2.
-- Run this in your Supabase SQL Editor AFTER supabase_migration_regfox_webhook.sql.
--
-- The first-pass mapper matched on field labels from Webconnex's generic
-- sample payload and produced all-NULL mapped_* columns for real Home Show
-- registrations. The mapper now matches on field keys and captures more of
-- the form (see src/lib/regfox-mapper.ts). These columns hold the extras.

ALTER TABLE regfox_registrations
  ADD COLUMN IF NOT EXISTS mapped_address TEXT,
  ADD COLUMN IF NOT EXISTS mapped_booth_choices TEXT[],
  ADD COLUMN IF NOT EXISTS mapped_sponsor_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS mapped_is_sponsor BOOLEAN,
  ADD COLUMN IF NOT EXISTS mapped_returning_vendor BOOLEAN,
  ADD COLUMN IF NOT EXISTS mapped_product_description TEXT,
  ADD COLUMN IF NOT EXISTS mapped_needs_electricity BOOLEAN,
  ADD COLUMN IF NOT EXISTS mapped_outlets_110 INTEGER,
  ADD COLUMN IF NOT EXISTS mapped_outlets_220 INTEGER,
  ADD COLUMN IF NOT EXISTS mapped_notes TEXT,
  ADD COLUMN IF NOT EXISTS order_total NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS regfox_lookup_id TEXT;

-- "Add to Vendor Pool" now carries these over to the vendor record.
ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS booth_choices TEXT[],
  ADD COLUMN IF NOT EXISTS is_sponsor BOOLEAN,
  ADD COLUMN IF NOT EXISTS sponsor_amount NUMERIC(10, 2);
