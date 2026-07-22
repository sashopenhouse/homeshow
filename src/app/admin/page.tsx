"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Calendar, CheckSquare, ArrowUpRight, Megaphone, Building2 } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  color: string;
}

function StatCard({ title, value, description, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white border border-border p-6 shadow-sm flex items-start justify-between">
      <div className="space-y-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
        <h3 className="text-3xl font-black text-foreground">{value}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className={`p-3 bg-muted border border-border ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [vendorsCount, setVendorsCount] = useState(0);
  const [assignedBooths, setAssignedBooths] = useState(0);
  const [totalBooths, setTotalBooths] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [pendingVendorPosts, setPendingVendorPosts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [vendorsRes, assignedRes, boothsRes, postsRes, pendingRes] = await Promise.all([
          supabase.from("vendors").select("*", { count: "exact", head: true }),
          supabase.from("booths").select("*", { count: "exact", head: true }).not("vendor_id", "is", null),
          supabase.from("booths").select("*", { count: "exact", head: true }),
          supabase.from("posts").select("*", { count: "exact", head: true }),
          supabase.from("vendor_posts").select("*", { count: "exact", head: true }).eq("status", "pending"),
        ]);

        if (vendorsRes.count != null) setVendorsCount(vendorsRes.count);
        if (assignedRes.count != null) setAssignedBooths(assignedRes.count);
        if (boothsRes.count != null) setTotalBooths(boothsRes.count);
        if (postsRes.count != null) setTotalPosts(postsRes.count);
        if (pendingRes.count != null) setPendingVendorPosts(pendingRes.count);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground text-sm">Welcome back. Here is how the Home Show looks today.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Vendors"
          value={loading ? "..." : vendorsCount}
          description="Exhibitors in the pool"
          icon={Building2}
          color="text-primary"
        />
        <StatCard
          title="Ticket Sales"
          value="$14,240"
          description="712 general admission sold"
          icon={Calendar}
          color="text-amber-600"
        />
        <StatCard
          title="News Articles"
          value={loading ? "..." : totalPosts}
          description="Live news updates published"
          icon={FileText}
          color="text-blue-600"
        />
        <StatCard
          title="Booths Booked"
          value={loading ? "..." : `${assignedBooths} / ${totalBooths}`}
          description="Booths assigned to a vendor"
          icon={CheckSquare}
          color="text-emerald-600"
        />
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vendor Pool summary */}
        <div className="bg-white border border-border p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground">Vendor Pool</h3>
            <Link
              href="/admin/vendors"
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              Manage Pool
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Exhibitors imported</span>
              <span className="text-2xl font-black text-foreground">{loading ? "..." : vendorsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Assigned to booths</span>
              <span className="text-2xl font-black text-primary">{loading ? "..." : assignedBooths}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-3 border-t border-border">
              Import exhibitors, then place them on the floor plan from the Booth Map editor.
            </p>
          </div>
        </div>

        {/* System Logs / Quick Links */}
        <div className="bg-white border border-border p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-foreground">Quick Admin Operations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/posts/create"
              className="p-4 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left flex flex-col justify-between h-28"
            >
              <FileText size={20} className="text-primary" />
              <div>
                <h4 className="font-bold text-sm text-foreground">Create News Post</h4>
                <span className="text-xs text-muted-foreground">Add to front page news</span>
              </div>
            </Link>
            <Link
              href="/admin/booths"
              className="p-4 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left flex flex-col justify-between h-28"
            >
              <CheckSquare size={20} className="text-primary" />
              <div>
                <h4 className="font-bold text-sm text-foreground">Assign Booths</h4>
                <span className="text-xs text-muted-foreground">Place vendors on the map</span>
              </div>
            </Link>
            <Link
              href="/admin/vendor-posts"
              className="relative p-4 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left flex flex-col justify-between h-28"
            >
              {!loading && pendingVendorPosts > 0 && (
                <span className="absolute top-3 right-3 min-w-5 h-5 px-1.5 flex items-center justify-center bg-primary text-white text-xs font-black rounded-none">
                  {pendingVendorPosts}
                </span>
              )}
              <Megaphone size={20} className="text-primary" />
              <div>
                <h4 className="font-bold text-sm text-foreground">Moderate Vendor Feed</h4>
                <span className="text-xs text-muted-foreground">
                  {loading
                    ? "Checking submissions..."
                    : pendingVendorPosts > 0
                    ? `${pendingVendorPosts} post${pendingVendorPosts === 1 ? "" : "s"} awaiting review`
                    : "No posts awaiting review"}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
