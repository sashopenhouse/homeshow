"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Megaphone,
  Store,
  Calendar,
  Check,
  X,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Tag,
  Sparkles,
} from "lucide-react";

interface VendorPost {
  id: string;
  vendor_name: string | null;
  title: string;
  body: string;
  image_url: string | null;
  post_type: string;
  status: string;
  created_at: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const typeStyles: Record<string, { label: string; className: string; icon: typeof Tag }> = {
  promotion: { label: "Promotion", className: "text-amber-700 bg-amber-50 border-amber-200", icon: Tag },
  announcement: { label: "Announcement", className: "text-blue-700 bg-blue-50 border-blue-200", icon: Sparkles },
  update: { label: "Update", className: "text-primary bg-primary/10 border-primary/20", icon: Store },
};

const statusStyles: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: "Pending", className: "text-amber-700 bg-amber-50 border-amber-200", icon: Clock },
  approved: { label: "Approved", className: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "text-destructive bg-destructive/5 border-destructive/20", icon: XCircle },
};

export default function AdminVendorPostsPage() {
  const [posts, setPosts] = useState<VendorPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from("vendor_posts")
        .select("id, vendor_name, title, body, image_url, post_type, status, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setLoadError(error.message);
      } else if (data) {
        setPosts(data);
        setLoadError("");
      }
    } catch (err) {
      console.error("Error fetching vendor posts:", err);
      setLoadError("Failed to load vendor posts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  const counts = useMemo(() => {
    return {
      all: posts.length,
      pending: posts.filter((p) => p.status === "pending").length,
      approved: posts.filter((p) => p.status === "approved").length,
      rejected: posts.filter((p) => p.status === "rejected").length,
    };
  }, [posts]);

  const visiblePosts = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter((p) => p.status === filter);
  }, [posts, filter]);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setBusyId(id);
    // optimistic update
    const prev = posts;
    setPosts((cur) => cur.map((p) => (p.id === id ? { ...p, status } : p)));
    try {
      const { error } = await supabase
        .from("vendor_posts")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to update status:", err);
      setPosts(prev); // rollback
      alert("Could not update this post. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this vendor post? This cannot be undone.")) return;
    setBusyId(id);
    const prev = posts;
    setPosts((cur) => cur.filter((p) => p.id !== id));
    try {
      const { error } = await supabase.from("vendor_posts").delete().eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to delete post:", err);
      setPosts(prev); // rollback
      alert("Could not delete this post. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filterTabs: { key: StatusFilter; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Megaphone size={26} className="text-primary" />
          Vendor Business Feed
        </h1>
        <p className="text-muted-foreground text-sm">
          Review, approve, and reject exhibitor posts before they appear on the public feed.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border transition-all rounded-none ${
                active
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-none ${
                  active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {loadError && (
        <div className="p-4 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-none">
          <p className="font-bold mb-1">Could not load posts.</p>
          <p>{loadError}</p>
          <p className="mt-2 text-xs">
            If pending posts aren&apos;t showing, make sure the admin SELECT policy from{" "}
            <code className="font-mono">supabase_migration_vendor_feed.sql</code> has been applied.
          </p>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm bg-white border border-border shadow-sm">
            Loading vendor posts...
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm bg-white border border-border shadow-sm">
            {filter === "pending"
              ? "No posts waiting for review. You're all caught up!"
              : "No posts in this category."}
          </div>
        ) : (
          visiblePosts.map((post) => {
            const type = typeStyles[post.post_type] ?? typeStyles.update;
            const status = statusStyles[post.status] ?? statusStyles.pending;
            const TypeIcon = type.icon;
            const StatusIcon = status.icon;
            return (
              <div
                key={post.id}
                className="bg-white border border-border shadow-sm flex flex-col md:flex-row overflow-hidden"
              >
                {post.image_url && (
                  <div className="md:w-48 shrink-0 bg-muted border-b md:border-b-0 md:border-r border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image_url}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-40 md:h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-6 flex flex-col gap-4 min-w-0">
                  {/* Top row: vendor + badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 mr-1">
                      <Store size={15} className="text-primary" />
                      <span className="text-sm font-bold text-foreground">
                        {post.vendor_name || "Unnamed Exhibitor"}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-none ${type.className}`}>
                      <TypeIcon size={10} />
                      {type.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-none ${status.className}`}>
                      <StatusIcon size={10} />
                      {status.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                      <Calendar size={12} />
                      {formatDate(post.created_at)}
                    </span>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1.5">{post.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {post.body}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                    {post.status !== "approved" && (
                      <button
                        onClick={() => updateStatus(post.id, "approved")}
                        disabled={busyId === post.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all rounded-none disabled:opacity-50"
                      >
                        <Check size={14} />
                        Approve
                      </button>
                    )}
                    {post.status !== "rejected" && (
                      <button
                        onClick={() => updateStatus(post.id, "rejected")}
                        disabled={busyId === post.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-none disabled:opacity-50"
                      >
                        <X size={14} />
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={busyId === post.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-border text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all rounded-none disabled:opacity-50 ml-auto"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
