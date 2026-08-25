-- Migration: carry old merged-booth assignments onto the new plan.
-- Run AFTER supabase_migration_booth_layout_v2.sql, in your Supabase SQL Editor.
--
-- Step 3 of the v2 migration deliberately spared stale booth rows that still had
-- a vendor, so no assignment was lost. Those rows keep their OLD geometry, so the
-- map draws them on top of the new plan — that is the overlapping mess on
-- /vendors/list, not anything to do with the vendors table.
--
-- This script moves each vendor onto the individual booths its old merged label
-- covered ("187-194" becomes booths 187 through 194, all pointing at the same
-- vendor), then deletes the leftover row. Booth numbers that no longer exist on
-- the new plan are listed at the bottom for you to place by hand.

-- 75-78 → 76, 77, 78  (Amber Water Pros)   [75 not on the new plan]
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '75-78'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('76', '77', '78');

-- 82-83 → 82, 83  (C. Michael Exteriors, Inc.)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '82-83'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('82', '83');

-- 151-153 → 151, 152, 153  (Clinton Tractor)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '151-153'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('151', '152', '153');

-- 141-142 → 141, 142  (Clinton Tractor)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '141-142'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('141', '142');

-- 124-125 → 124, 125  (Comfort Windows and Doors)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '124-125'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('124', '125');

-- 63-65 → 63, 64, 65  (Country Suburban)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '63-65'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('63', '64', '65');

-- 94-95 → 94, 95  (Energy Savers)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '94-95'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('94', '95');

-- 79-80 → 79, 80  (Floor and Wall Remedies and More LLC)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '79-80'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('79', '80');

-- 129-130 → 129, 130  (Holbrook Heating Inc.)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '129-130'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('129', '130');

-- 122-123, 143 → 122, 123, 143  (Timberland Fence)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '122-123, 143'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('122', '123', '143');

-- 134-137 → 134, 135, 136, 137  (Java Farm Supply Inc.)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '134-137'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('134', '135', '136', '137');

-- 159-163 → 159, 160, 161, 162, 163  (Joe Tahans Furniture & Ashley Home Store)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '159-163'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('159', '160', '161', '162', '163');

-- 200-201 → 200, 201  (John's Clean-Outs and Property Preservation, Inc.)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '200-201'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('200', '201');

-- 198-199 → 198, 199  (Lowes New Hartford)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '198-199'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('198', '199');

-- 60-62 → 60, 61, 62  (Platinum Epoxy)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '60-62'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('60', '61', '62');

-- 87-88 → 87, 88  (Renewal By Anderson of CNY)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '87-88'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('87', '88');

-- 58-59 → 58, 59  (Standard Heating, Cooling & Insulating)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '58-59'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('58', '59');

-- 85-86 → 85, 86  (Stellar Roofing)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '85-86'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('85', '86');

-- 43-45, 25-27 → 43, 44, 26, 27  (Acme Pool and Spa)   [45, 25 not on the new plan]
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '43-45, 25-27'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('43', '44', '26', '27');

-- 187-194 → 187, 188, 189, 190, 191, 192, 193, 194  (Destination KIA of Utica)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '187-194'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('187', '188', '189', '190', '191', '192', '193', '194');

-- 46-47 → 46, 47  (Fred F. Collis & Sons)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '46-47'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('46', '47');

-- 41-42 → 41, 42  (Solutions Empire LLC)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '41-42'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('41', '42');

-- 195-196 → 195, 196  (Tru-Line Hardwood Flooring)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '195-196'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('195', '196');

-- 17-18 → 17, 18  (W&B New York)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '17-18'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('17', '18');

-- 7-9 → 7, 8, 9  (B&K Fencing)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '7-9'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('7', '8', '9');

-- 5-6 → 5, 6  (CNY's Open House)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '5-6'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('5', '6');

-- 177-179 → 177, 178, 179  (First Source Federal Credit Union (Kids Zone))
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '177-179'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('177', '178', '179');

-- 10-11 → 10, 11  (Home Heat)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '10-11'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('10', '11');

-- 12-13 → 12, 13  (Lincoln Davies)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '12-13'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('12', '13');

-- 3-4 → 3, 4  (Melo Roofing Inc)
UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '3-4'),
                  status = 'sold',
                  updated_at = NOW()
WHERE booth_number IN ('3', '4');

-- Remove the leftover merged rows now that their vendors have been moved.
DELETE FROM booths WHERE booth_number IN ('75-78', '82-83', '151-153', '141-142', '124-125', '63-65', '94-95', '79-80', '129-130', '122-123, 143', '134-137', '159-163', '200-201', '198-199', '60-62', '87-88', '58-59', '85-86', '43-45, 25-27', '187-194', '46-47', '41-42', '195-196', '17-18', '7-9', '5-6', '177-179', '10-11', '12-13', '3-4');

-- ---------------------------------------------------------------------------
-- NEEDS A HUMAN DECISION — these have no equivalent booth on the new plan.
-- Their rows are left in place (and still draw on the map) until you either
-- assign the vendor to a real booth number or delete the row.
--   103-104        Michael White Contracting & All County Chip Seal — no equivalent booth on the new plan
--   H1             Deerfield Place — no equivalent booth on the new plan
--   H2             Mohawk Valley Spray Foam — no equivalent booth on the new plan
--   34-36          New York Sash — no equivalent booth on the new plan
--
-- To place one:  UPDATE booths SET vendor_id = (SELECT vendor_id FROM booths WHERE booth_number = '<old label>'), status = 'sold' WHERE booth_number = '<new booth>';
-- Then:          DELETE FROM booths WHERE booth_number = '<old label>';
--
-- Or, to drop them from the map without reassigning:
-- DELETE FROM booths WHERE booth_number IN ('103-104', 'H1', 'H2', '34-36');
