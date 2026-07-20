"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MapPin } from "lucide-react";

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

export default function VendorListPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(".fade-in-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
      gsap.fromTo(".map-container",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );
    },
    { scope: container }
  );

  return (
    <main ref={container} className="flex-1 flex flex-col min-h-screen bg-background pt-32 pb-12 px-6">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-[calc(100vh-10rem)] min-h-[600px]">
        {/* Header */}
        <div className="fade-in-header mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              <MapPin size={14} />
              Floor Plan
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Interactive Directory
            </h1>
          </div>
          <p className="text-muted-foreground max-w-md text-sm">
            Explore the Nexus Center exhibition floor. Click on any colored booth to view the vendor details and their location.
          </p>
        </div>

        {/* Interactive Map */}
        <div className="map-container flex-1 bg-white border border-border shadow-sm relative overflow-hidden flex flex-col">
          <MapEngine />
        </div>
      </div>
    </main>
  );
}
