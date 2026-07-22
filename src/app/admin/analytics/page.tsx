"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Building2, Grid3x3, MapPin, UserPlus } from "lucide-react";

interface VendorRow {
  id: string;
  industry_category: string | null;
}
interface BoothRow {
  status: string | null;
  vendor_id: string | null;
}

const categoryColors = [
  "bg-primary",
  "bg-amber-600",
  "bg-blue-600",
  "bg-emerald-600",
  "bg-purple-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-orange-600",
];

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  href,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Building2;
  accent: string;
  href?: string;
}) {
  const card = (
    <div
      className={`bg-white border border-border p-6 shadow-sm space-y-4 h-full ${
        href ? "hover:border-primary/40 hover:shadow-md transition-all" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon size={16} className={accent} />
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-black text-foreground">{value}</h3>
        <p className={`text-xs ${href ? "text-primary font-semibold" : "text-muted-foreground"}`}>{sub}</p>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}

export default function AdminAnalyticsPage() {
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [booths, setBooths] = useState<BoothRow[]>([]);
  const [postsCount, setPostsCount] = useState(0);
  const [sponsorsCount, setSponsorsCount] = useState(0);
  const [feedApproved, setFeedApproved] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [vendorsRes, boothsRes, postsRes, sponsorsRes, feedRes] = await Promise.all([
          supabase.from("vendors").select("id, industry_category"),
          supabase.from("booths").select("status, vendor_id"),
          supabase.from("posts").select("*", { count: "exact", head: true }),
          supabase.from("sponsors").select("*", { count: "exact", head: true }),
          supabase.from("vendor_posts").select("status"),
        ]);

        if (vendorsRes.data) setVendors(vendorsRes.data);
        if (boothsRes.data) setBooths(boothsRes.data);
        if (postsRes.count != null) setPostsCount(postsRes.count);
        if (sponsorsRes.count != null) setSponsorsCount(sponsorsRes.count);
        if (feedRes.data) {
          const rows = feedRes.data as { status: string | null }[];
          setFeedApproved(rows.filter((r) => r.status === "approved").length);
        }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const vendorsCount = vendors.length;

  const boothStats = useMemo(() => {
    const stats = { available: 0, reserved: 0, sold: 0, total: booths.length, assigned: 0 };
    booths.forEach((b) => {
      const s = (b.status ?? "available").toLowerCase();
      if (s === "sold") stats.sold += 1;
      else if (s === "reserved") stats.reserved += 1;
      else stats.available += 1;
      if (b.vendor_id) stats.assigned += 1;
    });
    return stats;
  }, [booths]);

  const occupancy = boothStats.total ? Math.round((boothStats.assigned / boothStats.total) * 100) : 0;

  const placedVendors = useMemo(() => {
    const ids = new Set<string>();
    booths.forEach((b) => {
      if (b.vendor_id) ids.add(b.vendor_id);
    });
    return ids.size;
  }, [booths]);
  const unplacedVendors = Math.max(0, vendorsCount - placedVendors);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    vendors.forEach((v) => {
      const c = v.industry_category?.trim() || "Uncategorized";
      map.set(c, (map.get(c) ?? 0) + 1);
    });
    return [...map.entries()]
      .map(([category, count]) => ({
        category,
        count,
        percentage: vendorsCount ? Math.round((count / vendorsCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [vendors, vendorsCount]);

  const dash = loading ? "…" : undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Live figures from your vendor pool, booth assignments, and the exhibitor feed.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Vendors in Pool"
          value={dash ?? String(vendorsCount)}
          sub="Exhibitors imported"
          icon={Building2}
          accent="text-primary"
        />
        <MetricCard
          label="Booth Occupancy"
          value={dash ?? `${occupancy}%`}
          sub={`${boothStats.assigned} of ${boothStats.total} booths assigned`}
          icon={Grid3x3}
          accent="text-amber-600"
        />
        <MetricCard
          label="Exhibitors Placed"
          value={dash ?? `${placedVendors}`}
          sub={`of ${vendorsCount} in the pool`}
          icon={MapPin}
          accent="text-emerald-600"
        />
        <MetricCard
          label="Unassigned Vendors"
          value={dash ?? String(unplacedVendors)}
          sub="Click to assign booths →"
          icon={UserPlus}
          accent="text-rose-600"
          href="/admin/booths"
        />
      </div>

      {/* Category + Booth inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category breakdown */}
        <div className="bg-white border border-border p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-foreground">Exhibitor Category Breakdown</h3>
          <div className="space-y-4 pt-2">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading categories…</p>
            ) : categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No vendors in the pool yet — import some on the Vendor Pool page.
              </p>
            ) : (
              categoryBreakdown.map((item, i) => (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground">{item.category}</span>
                    <span className="text-muted-foreground">
                      {item.count} {item.count === 1 ? "vendor" : "vendors"} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-muted border border-border">
                    <div
                      className={`h-full ${categoryColors[i % categoryColors.length]}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Booth inventory */}
        <div className="bg-white border border-border p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground">Booth Inventory</h3>
            <span className="text-xs font-bold text-muted-foreground">{boothStats.total} total</span>
          </div>
          <div className="space-y-4 pt-2">
            {[
              { label: "Available", value: boothStats.available, color: "bg-emerald-600" },
              { label: "Reserved", value: boothStats.reserved, color: "bg-amber-600" },
              { label: "Sold", value: boothStats.sold, color: "bg-primary" },
            ].map((row) => {
              const pct = boothStats.total ? Math.round((row.value / boothStats.total) * 100) : 0;
              return (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground">{row.label}</span>
                    <span className="text-muted-foreground">{loading ? "…" : `${row.value} (${pct}%)`}</span>
                  </div>
                  <div className="w-full h-3 bg-muted border border-border">
                    <div className={`h-full ${row.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {!loading && boothStats.total === 0 && (
            <p className="text-xs text-muted-foreground text-center">No booths defined yet.</p>
          )}
        </div>
      </div>

      {/* Placement */}
      <div className="bg-white border border-border p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-foreground">Exhibitor Placement</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-emerald-200 bg-emerald-50 p-4 text-center rounded-none">
            <div className="text-2xl font-black text-emerald-700">{loading ? "…" : placedVendors}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mt-1">
              Placed on the map
            </div>
          </div>
          <div className="border border-border bg-muted/40 p-4 text-center rounded-none">
            <div className="text-2xl font-black text-foreground">{loading ? "…" : unplacedVendors}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
              In pool, not yet placed
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Assign unplaced exhibitors to booths in the{" "}
          <span className="font-semibold text-foreground">Booth Map</span> editor.
        </p>
      </div>

      {/* Footnote */}
      <div className="flex flex-wrap gap-6 text-xs text-muted-foreground border-t border-border pt-4">
        <span>
          <span className="font-bold text-foreground">{loading ? "…" : postsCount}</span> news posts published
        </span>
        <span>
          <span className="font-bold text-foreground">{loading ? "…" : sponsorsCount}</span> active sponsors
        </span>
        <span>
          <span className="font-bold text-foreground">{loading ? "…" : feedApproved}</span> live feed posts
        </span>
      </div>
    </div>
  );
}
