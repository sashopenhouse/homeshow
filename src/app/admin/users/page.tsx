"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Check, X, Ban } from "lucide-react";

interface AdminUser {
  user_id: string;
  email: string;
  full_name: string | null;
  approved: boolean;
  approved_at: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [myId, setMyId] = useState<string | null>(null);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setUsers(data);
    } catch (err) {
      console.error("Error fetching admin users:", err);
      setLoadError("Could not load users. Make sure supabase_migration_admin_signup.sql has been run.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null));
  }, []);

  const setApproved = async (u: AdminUser, approved: boolean) => {
    if (!approved && !confirm(`Revoke admin access for ${u.email}?`)) return;
    setBusyId(u.user_id);
    try {
      const approved_at = approved ? new Date().toISOString() : null;
      const { error } = await supabase
        .from("admin_users")
        .update({ approved, approved_at })
        .eq("user_id", u.user_id);
      if (error) throw error;
      setUsers((cur) => cur.map((x) => (x.user_id === u.user_id ? { ...x, approved, approved_at } : x)));
    } catch (err) {
      console.error(err);
      alert("Could not update this user.");
    } finally {
      setBusyId(null);
    }
  };

  // Removes the request from this list. The login itself stays in Supabase Auth
  // (deleting it needs the service-role key), but without a row it has no access.
  const removeUser = async (u: AdminUser) => {
    if (!confirm(`Remove ${u.email} from the admin list? They will lose all access.`)) return;
    setBusyId(u.user_id);
    const prev = users;
    setUsers((cur) => cur.filter((x) => x.user_id !== u.user_id));
    try {
      const { error } = await supabase.from("admin_users").delete().eq("user_id", u.user_id);
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setUsers(prev);
      alert("Could not remove this user.");
    } finally {
      setBusyId(null);
    }
  };

  const pending = users.filter((u) => !u.approved);
  const approvedUsers = users.filter((u) => u.approved);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const renderRow = (u: AdminUser) => {
    const isMe = u.user_id === myId;
    const busy = busyId === u.user_id;
    return (
      <div
        key={u.user_id}
        className="bg-white border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <div className="font-bold text-sm text-foreground truncate">
            {u.full_name || u.email}
            {isMe && <span className="ml-2 text-xs font-semibold text-primary">(you)</span>}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {u.full_name ? `${u.email} · ` : ""}
            {u.approved && u.approved_at ? `Approved ${formatDate(u.approved_at)}` : `Requested ${formatDate(u.created_at)}`}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {u.approved ? (
            !isMe && (
              <button
                onClick={() => setApproved(u, false)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-border text-destructive hover:bg-destructive/5 transition-all rounded-none disabled:opacity-50"
              >
                <Ban size={14} />
                Revoke
              </button>
            )
          ) : (
            <>
              <button
                onClick={() => setApproved(u, true)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all rounded-none disabled:opacity-50"
              >
                <Check size={14} />
                Approve
              </button>
              <button
                onClick={() => removeUser(u)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-border text-destructive hover:bg-destructive/5 transition-all rounded-none disabled:opacity-50"
              >
                <X size={14} />
                Deny
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Users size={26} className="text-primary" />
          Admin Users
        </h1>
        <p className="text-muted-foreground text-sm">
          People who signed up at /admin/signup need your approval before they can use the dashboard.
        </p>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading users...</div>
      ) : loadError ? (
        <div className="p-3.5 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-none">
          {loadError}
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Pending Approval ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <div className="text-sm text-muted-foreground">No pending requests.</div>
            ) : (
              pending.map(renderRow)
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Approved Admins ({approvedUsers.length})
            </h2>
            {approvedUsers.map(renderRow)}
          </section>
        </>
      )}
    </div>
  );
}
