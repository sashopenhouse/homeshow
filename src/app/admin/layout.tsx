"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, BarChart3, ArrowLeft, Shield } from "lucide-react";

const adminSidebarLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Manage Posts", icon: FileText },
  { href: "/admin/signups", label: "Vendor Signups", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col md:flex-row text-foreground font-sans">
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
        <div className="p-4 border-t border-border">
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
