"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { mapRegistrant, type RegfoxRegistrant } from "@/lib/regfox-mapper";
import { Inbox, Check, X, ChevronDown, ChevronUp, ExternalLink, RefreshCw } from "lucide-react";
import { absoluteUrl } from "@/lib/utils";

interface RegfoxRegistration {
  id: string;
  regfox_registrant_id: string;
  regfox_order_id: string | null;
  regfox_lookup_id: string | null;
  mapped_company_name: string | null;
  mapped_contact_name: string | null;
  mapped_contact_email: string | null;
  mapped_contact_phone: string | null;
  mapped_website_url: string | null;
  mapped_ticket_type: string | null;
  mapped_address: string | null;
  mapped_booth_choices: string[] | null;
  mapped_sponsor_amount: number | null;
  mapped_is_sponsor: boolean | null;
  mapped_returning_vendor: boolean | null;
  mapped_product_description: string | null;
  mapped_category: string | null;
  mapped_needs_electricity: boolean | null;
  mapped_outlets_110: number | null;
  mapped_outlets_220: number | null;
  mapped_notes: string | null;
  order_total: number | null;
  raw_payload: unknown;
  status: string;
  vendor_id: string | null;
  received_at: string;
  reviewed_at: string | null;
}

interface EditValues {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  address: string;
  category: string;
  booth_choices: string;
  is_sponsor: boolean;
  sponsor_amount: string;
}

const SELECT_COLUMNS =
  "id, regfox_registrant_id, regfox_order_id, regfox_lookup_id, mapped_company_name, mapped_contact_name, mapped_contact_email, mapped_contact_phone, mapped_website_url, mapped_ticket_type, mapped_address, mapped_booth_choices, mapped_sponsor_amount, mapped_is_sponsor, mapped_returning_vendor, mapped_product_description, mapped_category, mapped_needs_electricity, mapped_outlets_110, mapped_outlets_220, mapped_notes, order_total, raw_payload, status, vendor_id, received_at, reviewed_at";

function toEditValues(r: RegfoxRegistration): EditValues {
  return {
    company_name: r.mapped_company_name || "",
    contact_name: r.mapped_contact_name || "",
    contact_email: r.mapped_contact_email || "",
    contact_phone: r.mapped_contact_phone || "",
    website_url: r.mapped_website_url || "",
    address: r.mapped_address || "",
    category: r.mapped_category || "",
    booth_choices: (r.mapped_booth_choices || []).join(", "),
    is_sponsor: r.mapped_is_sponsor === true,
    sponsor_amount: r.mapped_sponsor_amount != null ? String(r.mapped_sponsor_amount) : "",
  };
}

function parseBoothChoices(text: string): string[] | null {
  const list = text.split(",").map((s) => s.trim()).filter(Boolean);
  return list.length ? list : null;
}

function parseAmount(text: string): number | null {
  const n = Number(text.replace(/[^0-9.-]/g, ""));
  return text.trim() && Number.isFinite(n) ? n : null;
}

function vendorFieldsFrom(values: EditValues) {
  return {
    company_name: values.company_name.trim(),
    contact_name: values.contact_name.trim() || null,
    contact_email: values.contact_email.trim() || null,
    contact_phone: values.contact_phone.trim() || null,
    website_url: absoluteUrl(values.website_url),
    address: values.address.trim() || null,
    industry_category: values.category.trim() || null,
    booth_choices: parseBoothChoices(values.booth_choices),
    is_sponsor: values.is_sponsor,
    sponsor_amount: parseAmount(values.sponsor_amount),
  };
}

