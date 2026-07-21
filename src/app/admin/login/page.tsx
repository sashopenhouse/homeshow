"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Shield, LogIn, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const code = signInError.code;
        let msg = signInError.message || "Sign in failed. Please try again.";
        if (code === "invalid_credentials") {
          msg = "Invalid email or password. Please try again.";
        } else if (code === "email_not_confirmed") {
          msg =
            "This account's email hasn't been confirmed yet. Confirm it from the Supabase dashboard (Authentication → Users), then sign in.";
        } else if (
          signInError.name === "AuthRetryableFetchError" ||
          /fetch|network|failed to fetch/i.test(msg)
        ) {
          msg =
            "Couldn't reach the authentication server. Check your connection and that the Supabase URL/key are configured.";
        }
        setError(msg);
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Unexpected error signing in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-primary flex items-center justify-center mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Home Show Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Nexus Center Management Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-border shadow-sm p-8 rounded-none">
          <h2 className="text-lg font-bold text-foreground mb-6">Sign In to Continue</h2>

          {error && (
            <div className="mb-5 p-3.5 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-none">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-none border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="admin@homeshownexus.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block">
                  Password
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-bold text-sm rounded-none hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <LogIn size={16} />
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Admin access only. Unauthorized access is prohibited.
        </p>
      </div>
    </main>
  );
}
