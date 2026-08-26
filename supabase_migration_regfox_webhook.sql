-- Migration: RegFox webhook staging table (Phase 1 of the RegFox integration).
-- Run this in your Supabase SQL Editor.
--
-- New registrations from RegFox land here first, NOT directly in the public
-- `vendors` table. An admin reviews each one on /admin/regfox and clicks
-- "Add to Vendor Pool" to create the real vendor row. This exists because:
--   1. We don't know your RegFox form's exact field labels yet, so the
--      webhook's field-mapping is best-effort/fuzzy on the first pass.
--   2. A test registration, typo, or later-refunded order shouldn't reach
--      the public exhibitor directory unreviewed.
--
-- The webhook handler runs with the Supabase SERVICE ROLE key (server-side
-- only, never exposed to the browser), so it bypasses RLS entirely on
-- INSERT — the RLS policies below only govern who can READ/UPDATE rows
-- from the admin UI.

CREATE TABLE regfox_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity from RegFox — regfox_registrant_id is unique so webhook retries
  -- (RegFox may redeliver on a failed ack) don't create duplicate rows.
  regfox_order_id TEXT,
  regfox_registrant_id TEXT UNIQUE NOT NULL,
  regfox_form_id TEXT,
  event_type TEXT NOT NULL DEFAULT 'registration',

  -- Best-effort field mapping, extracted from the registrant's fieldData by
  -- fuzzy label matching (see src/app/api/regfox-webhook/route.ts). Any of
  -- these can be null if no field label matched — the admin reviews and
  -- corrects from raw_payload before adding to the vendor pool.
  mapped_company_name TEXT,
  mapped_contact_name TEXT,
  mapped_contact_email TEXT,
  mapped_contact_phone TEXT,
  mapped_website_url TEXT,
  mapped_ticket_type TEXT,

  -- Full webhook payload for this registrant, kept so a human can read the
  -- real field labels/values when the fuzzy mapping above misses something.
  raw_payload JSONB NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'added', 'ignored'
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,

  received_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

CREATE INDEX regfox_registrations_status_idx ON regfox_registrations (status, received_at DESC);

ALTER TABLE regfox_registrations ENABLE ROW LEVEL SECURITY;

-- No public SELECT/INSERT policy at all — the table is invisible to the
-- anon key. The webhook route uses the service role key (bypasses RLS);
-- the admin UI reads/writes as an authenticated user.
CREATE POLICY "RegFox registrations are viewable by authenticated users only"
  ON regfox_registrations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "RegFox registrations are updatable by authenticated users only"
  ON regfox_registrations FOR UPDATE USING (auth.role() = 'authenticated');
