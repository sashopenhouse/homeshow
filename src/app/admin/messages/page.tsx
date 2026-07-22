"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Calendar, Trash2, Search, MailOpen, Reply } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [query, setQuery] = useState("");

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleRead = async (m: Message) => {
    setBusyId(m.id);
    const next = !m.is_read;
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_read: next } : x)));
    try {
      const { error } = await supabase.from("contact_messages").update({ is_read: next }).eq("id", m.id);
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_read: m.is_read } : x)));
    } finally {
      setBusyId(null);
    }
  };

  const deleteMessage = async (m: Message) => {
    if (!confirm(`Delete the message from ${m.name}?`)) return;
    setBusyId(m.id);
    const prev = messages;
    setMessages((cur) => cur.filter((x) => x.id !== m.id));
    try {
      const { error } = await supabase.from("contact_messages").delete().eq("id", m.id);
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setMessages(prev);
      alert("Could not delete. Make sure supabase_migration_contact_messages.sql has been run.");
    } finally {
      setBusyId(null);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const visible = messages.filter((m) => {
    if (filter === "unread" && m.is_read) return false;
    const qq = query.trim().toLowerCase();
    if (!qq) return true;
    return [m.name, m.email, m.subject, m.message].some((f) => (f || "").toLowerCase().includes(qq));
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Mail size={26} className="text-primary" />
          Messages
        </h1>
        <p className="text-muted-foreground text-sm">
          Contact-form submissions from the website.
          {unreadCount > 0 && <span className="text-primary font-semibold"> · {unreadCount} unread</span>}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {(["all", "unread"] as const).map((f) => (
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
              {f === "unread" && (
                <span className={`text-xs px-1.5 py-0.5 rounded-none ${filter === f ? "bg-white/20" : "bg-muted"}`}>
                  {unreadCount}
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
            placeholder="Search by name, email, or content…"
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm bg-white border border-border shadow-sm">
            Loading messages…
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm bg-white border border-border shadow-sm">
            {messages.length === 0 ? "No messages yet." : "No messages match this view."}
          </div>
        ) : (
          visible.map((m) => (
            <div
              key={m.id}
              className={`bg-white border shadow-sm p-6 space-y-4 transition-colors ${
                m.is_read ? "border-border" : "border-primary/40 bg-primary/[0.02]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {!m.is_read && <span className="w-2 h-2 bg-primary shrink-0" title="Unread" />}
                    <h3 className="text-base font-bold text-foreground truncate">{m.subject || "(No subject)"}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From <span className="font-semibold text-foreground">{m.name}</span> ·{" "}
                    <a href={`mailto:${m.email}`} className="hover:text-primary transition-colors">
                      {m.email}
                    </a>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <Calendar size={12} />
                  {formatDate(m.created_at)}
                </div>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line border-t border-border pt-4">
                {m.message}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || "Your message"))}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all rounded-none"
                >
                  <Reply size={14} />
                  Reply
                </a>
                <button
                  onClick={() => toggleRead(m)}
                  disabled={busyId === m.id}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-none disabled:opacity-50"
                >
                  <MailOpen size={14} />
                  Mark {m.is_read ? "unread" : "read"}
                </button>
                <button
                  onClick={() => deleteMessage(m)}
                  disabled={busyId === m.id}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-border text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all rounded-none disabled:opacity-50 ml-auto"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
