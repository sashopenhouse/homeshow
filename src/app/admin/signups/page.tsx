"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Phone, Calendar, Building, CheckCircle, Search } from "lucide-react";

interface Signup {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  industry?: string; // fallback in case
  created_at: string;
}

export default function AdminSignupsPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [filteredSignups, setFilteredSignups] = useState<Signup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignups() {
      try {
        const { data, error } = await supabase
          .from("vendor_applications")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setSignups(data);
          setFilteredSignups(data);
        }
      } catch (err) {
        console.error("Error fetching vendor signups:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSignups();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredSignups(signups);
      return;
    }

    const filtered = signups.filter(
      (s) =>
        s.company_name?.toLowerCase().includes(query.toLowerCase()) ||
        s.contact_name?.toLowerCase().includes(query.toLowerCase()) ||
        s.email?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSignups(filtered);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Vendor Applications</h1>
        <p className="text-muted-foreground text-sm">Review vendor submissions for booth reservations at the Home Show.</p>
      </div>

      {/* Filter Options */}
      <div className="flex items-center bg-white border border-border px-4 py-3 shadow-sm max-w-md">
        <Search className="text-muted-foreground mr-3" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by company, contact, or email..."
          className="w-full bg-transparent text-sm text-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
        />
      </div>

      {/* Signups List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm bg-white border border-border shadow-sm">
            Loading vendor applications...
          </div>
        ) : filteredSignups.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm bg-white border border-border shadow-sm">
            No applications match your query.
          </div>
        ) : (
          filteredSignups.map((signup) => (
            <div
              key={signup.id}
              className="bg-white border border-border p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:border-primary/30 transition-colors"
            >
              <div className="space-y-3">
                {/* Company & Contact */}
                <div>
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-primary" />
                    <h3 className="text-lg font-bold text-foreground">{signup.company_name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
                    Contact: {signup.contact_name}
                  </p>
                </div>

                {/* Subinfo Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} />
                    <a href={`mailto:${signup.email}`} className="hover:text-primary transition-colors">
                      {signup.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} />
                    <a href={`tel:${signup.phone}`} className="hover:text-primary transition-colors">
                      {signup.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Status / Date */}
              <div className="flex flex-row md:flex-col md:items-end justify-between items-center gap-2 border-t md:border-t-0 border-border pt-4 md:pt-0">
                <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-xs uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2.5 py-1">
                  <CheckCircle size={12} />
                  Received
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <Calendar size={12} />
                  <span>{formatDate(signup.created_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
