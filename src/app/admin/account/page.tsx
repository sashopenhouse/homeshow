"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { KeyRound, Eye, EyeOff, CheckCircle2, Loader2, UserCircle } from "lucide-react";

export default function AdminAccountPage() {
  const [user, setUser] = useState<User | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (password.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match. Please re-enter them.");
      return;
    }
    if (password === currentPassword) {
      setError("Your new password must be different from your current one.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Re-authenticate first so a walked-away-from session can't be used to
      // take over the account. signInWithPassword refreshes the same session.
      const email = user?.email;
      if (!email) throw new Error("Couldn't determine your account email. Sign in again and retry.");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) {
        setError("Your current password is incorrect.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setSuccess(true);
      setCurrentPassword("");
      setPassword("");
      setConfirm("");
    } catch (err: any) {
      console.error("Password change error:", err);
      let msg = err?.message || "Could not update your password. Please try again.";
      if (err?.name === "AuthRetryableFetchError" || /failed to fetch|fetch|network/i.test(msg)) {
        msg =
          "Couldn't reach the authentication server. If this is the deployed site, make sure the Supabase environment variables are configured in your hosting settings.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-foreground">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the credentials for your admin account.
        </p>
      </div>

      {/* Signed-in identity */}
      <div className="bg-white border border-border shadow-sm p-6 mb-6 flex items-center gap-4">
        <div className="w-11 h-11 bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <UserCircle size={22} className="text-primary" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Signed in as
          </div>
          <div className="text-sm font-bold text-foreground truncate">
            {user?.email ?? "Loading…"}
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white border border-border shadow-sm p-8">
        <h2 className="text-lg font-bold text-foreground mb-2">Change password</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Confirm your current password, then choose a new one of at least 8 characters.
        </p>

        {error && (
          <div className="mb-5 p-3.5 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-none">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 text-sm rounded-none flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            Your password has been updated.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
              Current Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full p-3 rounded-none border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full p-3 pr-10 rounded-none border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
              Confirm New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="w-full p-3 rounded-none border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-bold text-sm rounded-none hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
