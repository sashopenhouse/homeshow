"use client";

import dynamic from "next/dynamic";
import { MapPin, ExternalLink } from "lucide-react";

const MapEngine = dynamic(() => import("@/components/MapEngine"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/10">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <MapPin className="text-primary animate-bounce" />
        </div>
        <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Loading Floor Plan</p>
      </div>
    </div>
  ),
});

// How often the embedded map re-reads booth assignments from the database.
const REFRESH_MS = 60_000;

// The public floor plan on its own, sized to fill whatever <iframe> it is placed in.
export default function EmbedMapPage() {
  return (
    <main className="h-screen w-full flex flex-col bg-white">
      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
        <MapEngine refreshMs={REFRESH_MS} />
      </div>
      <a
        href="/vendors/list"
        target="_blank"
        rel="noopener"
        className="shrink-0 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-muted-foreground hover:text-primary border-t border-border"
      >
        Home Show at Nexus Center · Full vendor directory
        <ExternalLink size={12} />
      </a>
    </main>
  );
}
