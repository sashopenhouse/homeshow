// Regenerates src/data/boothLayout.ts + supabase_migration_booth_layout_v2.sql
// Run with: node scripts/generate-booth-layout.js
// from the official 2027 Nexus Center floor plan.
//
// Coordinates below are expressed in REFERENCE-IMAGE pixels (the 1919x1919
// floor-plan artwork) and scaled by F into the map's design units.
const fs = require("fs");
const path = require("path");

const F = 0.94;
const s = (v) => Math.round(v * F);

const RINK2 = "Ground Level – Rink 2";
const RINK3 = "Ground Level – Rink 3";

const booths = [];
const push = (number, x1, y1, x2, y2, floor) =>
  booths.push({ number: String(number), x1: s(x1), y1: s(y1), x2: s(x2), y2: s(y2), floor });

// Evenly divide [x1,x2] into numbers.length cells sharing edges.
function row(numbers, x1, x2, y1, y2, floor) {
  const w = (x2 - x1) / numbers.length;
  numbers.forEach((n, i) => push(n, x1 + i * w, y1, x1 + (i + 1) * w, y2, floor));
}

// Stack numbers top-to-bottom in [y1,y2] with a gap between each.
function col(numbers, x1, x2, y1, y2, floor, gap = 8) {
  const h = (y2 - y1 - gap * (numbers.length - 1)) / numbers.length;
  numbers.forEach((n, i) => {
    const top = y1 + i * (h + gap);
    push(n, x1, top, x2, top + h, floor);
  });
}

// A two-row island: top numbers over bottom numbers, same column edges.
function island(top, bottom, x1, x2, y1, ymid, y2, floor) {
  row(top, x1, x2, y1, ymid, floor);
  row(bottom, x1, x2, ymid, y2, floor);
}

/* ===================== RINK 2 ===================== */

// Top row 180 → 196
row([180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196],
  185, 1483, 378, 432, RINK2);

// Right edge column 202 → 197
col([202, 201, 200, 199, 198, 197], 1518, 1580, 460, 883, RINK2);

// Left edge column 179 → 175
col([179, 178, 177, 176, 175], 68, 145, 508, 918, RINK2, 11);

// Tasting-area islands (left inner)
island([174, 173, 172], [147, 148, 149], 212, 448, 490, 565, 640, RINK2);
island([146, 145, 144], [119, 120, 121], 212, 448, 745, 820, 895, RINK2);

// Centre islands — 150 / 122 are single deep booths capping the aisle
push(150, 518, 490, 598, 640, RINK2);
island([171, 170, 169, 168], [151, 152, 153, 154], 600, 910, 490, 565, 640, RINK2);
push(122, 518, 745, 598, 895, RINK2);
island([143, 142, 141, 140], [123, 124, 125, 126], 600, 910, 745, 820, 895, RINK2);

// Right islands — 161 / 133 cap the aisle
island([166, 165, 164, 163, 162], [156, 157, 158, 159, 160], 975, 1360, 490, 565, 640, RINK2);
push(161, 1360, 490, 1440, 640, RINK2);
island([138, 137, 136, 135, 134], [128, 129, 130, 131, 132], 975, 1360, 745, 820, 895, RINK2);
push(133, 1360, 745, 1440, 895, RINK2);

// Bottom row — split by the walkway, then the concessions zone
row([118, 117, 116], 185, 425, 925, 990, RINK2);
row([115, 114, 113, 112, 111, 110, 109, 108], 500, 1105, 925, 990, RINK2);

/* ===================== RINK 3 ===================== */

// Top row — split by the walkway
row([84, 85, 86], 175, 415, 1130, 1195, RINK3);
row([87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99], 470, 1465, 1130, 1195, RINK3);

// Left edge column 83 → 79
col([83, 82, 81, 80, 79], 68, 142, 1225, 1618, RINK3, 7);

// Right edge column — 101/100 above the entrance, 1/2 below it
col([101, 100], 1518, 1580, 1250, 1397, RINK3, 7);
col([1, 2], 1518, 1580, 1500, 1652, RINK3, 8);

