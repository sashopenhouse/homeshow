"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Award, Building2 } from "lucide-react";
import Link from "next/link";

interface Sponsor {
  id: string;
  name: string;
  description: string;
  tier: string;
  logo_url?: string;
  order_index: number;
}

export default function AdminManageSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchSponsors() {
    try {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("order_index", { ascending: true });

      if (!error && data) {
        setSponsors(data);
      }
    } catch (err) {
      console.error("Error fetching sponsors:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sponsor?")) return;
    setDeletingId(id);

    try {
      const { error } = await supabase.from("sponsors").delete().eq("id", id);
      if (error) throw error;
      setSponsors((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete sponsor. Try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground font-sans">Manage Sponsors</h1>
          <p className="text-muted-foreground text-sm">Add, configure, and delete event partners appearing on the sponsors page.</p>
        </div>
        <div className="flex shrink-0">
          <Link
            href="/admin/sponsors/create"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-none bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={16} />
            Add Sponsor
          </Link>
        </div>
      </div>

      {/* Sponsors Table */}
      <div className="bg-white border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Loading show partners...
          </div>
        ) : sponsors.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No sponsors found in the database. Add your first sponsor now!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 pl-6">Sponsor Name</th>
                  <th className="p-4">Tier Level</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Sort Order</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {sponsors.map((sponsor) => (
                  <tr key={sponsor.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6 font-bold text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-none border bg-muted flex items-center justify-center text-muted-foreground">
                          <Building2 size={14} />
                        </div>
                        <span>{sponsor.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-0.5 border border-border bg-muted/60 text-foreground`}>
                        {sponsor.tier}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground max-w-xs truncate" title={sponsor.description}>
                      {sponsor.description}
                    </td>
                    <td className="p-4 text-muted-foreground font-mono">{sponsor.order_index}</td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDelete(sponsor.id)}
                        disabled={deletingId === sponsor.id}
                        className="p-2 border border-border text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all cursor-pointer inline-flex items-center justify-center align-middle"
                        title="Delete Sponsor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
