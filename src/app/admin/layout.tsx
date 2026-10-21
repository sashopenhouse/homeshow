"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { LayoutDashboard, FileText, BarChart3, ArrowLeft, Shield, Award, LogOut, Loader2, Megaphone, Map as MapIcon, Building2, Mail, Inbox, KeyRound, Gift, Users, Clock } from "lucide-react";

const adminSidebarLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/regfox", label: "RegFox Registrations", icon: Inbox },
  { href: "/admin/posts", label: "Manage Posts", icon: FileText },
  { href: "/admin/vendor-posts", label: "Vendor Feed", icon: Megaphone },
  { href: "/admin/vendors", label: "Vendor Pool", icon: Building2 },
  { href: "/admin/booths", label: "Booth Map", icon: MapIcon },
  { href: "/admin/sponsors", label: "Sponsors", icon: Award },
  { href: "/admin/contest", label: "Contest Entries", icon: Gift },
  { href: "/admin/users", label: "Admin Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

// Routes under /admin that must render without the auth guard or sidebar
// (login, sign-up and the password-recovery flow, which relies on a temporary session).
const PUBLIC_ADMIN_ROUTES = ["/admin/login", "/admin/signup", "/admin/forgot-password", "/admin/reset-password"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  // null while unknown; false shows the awaiting-approval screen.
  const [approved, setApproved] = useState<boolean | null>(null);

  const isPublicRoute = PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    // Check auth state on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Not logged in — redirect to login (unless on a public admin route)
        if (!isPublicRoute) {
          router.replace("/admin/login");
        }
      } else {
        setUser(session.user);
      }
      setChecking(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        if (!isPublicRoute) {
          router.replace("/admin/login");
        }
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router, isPublicRoute]);

  // New sign-ups can't use the dashboard until an existing admin approves them.
  // The database enforces this too; this just shows them why everything is empty.
  useEffect(() => {
    if (!user) return;
    supabase
      .from("admin_users")
      .select("approved")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          // Before supabase_migration_admin_signup.sql is run the table doesn't exist
          // and every signed-in user is an admin, as before.
          console.error("Error checking admin approval:", error);
          setApproved(true);
        } else {
          setApproved(!!data?.approved);
        }
      });
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // Public admin routes (login + password recovery) render directly, no sidebar wrapper
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show spinner while checking auth
  if (checking || (user && approved === null)) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 size={28} className="animate-spin text-primary" />
          <span className="text-sm font-semibold">Verifying session...</span>
        </div>
      </div>
    );
  }

  // If no user after check, render nothing (redirect is in progress)
  if (!user) return null;

  if (!approved) {
    return (
      <main className="admin-shell min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-border shadow-sm p-8 rounded-none text-center space-y-4">
          <Clock size={40} className="text-primary mx-auto" />
          <h1 className="text-lg font-bold text-foreground">Awaiting Approval</h1>
          <p className="text-sm text-muted-foreground">
            Your account (<span className="font-semibold text-foreground">{user.email}</span>) has been
            created, but an existing admin needs to approve it before you can use the dashboard.
          </p>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border border-border text-destructive hover:bg-destructive/5 transition-all rounded-none"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="admin-shell min-h-screen bg-[#fafafa] flex flex-col md:flex-row text-foreground font-sans">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-border shrink-0 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center gap-2">
            <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground font-black text-sm">
              <Shield size={16} />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight">Home Show Admin</h1>
              <span className="text-xs text-muted-foreground">Nexus Center Manager</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {adminSidebarLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all ${
                    active
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          {/* Logged-in user email */}
          <div className="px-2 py-1.5 text-xs text-muted-foreground font-semibold truncate">
            {user.email}
          </div>

          {/* Account settings */}
          <Link
            href="/admin/account"
            className={`flex items-center gap-2 w-full px-3 py-2.5 text-xs font-bold border transition-all ${
              pathname === "/admin/account"
                ? "bg-primary text-white border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <KeyRound size={14} />
            Account &amp; Password
          </Link>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-xs font-bold border border-border text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all rounded-none"
          >
            <LogOut size={14} />
            Sign Out
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <ArrowLeft size={14} />
            View Live Site
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-border py-4 px-8 hidden md:flex items-center justify-between">
          <h2 className="text-sm font-bold text-muted-foreground">
            System Status: <span className="text-emerald-600 font-extrabold uppercase">Online</span>
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-600 animate-pulse" />
            <span className="text-xs font-bold text-muted-foreground">Live Database Linked</span>
          </div>
        </header>

        {/* Dynamic Inner Page */}
        <div className="flex-1 p-6 md:p-10 max-h-[92vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
