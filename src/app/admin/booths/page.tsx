"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Map as MapIcon, MousePointerClick, Code2, Copy, Check, ExternalLink } from "lucide-react";

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
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const embedUrl = `${origin}/embed/map`;
  const embedCode = `<iframe src="${embedUrl}" title="Home Show Floor Plan" width="100%" height="700" style="border:0;" loading="lazy"></iframe>`;

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Couldn't copy automatically. Select the code and copy it manually.");
    }
  };

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

      {/* Embed code for other sites */}
      <div className="bg-white border border-border shadow-sm p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Code2 size={16} className="text-primary" />
              Embed This Map on Another Site
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Paste this code into the other site&rsquo;s page. It shows the public floor plan and picks up booth changes made here automatically.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <a
              href="/embed/map"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-none"
            >
              <ExternalLink size={14} />
              Preview
            </a>
            <button
              onClick={copyEmbedCode}
              disabled={!origin}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all rounded-none disabled:opacity-50"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Code"}
            </button>
          </div>
        </div>
        <pre className="text-xs bg-muted/50 border border-border p-3 overflow-x-auto whitespace-pre-wrap break-all font-mono text-foreground">
          {embedCode}
        </pre>
      </div>
    </div>
  );
}
