"use client";

import dynamic from "next/dynamic";

const MapEngine = dynamic(() => import("@/components/MapEngine"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/20">
      Map Engine Loading...
    </div>
  ),
});

export default function VendorListPage() {
  return (
    <main className="flex-1 flex flex-col p-8 h-screen">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Interactive Directory</h1>
      <div className="flex-1 border rounded-lg overflow-hidden relative">
        <MapEngine />
      </div>
    </main>
  );
}
