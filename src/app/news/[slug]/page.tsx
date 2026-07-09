"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowLeft, Calendar, User, Rss } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Post {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  created_at: string;
  author: string;
  category: string;
}

const defaultArticles = [
  {
    title: "Utica University Nexus Center Prepares for Massive 2026 Turnout",
    slug: "nexus-center-prepares-2026",
    excerpt: "With over 200 exhibitors registered, this year's Home Show is set to be the largest event of the season, introducing new interactive layouts and family attractions.",
    content: "Utica University Nexus Center is preparing to host the biggest Home Show of the region. Kessler Promotions is bringing home improvement experts, interactive schedules, live music, and child museum events under one roof.",
    created_at: new Date("2026-01-10").toISOString(),
    author: "Home Show Team",
    category: "Event Updates"
  },
  {
    title: "Exhibitor Spotlight: New York Sash Brings Custom Siding and Bath Solutions",
    slug: "exhibitor-spotlight-new-york-sash",
    excerpt: "Learn more about our presenting sponsor New York Sash and the exclusive home improvement offers they are bringing to the Nexus Center floor.",
    content: "Our presenting sponsor New York Sash will showcase top-tier custom siding, bath systems, and window options. Find them directly at booth A1 for exclusive discount consultations. Kessler promotions are bringing state of the art home remodeling directly to your doorsteps.",
    created_at: new Date("2026-01-05").toISOString(),
    author: "Kessler Promotions",
    category: "Exhibitors"
  },
  {
    title: "Interactive Children's Exhibits & Zoomobile details announced",
    slug: "children-exhibits-zoomobile-announced",
    excerpt: "Discover the educational and family entertainment options available for attendees, including hands-on activities by the Utica Children's Museum.",
    content: "Bring the whole family! The show will feature live interactive wildlife exhibits from the Zoomobile, along with dedicated educational play areas created by the Children's Museum.",
    created_at: new Date("2025-12-18").toISOString(),
    author: "Event Coordinator",
    category: "Entertainment"
  }
];

export default function PostDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("slug", unwrappedParams.slug)
          .single();

        if (error) {
          // If not in database, check default static fallbacks
          const localArticle = defaultArticles.find((a) => a.slug === unwrappedParams.slug);
          if (localArticle) {
            setPost(localArticle);
          } else {
            setPost(null);
          }
        } else if (data) {
          setPost(data);
        }
      } catch (err) {
        const localArticle = defaultArticles.find((a) => a.slug === unwrappedParams.slug);
        setPost(localArticle || null);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [unwrappedParams.slug]);

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

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="flex-1 bg-background py-32 px-6 text-center text-muted-foreground">
        Loading post details...
      </main>
    );
  }

  if (!post) {
    return (
      <main className="flex-1 bg-background py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-black mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The article you are looking for does not exist or has been removed.
          </p>
          <Link href="/news" className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all">
            <ArrowLeft size={16} />
            Back to News
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main ref={container} className="flex-1 bg-background py-32 px-6">
      <article className="max-w-2xl mx-auto fade-in-content">
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-all">
            <ArrowLeft size={16} />
            Back to News
          </Link>
        </div>

        {/* Category Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider mb-6">
          <Rss size={14} />
          {post.category}
        </div>

        {/* Article Title */}
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground border-y border-border py-4 mb-10">
          <div className="flex items-center gap-1.5">
            <Calendar size={16} />
            <span>{formatDate(post.created_at)}</span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <User size={16} />
            <span>{post.author}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="prose prose-primary max-w-none text-foreground leading-relaxed space-y-6 text-base md:text-lg">
          {post.content.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
