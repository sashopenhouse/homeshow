"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, ExternalLink, MapPin, Store } from "lucide-react";

interface Vendor {
  id: string;
  company_name: string;
  website_url: string | null;
  industry_category: string | null;
}

export default function VendorDirectory() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [boothsByVendor, setBoothsByVendor] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    async function load() {
      try {
        const [vRes, bRes] = await Promise.all([
          supabase
            .from("vendors")
            .select("id, company_name, website_url, industry_category")
            .order("company_name", { ascending: true }),
          supabase.from("booths").select("booth_number, vendor_id").not("vendor_id", "is", null),
        ]);

        if (vRes.data) setVendors(vRes.data);
        if (bRes.data) {
          const map: Record<string, string[]> = {};
          (bRes.data as { booth_number: string; vendor_id: string }[]).forEach((b) => {
            if (!b.vendor_id) return;
            (map[b.vendor_id] ||= []).push(b.booth_number);
          });
          Object.values(map).forEach((arr) =>
            arr.sort((a, z) => a.localeCompare(z, undefined, { numeric: true }))
          );
          setBoothsByVendor(map);
        }
      } catch (err) {
        console.error("Error loading vendor directory:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach((v) => {
      if (v.industry_category) set.add(v.industry_category);
    });
    return ["All", ...[...set].sort()];
  }, [vendors]);

  const filtered = useMemo(() => {
    const qq = query.trim().toLowerCase();
    return vendors.filter((v) => {
      if (category !== "All" && v.industry_category !== category) return false;
      if (!qq) return true;
      const booths = (boothsByVendor[v.id] || []).join(" ");
      return (
        v.company_name.toLowerCase().includes(qq) ||
        (v.industry_category || "").toLowerCase().includes(qq) ||
        booths.toLowerCase().includes(qq)
      );
    });
  }, [vendors, boothsByVendor, query, category]);

  return (
    <section className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            <Store size={14} />
            Exhibitor Directory
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
            Vendors at the Show
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? "Loading exhibitors…" : `${vendors.length} exhibitors · find a booth on the map above.`}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center bg-white border border-border px-4 py-2.5 shadow-sm flex-1 rounded-none">
          <Search className="text-muted-foreground mr-3 shrink-0" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company, category, or booth #…"
            className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white border border-border px-4 py-2.5 shadow-sm text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded-none sm:w-56"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All categories" : c}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm bg-white border border-border">
          Loading exhibitors…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm bg-white border border-border">
          {vendors.length === 0
            ? "No exhibitors have been listed yet."
            : "No exhibitors match your search."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((v) => {
            const booths = boothsByVendor[v.id] || [];
            return (
              <div
                key={v.id}
                className="bg-white border border-border rounded-none p-4 flex flex-col gap-2 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 uppercase tracking-wide rounded-none">
                    <MapPin size={10} />
                    {booths.length ? `Booth ${booths.join(", ")}` : "Not on map"}
                  </span>
                  {v.industry_category && (
                    <span className="text-[10px] text-muted-foreground font-semibold text-right shrink-0">
                      {v.industry_category}
                    </span>
                  )}
                </div>
                {v.website_url ? (
                  <a
                    href={v.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-sm text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 leading-snug"
                  >
                    {v.company_name}
                    <ExternalLink size={11} className="shrink-0 text-muted-foreground" />
                  </a>
                ) : (
                  <span className="font-bold text-sm text-foreground leading-snug">{v.company_name}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
