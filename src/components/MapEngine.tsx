"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, Polygon, Marker, Rectangle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";
import { X, Check, Award, Plus, Trash2, Move } from "lucide-react";
import { RINK2, RINK3, stallsData, type StallData } from "@/data/boothLayout";

const MAP_H = 1800;
const yy = (y: number) => MAP_H - y;
const MIN_SIZE = 24; // minimum booth width/height in design units

// A booth in editable state also carries its DB row id (when it came from the DB)
// and optional internal admin notes.
type Stall = StallData & { id?: string; notes?: string };

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

// Editing handles (created once, client-side)
const moveIcon = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#003d7a;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.45);cursor:move;"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});
const cornerIconNWSE = L.divIcon({
  className: "",
  html: `<div style="width:12px;height:12px;background:#fff;border:2px solid #003d7a;box-shadow:0 1px 3px rgba(0,0,0,.35);cursor:nwse-resize;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});
const cornerIconNESW = L.divIcon({
  className: "",
  html: `<div style="width:12px;height:12px;background:#fff;border:2px solid #003d7a;box-shadow:0 1px 3px rgba(0,0,0,.35);cursor:nesw-resize;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

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

// Parse a booth's stored coordinates into a bounding box. Handles the seeded
// object form {x1,y1,x2,y2} (JSONB object or a stringified one) and returns
// null for anything else (e.g. legacy array coordinates) so callers can fall
// back to the bundled default layout.
function parseBbox(raw: unknown): { x1: number; y1: number; x2: number; y2: number } | null {
  let c: any = raw;
  if (typeof c === "string") {
    try {
      c = JSON.parse(c);
    } catch {
      return null;
    }
  }
  if (
    c && typeof c === "object" && !Array.isArray(c) &&
    c.x1 != null && c.y1 != null && c.x2 != null && c.y2 != null
  ) {
    return { x1: Number(c.x1), y1: Number(c.y1), x2: Number(c.x2), y2: Number(c.y2) };
  }
  return null;
}

// Keep a booth's box inside the map extent so it can't be dragged/resized
// off-canvas (which would persist and be hard to recover).
const MAP_W = 1750;
function clampBox(b: { x1: number; y1: number; x2: number; y2: number }) {
  const cx = (v: number) => Math.max(0, Math.min(v, MAP_W));
  const cy = (v: number) => Math.max(0, Math.min(v, MAP_H));
  return { x1: cx(b.x1), y1: cy(b.y1), x2: cx(b.x2), y2: cy(b.y2) };
}

// Captures the Leaflet map instance so we can place new booths at the current view center.
function MapRefSetter({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

export default function MapEngine({ admin = false }: { admin?: boolean }) {
  const [assignments, setAssignments] = useState<Record<string, { id?: string; vendor_name: string }>>({});
  const [vendors, setVendors] = useState<{ id: string; company_name: string }[]>([]);
  const [stalls, setStalls] = useState<Stall[]>(stallsData);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [vendorInputText, setVendorInputText] = useState<string>("");
  const [numberInput, setNumberInput] = useState<string>("");
  const [notesInput, setNotesInput] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbBacked, setDbBacked] = useState(false);

  // Editing is driven by the `admin` prop: /admin/booths passes admin (editing on),
  // the public floor plan renders it without the prop (view-only). Writes are also
  // enforced server-side by the booths RLS policy (authenticated only).
  const adminMode = admin;

  // The currently selected booth, derived from the live stalls array by number.
  const selectedStall = selectedNumber ? stalls.find((s) => s.number === selectedNumber) ?? null : null;

  // Refs give drag handlers the latest state without stale closures.
  const stallsRef = useRef<Stall[]>(stalls);
  stallsRef.current = stalls;
  const selRef = useRef<string | null>(null);
  selRef.current = selectedNumber;
  const mapRef = useRef<L.Map | null>(null);

  // Simple coordinate system bounding coordinates
  const bounds: L.LatLngBoundsExpression = [
    [yy(1800), 0],
    [yy(0), 1750]
  ];

  async function loadData() {
    try {
      // 1. Fetch booths — geometry (coordinates/floor) + assignment (vendor).
      // `notes` is requested ONLY in admin mode so internal notes never reach
      // the public floor plan's network payload. We try progressively simpler
      // column sets so the query still works before the floor/notes columns
      // exist (pre-migration), without ever exposing notes publicly.
      const colSets = adminMode
        ? [
            "id, booth_number, coordinates, floor, vendor_id, status, notes, vendors ( company_name )",
            "id, booth_number, coordinates, floor, vendor_id, status, vendors ( company_name )",
            "id, booth_number, coordinates, vendor_id, status, vendors ( company_name )"
          ]
        : [
            "id, booth_number, coordinates, floor, vendor_id, status, vendors ( company_name )",
            "id, booth_number, coordinates, vendor_id, status, vendors ( company_name )"
          ];

      let boothsData: any[] | null = null;
      for (const cols of colSets) {
        const resp = await supabase.from("booths").select(cols);
        if (!resp.error) {
          boothsData = resp.data as any[] | null;
          break;
        }
      }

      const loadedAssignments: Record<string, { id?: string; vendor_name: string }> = {};
      const dbStalls: Stall[] = [];

      if (boothsData) {
        boothsData.forEach((b: any) => {
          if (b.vendors?.company_name) {
            loadedAssignments[b.booth_number] = {
              id: b.vendor_id,
              vendor_name: b.vendors.company_name
            };
          }
          const box = parseBbox(b.coordinates);
          if (box) {
            dbStalls.push({ id: b.id, number: b.booth_number, floor: b.floor || "", notes: b.notes || "", ...box });
          }
        });
      }

      setAssignments(loadedAssignments);
      // Prefer DB geometry once the layout has been seeded (Phase 1 migration);
      // otherwise fall back to the bundled default layout so the map always renders.
      setStalls(dbStalls.length > 0 ? dbStalls : stallsData);
      // dbBacked = the map is reading real DB rows (with ids) that edits can save to.
      setDbBacked(dbStalls.length > 0);

      // 2. Fetch live vendors list (for the assignment dropdown)
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

  const handleSelectStall = (stall: Stall) => {
    setSelectedNumber(stall.number);
    setNumberInput(stall.number);
    setNotesInput(stall.notes || "");
    const existing = assignments[stall.number];
    if (existing) {
      setSelectedVendorId(existing.id || "");
      setVendorInputText(existing.vendor_name);
    } else {
      setSelectedVendorId("");
      setVendorInputText("");
    }
  };

  const closePanel = () => setSelectedNumber(null);

  // ---- Geometry editing ---------------------------------------------------

  const updateBox = (number: string, box: { x1: number; y1: number; x2: number; y2: number }) => {
    const clamped = clampBox(box);
    setStalls((prev) => prev.map((s) => (s.number === number ? { ...s, ...clamped } : s)));
  };

  const persistGeometry = async (s: Stall) => {
    try {
      const coords = {
        x1: Math.round(s.x1),
        y1: Math.round(s.y1),
        x2: Math.round(s.x2),
        y2: Math.round(s.y2)
      };
      const q = supabase.from("booths").update({ coordinates: coords, updated_at: new Date().toISOString() });
      const { error } = s.id ? await q.eq("id", s.id) : await q.eq("booth_number", s.number);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to save booth geometry:", err);
    }
  };

  const onMoveDrag = (e: L.LeafletEvent) => {
    const s = stallsRef.current.find((x) => x.number === selRef.current);
    if (!s) return;
    const ll = (e.target as L.Marker).getLatLng();
    const cx = ll.lng;
    const cy = MAP_H - ll.lat;
    const w = s.x2 - s.x1;
    const h = s.y2 - s.y1;
    updateBox(s.number, { x1: cx - w / 2, y1: cy - h / 2, x2: cx + w / 2, y2: cy + h / 2 });
  };

  const onCornerDrag = (key: "a" | "b" | "c" | "d", e: L.LeafletEvent) => {
    const s = stallsRef.current.find((x) => x.number === selRef.current);
    if (!s) return;
    const ll = (e.target as L.Marker).getLatLng();
    const nx = ll.lng;
    const ny = MAP_H - ll.lat;
    let { x1, y1, x2, y2 } = s;
    if (key === "a") { x1 = Math.min(nx, x2 - MIN_SIZE); y1 = Math.min(ny, y2 - MIN_SIZE); }
    if (key === "b") { x2 = Math.max(nx, x1 + MIN_SIZE); y1 = Math.min(ny, y2 - MIN_SIZE); }
    if (key === "c") { x1 = Math.min(nx, x2 - MIN_SIZE); y2 = Math.max(ny, y1 + MIN_SIZE); }
    if (key === "d") { x2 = Math.max(nx, x1 + MIN_SIZE); y2 = Math.max(ny, y1 + MIN_SIZE); }
    updateBox(s.number, { x1, y1, x2, y2 });
  };

  const onEditDragEnd = () => {
    const s = stallsRef.current.find((x) => x.number === selRef.current);
    if (s) persistGeometry(s);
  };

  // ---- Booth CRUD ---------------------------------------------------------

  const addBooth = async () => {
    // unique placeholder number
    let n = 1;
    while (stalls.some((s) => s.number === `New ${n}`)) n++;
    const number = `New ${n}`;

    // place at the current map view center (fall back to a central spot)
    let cx = 800;
    let cy = 900;
    const map = mapRef.current;
    if (map) {
      const c = map.getCenter();
      cx = c.lng;
      cy = MAP_H - c.lat;
    }
    const w = 90;
    const h = 70;
    const box = { x1: cx - w / 2, y1: cy - h / 2, x2: cx + w / 2, y2: cy + h / 2 };

    try {
      const { data, error } = await supabase
        .from("booths")
        .insert([
          {
            booth_number: number,
            coordinates: {
              x1: Math.round(box.x1),
              y1: Math.round(box.y1),
              x2: Math.round(box.x2),
              y2: Math.round(box.y2)
            },
            floor: RINK2,
            status: "available",
            created_at: new Date().toISOString()
          }
        ])
        .select("id")
        .single();

      if (error) throw error;

      setStalls((prev) => [...prev, { id: data?.id, number, floor: RINK2, ...box }]);
      setSelectedNumber(number);
      setNumberInput(number);
      setNotesInput("");
      setSelectedVendorId("");
      setVendorInputText("");
    } catch (err) {
      console.error(err);
      alert("Could not add booth. Make sure the booth-layout migration has been run in Supabase.");
    }
  };

  const renameBooth = async (raw: string) => {
    const target = selectedStall;
    if (!target) return;
    const newNumber = raw.trim();
    if (!newNumber || newNumber === target.number) {
      setNumberInput(target.number);
      return;
    }
    if (stalls.some((s) => s.number === newNumber)) {
      alert("That booth number already exists.");
      setNumberInput(target.number);
      return;
    }
    try {
      const q = supabase.from("booths").update({ booth_number: newNumber, updated_at: new Date().toISOString() });
      const { error } = target.id ? await q.eq("id", target.id) : await q.eq("booth_number", target.number);
      if (error) throw error;

      setStalls((prev) => prev.map((s) => (s.number === target.number ? { ...s, number: newNumber } : s)));
      setAssignments((prev) => {
        if (!prev[target.number]) return prev;
        const next = { ...prev };
        next[newNumber] = next[target.number];
        delete next[target.number];
        return next;
      });
      setSelectedNumber(newNumber);
    } catch (err) {
      console.error(err);
      alert("Could not rename booth. The number may already be taken.");
      setNumberInput(target.number);
    }
  };

  const changeFloor = async (floor: string) => {
    const target = selectedStall;
    if (!target) return;
    const prevFloor = target.floor;
    // optimistic
    setStalls((prev) => prev.map((s) => (s.number === target.number ? { ...s, floor } : s)));
    try {
      const q = supabase.from("booths").update({ floor, updated_at: new Date().toISOString() });
      const { error } = target.id ? await q.eq("id", target.id) : await q.eq("booth_number", target.number);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to update floor:", err);
      // revert so the UI doesn't show an unsaved value
      setStalls((prev) => prev.map((s) => (s.number === target.number ? { ...s, floor: prevFloor } : s)));
      alert("Could not save the floor change.");
    }
  };

  const saveNotes = async () => {
    const target = selectedStall;
    if (!target) return;
    const notes = notesInput;
    const prevNotes = target.notes || "";
    if (prevNotes === notes) return;
    // optimistic
    setStalls((prev) => prev.map((s) => (s.number === target.number ? { ...s, notes } : s)));
    try {
      const q = supabase.from("booths").update({ notes, updated_at: new Date().toISOString() });
      const { error } = target.id ? await q.eq("id", target.id) : await q.eq("booth_number", target.number);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to save notes:", err);
      // revert both the stall and the textarea
      setStalls((prev) => prev.map((s) => (s.number === target.number ? { ...s, notes: prevNotes } : s)));
      setNotesInput(prevNotes);
      alert("Could not save notes.");
    }
  };

  const deleteBooth = async () => {
    const target = selectedStall;
    if (!target) return;
    if (!confirm(`Delete booth ${target.number}? This removes it from the floor plan.`)) return;
    try {
      const q = supabase.from("booths").delete();
      const { error } = target.id ? await q.eq("id", target.id) : await q.eq("booth_number", target.number);
      if (error) throw error;

      setStalls((prev) => prev.filter((s) => s.number !== target.number));
      setAssignments((prev) => {
        const next = { ...prev };
        delete next[target.number];
        return next;
      });
      setSelectedNumber(null);
    } catch (err) {
      console.error(err);
      alert("Could not delete booth.");
    }
  };

  // ---- Vendor assignment (existing behavior) ------------------------------

  const handleAssign = async () => {
    if (!selectedStall) return;
    setSaving(true);

    try {
      let vendorName = vendorInputText.trim();
      let vendorId: string | null = null;

      if (selectedVendorId) {
        const matching = vendors.find((v) => v.id === selectedVendorId);
        if (matching) {
          vendorId = matching.id;
          vendorName = matching.company_name;
        }
      }

      const hasValue = !!vendorName;

      const { data: checkData } = await supabase
        .from("booths")
        .select("id")
        .eq("booth_number", selectedStall.number)
        .maybeSingle();

      if (checkData) {
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
        const { error } = await supabase
          .from("booths")
          .insert([
            {
              booth_number: selectedStall.number,
              coordinates: {
                x1: selectedStall.x1,
                y1: selectedStall.y1,
                x2: selectedStall.x2,
                y2: selectedStall.y2
              },
              floor: selectedStall.floor,
              status: hasValue ? "sold" : "available",
              vendor_id: vendorId,
              created_at: new Date().toISOString()
            }
          ]);
        if (error) throw error;
      }

      if (hasValue) {
        setAssignments((prev) => ({
          ...prev,
          [selectedStall.number]: { id: vendorId || undefined, vendor_name: vendorName }
        }));
      } else {
        setAssignments((prev) => {
          const next = { ...prev };
          delete next[selectedStall.number];
          return next;
        });
      }
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
        .update({ status: "available", vendor_id: null, updated_at: new Date().toISOString() })
        .eq("booth_number", selectedStall.number);
      if (error) throw error;

      setAssignments((prev) => {
        const next = { ...prev };
        delete next[selectedStall.number];
        return next;
      });
    } catch (err) {
      console.error(err);
      alert("Failed to clear vendor assignment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col font-sans select-none">
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
            style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, background: "#ffffff" }}
            className="z-0 border border-border"
          >
            <MapRefSetter mapRef={mapRef} />

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
            {stalls.map((stall) => {
              const assignment = assignments[stall.number];
              const isAssigned = !!assignment;

              const isCurrentSelect = selectedNumber === stall.number;
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

            {/* Editing handles for the selected booth (admin only) */}
            {adminMode && selectedStall && (
              <>
                <Marker
                  draggable
                  position={[yy((selectedStall.y1 + selectedStall.y2) / 2), (selectedStall.x1 + selectedStall.x2) / 2]}
                  icon={moveIcon}
                  zIndexOffset={1000}
                  eventHandlers={{ drag: onMoveDrag, dragend: onEditDragEnd }}
                />
                {([
                  ["a", selectedStall.x1, selectedStall.y1],
                  ["b", selectedStall.x2, selectedStall.y1],
                  ["c", selectedStall.x1, selectedStall.y2],
                  ["d", selectedStall.x2, selectedStall.y2]
                ] as const).map(([key, cxv, cyv]) => (
                  <Marker
                    key={`handle-${key}`}
                    draggable
                    position={[yy(cyv), cxv]}
                    icon={key === "a" || key === "d" ? cornerIconNWSE : cornerIconNESW}
                    zIndexOffset={1000}
                    eventHandlers={{ drag: (e) => onCornerDrag(key, e), dragend: onEditDragEnd }}
                  />
                ))}
              </>
            )}
          </MapContainer>
        )}

        {/* Admin editing toolbar */}
        {adminMode && !loading && (
          <div className="absolute top-4 left-4 z-[1000] bg-white border border-border shadow-md rounded-none p-2 flex items-center gap-2 pointer-events-auto max-w-[260px]">
            <button
              onClick={addBooth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-none hover:bg-primary/90 transition-all shrink-0"
            >
              <Plus size={14} />
              Add Booth
            </button>
            {dbBacked ? (
              <span className="text-[10px] text-muted-foreground font-semibold leading-tight">
                Click a booth to edit · drag <Move size={9} className="inline -mt-0.5" /> to move · drag corners to resize
              </span>
            ) : (
              <span className="text-[10px] text-amber-700 font-bold leading-tight">
                Showing the built-in default layout — run the booth-layout migration in Supabase to save edits.
              </span>
            )}
          </div>
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

        {/* Selection panel */}
        {selectedStall && (
          <div className="absolute top-20 right-6 z-[1000] bg-white border-2 border-primary w-72 p-5 shadow-2xl space-y-5 rounded-none pointer-events-auto max-h-[85%] overflow-y-auto">
            <button
              onClick={closePanel}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary uppercase tracking-widest mb-1.5">
                <Award size={10} />
                Booth Editor
              </div>
              <h3 className="text-lg font-black text-foreground">Stall {selectedStall.number}</h3>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{selectedStall.floor || "—"}</p>
            </div>

            {/* Geometry / identity (admin editing) */}
            {adminMode && (
              <div className="space-y-3 border-b border-border pb-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Booth Number</label>
                  <input
                    type="text"
                    value={numberInput}
                    onChange={(e) => setNumberInput(e.target.value)}
                    onBlur={() => renameBooth(numberInput)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    }}
                    className="w-full p-2.5 rounded-none border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Floor</label>
                  <select
                    value={selectedStall.floor || RINK2}
                    onChange={(e) => changeFloor(e.target.value)}
                    className="w-full p-2.5 rounded-none border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={RINK2}>Rink 2</option>
                    <option value={RINK3}>Rink 3</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Notes</label>
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    onBlur={saveNotes}
                    rows={3}
                    className="w-full p-2.5 rounded-none border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="Internal notes — power/water needs, special requests, etc."
                  />
                </div>
                <button
                  onClick={deleteBooth}
                  className="w-full py-2 border border-destructive/30 text-destructive text-xs font-bold hover:bg-destructive/5 transition-all rounded-none flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  Delete Booth
                </button>
              </div>
            )}

            {/* Vendor assignment */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Select Registered Vendor</label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => {
                    setSelectedVendorId(e.target.value);
                    const matched = vendors.find((v) => v.id === e.target.value);
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
