"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Calendar, User, ArrowRight, Rss, Plus } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Post {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date?: string; // fallback
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
    content: "Our presenting sponsor New York Sash will showcase top-tier custom siding, bath systems, and window options. Find them directly at booth A1 for exclusive discount consultations.",
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

export default function NewsPage() {
  const container = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching posts:", error);
          setPosts(defaultArticles);
        } else if (data && data.length > 0) {
          setPosts(data);
        } else {
          // If table is empty, show default posts
          setPosts(defaultArticles);
        }
      } catch (err) {
        console.error("Failed to connect to Supabase:", err);
        setPosts(defaultArticles);
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
        gsap.fromTo(".article-card",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
        );
      }
    },
    { scope: container, dependencies: [posts] }
  );

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
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
              <Rss size={14} />
              Show News
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
              Latest <span className="text-primary">Happenings</span>
            </h1>
            <p className="text-muted-foreground max-w-xl text-base">
              Stay up to date with the latest news, announcements, and scheduling details for the Home Show at Nexus Center.
            </p>
          </div>
          <div className="flex justify-center shrink-0">
            <Link
              href="/news/create"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-none bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} />
              Create Post
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            Loading news articles...
          </div>
        ) : (
          /* Article Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {posts.map((article) => (
              <article
                key={article.slug}
                className="article-card bg-white border border-border rounded-none p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                    <span>{article.category}</span>
                  </div>
                  <Link href={`/news/${article.slug}`}>
                    <h2 className="text-xl font-bold text-foreground mb-3 hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                  </Link>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="border-t border-border pt-4 mt-auto">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User size={12} />
                      <span>{article.author}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
