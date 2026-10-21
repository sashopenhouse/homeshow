"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Shield, UserPlus, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function AdminSignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // "confirm-email" when Supabase requires email confirmation before sign-in.
  const [done, setDone] = useState<null | "pending" | "confirm-email">(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match. Please re-enter them.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (signUpError) {
        let msg = signUpError.message || "Sign up failed. Please try again.";
        if (signUpError.code === "user_already_exists") {
          msg = "An account with this email already exists. Try signing in instead.";
        } else if (signUpError.code === "signup_disabled") {
          msg = "New sign-ups are turned off. Ask an existing admin to enable them.";
        } else if (
          signUpError.name === "AuthRetryableFetchError" ||
          /fetch|network|failed to fetch/i.test(msg)
        ) {
          msg =
            "Couldn't reach the authentication server. Check your connection and that the Supabase URL/key are configured.";
        }
        setError(msg);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Signed straight in; the admin layout shows the awaiting-approval screen.
        await supabase.auth.signOut();
        setDone("pending");
      } else {
        setDone("confirm-email");
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err?.message || "Unexpected error signing up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 rounded-none border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";
  const labelClass = "text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5";

  return (
    <main className="admin-shell min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-primary flex items-center justify-center mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Home Show Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Nexus Center Management Portal</p>
        </div>

        <div className="bg-white border border-border shadow-sm p-8 rounded-none">
          {done ? (
            <div className="text-center space-y-4">
              <CheckCircle2 size={40} className="text-emerald-600 mx-auto" />
              <h2 className="text-lg font-bold text-foreground">Account created</h2>
              <p className="text-sm text-muted-foreground">
                {done === "confirm-email"
                  ? `We sent a confirmation link to ${email}. Confirm your email, then an existing admin needs to approve your account before you can sign in to the dashboard.`
                  : "An existing admin needs to approve your account before you can use the dashboard. You'll be able to sign in once they do."}
              </p>
              <Link
                href="/admin/login"
                className="inline-block text-sm font-semibold text-primary hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-foreground mb-1">Request Admin Access</h2>
              <p className="text-sm text-muted-foreground mb-6">
                New accounts must be approved by an existing admin.
              </p>

              {error && (
                <div className="mb-5 p-3.5 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-none">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                    placeholder="Jane Smith"
                  />
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pr-10`}
                      placeholder="At least 8 characters"
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
                  <label className={labelClass}>Confirm Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white font-bold text-sm rounded-none hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <UserPlus size={16} />
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/admin/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
