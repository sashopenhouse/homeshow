"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Shield, Eye, EyeOff, CheckCircle2, KeyRound, ArrowLeft, Loader2 } from "lucide-react";

export default function AdminResetPasswordPage() {
  const router = useRouter();

  // Whether a valid recovery session was established from the email link.
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [checking, setChecking] = useState(true);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;

    // Supabase parses the recovery token from the URL during client init, so by
    // the time getSession() resolves the recovery session should be present.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session) setRecoveryReady(true);
      setChecking(false);
    });

    // Also listen for the PASSWORD_RECOVERY event in case it fires slightly later.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setRecoveryReady(true);
        setChecking(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match. Please re-enter them.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      // Give the user a moment to read the confirmation, then send to the dashboard.
      setTimeout(() => router.push("/admin"), 2000);
    } catch (err: any) {
      console.error("Password update error:", err);
      let msg = err?.message || "Could not update your password. Request a new reset link and try again.";
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
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-primary flex items-center justify-center mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Home Show Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Nexus Center Management Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-border shadow-sm p-8 rounded-none">
          {checking ? (
            <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
              <Loader2 size={26} className="animate-spin text-primary" />
              <span className="text-sm font-semibold">Verifying reset link…</span>
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                <CheckCircle2 size={28} className="text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Password updated</h2>
              <p className="text-sm text-muted-foreground">
                Your password has been changed. Redirecting you to the dashboard…
              </p>
            </div>
          ) : !recoveryReady ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5">
                <KeyRound size={26} className="text-destructive" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Reset link invalid or expired</h2>
              <p className="text-sm text-muted-foreground mb-6">
                This password reset link is no longer valid. Request a fresh one and try again.
              </p>
              <Link
                href="/admin/forgot-password"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-bold text-sm rounded-none hover:bg-primary/90 transition-all"
              >
                Request a New Link
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mt-4"
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-foreground mb-2">Choose a new password</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Enter a new password for your admin account. Make it at least 8 characters.
              </p>

              {error && (
                <div className="mb-5 p-3.5 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-none">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="w-full p-3 rounded-none border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white font-bold text-sm rounded-none hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <KeyRound size={16} />
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Admin access only. Unauthorized access is prohibited.
        </p>
      </div>
    </main>
  );
}