// Upper islands — 49 caps the aisle, 64 caps the long island
push(49, 218, 1235, 295, 1385, RINK3);
island([78, 77, 76], [50, 51, 52], 297, 535, 1235, 1310, 1385, RINK3);
island([74, 73, 72, 71, 70, 69, 68, 67, 66, 65], [54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
  595, 1360, 1235, 1310, 1385, RINK3);
push(64, 1360, 1235, 1440, 1385, RINK3);

// Lower islands — 21 caps the aisle, giveaway area caps the long island
push(21, 218, 1470, 295, 1620, RINK3);
island([48, 47, 46], [22, 23, 24], 297, 535, 1470, 1545, 1620, RINK3);
island([44, 43, 42, 41, 40, 39, 38, 37], [26, 27, 28, 29, 30, 31, 32, 33],
  595, 1210, 1470, 1545, 1620, RINK3);

// Bottom row 20 → 3
row([20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3],
  148, 1498, 1655, 1725, RINK3);

/* ===================== output ===================== */

const root = path.resolve(__dirname, "..");
const projectRoot = process.argv[2] || root;

// Sanity checks
const seen = new Set();
booths.forEach((b) => {
  if (seen.has(b.number)) throw new Error(`duplicate booth ${b.number}`);
  seen.add(b.number);
  if (b.x2 <= b.x1 || b.y2 <= b.y1) throw new Error(`bad box for ${b.number}`);
  if (b.x1 < 0 || b.x2 > 1750 || b.y1 < 0 || b.y2 > 1800) throw new Error(`out of bounds ${b.number}`);
});
console.log(`${booths.length} booths, ${booths.filter((b) => b.floor === RINK2).length} in rink 2`);

const groups = [];
let current = null;
booths.forEach((b) => {
  const key = b.floor;
  if (!current || current.key !== key) {
    current = { key, items: [] };
    groups.push(current);
  }
  current.items.push(b);
});

const line = (b) =>
  `  { number: "${b.number}", x1: ${b.x1}, y1: ${b.y1}, x2: ${b.x2}, y2: ${b.y2}, floor: ${b.floor === RINK2 ? "RINK2" : "RINK3"} },`;

const ts = `// Default booth floor-plan layout for the Home Show at Nexus Center.
//
// GENERATED from the official 2027 floor plan artwork — booth boxes are the
// reference image's pixel coordinates scaled by ${F} into map design units
// (origin top-left; MapEngine flips y for Leaflet).
//
// This is the SEED / fallback source of truth for booth geometry. Once the
// booths table is populated (via supabase_migration_booth_layout_v2.sql), the
// map renders from the database and this file is only used as a fallback when
// the DB has no booth geometry yet. The admin visual editor edits the DB rows.

export const RINK2 = "${RINK2}";
export const RINK3 = "${RINK3}";

export interface StallData {
  number: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  floor: string;
}

export const stallsData: StallData[] = [
  /* ---------- GROUND LEVEL – RINK 2 ---------- */
${booths.filter((b) => b.floor === RINK2).map(line).join("\n")}

  /* ---------- GROUND LEVEL – RINK 3 ---------- */
${booths.filter((b) => b.floor === RINK3).map(line).join("\n")}
];
`;

fs.writeFileSync(path.join(projectRoot, "src/data/boothLayout.ts"), ts);

const values = booths
  .map(
    (b) =>
      `('${b.number}', '{"x1":${b.x1},"y1":${b.y1},"x2":${b.x2},"y2":${b.y2}}', '${b.floor}', 'available')`
  )
  .join(",\n");

const numberList = booths.map((b) => `'${b.number}'`).join(", ");

const sql = `-- Migration: replace the booth floor plan with the official 2027 layout.
-- Run this in your Supabase SQL Editor. Requires supabase_migration_booth_layout.sql
-- to have been run first (it adds the \`floor\` column and widens booth_number).
--
-- The previous layout used merged labels ("187-194", "43-45, 25-27", …). The new
-- plan numbers every booth individually, so most old rows no longer exist.
--
-- NON-DESTRUCTIVE toward assignments: the upsert only rewrites coordinates/floor,
-- and step 3 removes stale rows ONLY when they have no vendor assigned. Step 4
-- lists any assigned booth whose number is gone from the new plan so you can move
-- that vendor to a new booth by hand.

-- 1. Make sure the geometry columns exist (no-ops if the first migration ran).
ALTER TABLE booths ALTER COLUMN booth_number TYPE VARCHAR(50);
ALTER TABLE booths ADD COLUMN IF NOT EXISTS floor TEXT;

-- 2. Seed / refresh booth geometry from the official plan (${booths.length} booths).
INSERT INTO booths (booth_number, coordinates, floor, status) VALUES
${values}
ON CONFLICT (booth_number) DO UPDATE SET
  coordinates = EXCLUDED.coordinates,
  floor = EXCLUDED.floor;

-- 3. Drop unassigned booths that are not part of the new plan.
DELETE FROM booths
WHERE vendor_id IS NULL
  AND booth_number NOT IN (${numberList});

-- 4. Review: assigned booths that no longer exist on the new plan.
--    These are kept so no assignment is lost — reassign each vendor to a booth
--    number from the new plan, then delete the leftover row.
SELECT b.booth_number, v.company_name
FROM booths b
LEFT JOIN vendors v ON v.id = b.vendor_id
WHERE b.vendor_id IS NOT NULL
  AND b.booth_number NOT IN (${numberList});
`;

fs.writeFileSync(path.join(projectRoot, "supabase_migration_booth_layout_v2.sql"), sql);
console.log("wrote src/data/boothLayout.ts and supabase_migration_booth_layout_v2.sql");
