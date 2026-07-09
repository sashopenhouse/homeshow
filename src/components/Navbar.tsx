"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Menu, X, ChevronDown } from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  children?: { href: string; label: string }[];
}

const navigation: NavItem[] = [
  { href: "/", label: "Home" },
  {
    label: "Attendees",
    children: [
      { href: "/attendees", label: "Ticket & Schedule Info" },
      { href: "https://kesslerpromotionsinc.ticketspice.com/2026-home-show-nexus-center-admission", label: "Buy Tickets" },
    ],
  },
  {
    label: "Vendors",
    children: [
      { href: "/vendors", label: "Apply to Exhibit" },
      { href: "/vendors/list", label: "Floor Plan & Map" },
      { href: "/vendors/info", label: "Exhibitor Kit" },
    ],
  },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/news", label: "News" },
  { href: "/contact-us", label: "Contact Us" },
];

export default function Navbar() {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useGSAP(() => {
    gsap.fromTo(ref.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.1 }
    );
  }, { scope: ref });

  const toggleMobileExpanded = (label: string) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isChildActive = (children?: { href: string }[]) => {
    if (!children) return false;
    return children.some((child) => pathname === child.href);
  };

  return (
    <>
      <nav
        ref={ref}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-white/70 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-none bg-primary/15 border border-primary/30 flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-primary/20">
              <span className="text-primary font-black text-sm">HS</span>
            </div>
            <span className="font-bold text-foreground tracking-tight">
              Home Show <span className="text-primary">Nexus</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-2">
            {navigation.map((item) => {
              if (item.children) {
                const active = isChildActive(item.children);
                return (
                  <div key={item.label} className="relative group py-2">
                    <button
                      className={`px-4 py-2 rounded-none text-sm font-medium transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {item.label}
                      <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                    </button>
                    {/* Dropdown Card */}
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white/95 backdrop-blur-xl border border-border shadow-lg rounded-none p-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200">
                      {item.children.map((child) => {
                        const isExternal = child.href.startsWith("http");
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            className={`block px-4 py-2.5 rounded-none text-sm font-medium transition-all ${
                              pathname === child.href
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={`px-4 py-2 rounded-none text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/vendors"
              className="px-5 py-2.5 rounded-none bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-[0_4px_20px_oklch(0.55_0.18_142/0.30)] active:scale-95"
            >
              Apply to Exhibit
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            id="mobile-menu-toggle"
            className="md:hidden p-2 rounded-none hover:bg-primary/10 transition-colors text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-border px-6 py-4 flex flex-col gap-2 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            {navigation.map((item) => {
              if (item.children) {
                const expanded = mobileExpanded[item.label];
                const active = isChildActive(item.children);
                return (
                  <div key={item.label} className="flex flex-col gap-1">
                    <button
                      onClick={() => toggleMobileExpanded(item.label)}
                      className={`px-4 py-3 rounded-none text-sm font-medium flex items-center justify-between transition-all ${
                        active
                          ? "bg-primary/5 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {item.label}
                      <ChevronDown size={16} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                    </button>
                     {expanded && (
                      <div className="pl-4 flex flex-col gap-1 border-l-2 border-primary/20 ml-4 animate-in slide-in-from-top-1 duration-200">
                        {item.children.map((child) => {
                          const isExternal = child.href.startsWith("http");
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              target={isExternal ? "_blank" : undefined}
                              rel={isExternal ? "noopener noreferrer" : undefined}
                              onClick={() => setMobileOpen(false)}
                              className={`px-4 py-2.5 rounded-none text-sm font-medium transition-all ${
                                pathname === child.href
                                  ? "text-primary bg-primary/5"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-none text-sm font-medium transition-all ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/vendors"
              onClick={() => setMobileOpen(false)}
              className="mt-2 px-5 py-3 rounded-none bg-primary text-primary-foreground text-sm font-semibold text-center"
            >
              Apply to Exhibit
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
