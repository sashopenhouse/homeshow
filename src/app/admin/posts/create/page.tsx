"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function AdminCreatePostPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Event Updates");
  const [author, setAuthor] = useState("Home Show Team");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars
      .replace(/\s+/g, "-")         // replace spaces with dashes
      .replace(/-+/g, "-");         // collapse multiple dashes
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      setErrorMsg("Please fill out the Title, Slug, and Content fields.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.from("posts").insert([
        {
          title,
          slug,
          excerpt: excerpt || content.substring(0, 120) + "...",
          content,
          category,
          author,
          created_at: new Date().toISOString()
        }
      ]);

      if (error) {
        throw error;
      }

      router.push("/admin/posts");
    } catch (err: any) {
      console.error("Supabase insert error:", err);
      setErrorMsg(err.message || "Failed to create post. Ensure the database table is configured.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back Link */}
      <div>
        <Link href="/admin/posts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-all">
          <ArrowLeft size={16} />
          Back to Posts List
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Create New <span className="text-primary">Post</span>
        </h1>
        <p className="text-muted-foreground text-sm">Write and publish articles to the news section of the website.</p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-border p-8 shadow-sm rounded-none">
        {errorMsg && (
          <div className="mb-6 p-4 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-none">
            {errorMsg}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-1.5 block text-foreground">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full p-3 rounded-none border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary border-border"
              placeholder="e.g. Exhibitor Spotlights at the 2026 Nexus Center Home Show"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="text-sm font-medium mb-1.5 block text-foreground">URL Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full p-3 rounded-none border bg-background text-xs font-mono text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary border-border"
              placeholder="e.g. exhibitor-spotlights-2026"
            />
          </div>

          {/* Category & Author Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-none border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary border-border"
              >
                <option>Event Updates</option>
                <option>Exhibitors</option>
                <option>Entertainment</option>
                <option>General News</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-3 rounded-none border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary border-border"
                placeholder="Home Show Team"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-sm font-medium mb-1.5 block text-foreground">Excerpt (Short Hook)</label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full p-3 rounded-none border bg-background text-sm min-h-[60px] focus:outline-none focus:ring-1 focus:ring-primary border-border"
              placeholder="A short hook summarizing this post..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium mb-1.5 block text-foreground">Full Body Content</label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 rounded-none border bg-background text-sm min-h-[200px] focus:outline-none focus:ring-1 focus:ring-primary border-border"
              placeholder="Write the full body content of your post here (HTML or plain text)..."
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-none"
          >
            <Save size={16} />
            {submitting ? "Saving Post..." : "Publish Post"}
          </Button>
        </form>
      </div>
    </div>
  );
}
