"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TrendingUp, Users, CheckCircle2, Grid3x3, Megaphone } from "lucide-react";

interface ApplicationRow {
  industry_category: string | null;
  status: string | null;
  created_at: string;
}

interface BoothRow {
  status: string | null;
}

const categoryColors = [
  "bg-primary",
  "bg-amber-600",
  "bg-blue-600",
  "bg-emerald-600",
  "bg-purple-600",
  "bg-rose-600",
  "bg-cyan-600",
];

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Users;
  accent: string;
}) {
  return (
    <div className="bg-white border border-border p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon size={16} className={accent} />
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-black text-foreground">{value}</h3>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [booths, setBooths] = useState<BoothRow[]>([]);
  const [postsCount, setPostsCount] = useState(0);
  const [sponsorsCount, setSponsorsCount] = useState(0);
  const [approvedFeedCount, setApprovedFeedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [appsRes, boothsRes, postsRes, sponsorsRes, feedRes] = await Promise.all([
          supabase.from("vendor_applications").select("industry_category, status, created_at"),
          supabase.from("booths").select("status"),
          supabase.from("posts").select("*", { count: "exact", head: true }),
          supabase.from("sponsors").select("*", { count: "exact", head: true }),
          supabase.from("vendor_posts").select("*", { count: "exact", head: true }).eq("status", "approved"),
        ]);

        if (appsRes.data) setApplications(appsRes.data);
        if (boothsRes.data) setBooths(boothsRes.data);
        if (postsRes.count !== null) setPostsCount(postsRes.count ?? 0);
        if (sponsorsRes.count !== null) setSponsorsCount(sponsorsRes.count ?? 0);
        if (feedRes.count !== null) setApprovedFeedCount(feedRes.count ?? 0);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalApplications = applications.length;

  const statusSplit = useMemo(() => {
    const split = { pending: 0, approved: 0, rejected: 0 };
    applications.forEach((a) => {
      const s = (a.status ?? "pending").toLowerCase();
      if (s === "approved") split.approved += 1;
      else if (s === "rejected") split.rejected += 1;
      else split.pending += 1;
    });
    return split;
  }, [applications]);

  const approvalRate = totalApplications
    ? Math.round((statusSplit.approved / totalApplications) * 100)
    : 0;

  const boothStats = useMemo(() => {
    const stats = { available: 0, reserved: 0, sold: 0, total: booths.length };
    booths.forEach((b) => {
      const s = (b.status ?? "available").toLowerCase();
      if (s === "sold") stats.sold += 1;
      else if (s === "reserved") stats.reserved += 1;
      else stats.available += 1;
    });
    return stats;
  }, [booths]);

  const occupancy = boothStats.total
    ? Math.round(((boothStats.reserved + boothStats.sold) / boothStats.total) * 100)
    : 0;

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    applications.forEach((a) => {
      const c = a.industry_category?.trim() || "Uncategorized";
      map.set(c, (map.get(c) ?? 0) + 1);
    });
    return [...map.entries()]
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalApplications ? Math.round((count / totalApplications) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [applications, totalApplications]);

  const last7Days = useMemo(() => {
    const days: { label: string; key: string; count: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        key: d.toDateString(),
        count: 0,
      });
    }
    applications.forEach((a) => {
      const key = new Date(a.created_at).toDateString();
      const day = days.find((d) => d.key === key);
      if (day) day.count += 1;
    });
    return days;
  }, [applications]);

  const maxDayCount = Math.max(1, ...last7Days.map((d) => d.count));
  const weekTotal = last7Days.reduce((sum, d) => sum + d.count, 0);

  const dash = loading ? "…" : undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Live figures pulled from your Supabase data — applications, booth inventory, and the vendor feed.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Applications"
          value={dash ?? String(totalApplications)}
          sub="Vendor booth submissions received"
          icon={Users}
          accent="text-primary"
        />
        <MetricCard
          label="Approval Rate"
          value={dash ?? `${approvalRate}%`}
          sub={`${statusSplit.approved} of ${totalApplications} approved`}
          icon={CheckCircle2}
          accent="text-emerald-600"
        />
        <MetricCard
          label="Booth Occupancy"
          value={dash ?? `${occupancy}%`}
          sub={`${boothStats.reserved + boothStats.sold} of ${boothStats.total} booths taken`}
          icon={Grid3x3}
          accent="text-amber-600"
        />
        <MetricCard
          label="Live Feed Posts"
          value={dash ?? String(approvedFeedCount)}
          sub="Approved vendor updates published"
          icon={Megaphone}
          accent="text-blue-600"
        />
      </div>

      {/* Trend + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Applications over last 7 days */}
        <div className="bg-white border border-border p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground">New Applications (Last 7 Days)</h3>
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <TrendingUp size={14} className="text-primary" />
              {weekTotal} this week
            </span>
          </div>
          <div className="h-64 flex items-end gap-3 pt-6 border-b border-border pl-6 relative">
            <div className="absolute left-0 right-0 top-1/4 border-t border-border/40" />
            <div className="absolute left-0 right-0 top-2/4 border-t border-border/40" />
            <div className="absolute left-0 right-0 top-3/4 border-t border-border/40" />

            {last7Days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 relative z-10 h-full justify-end">
                <span className="text-xs font-bold text-foreground">{day.count > 0 ? day.count : ""}</span>
                <div
                  className="w-full bg-primary hover:bg-primary/90 transition-all min-h-0.5"
                  style={{ height: `${(day.count / maxDayCount) * 100}%` }}
                />
                <span className="text-xs font-bold text-muted-foreground mt-2">{day.label}</span>
              </div>
            ))}
          </div>
          {!loading && weekTotal === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              No applications recorded in the last 7 days.
            </p>
          )}
        </div>

        {/* Category breakdown */}
        <div className="bg-white border border-border p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-foreground">Application Category Breakdown</h3>
          <div className="space-y-4 pt-4">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading categories…</p>
            ) : categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No applications yet to categorize.
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
      </div>

      {/* Status + Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Application status */}
        <div className="bg-white border border-border p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-foreground">Application Status</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Pending", value: statusSplit.pending, className: "text-amber-700 border-amber-200 bg-amber-50" },
              { label: "Approved", value: statusSplit.approved, className: "text-emerald-700 border-emerald-200 bg-emerald-50" },
              { label: "Rejected", value: statusSplit.rejected, className: "text-destructive border-destructive/20 bg-destructive/5" },
            ].map((s) => (
              <div key={s.label} className={`border p-4 text-center rounded-none ${s.className}`}>
                <div className="text-2xl font-black">{loading ? "…" : s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Update statuses from the{" "}
            <span className="font-semibold text-foreground">Vendor Signups</span> page.
          </p>
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
                    <span className="text-muted-foreground">
                      {loading ? "…" : `${row.value} (${pct}%)`}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-muted border border-border">
                    <div className={`h-full ${row.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {!loading && boothStats.total === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              No booths defined in the database yet.
            </p>
          )}
        </div>
      </div>

      {/* Footnote for cross-referencing other real counts */}
      <div className="flex flex-wrap gap-6 text-xs text-muted-foreground border-t border-border pt-4">
        <span>
          <span className="font-bold text-foreground">{loading ? "…" : postsCount}</span> news posts published
        </span>
        <span>
          <span className="font-bold text-foreground">{loading ? "…" : sponsorsCount}</span> active sponsors
        </span>
        <span>
          <span className="font-bold text-foreground">{loading ? "…" : approvedFeedCount}</span> live feed posts
        </span>
      </div>
    </div>
  );
}
