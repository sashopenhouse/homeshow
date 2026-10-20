"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Gift, Trash2, Search, Download, Check } from "lucide-react";

interface Entry {
  id: string;
  name: string;
  email: string;
  phone: string;
  opt_in: boolean;
  created_at: string;
}

export default function AdminContestPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "opted in">("all");
  const [query, setQuery] = useState("");

  async function fetchEntries() {
    try {
      const { data, error } = await supabase
        .from("contest_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setEntries(data);
    } catch (err) {
      console.error("Error fetching contest entries:", err);
      setLoadError("Could not load entries. Make sure supabase_migration_contest_entries.sql has been run.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  const deleteEntry = async (e: Entry) => {
    if (!confirm(`Delete the entry from ${e.name}?`)) return;
    setBusyId(e.id);
    const prev = entries;
    setEntries((cur) => cur.filter((x) => x.id !== e.id));
    try {
      const { error } = await supabase.from("contest_entries").delete().eq("id", e.id);
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setEntries(prev);
      alert("Could not delete this entry.");
    } finally {
      setBusyId(null);
    }
  };

  const optInCount = entries.filter((e) => e.opt_in).length;

  const visible = entries.filter((e) => {
    if (filter === "opted in" && !e.opt_in) return false;
    const qq = query.trim().toLowerCase();
    if (!qq) return true;
    return [e.name, e.email, e.phone].some((f) => (f || "").toLowerCase().includes(qq));
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Download the entries in the current view as a CSV file.
  const exportCsv = () => {
    const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [
      ["Name", "Email", "Phone", "Opted In", "Entered"],
      ...visible.map((e) => [e.name, e.email, e.phone, e.opt_in ? "Yes" : "No", new Date(e.created_at).toLocaleString("en-US")]),
    ];
    const csv = rows.map((r) => r.map(cell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `contest-entries${filter === "opted in" ? "-opted-in" : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Gift size={26} className="text-primary" />
            Contest Entries
          </h1>
          <p className="text-muted-foreground text-sm">
            &ldquo;Enter to Win&rdquo; submissions from the homepage banner.
            {entries.length > 0 && (
              <span className="text-primary font-semibold">
                {" "}
                · {entries.length} {entries.length === 1 ? "entry" : "entries"} · {optInCount} opted in
              </span>
            )}
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={visible.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all rounded-none disabled:opacity-50 shrink-0"
        >
          <Download size={16} />
          Download CSV
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {(["all", "opted in"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border transition-all rounded-none capitalize ${
                filter === f
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
              }`}
            >
              {f}
              {f === "opted in" && (
                <span className={`text-xs px-1.5 py-0.5 rounded-none ${filter === f ? "bg-white/20" : "bg-muted"}`}>
                  {optInCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-white border border-border px-4 py-2 shadow-sm flex-1">
          <Search className="text-muted-foreground mr-2 shrink-0" size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or phone…"
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-border shadow-sm overflow-x-auto">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading entries…</div>
        ) : loadError ? (
          <div className="text-center py-16 text-destructive text-sm">{loadError}</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {entries.length === 0 ? "No entries yet." : "No entries match this view."}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Opted In</th>
                <th className="p-4">Entered</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {visible.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30">
                  <td className="p-4 font-semibold text-foreground">{e.name}</td>
                  <td className="p-4">
                    <a href={`mailto:${e.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {e.email}
                    </a>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <a href={`tel:${e.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {e.phone}
                    </a>
                  </td>
                  <td className="p-4">
                    {e.opt_in ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                        <Check size={14} /> Yes
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No</span>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground whitespace-nowrap">{formatDate(e.created_at)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteEntry(e)}
                      disabled={busyId === e.id}
                      aria-label={`Delete entry from ${e.name}`}
                      className="p-2 border border-border text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all rounded-none disabled:opacity-50 inline-flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
