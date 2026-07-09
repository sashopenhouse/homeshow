"use client";

import { useEffect, useState } from "react";
import { MapContainer, ImageOverlay, Polygon, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";
import { X, Check, ShieldAlert, Award } from "lucide-react";

// Fix Leaflet marker icons issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Vendor {
  id: string;
  company_name: string;
}

interface Booth {
  id: string | number;
  booth_number: string;
  coordinates: [number, number][];
  status: "available" | "reserved" | "sold";
  vendor_id?: string;
  vendors?: { company_name: string } | null;
}

const defaultBooths: Booth[] = [
  {
    id: "1",
    booth_number: "A1",
    coordinates: [[150, 150], [150, 350], [300, 350], [300, 150]],
    status: "available",
  },
  {
    id: "2",
    booth_number: "A2",
    coordinates: [[150, 400], [150, 600], [300, 600], [300, 400]],
    status: "available",
  },
  {
    id: "3",
    booth_number: "A3",
    coordinates: [[150, 650], [150, 850], [300, 850], [300, 650]],
    status: "sold",
  },
];

export default function MapEngine() {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [adminMode, setAdminMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Bounds for the Nexus Center floor map overlay
  const bounds: L.LatLngBoundsExpression = [
    [0, 0],
    [600, 1000],
  ];

  async function loadData() {
    try {
      // Fetch booths
      const { data: boothsData, error: boothsError } = await supabase
        .from("booths")
        .select(`
          id,
          booth_number,
          coordinates,
          status,
          vendor_id,
          vendors (
            company_name
          )
        `);

      if (!boothsError && boothsData && boothsData.length > 0) {
        // Map data to expected types
        const formatted = boothsData.map((b: any) => {
          let coords = b.coordinates;
          if (typeof coords === "string") {
            coords = JSON.parse(coords);
          }
          return {
            id: b.id,
            booth_number: b.booth_number,
            coordinates: coords as [number, number][],
            status: b.status as any,
            vendor_id: b.vendor_id || undefined,
            vendors: b.vendors ? { company_name: b.vendors.company_name } : null
          };
        });
        setBooths(formatted);
      } else {
        setBooths(defaultBooths);
      }

      // Fetch vendors
      const { data: vendorsData } = await supabase
        .from("vendors")
        .select("id, company_name")
        .order("company_name", { ascending: true });

      if (vendorsData) {
        setVendors(vendorsData);
      }
    } catch (err) {
      console.error("Error loading map data:", err);
      setBooths(defaultBooths);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignVendor = async () => {
    if (!selectedBooth) return;
    setSaving(true);

    try {
      const isRelease = !selectedVendorId;
      const updates = {
        status: isRelease ? "available" : "sold",
        vendor_id: isRelease ? null : selectedVendorId,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("booths")
        .update(updates)
        .eq("booth_number", selectedBooth.booth_number);

      if (error) throw error;

      setSelectedBooth(null);
      setSelectedVendorId("");
      loadData();
    } catch (err) {
      alert("Failed to assign vendor. Ensure the booth table contains this booth number.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col font-sans">
      {/* Admin Mode Toggle Panel */}
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

      {/* Map Element */}
      <div className="flex-1 min-h-[500px]">
        <MapContainer
          crs={L.CRS.Simple}
          bounds={bounds}
          maxZoom={2}
          minZoom={-2}
          zoom={-1}
          center={[300, 500]}
          style={{ height: "100%", width: "100%", background: "#f8f9fa" }}
          className="z-0 border border-border"
        >
          <ImageOverlay
            url="/blueprint.png"
            bounds={bounds}
          />

          {booths.map((booth) => {
            const isSold = booth.status === "sold";
            const color = isSold ? "#475569" : "#10b981"; // Slate for sold, Emerald for available
            const fillColor = isSold ? "#47556950" : "#10b98130";

            return (
              <Polygon
                key={booth.id}
                positions={booth.coordinates}
                pathOptions={{
                  color: color,
                  weight: 3,
                  fillColor: fillColor,
                  fillOpacity: 1,
                  dashArray: adminMode ? "4" : undefined
                }}
                eventHandlers={{
                  click: () => {
                    if (adminMode) {
                      setSelectedBooth(booth);
                      setSelectedVendorId(booth.vendor_id || "");
                    } else {
                      alert(
                        `Booth ${booth.booth_number} - Status: ${booth.status.toUpperCase()}${
                          booth.vendors ? `\nOccupied by: ${booth.vendors.company_name}` : ""
                        }`
                      );
                    }
                  },
                }}
              >
                <Tooltip sticky>
                  <div className="text-center font-sans text-xs p-1">
                    <strong className="block text-foreground">Booth {booth.booth_number}</strong>
                    <span className={`block font-bold text-[10px] uppercase ${isSold ? "text-slate-600" : "text-emerald-600"}`}>
                      {booth.status}
                    </span>
                    {booth.vendors && (
                      <span className="block mt-1 border-t border-border pt-1 text-muted-foreground font-semibold">
                        {booth.vendors.company_name}
                      </span>
                    )}
                  </div>
                </Tooltip>
              </Polygon>
            );
          })}
        </MapContainer>
      </div>

      {/* Assignment Modal (Flat design) */}
      {selectedBooth && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6 z-[2000] animate-in fade-in duration-200">
          <div className="bg-white border-2 border-primary w-full max-w-sm p-6 shadow-2xl relative space-y-6 rounded-none">
            <button
              onClick={() => setSelectedBooth(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={20} />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
                <Award size={12} />
                Booth Assignment
              </div>
              <h3 className="text-xl font-black text-foreground">Booth {selectedBooth.booth_number}</h3>
              <p className="text-xs text-muted-foreground mt-1">Assign an active vendor to occupy this stall on the floor plan.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1.5">Select Vendor</label>
                {vendors.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-3 border border-border bg-muted">
                    No vendors registered in your database yet.
                  </div>
                ) : (
                  <select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="w-full p-3 rounded-none border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Unassigned (Available) --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.company_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedBooth(null)}
                  className="flex-1 py-2.5 border border-border text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignVendor}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-primary text-white text-sm font-bold hover:bg-primary/95 transition-all rounded-none flex items-center justify-center gap-1.5"
                >
                  <Check size={16} />
                  {saving ? "Saving..." : "Save Assign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
