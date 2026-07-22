"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { Sparkles, ExternalLink, ArrowRight, Users, Calendar, MapPin, CheckCircle2, FileText, Map } from "lucide-react";

// TEMP: points to the contact page until the real RegFox registration URL is provided.
// Swap this one line for the RegFox URL (https://…) — the button auto-opens external links in a new tab.
const REGFOX_APPLY_URL = "/contact-us";
const APPLY_IS_EXTERNAL = REGFOX_APPLY_URL.startsWith("http");

const highlights = [
  { icon: Users, title: "20,000+ attendees", desc: "Two days of motivated homeowners under one roof." },
  { icon: Calendar, title: "January 30–31, 2027", desc: "Saturday & Sunday at the Utica University Nexus Center." },
  { icon: MapPin, title: "Prime floor placement", desc: "Booths across two rinks with strong foot traffic." },
  { icon: CheckCircle2, title: "200+ exhibitors", desc: "Join the region's premier home improvement showcase." },
];

export default function VendorApplicationPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(".fade-in-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
      gsap.fromTo(".fade-up",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
      );
    },
    { scope: container }
  );

  return (
    <main ref={container} className="flex-1 bg-background py-32 px-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="fade-in-header text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
            <Sparkles size={14} />
            Join the Show
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            Become a <span className="text-primary">Vendor</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Exhibit at the region&apos;s premier Home Show — January 30–31, 2027 at the Utica University
            Nexus Center. Reserve your booth through our registration partner.
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {highlights.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="fade-up bg-white border border-border rounded-none p-5 flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 bg-primary/12 border border-primary/20 flex items-center justify-center">
                <Icon size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm mb-1">{title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="fade-up bg-primary rounded-none p-8 md:p-10 flex flex-col items-center text-center gap-5 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-foreground">Ready to secure your booth?</h2>
          <p className="text-primary-foreground/80 max-w-md text-sm">
            Reserve your exhibition space for the 2027 Home Show — get in touch and our team will get
            you set up with a booth.
          </p>
          <a
            href={REGFOX_APPLY_URL}
            target={APPLY_IS_EXTERNAL ? "_blank" : undefined}
            rel={APPLY_IS_EXTERNAL ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-none bg-white text-primary font-bold text-base hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            Apply to Exhibit
            {APPLY_IS_EXTERNAL ? <ExternalLink size={18} /> : <ArrowRight size={18} />}
          </a>
        </div>

        {/* Secondary links */}
        <div className="fade-up grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <Link
            href="/vendors/info"
            className="group bg-white border border-border rounded-none p-5 flex items-center gap-3 hover:border-primary/40 transition-all"
          >
            <FileText size={18} className="text-primary" />
            <div>
              <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Exhibitor Kit</h4>
              <span className="text-xs text-muted-foreground">Booth details, pricing &amp; deadlines</span>
            </div>
          </Link>
          <Link
            href="/vendors/list"
            className="group bg-white border border-border rounded-none p-5 flex items-center gap-3 hover:border-primary/40 transition-all"
          >
            <Map size={18} className="text-primary" />
            <div>
              <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Floor Plan &amp; Map</h4>
              <span className="text-xs text-muted-foreground">See the layout and current exhibitors</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
