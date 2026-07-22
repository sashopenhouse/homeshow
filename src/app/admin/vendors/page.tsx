"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Building2,
  Upload,
  Search,
  Check,
  ExternalLink,
  MapPin,
  FileSpreadsheet,
  X,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";

interface Vendor {
  id: string;
  company_name: string;
  website_url: string | null;
  industry_category: string | null;
}

type Mapping = { company: number | null; website: number | null; category: number | null };

// Minimal CSV parser: handles quoted fields, escaped quotes, commas, CRLF.
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function guessColumn(headers: string[], keywords: string[]): number | null {
  const idx = headers.findIndex((h) => keywords.some((k) => h.toLowerCase().includes(k)));
  return idx >= 0 ? idx : null;
}

export default function AdminVendorPoolPage() {
  const fileRef = useRef<HTMLInputElement>(null);

  const [pool, setPool] = useState<Vendor[]>([]);
  const [boothCounts, setBoothCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ company_name: "", website_url: "", industry_category: "" });
  const [rowBusy, setRowBusy] = useState<string | null>(null);

  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Mapping>({ company: null, website: null, category: null });
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);
  const [parseError, setParseError] = useState("");

  async function loadPool() {
    try {
      const [vRes, bRes] = await Promise.all([
        supabase
          .from("vendors")
          .select("id, company_name, website_url, industry_category")
          .order("company_name", { ascending: true }),
        supabase.from("booths").select("vendor_id").not("vendor_id", "is", null),
      ]);
      if (vRes.data) setPool(vRes.data);
      if (bRes.data) {
        const counts: Record<string, number> = {};
        (bRes.data as { vendor_id: string }[]).forEach((b) => {
          if (b.vendor_id) counts[b.vendor_id] = (counts[b.vendor_id] || 0) + 1;
        });
        setBoothCounts(counts);
      }
    } catch (err) {
      console.error("Error loading vendor pool:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPool();
  }, []);

  const ingest = (text: string) => {
    setResult(null);
    setParseError("");
    const rows = parseCSV(text);
    if (rows.length < 2) {
      setParseError("Couldn't find a header row plus at least one data row.");
      setHeaders([]);
      setDataRows([]);
      return;
    }
    const hdr = rows[0].map((h) => h.trim());
    setHeaders(hdr);
    setDataRows(rows.slice(1));
    setMapping({
      company: guessColumn(hdr, ["company", "business", "exhibitor", "organization", "name"]),
      website: guessColumn(hdr, ["website", "url", "site", "web"]),
      category: guessColumn(hdr, ["category", "type", "industry", "classification"]),
    });
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => ingest(String(reader.result || ""));
    reader.readAsText(file);
  };

  const clearImport = () => {
    setHeaders([]);
    setDataRows([]);
    setMapping({ company: null, website: null, category: null });
    setResult(null);
    setParseError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  // Build the vendor rows the current mapping would produce.
  const previewRows = useMemo(() => {
    if (mapping.company == null) return [];
    return dataRows
      .map((r) => ({
        company_name: (r[mapping.company as number] || "").trim(),
        website_url: mapping.website != null ? (r[mapping.website] || "").trim() || null : null,
        industry_category: mapping.category != null ? (r[mapping.category] || "").trim() || null : null,
      }))
      .filter((v) => v.company_name);
  }, [dataRows, mapping]);

  const handleImport = async () => {
    if (!previewRows.length) return;
    setImporting(true);
    setResult(null);
    try {
      // de-dupe within the file (case-insensitive on name)
      const seen = new Set<string>();
      const unique = previewRows.filter((v) => {
        const key = v.company_name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const existing = new Set(pool.map((p) => p.company_name.toLowerCase()));
      const toInsert = unique.filter((v) => !existing.has(v.company_name.toLowerCase()));

      if (toInsert.length) {
        const { error } = await supabase.from("vendors").insert(toInsert);
        if (error) throw error;
      }

      setResult({ added: toInsert.length, skipped: previewRows.length - toInsert.length });
      await loadPool();
    } catch (err: any) {
      console.error("Import error:", err);
      setParseError(err?.message || "Import failed. Check the console for details.");
    } finally {
      setImporting(false);
    }
  };

  const startEdit = (v: Vendor) => {
    setEditingId(v.id);
    setEditForm({
      company_name: v.company_name,
      website_url: v.website_url || "",
      industry_category: v.industry_category || "",
    });
  };

  const saveEdit = async (id: string) => {
    if (!editForm.company_name.trim()) return;
    setRowBusy(id);
    try {
      const patch = {
        company_name: editForm.company_name.trim(),
        website_url: editForm.website_url.trim() || null,
        industry_category: editForm.industry_category.trim() || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("vendors").update(patch).eq("id", id);
      if (error) throw error;
      setPool((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
      setEditingId(null);
    } catch (err: any) {
      console.error("Update vendor error:", err);
      alert("Could not save changes.");
    } finally {
      setRowBusy(null);
    }
  };

  const deleteVendor = async (v: Vendor) => {
    if (!confirm(`Remove "${v.company_name}" from the pool? Any booth it's assigned to becomes unassigned.`)) return;
    setRowBusy(v.id);
    try {
      const { error } = await supabase.from("vendors").delete().eq("id", v.id);
      if (error) throw error;
      setPool((prev) => prev.filter((x) => x.id !== v.id));
      setBoothCounts((prev) => {
        const next = { ...prev };
        delete next[v.id];
        return next;
      });
      if (editingId === v.id) setEditingId(null);
    } catch (err: any) {
      console.error("Delete vendor error:", err);
      alert("Could not delete. Make sure supabase_migration_vendor_delete.sql has been run.");
    } finally {
      setRowBusy(null);
    }
  };

  const filteredPool = useMemo(() => {
    const qq = query.trim().toLowerCase();
    if (!qq) return pool;
    return pool.filter(
      (v) =>
        v.company_name.toLowerCase().includes(qq) ||
        (v.industry_category || "").toLowerCase().includes(qq)
    );
  }, [pool, query]);

  const assignedCount = useMemo(
    () => pool.filter((v) => boothCounts[v.id]).length,
    [pool, boothCounts]
  );

  const columnOptions = (
    <>
      <option value="">— none —</option>
      {headers.map((h, i) => (
        <option key={i} value={i}>
          {h || `Column ${i + 1}`}
        </option>
      ))}
    </>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Building2 size={26} className="text-primary" />
          Vendor Pool
        </h1>
        <p className="text-muted-foreground text-sm">
          Import exhibitors here, then assign them to booths from the{" "}
          <span className="font-semibold text-foreground">Booth Map</span> editor&apos;s vendor dropdown.
        </p>
      </div>

      {/* Import card */}
      <div className="bg-white border border-border shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Upload size={18} className="text-primary" />
          <h2 className="font-bold text-base text-foreground">Import from CSV</h2>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Export your registrations (e.g. from RegFox) as CSV, then upload or paste below. Existing
          companies are skipped, so it&apos;s safe to re-import.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onFile}
            className="block text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:border file:border-border file:bg-muted file:text-foreground file:text-xs file:font-bold file:rounded-none hover:file:bg-muted/70 file:cursor-pointer"
          />
          {(headers.length > 0 || parseError) && (
            <button
              onClick={clearImport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-none shrink-0"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground font-semibold hover:text-foreground">
            …or paste CSV text
          </summary>
          <textarea
            rows={4}
            onChange={(e) => ingest(e.target.value)}
            placeholder="Company,Website,Category&#10;New York Sash,https://newyorksash.com,Exterior Remodeling"
            className="mt-2 w-full p-3 rounded-none border border-border bg-background text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </details>

        {parseError && (
          <div className="p-3 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-none">
            {parseError}
          </div>
        )}

        {headers.length > 0 && (
          <div className="space-y-5 border-t border-border pt-5">
            {/* Column mapping */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
                  Company column <span className="text-destructive">*</span>
                </label>
                <select
                  value={mapping.company ?? ""}
                  onChange={(e) => setMapping((m) => ({ ...m, company: e.target.value === "" ? null : Number(e.target.value) }))}
                  className="w-full p-2.5 rounded-none border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {columnOptions}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
                  Website column
                </label>
                <select
                  value={mapping.website ?? ""}
                  onChange={(e) => setMapping((m) => ({ ...m, website: e.target.value === "" ? null : Number(e.target.value) }))}
                  className="w-full p-2.5 rounded-none border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {columnOptions}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
                  Category column
                </label>
                <select
                  value={mapping.category ?? ""}
                  onChange={(e) => setMapping((m) => ({ ...m, category: e.target.value === "" ? null : Number(e.target.value) }))}
                  className="w-full p-2.5 rounded-none border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {columnOptions}
                </select>
              </div>
            </div>

            {/* Preview */}
            {mapping.company == null ? (
              <p className="text-sm text-muted-foreground">Pick which column holds the company name to preview.</p>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  <FileSpreadsheet size={14} />
                  Preview — {previewRows.length} vendors detected
                </div>
                <div className="border border-border max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-muted/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="p-2 pl-3">Company</th>
                        <th className="p-2">Website</th>
                        <th className="p-2">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {previewRows.slice(0, 50).map((v, i) => (
                        <tr key={i}>
                          <td className="p-2 pl-3 font-semibold text-foreground">{v.company_name}</td>
                          <td className="p-2 text-muted-foreground truncate max-w-[200px]">{v.website_url || "—"}</td>
                          <td className="p-2 text-muted-foreground">{v.industry_category || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewRows.length > 50 && (
                  <p className="text-[11px] text-muted-foreground mt-1">Showing first 50 of {previewRows.length}.</p>
                )}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={importing || !previewRows.length}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-none bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Check size={16} />
              {importing ? "Importing…" : `Import ${previewRows.length} vendors`}
            </button>
          </div>
        )}

        {result && (
          <div className="p-4 bg-primary/10 border-l-4 border-primary text-sm rounded-none">
            <span className="font-bold text-foreground">{result.added} added</span>
            {result.skipped > 0 && (
              <span className="text-muted-foreground"> · {result.skipped} skipped (already in the pool)</span>
            )}
          </div>
        )}
      </div>

      {/* Pool list */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="font-bold text-base text-foreground">
            Current pool — {loading ? "…" : pool.length} vendors
            {!loading && <span className="text-muted-foreground font-normal"> · {assignedCount} assigned to booths</span>}
          </h2>
          <div className="flex items-center bg-white border border-border px-4 py-2 shadow-sm sm:w-72">
            <Search className="text-muted-foreground mr-2 shrink-0" size={16} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the pool…"
              className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="bg-white border border-border shadow-sm">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading pool…</div>
          ) : filteredPool.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {pool.length === 0 ? "The pool is empty — import a CSV above to get started." : "No vendors match your search."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-3 pl-4">Company</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Website</th>
                    <th className="p-3 text-right">Booths</th>
                    <th className="p-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPool.map((v) => {
                    const editing = editingId === v.id;
                    return (
                      <tr key={v.id} className="hover:bg-muted/30 transition-colors align-top">
                        {editing ? (
                          <>
                            <td className="p-2 pl-4">
                              <input
                                value={editForm.company_name}
                                onChange={(e) => setEditForm((f) => ({ ...f, company_name: e.target.value }))}
                                className="w-full p-2 rounded-none border border-border bg-background text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                value={editForm.industry_category}
                                onChange={(e) => setEditForm((f) => ({ ...f, industry_category: e.target.value }))}
                                placeholder="Category"
                                className="w-full p-2 rounded-none border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </td>
                            <td className="p-2" colSpan={2}>
                              <input
                                value={editForm.website_url}
                                onChange={(e) => setEditForm((f) => ({ ...f, website_url: e.target.value }))}
                                placeholder="https://…"
                                className="w-full p-2 rounded-none border border-border bg-background text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </td>
                            <td className="p-2 pr-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => saveEdit(v.id)}
                                disabled={rowBusy === v.id}
                                title="Save"
                                className="p-2 border border-border text-primary hover:bg-primary/10 transition-all inline-flex align-middle disabled:opacity-50"
                              >
                                <Save size={15} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                title="Cancel"
                                className="p-2 border border-border text-muted-foreground hover:bg-muted transition-all inline-flex align-middle ml-1"
                              >
                                <X size={15} />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 pl-4 font-bold text-foreground">{v.company_name}</td>
                            <td className="p-3 text-muted-foreground">{v.industry_category || "—"}</td>
                            <td className="p-3">
                              {v.website_url ? (
                                <a
                                  href={v.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  Link <ExternalLink size={11} />
                                </a>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {boothCounts[v.id] ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5">
                                  <MapPin size={10} />
                                  {boothCounts[v.id]}
                                </span>
                              ) : (
                                <span className="text-[11px] text-muted-foreground">unassigned</span>
                              )}
                            </td>
                            <td className="p-3 pr-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => startEdit(v)}
                                title="Edit"
                                className="p-2 border border-border text-foreground hover:bg-primary/10 hover:border-primary/40 transition-all inline-flex align-middle"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => deleteVendor(v)}
                                disabled={rowBusy === v.id}
                                title="Delete"
                                className="p-2 border border-border text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all inline-flex align-middle ml-1 disabled:opacity-50"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
