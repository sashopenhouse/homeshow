"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function AdminCreateSponsorPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [tier, setTier] = useState("Major Partners");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setErrorMsg("Please fill out the Sponsor Name field.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.from("sponsors").insert([
        {
          name,
          tier,
          description,
          logo_url: logoUrl || null,
          order_index: Number(orderIndex) || 0,
          created_at: new Date().toISOString()
        }
      ]);

      if (error) {
        throw error;
      }

      router.push("/admin/sponsors");
    } catch (err: any) {
      console.error("Supabase insert error:", err);
      setErrorMsg(err.message || "Failed to add sponsor. Ensure the database schema is updated.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back Link */}
      <div>
        <Link href="/admin/sponsors" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-all">
          <ArrowLeft size={16} />
          Back to Sponsors List
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Add New <span className="text-primary">Sponsor</span>
        </h1>
        <p className="text-muted-foreground text-sm">Add event partners and group them by support tiers on the live site.</p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-border p-8 shadow-sm rounded-none">
        {errorMsg && (
          <div className="mb-6 p-4 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-none">
            {errorMsg}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="text-sm font-medium mb-1.5 block text-foreground">Sponsor Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-none border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary border-border"
              placeholder="e.g. New York Sash"
            />
          </div>

          {/* Tier & Order Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Sponsor Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full p-3 rounded-none border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary border-border"
              >
                <option>Presenting Sponsor</option>
                <option>Major Partners</option>
                <option>Support Sponsors</option>
                <option>Media Partners</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Sort Order Index</label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full p-3 rounded-none border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary border-border"
                placeholder="0"
                min={0}
              />
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label className="text-sm font-medium mb-1.5 block text-foreground">Logo Image URL (Optional)</label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full p-3 rounded-none border bg-background text-xs font-mono text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary border-border"
              placeholder="e.g. /sponsors/nysash.png"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1.5 block text-foreground">Description / Bio</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-none border bg-background text-sm min-h-[100px] focus:outline-none focus:ring-1 focus:ring-primary border-border"
              placeholder="Short statement outlining what this partner does..."
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-none"
          >
            <Save size={16} />
            {submitting ? "Saving Sponsor..." : "Add Sponsor"}
          </Button>
        </form>
      </div>
    </div>
  );
}
