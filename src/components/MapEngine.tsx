"use client";

import { useEffect, useState } from "react";
import { MapContainer, ImageOverlay, Polygon, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Booth {
  id: number;
  booth_number: string;
  coordinates: [number, number][];
  status: "available" | "reserved" | "sold";
  vendor_id?: string;
}

export default function MapEngine() {
  const [booths, setBooths] = useState<Booth[]>([]);

  // We use a dummy image bounds for the placeholder
  const bounds: L.LatLngBoundsExpression = [
    [0, 0],
    [500, 500],
  ];

  useEffect(() => {
    // In the future, this will fetch from Supabase
    // For now, we use the dummy data from the SQL schema
    setBooths([
      {
        id: 1,
        booth_number: "A1",
        coordinates: [[100, 100], [100, 200], [200, 200], [200, 100]],
        status: "available",
      },
      {
        id: 2,
        booth_number: "A2",
        coordinates: [[210, 100], [210, 200], [310, 200], [310, 100]],
        status: "available",
      },
      {
        id: 3,
        booth_number: "A3",
        coordinates: [[320, 100], [320, 200], [420, 200], [420, 100]],
        status: "sold",
      },
    ]);
  }, []);

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      maxZoom={2}
      minZoom={-2}
      zoom={0}
      center={[250, 250]}
      style={{ height: "100%", width: "100%", background: "#111" }}
      className="z-0"
    >
      {/* Placeholder Image Overlay */}
      <ImageOverlay
        url="https://placehold.co/1000x1000/222/555?text=Blueprint+Placeholder"
        bounds={bounds}
      />

      {booths.map((booth) => {
        // Colors based on status
        const color = booth.status === "available" ? "#10b981" : "#475569"; // Emerald for available, Slate for sold
        const fillColor = booth.status === "available" ? "#10b98140" : "#47556980";

        return (
          <Polygon
            key={booth.id}
            positions={booth.coordinates}
            pathOptions={{
              color: color,
              weight: 2,
              fillColor: fillColor,
              fillOpacity: 1,
            }}
            eventHandlers={{
              click: () => {
                alert(`Clicked Booth ${booth.booth_number} - Status: ${booth.status}`);
              },
            }}
          >
            <Tooltip sticky>
              <div className="text-center font-sans">
                <strong>Booth {booth.booth_number}</strong>
                <br />
                <span className="capitalize">{booth.status}</span>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </MapContainer>
  );
}
