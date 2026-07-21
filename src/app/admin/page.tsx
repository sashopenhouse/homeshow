"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, FileText, Calendar, CheckSquare, ArrowUpRight, Megaphone } from "lucide-react";
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
  const [totalSignups, setTotalSignups] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [pendingVendorPosts, setPendingVendorPosts] = useState(0);
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total vendor applications
        const { count: signupsCount, error: signupsErr } = await supabase
          .from("vendor_applications")
          .select("*", { count: "exact", head: true });

        if (!signupsErr && signupsCount !== null) {
          setTotalSignups(signupsCount);
        }

        // Fetch recent vendor applications
        const { data: signupsData } = await supabase
          .from("vendor_applications")
          .select("id, company_name, contact_name, created_at")
          .order("created_at", { ascending: false })
          .limit(3);

        if (signupsData) {
          setRecentSignups(signupsData);
        }

        // Fetch total posts
        const { count: postsCount, error: postsErr } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true });

        if (!postsErr && postsCount !== null) {
          setTotalPosts(postsCount);
        }

        // Fetch count of vendor posts awaiting moderation
        const { count: pendingCount, error: pendingErr } = await supabase
          .from("vendor_posts")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        if (!pendingErr && pendingCount !== null) {
          setPendingVendorPosts(pendingCount);
        }
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
          title="Booth Signups"
          value={loading ? "..." : totalSignups}
          description="Total online applications"
          icon={Users}
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
          value="84 / 120"
          description="70% of floor plan occupied"
          icon={CheckSquare}
          color="text-emerald-600"
        />
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Vendor Signups */}
        <div className="bg-white border border-border p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground">Recent Vendor Signups</h3>
            <Link
              href="/admin/signups"
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              View All Signups
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {loading ? (
              <div className="py-4 text-sm text-muted-foreground text-center">Loading signups...</div>
            ) : recentSignups.length === 0 ? (
              <div className="py-4 text-sm text-muted-foreground text-center">No applications received yet.</div>
            ) : (
              recentSignups.map((signup) => (
                <div key={signup.id} className="py-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{signup.company_name}</h4>
                    <span className="text-xs text-muted-foreground">Contact: {signup.contact_name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(signup.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
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
              href="/admin/posts"
              className="p-4 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left flex flex-col justify-between h-28"
            >
              <CheckSquare size={20} className="text-primary" />
              <div>
                <h4 className="font-bold text-sm text-foreground">Manage Articles</h4>
                <span className="text-xs text-muted-foreground">Edit existing publications</span>
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
