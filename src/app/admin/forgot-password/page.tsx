"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Shield, Mail, ArrowLeft, CheckCircle2, Send } from "lucide-react";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your admin email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/admin/reset-password` }
      );

      if (resetError) throw resetError;

      // Always show the same confirmation regardless of whether the email
      // exists, so we don't leak which accounts are registered.
      setSent(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "Could not send the reset email. Please try again.");
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
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                <CheckCircle2 size={28} className="text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Check your email</h2>
              <p className="text-sm text-muted-foreground mb-6">
                If an admin account exists for{" "}
                <span className="font-semibold text-foreground">{email}</span>, we&apos;ve sent a
                link to reset your password. The link expires shortly, so use it soon.
              </p>
              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 border border-border text-foreground font-bold text-sm rounded-none hover:bg-muted transition-all"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-foreground mb-2">Reset your password</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Enter the email tied to your admin account and we&apos;ll send you a secure link to
                choose a new password.
              </p>

              {error && (
                <div className="mb-5 p-3.5 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-none">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 pl-10 rounded-none border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="admin@homeshownexus.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white font-bold text-sm rounded-none hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send size={16} />
                  {loading ? "Sending Link..." : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </div>
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
