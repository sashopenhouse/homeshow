"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Megaphone, Store, Calendar, Plus, Tag, Sparkles, Rss } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface VendorPost {
  id: string;
  vendor_name: string | null;
  title: string;
  body: string;
  image_url: string | null;
  post_type: string;
  created_at: string;
}

const defaultPosts: VendorPost[] = [
  {
    id: "sample-1",
    vendor_name: "New York Sash",
    title: "Show-Only Bath Remodel Savings",
    body: "Stop by booth A1 for an exclusive Home Show consultation. Attendees who book on-site receive a special package on custom bath and shower systems — available at the Nexus Center only.",
    image_url: null,
    post_type: "promotion",
    created_at: new Date("2026-01-12").toISOString(),
  },
  {
    id: "sample-2",
    vendor_name: "Timberland Fence",
    title: "New Composite Fencing Line Debuts at the Show",
    body: "We're bringing samples of our brand-new low-maintenance composite fencing to the floor this year. Come feel the difference and talk installation timelines with our team.",
    image_url: null,
    post_type: "announcement",
    created_at: new Date("2026-01-09").toISOString(),
  },
  {
    id: "sample-3",
    vendor_name: "Clinton Tractor",
    title: "Live Equipment Demos All Weekend",
    body: "Catch our compact tractor and outdoor power equipment demos throughout both days. Ask about seasonal financing while you're there.",
    image_url: null,
    post_type: "update",
    created_at: new Date("2026-01-05").toISOString(),
  },
];

const typeStyles: Record<string, { label: string; className: string; icon: typeof Tag }> = {
  promotion: { label: "Promotion", className: "text-amber-700 bg-amber-50 border-amber-200", icon: Tag },
  announcement: { label: "Announcement", className: "text-blue-700 bg-blue-50 border-blue-200", icon: Sparkles },
  update: { label: "Update", className: "text-primary bg-primary/10 border-primary/20", icon: Store },
};

function PostTypeBadge({ type }: { type: string }) {
  const style = typeStyles[type] ?? typeStyles.update;
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-none ${style.className}`}>
      <Icon size={11} />
      {style.label}
    </span>
  );
}

export default function VendorFeedPage() {
  const container = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<VendorPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from("vendor_posts")
          .select("id, vendor_name, title, body, image_url, post_type, created_at")
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching vendor posts:", error);
          setPosts(defaultPosts);
        } else if (data && data.length > 0) {
          setPosts(data);
        } else {
          setPosts(defaultPosts);
        }
      } catch (err) {
        console.error("Failed to connect to Supabase:", err);
        setPosts(defaultPosts);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  useGSAP(
    () => {
      if (posts.length > 0) {
        gsap.fromTo(".fade-in-header",
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        );
        gsap.fromTo(".feed-card",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
        );
      }
    },
    { scope: container, dependencies: [posts] }
  );

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main ref={container} className="flex-1 bg-background py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="fade-in-header flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
              <Megaphone size={14} />
              Exhibitor Feed
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
              Vendor <span className="text-primary">Business Feed</span>
            </h1>
            <p className="text-muted-foreground max-w-xl text-base">
              Deals, debuts, and announcements straight from the exhibitors on the floor.
              See what our vendors are bringing to the 2026 Home Show at Nexus Center.
            </p>
          </div>
          <div className="flex justify-center shrink-0">
            <Link
              href="/vendors/feed/submit"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-none bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} />
              Post an Update
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground flex items-center justify-center gap-2">
            <Rss size={16} className="animate-pulse" />
            Loading the latest from exhibitors...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="feed-card bg-white border border-border rounded-none shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {post.image_url && (
                  <div className="w-full aspect-[16/9] bg-muted overflow-hidden border-b border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image_url}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 shrink-0 bg-primary/12 border border-primary/20 flex items-center justify-center">
                        <Store size={15} className="text-primary" />
                      </div>
                      <span className="text-sm font-bold text-foreground truncate">
                        {post.vendor_name || "Home Show Exhibitor"}
                      </span>
                    </div>
                    <PostTypeBadge type={post.post_type} />
                  </div>

                  <h2 className="text-lg font-bold text-foreground mb-2 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-4 whitespace-pre-line">
                    {post.body}
                  </p>

                  <div className="border-t border-border pt-4 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar size={12} />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 bg-secondary/20 border border-secondary rounded-none p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">Exhibiting at the show?</h3>
            <p className="text-muted-foreground text-sm">
              Share a deal or announcement with attendees. Posts are reviewed before going live.
            </p>
          </div>
          <Link
            href="/vendors/feed/submit"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-none bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={16} />
            Submit a Post
          </Link>
        </div>
      </div>
    </main>
  );
}
