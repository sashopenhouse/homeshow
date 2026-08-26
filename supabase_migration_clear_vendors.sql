-- Migration: clear last year's exhibitors so the 2027 plan starts empty.
-- Run this in your Supabase SQL Editor.
--
-- DESTRUCTIVE. This deletes every row in `vendors` and unassigns every booth.
-- The vendors currently in the database are last season's exhibitors, loaded in
-- one batch by supabase_seed_vendors.sql; none of them came from the public
-- apply form, so nothing a real applicant submitted is lost here.
--
-- Booth GEOMETRY is untouched — the 185 booths of the new floor plan stay
-- exactly where they are, they just all go back to "available".
--
-- NOTE: vendor_posts.vendor_id is ON DELETE CASCADE, so if that table exists,
-- any business-feed post tied to a vendor goes with it. Posts with a null
-- vendor_id (submitted by name only) survive. Step 0 shows you the damage
-- before you commit to it.

-- 0. Look before you leap — what is about to be removed.
SELECT
  (SELECT count(*) FROM vendors)                              AS vendors_to_delete,
  (SELECT count(*) FROM booths WHERE vendor_id IS NOT NULL)   AS booths_to_unassign,
  (SELECT count(*) FROM booths)                               AS booths_total_after;

-- 1. Unassign every booth and reset its status. Doing this explicitly (rather
--    than leaning on the ON DELETE SET NULL foreign key) is what clears the
--    'sold' status — the FK would null the vendor but leave the booth looking
--    taken on the map.
UPDATE booths
SET vendor_id = NULL,
    status = 'available',
    updated_at = NOW()
WHERE vendor_id IS NOT NULL OR status <> 'available';

-- 2. Drop the four leftover rows that are not part of the new floor plan.
--    H1, H2 and 34-36 were placeholders invented by the vendor seed for
--    exhibitors that had no booth on the old map; 103-104 sat where the
--    concessions zone now is. All four still draw over real booths.
DELETE FROM booths WHERE booth_number IN ('103-104', 'H1', 'H2', '34-36');

-- 3. Delete the exhibitor records themselves.
DELETE FROM vendors;

-- 4. Confirm: expect 0 vendors, 0 assigned booths, 185 booths remaining.
SELECT
  (SELECT count(*) FROM vendors)                            AS vendors_left,
  (SELECT count(*) FROM booths WHERE vendor_id IS NOT NULL) AS booths_assigned,
  (SELECT count(*) FROM booths)                             AS booths_total;

-- ---------------------------------------------------------------------------
-- Do NOT re-run supabase_seed_vendors.sql after this — it would load the same
-- 114 exhibitors and their booth assignments straight back in.
