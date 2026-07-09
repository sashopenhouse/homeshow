"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, Polygon, Marker, Tooltip, Rectangle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";
import { X, Check, ShieldAlert, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAP_H = 1800;
const yy = (y: number) => MAP_H - y;

const RINK2 = 'Ground Level – Rink 2';
const RINK3 = 'Ground Level – Rink 3';

interface StallData {
  number: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  floor: string;
}

const stallsData: StallData[] = [
  /* ---------- RINK 2 : top row ---------- */
  { number: '180', x1: 190, y1: 365, x2: 265, y2: 445, floor: RINK2 },
  { number: '181', x1: 265, y1: 365, x2: 355, y2: 445, floor: RINK2 },
  { number: '182', x1: 355, y1: 365, x2: 430, y2: 445, floor: RINK2 },
  { number: '183', x1: 430, y1: 365, x2: 497, y2: 445, floor: RINK2 },
  { number: '184', x1: 502, y1: 365, x2: 577, y2: 445, floor: RINK2 },
  { number: '185', x1: 577, y1: 365, x2: 655, y2: 445, floor: RINK2 },
  { number: '186', x1: 655, y1: 365, x2: 732, y2: 445, floor: RINK2 },
  { number: '187-194', x1: 732, y1: 365, x2: 1300, y2: 445, floor: RINK2 },
  { number: '195-196', x1: 1300, y1: 365, x2: 1490, y2: 445, floor: RINK2 },

  /* ---------- RINK 2 : right edge column ---------- */
  { number: '202',     x1: 1512, y1: 460, x2: 1592, y2: 545, floor: RINK2 },
  { number: '200-201', x1: 1512, y1: 550, x2: 1592, y2: 685, floor: RINK2 },
  { number: '198-199', x1: 1512, y1: 690, x2: 1592, y2: 775, floor: RINK2 },
  { number: '197',     x1: 1512, y1: 830, x2: 1592, y2: 905, floor: RINK2 },

  /* ---------- RINK 2 : left edge column ---------- */
  { number: '176', x1: 65, y1: 755, x2: 145, y2: 830, floor: RINK2 },
  { number: '175', x1: 65, y1: 835, x2: 145, y2: 905, floor: RINK2 },

  /* ---------- RINK 2 : row B (y 480–560) ---------- */
  { number: '174', x1: 215, y1: 480, x2: 292, y2: 560, floor: RINK2 },
  { number: '173', x1: 292, y1: 480, x2: 368, y2: 560, floor: RINK2 },
  { number: '172', x1: 368, y1: 480, x2: 445, y2: 560, floor: RINK2 },
  { number: '150', x1: 520, y1: 480, x2: 597, y2: 640, floor: RINK2 },          /* tall */
  { number: '170', x1: 597, y1: 480, x2: 732, y2: 560, floor: RINK2 },
  { number: '169', x1: 732, y1: 480, x2: 832, y2: 560, floor: RINK2 },
  { number: '154', x1: 832, y1: 480, x2: 907, y2: 640, floor: RINK2 },          /* tall */
  { number: '166', x1: 975, y1: 480, x2: 1055, y2: 560, floor: RINK2 },
  { number: '165', x1: 1055, y1: 480, x2: 1132, y2: 560, floor: RINK2 },
  { number: '164', x1: 1132, y1: 480, x2: 1210, y2: 560, floor: RINK2 },
  { number: '159-163', x1: 1210, y1: 480, x2: 1440, y2: 640, floor: RINK2 },    /* tall */

  /* ---------- RINK 2 : row C (y 565–640) ---------- */
  { number: '147', x1: 215, y1: 565, x2: 292, y2: 640, floor: RINK2 },
  { number: '148', x1: 292, y1: 565, x2: 368, y2: 640, floor: RINK2 },
  { number: '149', x1: 368, y1: 565, x2: 445, y2: 640, floor: RINK2 },
  { number: '151-153', x1: 597, y1: 565, x2: 907, y2: 640, floor: RINK2 },
  { number: '156', x1: 975, y1: 565, x2: 1055, y2: 640, floor: RINK2 },
  { number: '157', x1: 1055, y1: 565, x2: 1132, y2: 640, floor: RINK2 },
  { number: '158', x1: 1132, y1: 565, x2: 1210, y2: 640, floor: RINK2 },

  /* ---------- RINK 2 : row D (y 720–800) ---------- */
  { number: '146', x1: 215, y1: 720, x2: 292, y2: 800, floor: RINK2 },
  { number: '145', x1: 292, y1: 720, x2: 368, y2: 800, floor: RINK2 },
  { number: '144', x1: 368, y1: 720, x2: 445, y2: 800, floor: RINK2 },
  { number: '122-123, 143', x1: 520, y1: 720, x2: 665, y2: 880, floor: RINK2 }, /* tall */
  { number: '141-142', x1: 665, y1: 720, x2: 832, y2: 800, floor: RINK2 },
  { number: '126', x1: 832, y1: 720, x2: 907, y2: 880, floor: RINK2 },          /* tall */
  { number: '128', x1: 975, y1: 720, x2: 1055, y2: 880, floor: RINK2 },         /* tall */
  { number: '134-137', x1: 1055, y1: 720, x2: 1360, y2: 800, floor: RINK2 },
  { number: '133', x1: 1360, y1: 720, x2: 1440, y2: 880, floor: RINK2 },        /* tall */

  /* ---------- RINK 2 : row E (y 800–880) ---------- */
  { number: '119', x1: 215, y1: 805, x2: 292, y2: 880, floor: RINK2 },
  { number: '120', x1: 292, y1: 805, x2: 368, y2: 880, floor: RINK2 },
  { number: '121', x1: 368, y1: 805, x2: 445, y2: 880, floor: RINK2 },
  { number: '124-125', x1: 665, y1: 800, x2: 832, y2: 880, floor: RINK2 },
  { number: '129-130', x1: 1055, y1: 800, x2: 1250, y2: 880, floor: RINK2 },
  { number: '131', x1: 1250, y1: 800, x2: 1360, y2: 880, floor: RINK2 },

  /* ---------- RINK 2 : bottom row (y 920–995) ---------- */
  { number: '118', x1: 190, y1: 920, x2: 268, y2: 995, floor: RINK2 },
  { number: '117', x1: 268, y1: 920, x2: 345, y2: 995, floor: RINK2 },
  { number: '116', x1: 345, y1: 920, x2: 425, y2: 995, floor: RINK2 },
  { number: '115', x1: 500, y1: 920, x2: 637, y2: 995, floor: RINK2 },
  { number: '114', x1: 637, y1: 920, x2: 732, y2: 995, floor: RINK2 },
  { number: '112', x1: 732, y1: 920, x2: 832, y2: 995, floor: RINK2 },
  { number: '111', x1: 832, y1: 920, x2: 955, y2: 995, floor: RINK2 },
  { number: '103-104', x1: 1337, y1: 920, x2: 1490, y2: 995, floor: RINK2 },

  /* ---------- Outside rink 2, right side ---------- */
  { number: 'MV', x1: 1512, y1: 1000, x2: 1592, y2: 1065, floor: RINK2 },       /* MV Spray Foam pad */

  /* ---------- RINK 3 : top row (y 1120–1195) ---------- */
  { number: '84',    x1: 175, y1: 1120, x2: 250, y2: 1195, floor: RINK3 },
  { number: '85-86', x1: 250, y1: 1120, x2: 412, y2: 1195, floor: RINK3 },
  { number: '87-88', x1: 470, y1: 1120, x2: 682, y2: 1195, floor: RINK3 },
  { number: '89',    x1: 682, y1: 1120, x2: 777, y2: 1195, floor: RINK3 },
  { number: '91',    x1: 777, y1: 1120, x2: 852, y2: 1195, floor: RINK3 },
  { number: '93',    x1: 852, y1: 1120, x2: 930, y2: 1195, floor: RINK3 },
  { number: '94-95', x1: 930, y1: 1120, x2: 1147, y2: 1195, floor: RINK3 },
  { number: '96',    x1: 1147, y1: 1120, x2: 1227, y2: 1195, floor: RINK3 },
  { number: '97',    x1: 1227, y1: 1120, x2: 1302, y2: 1195, floor: RINK3 },
  { number: '98',    x1: 1302, y1: 1120, x2: 1390, y2: 1195, floor: RINK3 },
  { number: '99',    x1: 1390, y1: 1120, x2: 1462, y2: 1195, floor: RINK3 },

  /* ---------- RINK 3 : left edge column ---------- */
  { number: '82-83', x1: 65, y1: 1230, x2: 142, y2: 1352, floor: RINK3 },
  { number: '81',    x1: 65, y1: 1357, x2: 142, y2: 1447, floor: RINK3 },
  { number: '79-80', x1: 65, y1: 1452, x2: 142, y2: 1592, floor: RINK3 },

  /* ---------- RINK 3 : row B (y 1230–1310) ---------- */
  { number: '49',    x1: 215, y1: 1230, x2: 292, y2: 1387, floor: RINK3 },      /* tall */
  { number: '75-78', x1: 292, y1: 1230, x2: 590, y2: 1310, floor: RINK3 },
  { number: '74',    x1: 590, y1: 1230, x2: 712, y2: 1310, floor: RINK3 },
  { number: '73',    x1: 712, y1: 1230, x2: 812, y2: 1310, floor: RINK3 },
  { number: '72',    x1: 840, y1: 1230, x2: 907, y2: 1310, floor: RINK3 },
  { number: '69',    x1: 915, y1: 1230, x2: 987, y2: 1310, floor: RINK3 },
  { number: '68',    x1: 987, y1: 1230, x2: 1107, y2: 1310, floor: RINK3 },
  { number: '67',    x1: 1107, y1: 1230, x2: 1212, y2: 1310, floor: RINK3 },
  { number: '66',    x1: 1217, y1: 1230, x2: 1287, y2: 1310, floor: RINK3 },
  { number: '63-65', x1: 1287, y1: 1230, x2: 1440, y2: 1387, floor: RINK3 },    /* tall */

  /* ---------- RINK 3 : right edge column ---------- */
  { number: '101', x1: 1512, y1: 1230, x2: 1592, y2: 1312, floor: RINK3 },
  { number: '100', x1: 1512, y1: 1317, x2: 1592, y2: 1397, floor: RINK3 },

  /* ---------- RINK 3 : row C (y 1312–1387) ---------- */
  { number: '50',    x1: 292, y1: 1312, x2: 372, y2: 1387, floor: RINK3 },
  { number: '51',    x1: 372, y1: 1312, x2: 447, y2: 1387, floor: RINK3 },
  { number: '52',    x1: 447, y1: 1312, x2: 532, y2: 1387, floor: RINK3 },
  { number: '54',    x1: 532, y1: 1312, x2: 662, y2: 1387, floor: RINK3 },
  { number: '55',    x1: 662, y1: 1312, x2: 742, y2: 1387, floor: RINK3 },
  { number: '56',    x1: 742, y1: 1312, x2: 827, y2: 1387, floor: RINK3 },
  { number: '57',    x1: 827, y1: 1312, x2: 907, y2: 1387, floor: RINK3 },
  { number: '58-59', x1: 907, y1: 1312, x2: 1062, y2: 1387, floor: RINK3 },
  { number: '60-62', x1: 1062, y1: 1312, x2: 1440, y2: 1387, floor: RINK3 },

  /* ---------- RINK 3 : row D (y 1470–1625) ---------- */
  { number: '21',    x1: 215, y1: 1470, x2: 292, y2: 1625, floor: RINK3 },      /* tall */
  { number: '48',    x1: 292, y1: 1470, x2: 372, y2: 1547, floor: RINK3 },
  { number: '46-47', x1: 372, y1: 1470, x2: 522, y2: 1547, floor: RINK3 },
  { number: '22',    x1: 292, y1: 1552, x2: 372, y2: 1625, floor: RINK3 },
  { number: '24',    x1: 372, y1: 1552, x2: 522, y2: 1625, floor: RINK3 },
  { number: '43-45, 25-27', x1: 597, y1: 1470, x2: 827, y2: 1625, floor: RINK3 }, /* large block */
  { number: '41-42', x1: 827, y1: 1470, x2: 1012, y2: 1547, floor: RINK3 },
  { number: '28',    x1: 827, y1: 1552, x2: 907, y2: 1625, floor: RINK3 },
  { number: '29',    x1: 907, y1: 1552, x2: 1012, y2: 1625, floor: RINK3 },
  { number: '39',    x1: 1032, y1: 1470, x2: 1127, y2: 1547, floor: RINK3 },
  { number: '31',    x1: 1032, y1: 1552, x2: 1127, y2: 1625, floor: RINK3 },
  { number: '37',    x1: 1127, y1: 1470, x2: 1212, y2: 1547, floor: RINK3 },
  { number: '33',    x1: 1127, y1: 1552, x2: 1212, y2: 1625, floor: RINK3 },

  /* ---------- RINK 3 : right of giveaway area ---------- */
  { number: '1', x1: 1522, y1: 1497, x2: 1597, y2: 1590, floor: RINK3 },
  { number: '2', x1: 1522, y1: 1595, x2: 1597, y2: 1687, floor: RINK3 },

  /* ---------- RINK 3 : bottom row (y 1655–1730) ---------- */
  { number: '20',    x1: 145, y1: 1655, x2: 225, y2: 1730, floor: RINK3 },
  { number: '17-18', x1: 225, y1: 1655, x2: 397, y2: 1730, floor: RINK3 },
  { number: '16',    x1: 397, y1: 1655, x2: 492, y2: 1730, floor: RINK3 },
  { number: '15',    x1: 492, y1: 1655, x2: 607, y2: 1730, floor: RINK3 },
  { number: '14',    x1: 607, y1: 1655, x2: 682, y2: 1730, floor: RINK3 },
  { number: '12-13', x1: 682, y1: 1655, x2: 832, y2: 1730, floor: RINK3 },
  { number: '10-11', x1: 832, y1: 1655, x2: 1002, y2: 1730, floor: RINK3 },
  { number: '7-9',   x1: 1002, y1: 1655, x2: 1217, y2: 1730, floor: RINK3 },
  { number: '5-6',   x1: 1217, y1: 1655, x2: 1392, y2: 1730, floor: RINK3 },
  { number: '3-4',   x1: 1392, y1: 1655, x2: 1512, y2: 1730, floor: RINK3 }
];

const zonesData = [
  { name: 'KID\'S ZONE (177-179)', x1: 65, y1: 520, x2: 145, y2: 750, floor: RINK2 },
  { name: 'CONCESSIONS & ENTERTAINMENT', x1: 955, y1: 920, x2: 1337, y2: 995, floor: RINK2 },
  { name: 'NEW YORK SASH & GIVEAWAY AREA', x1: 1212, y1: 1470, x2: 1440, y2: 1625, floor: RINK3 }
];

const labelsData = [
  { text: 'GROUND LEVEL – RINK 2', x: 800, y: 330, size: 20 },
  { text: 'GROUND LEVEL – RINK 3', x: 800, y: 1090, size: 20 },
  { text: 'TASTING AREA', x: 330, y: 680, size: 17 },
  { text: 'WALKWAY', x: 462, y: 1050, size: 13 },
  { text: '– ORISKANY STREET W –', x: 800, y: 1790, size: 18 },
  { text: 'ENTER / EXIT', x: 1660, y: 330, size: 12 },
  { text: 'ENTER / EXIT', x: 1660, y: 1440, size: 12 },
  { text: 'REST ROOMS', x: 1660, y: 500, size: 10 },
  { text: '– BROADWAY –', x: 1685, y: 960, size: 14 }
];

// Helper to generate rounded rink outlines
function getRinkOutlinePoints(x1: number, y1: number, x2: number, y2: number) {
  const r = 90;
  const pts: [number, number][] = [];
  const seg = 10;
  const cs: [number, number, number, number][] = [
    [x2 - r, y1 + r, -Math.PI / 2, 0],        // top-right
    [x2 - r, y2 - r, 0, Math.PI / 2],         // bottom-right
    [x1 + r, y2 - r, Math.PI / 2, Math.PI],   // bottom-left
    [x1 + r, y1 + r, Math.PI, (3 * Math.PI) / 2]  // top-left
  ];
  cs.forEach(([cx, cy, a0, a1]) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + ((a1 - a0) * i) / seg;
      pts.push([yy(cy + r * Math.sin(a)), cx + r * Math.cos(a)]);
    }
  });
  return pts;
}

