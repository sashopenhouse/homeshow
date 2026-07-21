"use client";

import dynamic from "next/dynamic";
import { Map as MapIcon, MousePointerClick } from "lucide-react";

const MapEngine = dynamic(() => import("@/components/MapEngine"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/10">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <MapIcon className="text-primary" />
        <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
          Loading Floor Plan
        </p>
      </div>
    </div>
  ),
});

export default function AdminBoothsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <MapIcon size={26} className="text-primary" />
            Booth Map
          </h1>
          <p className="text-muted-foreground text-sm">
            Assign vendors to booths on the live floor plan. Changes save to Supabase and appear instantly on the public map.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/50 border border-border px-3 py-2 rounded-none shrink-0">
          <MousePointerClick size={14} className="text-primary" />
          Click a booth to assign or clear it
        </div>
      </div>

      {/* Map editor — fixed height so the Leaflet container has a concrete size */}
      <div className="bg-white border border-border shadow-sm relative overflow-hidden flex flex-col h-[750px]">
        <MapEngine admin />
      </div>
    </div>
  );
}
