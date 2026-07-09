"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/admin");
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
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                Password
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
