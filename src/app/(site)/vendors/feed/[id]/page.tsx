"use client";

import { useEffect, useState, useRef, use } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowLeft, Calendar, Store, Tag, Sparkles } from "lucide-react";
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

// Kept in sync with the sample posts shown on /vendors/feed when the
// vendor_posts table is empty, so a shared link to one of those still
// resolves here instead of 404ing.
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

export default function VendorPostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const container = useRef<HTMLDivElement>(null);
  const [post, setPost] = useState<VendorPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data, error } = await supabase
          .from("vendor_posts")
          .select("id, vendor_name, title, body, image_url, post_type, created_at")
          .eq("id", id)
          .eq("status", "approved")
          .single();

        if (error || !data) {
          setPost(defaultPosts.find((p) => p.id === id) ?? null);
        } else {
          setPost(data);
        }
      } catch {
        setPost(defaultPosts.find((p) => p.id === id) ?? null);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  useGSAP(
    () => {
      if (post) {
        gsap.fromTo(".fade-in-content",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );
      }
    },
    { scope: container, dependencies: [post] }
  );

  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  if (loading) {
    return (
      <main className="flex-1 bg-background py-32 px-6 text-center text-muted-foreground">
        Loading post…
      </main>
    );
  }

  if (!post) {
    return (
      <main className="flex-1 bg-background py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-black mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This update does not exist, is still pending review, or has been removed.
          </p>
          <Link href="/vendors/feed" className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all">
            <ArrowLeft size={16} />
            Back to Business Feed
          </Link>
        </div>
      </main>
    );
  }

  const style = typeStyles[post.post_type] ?? typeStyles.update;
  const TypeIcon = style.icon;

  return (
    <main ref={container} className="flex-1 bg-background py-32 px-6">
      <article className="max-w-2xl mx-auto fade-in-content">
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/vendors/feed" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-all">
            <ArrowLeft size={16} />
            Back to Business Feed
          </Link>
        </div>

        {/* Post Type Header */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-none border text-xs font-bold uppercase tracking-wider mb-6 ${style.className}`}>
          <TypeIcon size={14} />
          {style.label}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground border-y border-border py-4 mb-10">
          <div className="flex items-center gap-1.5">
            <Store size={16} />
            <span className="font-semibold text-foreground">{post.vendor_name || "Home Show Exhibitor"}</span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <Calendar size={16} />
            <span>{formatDate(post.created_at)}</span>
          </div>
        </div>

        {/* Image */}
        {post.image_url && (
          <div className="w-full aspect-[16/9] bg-muted overflow-hidden border border-border mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content Body */}
        <div className="prose prose-primary max-w-none text-foreground leading-relaxed space-y-6 text-base md:text-lg whitespace-pre-line">
          {post.body}
        </div>
      </article>
    </main>
  );
}