export default function MapEngine() {
  const [assignments, setAssignments] = useState<Record<string, { id?: string; vendor_name: string }>>({});
  const [vendors, setVendors] = useState<{ id: string; company_name: string }[]>([]);
  const [selectedStall, setSelectedStall] = useState<StallData | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [vendorInputText, setVendorInputText] = useState<string>("");
  const [adminMode, setAdminMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simple coordinate system bounding coordinates
  const bounds: L.LatLngBoundsExpression = [
    [yy(1800), 0],
    [yy(0), 1750]
  ];

  async function loadData() {
    try {
      // 1. Fetch live assigned booths
      const { data: boothsData } = await supabase
        .from("booths")
        .select(`
          id,
          booth_number,
          vendor_id,
          vendors (
            company_name
          )
        `);

      const loadedAssignments: Record<string, { id?: string; vendor_name: string }> = {};
      if (boothsData) {
        boothsData.forEach((b: any) => {
          if (b.vendors?.company_name) {
            loadedAssignments[b.booth_number] = {
              id: b.vendor_id,
              vendor_name: b.vendors.company_name
            };
          }
        });
      }
      setAssignments(loadedAssignments);

      // 2. Fetch live vendors list
      const { data: vendorsData } = await supabase
        .from("vendors")
        .select("id, company_name")
        .order("company_name", { ascending: true });

      if (vendorsData) {
        setVendors(vendorsData);
      }
    } catch (err) {
      console.error("Error loading map layout database data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectStall = (stall: StallData) => {
    setSelectedStall(stall);
    const existing = assignments[stall.number];
    if (existing) {
      setSelectedVendorId(existing.id || "");
      setVendorInputText(existing.vendor_name);
    } else {
      setSelectedVendorId("");
      setVendorInputText("");
    }
  };

  const handleAssign = async () => {
    if (!selectedStall) return;
    setSaving(true);

    try {
      // Find selected vendor name
      let vendorName = vendorInputText.trim();
      let vendorId: string | null = null;

      if (selectedVendorId) {
        const matching = vendors.find(v => v.id === selectedVendorId);
        if (matching) {
          vendorId = matching.id;
          vendorName = matching.company_name;
        }
      }

      const hasValue = !!vendorName;

      // Check if booth record already exists in Supabase
      const { data: checkData } = await supabase
        .from("booths")
        .select("id")
        .eq("booth_number", selectedStall.number)
        .maybeSingle();

      if (checkData) {
        // Update existing record
        const { error } = await supabase
          .from("booths")
          .update({
            status: hasValue ? "sold" : "available",
            vendor_id: vendorId,
            updated_at: new Date().toISOString()
          })
          .eq("booth_number", selectedStall.number);

        if (error) throw error;
      } else {
        // Insert new booth coordinates record dynamically
        const boundsCoords = [
          [selectedStall.y1, selectedStall.x1],
          [selectedStall.y1, selectedStall.x2],
          [selectedStall.y2, selectedStall.x2],
          [selectedStall.y2, selectedStall.x1]
        ];

        const { error } = await supabase
          .from("booths")
          .insert([
            {
              booth_number: selectedStall.number,
              coordinates: JSON.stringify(boundsCoords),
              status: hasValue ? "sold" : "available",
              vendor_id: vendorId,
              created_at: new Date().toISOString()
            }
          ]);

        if (error) throw error;
      }

      // Refresh assignments state locally
      if (hasValue) {
        setAssignments(prev => ({
          ...prev,
          [selectedStall.number]: {
            id: vendorId || undefined,
            vendor_name: vendorName
          }
        }));
      } else {
        setAssignments(prev => {
          const next = { ...prev };
          delete next[selectedStall.number];
          return next;
        });
      }

      setSelectedStall(null);
    } catch (err) {
      console.error(err);
      alert("Failed to assign vendor details.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!selectedStall) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("booths")
        .update({
          status: "available",
          vendor_id: null,
          updated_at: new Date().toISOString()
        })
        .eq("booth_number", selectedStall.number);

      if (error) throw error;

      setAssignments(prev => {
        const next = { ...prev };
        delete next[selectedStall.number];
        return next;
      });

      setSelectedStall(null);
    } catch (err) {
      console.error(err);
      alert("Failed to clear vendor assignment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col font-sans select-none">
      {/* Top Banner Control Panel */}
      <div className="absolute top-4 right-4 z-[1000] bg-white border border-border p-3 shadow-md flex items-center gap-3 rounded-none">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className={adminMode ? "text-primary animate-pulse" : "text-muted-foreground"} />
          <span className="text-xs font-bold text-foreground">Interactive Admin Mode</span>
        </div>
        <button
          onClick={() => setAdminMode(!adminMode)}
          className={`px-3 py-1 text-xs font-bold transition-all rounded-none border ${
            adminMode
              ? "bg-primary text-white border-primary"
              : "bg-white text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          {adminMode ? "ENABLED" : "DISABLED"}
        </button>
      </div>

      {/* Interactive Map Layout Container */}
      <div className="flex-1 min-h-[600px] h-[750px] relative">
        {loading ? (
          <div className="absolute inset-0 bg-muted/10 flex items-center justify-center text-muted-foreground text-sm font-bold">
            Initializing Vector Map Layout...
          </div>
        ) : (
          <MapContainer
            crs={L.CRS.Simple}
            bounds={bounds}
            minZoom={-1.5}
            maxZoom={1}
            zoom={-0.5}
            center={[yy(900), 875]}
            style={{ height: "100%", width: "100%", background: "#ffffff" }}
            className="z-0 border border-border"
          >
            {/* Draw Rink Outlines */}
            <Polygon
              positions={getRinkOutlinePoints(55, 345, 1500, 1015)}
              pathOptions={{ color: '#111111', weight: 4.5, fill: false, interactive: false }}
            />
            <Polygon
              positions={getRinkOutlinePoints(50, 1100, 1505, 1750)}
              pathOptions={{ color: '#111111', weight: 4.5, fill: false, interactive: false }}
            />

            {/* Walkway Connector between rinks */}
            <Polygon
              positions={[[yy(1015), 430], [yy(1015), 500], [yy(1100), 470], [yy(1100), 400]]}
              pathOptions={{ color: '#111111', weight: 3, fillColor: '#ffffff', fillOpacity: 1, interactive: false }}
            />

            {/* Static Annotations & Labels */}
            {labelsData.map((label, index) => {
              const rotateStyle = label.text.includes('BROADWAY') ? 'transform:rotate(90deg);' : '';
              const labelIcon = L.divIcon({
                className: 'static-label-icon',
                html: `<div style="font-size:${label.size}px;font-weight:bold;color:#111;letter-spacing:1px;white-space:nowrap;${rotateStyle} font-family:sans-serif;">${label.text}</div>`,
                iconSize: [300, 30],
                iconAnchor: [150, 15]
              });
              return (
                <Marker key={`label-${index}`} position={[yy(label.y), label.x]} icon={labelIcon} interactive={false} />
              );
            })}

            {/* Walkway Text Label */}
            <Marker
              position={[yy(1057), 455]}
              icon={L.divIcon({
                className: 'walkway-label-icon',
                html: '<div style="font-size:11px;transform:rotate(-72deg);font-weight:bold;color:#111;letter-spacing:1px;white-space:nowrap;font-family:sans-serif;">WALKWAY</div>',
                iconSize: [80, 16],
                iconAnchor: [40, 8]
              })}
              interactive={false}
            />

            {/* Event Zones */}
            {zonesData.map((zone, index) => (
              <span key={`zone-group-${index}`}>
                <Rectangle
                  bounds={[[yy(zone.y2), zone.x1], [yy(zone.y1), zone.x2]]}
                  pathOptions={{ color: '#7ba05b', weight: 1.5, fillColor: '#c9e4b4', fillOpacity: 0.9, interactive: false }}
                />
                <Marker
                  position={[yy((zone.y1 + zone.y2) / 2), (zone.x1 + zone.x2) / 2]}
                  icon={L.divIcon({
                    className: 'zone-label-icon',
                    html: `<div style="font-size:10px;font-weight:bold;color:#2d5a2d;text-align:center;font-family:sans-serif;line-height:1.2;width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${zone.name}</div>`,
                    iconSize: [(zone.x2 - zone.x1), 40],
                    iconAnchor: [(zone.x2 - zone.x1) / 2, 20]
                  })}
                  interactive={false}
                />
              </span>
            ))}

            {/* Render Stalls */}
            {stallsData.map((stall) => {
              const assignment = assignments[stall.number];
              const isAssigned = !!assignment;
              
              // Map styling matching colors in the HTML version
              // Available: background #aed9f5, border #4a90c2
              // Assigned: background #8fd18f, border #3d8b3d
              const isCurrentSelect = selectedStall?.number === stall.number;
              const color = isCurrentSelect ? '#003d7a' : (isAssigned ? '#3d8b3d' : '#4a90c2');
              const fillColor = isCurrentSelect ? '#0066cc' : (isAssigned ? '#8fd18f' : '#aed9f5');

              const w = stall.x2 - stall.x1;
              const h = stall.y2 - stall.y1;
              const fs = Math.max(10, Math.min(15, Math.floor(Math.min(w, h) / 3.8)));

              const labelIcon = L.divIcon({
                className: 'stall-label-icon',
                html: `<div style="font-weight:bold;color:${isCurrentSelect ? '#ffffff' : '#1a1a1a'};text-align:center;line-height:1.15;font-size:${fs}px;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100%;font-family:sans-serif;white-space:normal;">
                  <span>${stall.number}</span>
                  ${isAssigned ? `<span style="font-weight:normal;font-size:9px;color:#2d2d2d;margin-top:2.5px;max-width:${w - 6}px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${assignment.vendor_name}</span>` : ''}
                </div>`,
                iconSize: [w, h],
                iconAnchor: [w / 2, h / 2]
              });

              return (
                <span key={`stall-group-${stall.number}`}>
                  <Rectangle
                    bounds={[[yy(stall.y2), stall.x1], [yy(stall.y1), stall.x2]]}
                    pathOptions={{
                      color: color,
                      weight: isCurrentSelect ? 3 : 1.5,
                      fillColor: fillColor,
                      fillOpacity: isCurrentSelect ? 0.85 : 0.9,
                      dashArray: adminMode ? "4" : undefined
                    }}
                    eventHandlers={{
                      click: () => {
                        if (adminMode) {
                          handleSelectStall(stall);
                        } else {
                          alert(`Stall ${stall.number} (${stall.floor})${isAssigned ? `\nOccupied by: ${assignment.vendor_name}` : '\nStatus: Available'}`);
                        }
                      }
                    }}
                  />
                  <Marker
                    position={[yy((stall.y1 + stall.y2) / 2), (stall.x1 + stall.x2) / 2]}
                    icon={labelIcon}
                    interactive={false}
                  />
                </span>
              );
            })}
          </MapContainer>
        )}

        {/* Legend Overlay Card */}
        <div className="absolute bottom-6 left-6 z-[1000] bg-white border border-border p-4 shadow-md font-sans text-[11px] select-none max-w-xs rounded-none pointer-events-auto">
          <strong className="block text-foreground border-b border-border pb-1.5 mb-2 uppercase tracking-wide">Home Show — Nexus Center</strong>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-3.5 border border-[#4a90c2] bg-[#aed9f5] block" />
              <span className="text-muted-foreground font-semibold">Available stall</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-3.5 border border-[#3d8b3d] bg-[#8fd18f] block" />
              <span className="text-muted-foreground font-semibold">Assigned stall</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-3.5 border border-[#7ba05b] bg-[#c9e4b4] block" />
              <span className="text-muted-foreground font-semibold">Event zone</span>
            </div>
          </div>
        </div>

        {/* Assignment panel (Flat layout side panel) */}
        {selectedStall && (
          <div className="absolute top-20 right-6 z-[1000] bg-white border-2 border-primary w-72 p-5 shadow-2xl relative space-y-5 rounded-none pointer-events-auto">
            <button
              onClick={() => setSelectedStall(null)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary uppercase tracking-widest mb-1.5">
                <Award size={10} />
                Booth Assignment
              </div>
              <h3 className="text-lg font-black text-foreground">Stall {selectedStall.number}</h3>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{selectedStall.floor}</p>
            </div>

            <div className="space-y-4">
              {/* Select Registered Vendor dropdown */}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Select Registered Vendor</label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => {
                    setSelectedVendorId(e.target.value);
                    const matched = vendors.find(v => v.id === e.target.value);
                    if (matched) setVendorInputText(matched.company_name);
                  }}
                  className="w-full p-2.5 rounded-none border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Or type custom name below --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.company_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Free Text Input field */}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Vendor Name / Label</label>
                <input
                  type="text"
                  value={vendorInputText}
                  onChange={(e) => setVendorInputText(e.target.value)}
                  className="w-full p-2.5 rounded-none border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Type vendor name..."
                />
              </div>

              <div className="flex gap-2 pt-1.5">
                <button
                  onClick={handleClear}
                  disabled={saving}
                  className="flex-1 py-2 border border-border text-xs font-bold text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all rounded-none"
                >
                  Clear Stall
                </button>
                <button
                  onClick={handleAssign}
                  disabled={saving}
                  className="flex-1 py-2 bg-primary text-white text-xs font-bold hover:bg-primary/95 transition-all rounded-none flex items-center justify-center gap-1"
                >
                  <Check size={14} />
                  {saving ? "Saving..." : "Assign"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
