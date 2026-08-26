"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { ArrowLeft, Send, Megaphone, CheckCircle2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

const postTypes = [
  { value: "update", label: "Update — general news from your booth" },
  { value: "promotion", label: "Promotion — a deal or show-only offer" },
  { value: "announcement", label: "Announcement — a launch or reveal" },
];

export default function SubmitVendorPostPage() {
  const container = useRef<HTMLDivElement>(null);
  const openedAt = useRef(Date.now()); // used to reject impossibly-fast (bot) submits

  const [vendorName, setVendorName] = useState("");
  const [title, setTitle] = useState("");
  const [postType, setPostType] = useState("update");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [hp, setHp] = useState(""); // honeypot: real users never see or fill this

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useGSAP(
    () => {
      gsap.fromTo(".fade-up",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }
      );
    },
    { scope: container, dependencies: [submitted] }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bot traps: a filled honeypot or an impossibly fast submit — pretend it
    // worked but silently drop it (no DB write, no moderation-queue spam).
    if (hp.trim() !== "" || Date.now() - openedAt.current < 2500) {
      setSubmitted(true);
      return;
    }

    if (!vendorName.trim() || !title.trim() || !body.trim()) {
      setErrorMsg("Please fill out your business name, a title, and the post content.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.from("vendor_posts").insert([
        {
          vendor_name: vendorName.trim(),
          title: title.trim(),
          body: body.trim(),
          post_type: postType,
          image_url: imageUrl.trim() || null,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
    } catch (err: any) {
      console.error("Supabase insert error:", err);
      setErrorMsg(err.message || "Something went wrong submitting your post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setVendorName("");
    setTitle("");
    setPostType("update");
    setBody("");
    setImageUrl("");
    setSubmitted(false);
    setErrorMsg("");
    setHp("");
    openedAt.current = Date.now();
  };

  return (
    <main ref={container} className="flex-1 bg-background py-32 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <div className="fade-up mb-8">
          <Link
            href="/vendors/feed"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-all"
          >
            <ArrowLeft size={16} />
            Back to Business Feed
          </Link>
        </div>

        {submitted ? (
          <div className="fade-up bg-white border border-border shadow-sm rounded-none p-10 text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <CheckCircle2 size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground mb-3">
              Post submitted for review
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
              Thanks! Your update has been sent to the Home Show team. Once it's approved
              it will appear on the public Vendor Business Feed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={resetForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-none bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
              >
                <Send size={16} />
                Submit Another
              </button>
              <Link
                href="/vendors/feed"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-none border border-border text-foreground font-bold text-sm hover:bg-muted transition-all"
              >
                View the Feed
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="fade-up mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                <Megaphone size={14} />
                Exhibitor Feed
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-3">
                Post to the <span className="text-primary">Business Feed</span>
              </h1>
              <p className="text-muted-foreground text-sm max-w-xl">
                Share a deal, launch, or update with attendees planning their visit.
                Submissions are reviewed by the Home Show team before appearing on the live feed.
              </p>
            </div>

            {/* Form Card */}
            <div className="fade-up bg-white border border-border p-8 shadow-sm rounded-none">
              {errorMsg && (
                <div className="mb-6 p-4 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-none">
                  {errorMsg}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Honeypot — hidden from real users; bots that fill it get dropped */}
                <div
                  aria-hidden="true"
                  style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" }}
                >
                  <label htmlFor="company_url">Company URL</label>
                  <input
                    id="company_url"
                    name="company_url"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                  />
                </div>

                {/* Business Name */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">
                    Business Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full p-3 rounded-none border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary border-border"
                    placeholder="e.g. New York Sash"
                  />
                </div>

                {/* Title & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-foreground">
                      Post Title <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 rounded-none border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary border-border"
                      placeholder="e.g. Show-only bath remodel savings"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-foreground">Post Type</label>
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value)}
                      className="w-full p-3 rounded-none border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary border-border"
                    >
                      {postTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Body */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">
                    Post Content <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full p-3 rounded-none border bg-background text-sm min-h-[120px] focus:outline-none focus:ring-1 focus:ring-primary border-border"
                    placeholder="Tell attendees what you're offering or announcing at the show..."
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full p-3 rounded-none border bg-background text-xs font-mono text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary border-border"
                    placeholder="https://your-site.com/photo.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Link to a hosted image. Leave blank for a text-only post.
                  </p>
                </div>

                {/* Moderation notice */}
                <div className="flex items-start gap-2.5 p-3 bg-muted/50 border border-border text-xs text-muted-foreground rounded-none">
                  <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>
                    Every submission is reviewed by the Home Show team before it appears publicly.
                    Please keep posts relevant to your exhibit and the event.
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-none bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
                >
                  <Send size={16} />
                  {submitting ? "Submitting..." : "Submit for Review"}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
