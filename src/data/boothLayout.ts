// Default booth floor-plan layout for the Home Show at Nexus Center.
//
// This is the SEED / fallback source of truth for booth geometry. Once the
// booths table is populated (via supabase_migration_booth_layout.sql), the
// map renders from the database and this file is only used as a fallback when
// the DB has no booth geometry yet. The admin visual editor edits the DB rows.

export const RINK2 = "Ground Level – Rink 2";
export const RINK3 = "Ground Level – Rink 3";

export interface StallData {
  number: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  floor: string;
}

export const stallsData: StallData[] = [
  /* ---------- RINK 2 : top row ---------- */
  { number: "180", x1: 190, y1: 365, x2: 265, y2: 445, floor: RINK2 },
  { number: "181", x1: 265, y1: 365, x2: 355, y2: 445, floor: RINK2 },
  { number: "182", x1: 355, y1: 365, x2: 430, y2: 445, floor: RINK2 },
  { number: "183", x1: 430, y1: 365, x2: 497, y2: 445, floor: RINK2 },
  { number: "184", x1: 502, y1: 365, x2: 577, y2: 445, floor: RINK2 },
  { number: "185", x1: 577, y1: 365, x2: 655, y2: 445, floor: RINK2 },
  { number: "186", x1: 655, y1: 365, x2: 732, y2: 445, floor: RINK2 },
  { number: "187-194", x1: 732, y1: 365, x2: 1300, y2: 445, floor: RINK2 },
  { number: "195-196", x1: 1300, y1: 365, x2: 1490, y2: 445, floor: RINK2 },

  /* ---------- RINK 2 : right edge column ---------- */
  { number: "202", x1: 1512, y1: 460, x2: 1592, y2: 545, floor: RINK2 },
  { number: "200-201", x1: 1512, y1: 550, x2: 1592, y2: 685, floor: RINK2 },
  { number: "198-199", x1: 1512, y1: 690, x2: 1592, y2: 775, floor: RINK2 },
  { number: "197", x1: 1512, y1: 830, x2: 1592, y2: 905, floor: RINK2 },

  /* ---------- RINK 2 : left edge column ---------- */
  { number: "176", x1: 65, y1: 755, x2: 145, y2: 830, floor: RINK2 },
  { number: "175", x1: 65, y1: 835, x2: 145, y2: 905, floor: RINK2 },

  /* ---------- RINK 2 : row B (y 480–560) ---------- */
  { number: "174", x1: 215, y1: 480, x2: 292, y2: 560, floor: RINK2 },
  { number: "173", x1: 292, y1: 480, x2: 368, y2: 560, floor: RINK2 },
  { number: "172", x1: 368, y1: 480, x2: 445, y2: 560, floor: RINK2 },
  { number: "150", x1: 520, y1: 480, x2: 597, y2: 640, floor: RINK2 },
  { number: "170", x1: 597, y1: 480, x2: 732, y2: 560, floor: RINK2 },
  { number: "169", x1: 732, y1: 480, x2: 832, y2: 560, floor: RINK2 },
  { number: "154", x1: 832, y1: 480, x2: 907, y2: 640, floor: RINK2 },
  { number: "166", x1: 975, y1: 480, x2: 1055, y2: 560, floor: RINK2 },
  { number: "165", x1: 1055, y1: 480, x2: 1132, y2: 560, floor: RINK2 },
  { number: "164", x1: 1132, y1: 480, x2: 1210, y2: 560, floor: RINK2 },
  { number: "159-163", x1: 1210, y1: 480, x2: 1440, y2: 640, floor: RINK2 },

  /* ---------- RINK 2 : row C (y 565–640) ---------- */
  { number: "147", x1: 215, y1: 565, x2: 292, y2: 640, floor: RINK2 },
  { number: "148", x1: 292, y1: 565, x2: 368, y2: 640, floor: RINK2 },
  { number: "149", x1: 368, y1: 565, x2: 445, y2: 640, floor: RINK2 },
  { number: "151-153", x1: 597, y1: 565, x2: 907, y2: 640, floor: RINK2 },
  { number: "156", x1: 975, y1: 565, x2: 1055, y2: 640, floor: RINK2 },
  { number: "157", x1: 1055, y1: 565, x2: 1132, y2: 640, floor: RINK2 },
  { number: "158", x1: 1132, y1: 565, x2: 1210, y2: 640, floor: RINK2 },

  /* ---------- RINK 2 : row D (y 720–800) ---------- */
  { number: "146", x1: 215, y1: 720, x2: 292, y2: 800, floor: RINK2 },
  { number: "145", x1: 292, y1: 720, x2: 368, y2: 800, floor: RINK2 },
  { number: "144", x1: 368, y1: 720, x2: 445, y2: 800, floor: RINK2 },
  { number: "122-123, 143", x1: 520, y1: 720, x2: 665, y2: 880, floor: RINK2 },
  { number: "141-142", x1: 665, y1: 720, x2: 832, y2: 800, floor: RINK2 },
  { number: "126", x1: 832, y1: 720, x2: 907, y2: 880, floor: RINK2 },
  { number: "128", x1: 975, y1: 720, x2: 1055, y2: 880, floor: RINK2 },
  { number: "134-137", x1: 1055, y1: 720, x2: 1360, y2: 800, floor: RINK2 },
  { number: "133", x1: 1360, y1: 720, x2: 1440, y2: 880, floor: RINK2 },

  /* ---------- RINK 2 : row E (y 800–880) ---------- */
  { number: "119", x1: 215, y1: 805, x2: 292, y2: 880, floor: RINK2 },
  { number: "120", x1: 292, y1: 805, x2: 368, y2: 880, floor: RINK2 },
  { number: "121", x1: 368, y1: 805, x2: 445, y2: 880, floor: RINK2 },
  { number: "124-125", x1: 665, y1: 800, x2: 832, y2: 880, floor: RINK2 },
  { number: "129-130", x1: 1055, y1: 800, x2: 1250, y2: 880, floor: RINK2 },
  { number: "131", x1: 1250, y1: 800, x2: 1360, y2: 880, floor: RINK2 },

  /* ---------- RINK 2 : bottom row (y 920–995) ---------- */
  { number: "118", x1: 190, y1: 920, x2: 268, y2: 995, floor: RINK2 },
  { number: "117", x1: 268, y1: 920, x2: 345, y2: 995, floor: RINK2 },
  { number: "116", x1: 345, y1: 920, x2: 425, y2: 995, floor: RINK2 },
  { number: "115", x1: 500, y1: 920, x2: 637, y2: 995, floor: RINK2 },
  { number: "114", x1: 637, y1: 920, x2: 732, y2: 995, floor: RINK2 },
  { number: "112", x1: 732, y1: 920, x2: 832, y2: 995, floor: RINK2 },
  { number: "111", x1: 832, y1: 920, x2: 955, y2: 995, floor: RINK2 },
  { number: "103-104", x1: 1337, y1: 920, x2: 1490, y2: 995, floor: RINK2 },

  /* ---------- Outside rink 2, right side ---------- */
  { number: "MV", x1: 1512, y1: 1000, x2: 1592, y2: 1065, floor: RINK2 },

  /* ---------- RINK 3 : top row (y 1120–1195) ---------- */
  { number: "84", x1: 175, y1: 1120, x2: 250, y2: 1195, floor: RINK3 },
  { number: "85-86", x1: 250, y1: 1120, x2: 412, y2: 1195, floor: RINK3 },
  { number: "87-88", x1: 470, y1: 1120, x2: 682, y2: 1195, floor: RINK3 },
  { number: "89", x1: 682, y1: 1120, x2: 777, y2: 1195, floor: RINK3 },
  { number: "91", x1: 777, y1: 1120, x2: 852, y2: 1195, floor: RINK3 },
  { number: "93", x1: 852, y1: 1120, x2: 930, y2: 1195, floor: RINK3 },
  { number: "94-95", x1: 930, y1: 1120, x2: 1147, y2: 1195, floor: RINK3 },
  { number: "96", x1: 1147, y1: 1120, x2: 1227, y2: 1195, floor: RINK3 },
  { number: "97", x1: 1227, y1: 1120, x2: 1302, y2: 1195, floor: RINK3 },
  { number: "98", x1: 1302, y1: 1120, x2: 1390, y2: 1195, floor: RINK3 },
  { number: "99", x1: 1390, y1: 1120, x2: 1462, y2: 1195, floor: RINK3 },

  /* ---------- RINK 3 : left edge column ---------- */
  { number: "82-83", x1: 65, y1: 1230, x2: 142, y2: 1352, floor: RINK3 },
  { number: "81", x1: 65, y1: 1357, x2: 142, y2: 1447, floor: RINK3 },
  { number: "79-80", x1: 65, y1: 1452, x2: 142, y2: 1592, floor: RINK3 },

  /* ---------- RINK 3 : row B (y 1230–1310) ---------- */
  { number: "49", x1: 215, y1: 1230, x2: 292, y2: 1387, floor: RINK3 },
  { number: "75-78", x1: 292, y1: 1230, x2: 590, y2: 1310, floor: RINK3 },
  { number: "74", x1: 590, y1: 1230, x2: 712, y2: 1310, floor: RINK3 },
  { number: "73", x1: 712, y1: 1230, x2: 812, y2: 1310, floor: RINK3 },
  { number: "72", x1: 840, y1: 1230, x2: 907, y2: 1310, floor: RINK3 },
  { number: "69", x1: 915, y1: 1230, x2: 987, y2: 1310, floor: RINK3 },
  { number: "68", x1: 987, y1: 1230, x2: 1107, y2: 1310, floor: RINK3 },
  { number: "67", x1: 1107, y1: 1230, x2: 1212, y2: 1310, floor: RINK3 },
  { number: "66", x1: 1217, y1: 1230, x2: 1287, y2: 1310, floor: RINK3 },
  { number: "63-65", x1: 1287, y1: 1230, x2: 1440, y2: 1387, floor: RINK3 },

  /* ---------- RINK 3 : right edge column ---------- */
  { number: "101", x1: 1512, y1: 1230, x2: 1592, y2: 1312, floor: RINK3 },
  { number: "100", x1: 1512, y1: 1317, x2: 1592, y2: 1397, floor: RINK3 },

  /* ---------- RINK 3 : row C (y 1312–1387) ---------- */
  { number: "50", x1: 292, y1: 1312, x2: 372, y2: 1387, floor: RINK3 },
  { number: "51", x1: 372, y1: 1312, x2: 447, y2: 1387, floor: RINK3 },
  { number: "52", x1: 447, y1: 1312, x2: 532, y2: 1387, floor: RINK3 },
  { number: "54", x1: 532, y1: 1312, x2: 662, y2: 1387, floor: RINK3 },
  { number: "55", x1: 662, y1: 1312, x2: 742, y2: 1387, floor: RINK3 },
  { number: "56", x1: 742, y1: 1312, x2: 827, y2: 1387, floor: RINK3 },
  { number: "57", x1: 827, y1: 1312, x2: 907, y2: 1387, floor: RINK3 },
  { number: "58-59", x1: 907, y1: 1312, x2: 1062, y2: 1387, floor: RINK3 },
  { number: "60-62", x1: 1062, y1: 1312, x2: 1440, y2: 1387, floor: RINK3 },

  /* ---------- RINK 3 : row D (y 1470–1625) ---------- */
  { number: "21", x1: 215, y1: 1470, x2: 292, y2: 1625, floor: RINK3 },
  { number: "48", x1: 292, y1: 1470, x2: 372, y2: 1547, floor: RINK3 },
  { number: "46-47", x1: 372, y1: 1470, x2: 522, y2: 1547, floor: RINK3 },
  { number: "22", x1: 292, y1: 1552, x2: 372, y2: 1625, floor: RINK3 },
  { number: "24", x1: 372, y1: 1552, x2: 522, y2: 1625, floor: RINK3 },
  { number: "43-45, 25-27", x1: 597, y1: 1470, x2: 827, y2: 1625, floor: RINK3 },
  { number: "41-42", x1: 827, y1: 1470, x2: 1012, y2: 1547, floor: RINK3 },
  { number: "28", x1: 827, y1: 1552, x2: 907, y2: 1625, floor: RINK3 },
  { number: "29", x1: 907, y1: 1552, x2: 1012, y2: 1625, floor: RINK3 },
  { number: "39", x1: 1032, y1: 1470, x2: 1127, y2: 1547, floor: RINK3 },
  { number: "31", x1: 1032, y1: 1552, x2: 1127, y2: 1625, floor: RINK3 },
  { number: "37", x1: 1127, y1: 1470, x2: 1212, y2: 1547, floor: RINK3 },
  { number: "33", x1: 1127, y1: 1552, x2: 1212, y2: 1625, floor: RINK3 },

  /* ---------- RINK 3 : right of giveaway area ---------- */
  { number: "1", x1: 1522, y1: 1497, x2: 1597, y2: 1590, floor: RINK3 },
  { number: "2", x1: 1522, y1: 1595, x2: 1597, y2: 1687, floor: RINK3 },

  /* ---------- RINK 3 : bottom row (y 1655–1730) ---------- */
  { number: "20", x1: 145, y1: 1655, x2: 225, y2: 1730, floor: RINK3 },
  { number: "17-18", x1: 225, y1: 1655, x2: 397, y2: 1730, floor: RINK3 },
  { number: "16", x1: 397, y1: 1655, x2: 492, y2: 1730, floor: RINK3 },
  { number: "15", x1: 492, y1: 1655, x2: 607, y2: 1730, floor: RINK3 },
  { number: "14", x1: 607, y1: 1655, x2: 682, y2: 1730, floor: RINK3 },
  { number: "12-13", x1: 682, y1: 1655, x2: 832, y2: 1730, floor: RINK3 },
  { number: "10-11", x1: 832, y1: 1655, x2: 1002, y2: 1730, floor: RINK3 },
  { number: "7-9", x1: 1002, y1: 1655, x2: 1217, y2: 1730, floor: RINK3 },
  { number: "5-6", x1: 1217, y1: 1655, x2: 1392, y2: 1730, floor: RINK3 },
  { number: "3-4", x1: 1392, y1: 1655, x2: 1512, y2: 1730, floor: RINK3 },
];
