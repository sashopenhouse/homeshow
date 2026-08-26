"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Inbox, Check, X, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface RegfoxRegistration {
  id: string;
  regfox_registrant_id: string;
  regfox_order_id: string | null;
  mapped_company_name: string | null;
  mapped_contact_name: string | null;
  mapped_contact_email: string | null;
  mapped_contact_phone: string | null;
  mapped_website_url: string | null;
  mapped_ticket_type: string | null;
  raw_payload: unknown;
  status: string;
  received_at: string;
}

export default function AdminRegfoxPage() {
  const [rows, setRows] = useState<RegfoxRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, { company_name: string; contact_email: string; contact_phone: string; website_url: string }>>({});

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("regfox_registrations")
      .select("id, regfox_registrant_id, regfox_order_id, mapped_company_name, mapped_contact_name, mapped_contact_email, mapped_contact_phone, mapped_website_url, mapped_ticket_type, raw_payload, status, received_at")
      .eq("status", "pending")
      .order("received_at", { ascending: false });

    if (!error && data) {
      setRows(data as RegfoxRegistration[]);
      const initial: typeof editValues = {};
      (data as RegfoxRegistration[]).forEach((r) => {
        initial[r.id] = {
          company_name: r.mapped_company_name || "",
          contact_email: r.mapped_contact_email || "",
          contact_phone: r.mapped_contact_phone || "",
          website_url: r.mapped_website_url || "",
        };
      });
      setEditValues(initial);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const updateField = (id: string, field: keyof (typeof editValues)[string], value: string) => {
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
        .insert({
          company_name: values.company_name.trim(),
          contact_email: values.contact_email.trim() || null,
          contact_phone: values.contact_phone.trim() || null,
          website_url: values.website_url.trim() || null,
        })
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Inbox size={26} className="text-primary" />
          RegFox Registrations
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          New paid registrations from RegFox land here first. Field mapping is best-effort — check each one
          against the raw payload before adding it to the public vendor pool.
        </p>
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
            const values = editValues[row.id] ?? { company_name: "", contact_email: "", contact_phone: "", website_url: "" };
            const expanded = expandedId === row.id;
            const busy = busyId === row.id;
            return (
              <div key={row.id} className="bg-white border border-border shadow-sm">
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Company Name *</label>
                    <input
                      type="text"
                      value={values.company_name}
                      onChange={(e) => updateField(row.id, "company_name", e.target.value)}
                      className="w-full p-2.5 border border-border bg-background text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={values.contact_email}
                      onChange={(e) => updateField(row.id, "contact_email", e.target.value)}
                      className="w-full p-2.5 border border-border bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={values.contact_phone}
                      onChange={(e) => updateField(row.id, "contact_phone", e.target.value)}
                      className="w-full p-2.5 border border-border bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Website</label>
                    <input
                      type="text"
                      value={values.website_url}
                      onChange={(e) => updateField(row.id, "website_url", e.target.value)}
                      className="w-full p-2.5 border border-border bg-background text-sm"
                    />
                  </div>
                </div>

                <div className="px-5 pb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {row.mapped_ticket_type && <span>Booth type: <strong className="text-foreground">{row.mapped_ticket_type}</strong></span>}
                  {row.regfox_order_id && <span>Order #{row.regfox_order_id}</span>}
                  <span>Received {new Date(row.received_at).toLocaleString()}</span>
                </div>

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

                <div className="flex gap-2 p-4 border-t border-border bg-muted/20">
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