export default function AdminRegfoxPage() {
  const [rows, setRows] = useState<RegfoxRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewed, setShowReviewed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, EditValues>>({});

  // Callers set loading=true themselves (initial state, and the toggle
  // handler); state is only written in the .then callback below.
  useEffect(() => {
    let cancelled = false;
    let query = supabase.from("regfox_registrations").select(SELECT_COLUMNS).order("received_at", { ascending: false });
    if (!showReviewed) query = query.eq("status", "pending");
    query.then(({ data, error }) => {
      if (cancelled) return;
      if (!error && data) {
        const list = data as unknown as RegfoxRegistration[];
        setRows(list);
        const initial: Record<string, EditValues> = {};
        list.forEach((r) => {
          initial[r.id] = toEditValues(r);
        });
        setEditValues(initial);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [showReviewed]);

  const updateField = <K extends keyof EditValues>(id: string, field: K, value: EditValues[K]) => {
    setEditValues((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const addToPool = async (row: RegfoxRegistration) => {
    const values = editValues[row.id];
    if (!values.company_name.trim()) {
      alert("Company name is required — check the raw payload below and fill it in before adding.");
      return;
    }
    setBusyId(row.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .insert(vendorFieldsFrom(values))
        .select("id")
        .single();
      if (vendorError) throw vendorError;

      const { error: updateError } = await supabase
        .from("regfox_registrations")
        .update({
          status: "added",
          vendor_id: vendor.id,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.email ?? null,
        })
        .eq("id", row.id);
      if (updateError) throw updateError;

      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err) {
      console.error("Failed to add vendor from RegFox registration:", err);
      alert("Failed to add this registration to the vendor pool. See console for details.");
    } finally {
      setBusyId(null);
    }
  };

  const ignore = async (row: RegfoxRegistration) => {
    if (!confirm(`Ignore this registration${row.mapped_company_name ? ` from "${row.mapped_company_name}"` : ""}? It won't be added to the vendor pool.`)) return;
    setBusyId(row.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("regfox_registrations")
        .update({ status: "ignored", reviewed_at: new Date().toISOString(), reviewed_by: user?.email ?? null })
        .eq("id", row.id);
      if (error) throw error;
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err) {
      console.error("Failed to ignore registration:", err);
      alert("Failed to update this registration. See console for details.");
    } finally {
      setBusyId(null);
    }
  };

  // Re-runs the key-based mapper against the stored raw_payload and writes
  // the mapped_* columns back. If the row was already added to the vendor
  // pool, the linked vendor record is refreshed too — this is how a vendor
  // created while the mapping was broken gets backfilled.
  const remap = async (row: RegfoxRegistration) => {
    setBusyId(row.id);
    try {
      const mapped = mapRegistrant(row.raw_payload as RegfoxRegistrant);
      // An "added" row whose vendor has since been deleted is orphaned —
      // send it back to pending so it can be re-added with the real fields.
      const orphaned = row.status === "added" && !row.vendor_id;
      const patch = orphaned ? { ...mapped, status: "pending", reviewed_at: null, reviewed_by: null } : mapped;
      const { error } = await supabase.from("regfox_registrations").update(patch).eq("id", row.id);
      if (error) throw error;

      const updated: RegfoxRegistration = orphaned
        ? { ...row, ...mapped, status: "pending", reviewed_at: null }
        : { ...row, ...mapped };
      let vendorNote = orphaned ? " Its vendor record no longer exists, so it is back in the pending queue — review and add it again." : "";
      if (row.status === "added" && row.vendor_id) {
        const fields = vendorFieldsFrom(toEditValues(updated));
        if (fields.company_name) {
          const { error: vendorError } = await supabase.from("vendors").update(fields).eq("id", row.vendor_id);
          if (vendorError) throw vendorError;
          vendorNote = " The linked vendor record was updated too.";
        } else {
          vendorNote = " The linked vendor record was left alone because no company name was mapped.";
        }
      }

      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
      setEditValues((prev) => ({ ...prev, [row.id]: toEditValues(updated) }));
      alert(`Mapping re-run from the raw payload.${vendorNote}`);
    } catch (err) {
      console.error("Failed to re-run mapping:", err);
      alert("Failed to re-run the mapping. See console for details.");
    } finally {
      setBusyId(null);
    }
  };

  const inputClass = "w-full p-2.5 border border-border bg-background text-sm";
  const labelClass = "text-[10px] font-bold text-muted-foreground uppercase block mb-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Inbox size={26} className="text-primary" />
            RegFox Registrations
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            New paid registrations from RegFox land here first. Check each one against the raw payload before
            adding it to the public vendor pool.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showReviewed}
            onChange={(e) => {
              setLoading(true);
              setShowReviewed(e.target.checked);
            }}
          />
          Show added / ignored
        </label>
      </div>

      {loading ? (
        <div className="bg-white border border-border p-10 text-center text-muted-foreground text-sm">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-border p-10 text-center text-muted-foreground text-sm">
          No pending registrations. New RegFox sign-ups will appear here once the webhook is configured.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const values = editValues[row.id] ?? toEditValues(row);
            const expanded = expandedId === row.id;
            const busy = busyId === row.id;
            const pending = row.status === "pending";
            return (
              <div key={row.id} className="bg-white border border-border shadow-sm">
                {!pending && (
                  <div className={`px-5 py-2 text-[11px] font-bold uppercase tracking-wide ${row.status === "added" ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {row.status === "added" ? "Added to vendor pool" : "Ignored"}
                    {row.reviewed_at && <span className="font-normal normal-case"> · {new Date(row.reviewed_at).toLocaleString()}</span>}
                  </div>
                )}

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Company Name *</label>
                    <input type="text" value={values.company_name} onChange={(e) => updateField(row.id, "company_name", e.target.value)} className={`${inputClass} font-semibold`} />
                  </div>
                  <div>
                    <label className={labelClass}>Contact Name</label>
                    <input type="text" value={values.contact_name} onChange={(e) => updateField(row.id, "contact_name", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Contact Email</label>
                    <input type="email" value={values.contact_email} onChange={(e) => updateField(row.id, "contact_email", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Contact Phone</label>
                    <input type="text" value={values.contact_phone} onChange={(e) => updateField(row.id, "contact_phone", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Website</label>
                    <input type="text" value={values.website_url} onChange={(e) => updateField(row.id, "website_url", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Address</label>
                    <input type="text" value={values.address} onChange={(e) => updateField(row.id, "address", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <input type="text" value={values.category} onChange={(e) => updateField(row.id, "category", e.target.value)} placeholder="e.g. Windows & Doors" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Booth Choices (#1, #2, #3)</label>
                    <input type="text" value={values.booth_choices} onChange={(e) => updateField(row.id, "booth_choices", e.target.value)} placeholder="e.g. 3, 4, 5" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Sponsor Amount</label>
                    <input type="text" value={values.sponsor_amount} onChange={(e) => updateField(row.id, "sponsor_amount", e.target.value)} placeholder="e.g. 1000" className={inputClass} />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer select-none">
                      <input type="checkbox" checked={values.is_sponsor} onChange={(e) => updateField(row.id, "is_sponsor", e.target.checked)} />
                      Sponsor
                    </label>
                  </div>
                </div>

                <div className="px-5 pb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {row.mapped_ticket_type && <span>Booth type: <strong className="text-foreground">{row.mapped_ticket_type}</strong></span>}
                  {row.order_total != null && <span>Order total: <strong className="text-foreground">${row.order_total.toLocaleString()}</strong></span>}
                  {row.mapped_returning_vendor != null && <span>Returning vendor: <strong className="text-foreground">{row.mapped_returning_vendor ? "Yes" : "No"}</strong></span>}
                  {row.mapped_needs_electricity != null && (
                    <span>
                      Electricity: <strong className="text-foreground">{row.mapped_needs_electricity ? "Yes" : "No"}</strong>
                      {row.mapped_needs_electricity && (row.mapped_outlets_110 != null || row.mapped_outlets_220 != null) && (
                        <> ({row.mapped_outlets_110 ?? 0} × 110v, {row.mapped_outlets_220 ?? 0} × 220v)</>
                      )}
                    </span>
                  )}
                  {row.regfox_order_id && <span>Order #{row.regfox_order_id}</span>}
                  <span>Received {new Date(row.received_at).toLocaleString()}</span>
                </div>
                {row.mapped_product_description && (
                  <div className="px-5 pb-4 text-xs text-muted-foreground">
                    <span className="font-bold uppercase text-[10px]">Products / services: </span>
                    <span className="text-foreground">{row.mapped_product_description}</span>
                  </div>
                )}
                {row.mapped_notes && (
                  <div className="px-5 pb-4 text-xs text-muted-foreground">
                    <span className="font-bold uppercase text-[10px]">Notes: </span>
                    <span className="text-foreground">{row.mapped_notes}</span>
                  </div>
                )}

                <button
                  onClick={() => setExpandedId(expanded ? null : row.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground border-t border-border transition-colors"
                >
                  {expanded ? "Hide" : "View"} raw RegFox payload
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expanded && (
                  <pre className="p-4 bg-muted/50 border-t border-border text-[11px] overflow-x-auto max-h-64 overflow-y-auto">
                    {JSON.stringify(row.raw_payload, null, 2)}
                  </pre>
                )}

                <div className="flex flex-wrap gap-2 p-4 border-t border-border bg-muted/20">
                  <button
                    onClick={() => remap(row)}
                    disabled={busy}
                    title="Re-run the field mapping from the raw payload. Updates the linked vendor too if this row was already added."
                    className="py-2.5 px-4 border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    Re-run mapping
                  </button>
                  {pending && (
                    <>
                      <button
                        onClick={() => ignore(row)}
                        disabled={busy}
                        className="flex-1 py-2.5 border border-border text-xs font-bold text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all flex items-center justify-center gap-1.5"
                      >
                        <X size={14} />
                        Ignore
                      </button>
                      <button
                        onClick={() => addToPool(row)}
                        disabled={busy}
                        className="flex-1 py-2.5 bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check size={14} />
                        {busy ? "Adding…" : "Add to Vendor Pool"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <a
        href="https://help.regfox.com/en/articles/12714554-webhooks"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
      >
        RegFox webhook setup docs
        <ExternalLink size={12} />
      </a>
    </div>
  );
}
