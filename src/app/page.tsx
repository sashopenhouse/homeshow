"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import Image from "next/image";
import { Ticket, Building2, Map, Home, TreePine, Music, Gift, Star } from "lucide-react";

const highlights = [
  { icon: TreePine, title: "Zoomobile", desc: "Live exotic animals & interactive wildlife exhibits for the whole family." },
  { icon: Home, title: "Children's Museum", desc: "Immersive hands-on learning experiences designed for young minds." },
  { icon: Music, title: "Live Music", desc: "Local and regional artists performing throughout the weekend." },
  { icon: Gift, title: "Giveaways", desc: "Door prizes, vendor raffles, and grand prizes every hour." },
];

const stats = [
  { value: "200+", label: "Exhibitors" },
  { value: "20K+", label: "Attendees" },
  { value: "2", label: "Days" },
  { value: "50+", label: "Giveaways" },
];

export default function HomePage() {
  const container = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date("2026-01-31T09:00:00").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.fromTo(".hero-eyebrow",
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      )
      .fromTo(".hero-title",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power4.out" }, "-=0.2"
      )
      .fromTo(".hero-sub",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.3"
      )
      .fromTo(".hero-btn",
        { y: 20, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.4)" }, "-=0.3"
      )
      .fromTo(".hero-countdown",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.5"
      )
      .fromTo(".stat-pill",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out" }, "-=0.2"
      )
      .fromTo(".highlight-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }, "-=0.1"
      );
    },
    { scope: container }
  );

  return (
    <div ref={container} className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-background">
      {/* Hero — full bleed image */}
      <section className="relative z-10 w-full min-h-[92vh] flex flex-col justify-end overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-floor.png"
            alt="Home Show exhibition floor at Nexus Center"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Layered gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pb-16 pt-32 flex flex-col md:flex-row md:items-end md:justify-between gap-12">
          {/* Left Column */}
          <div className="flex flex-col items-start max-w-xl">
            {/* Eyebrow badge */}
            <div className="hero-eyebrow inline-flex items-center gap-2 px-4 py-1.5 rounded-none bg-primary/90 border border-primary mb-6 backdrop-blur-sm">
              <Star size={11} className="text-white fill-white" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">
                January 31 &amp; February 1, 2026 · Nexus Center
              </span>
              <Star size={11} className="text-white fill-white" />
            </div>

            {/* Main Title */}
            <h1 className="hero-title text-6xl md:text-8xl font-black tracking-tighter leading-none text-white mb-2 drop-shadow-lg">
              Home Show
            </h1>
            <h2 className="hero-title text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-6 drop-shadow-md">
              at Nexus Center
            </h2>

            <p className="hero-sub text-base md:text-lg text-white/80 leading-relaxed mb-10">
              The region's premier event for home improvement, architectural design,
              and modern lifestyle — all under one roof.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://kesslerpromotionsinc.ticketspice.com/2026-home-show-nexus-center-admission"
                target="_blank"
                rel="noopener noreferrer"
                id="hero-buy-tickets"
                className="hero-btn inline-flex items-center gap-2 px-8 py-4 rounded-none bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-[0_8px_30px_oklch(0.55_0.18_142/0.45)] active:scale-95"
              >
                <Ticket size={18} />
                Buy Tickets
              </a>
              <Link
                href="/vendors"
                id="hero-become-vendor"
                className="hero-btn inline-flex items-center gap-2 px-8 py-4 rounded-none bg-white/15 backdrop-blur-md border border-white/30 text-white font-bold text-base hover:bg-white/25 hover:border-white/50 transition-all hover:scale-105 active:scale-95"
              >
                <Building2 size={18} />
                Become a Vendor
              </Link>
              <Link
                href="/vendors/list"
                id="hero-floor-plan"
                className="hero-btn inline-flex items-center gap-2 px-8 py-4 rounded-none border border-white/20 text-white/80 font-semibold text-base hover:border-white/40 hover:text-white transition-all hover:scale-105 active:scale-95"
              >
                <Map size={18} />
                View Floor Plan
              </Link>
            </div>
          </div>

          {/* Right Column: flat square countdown card */}
          <div className="hero-countdown bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-none w-full md:w-80 shrink-0 self-start md:self-end">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4 text-center md:text-left">Show Starts In</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white/5 border border-white/10 py-3 rounded-none">
                <span className="block text-2xl font-black text-white">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[9px] uppercase font-bold text-white/50">Days</span>
              </div>
              <div className="bg-white/5 border border-white/10 py-3 rounded-none">
                <span className="block text-2xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[9px] uppercase font-bold text-white/50">Hours</span>
              </div>
              <div className="bg-white/5 border border-white/10 py-3 rounded-none">
                <span className="block text-2xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[9px] uppercase font-bold text-white/50">Mins</span>
              </div>
              <div className="bg-white/5 border border-white/10 py-3 rounded-none">
                <span className="block text-2xl font-black text-primary">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[9px] uppercase font-bold text-white/50">Secs</span>
              </div>
            </div>
            <div className="mt-4 text-[10px] text-white/40 text-center font-bold uppercase tracking-wider">
              Jan 31, 2026 @ 9:00 AM EST
            </div>
          </div>
        </div>

        {/* Stats strip at bottom */}
        <div className="relative z-10 w-full bg-black/40 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-center md:justify-start gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-pill flex items-center gap-3">
                <div className="text-2xl font-black text-primary">{stat.value}</div>
                <div className="text-sm text-white/60 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 mb-4">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Highlight Cards */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            Something for <span className="text-gold">Everyone</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            More than just a home show — a full weekend experience.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="highlight-card group relative bg-white border border-border rounded-none p-6 hover:border-primary/40 hover:shadow-[0_4px_24px_oklch(0.55_0.18_142/0.12)] transition-all duration-300 cursor-default overflow-hidden shadow-sm"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-none" />
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-none bg-primary/12 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2 group-hover:text-primary transition-colors duration-200">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA band */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20 w-full">
        <div className="bg-primary rounded-none p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-2xl font-extrabold text-primary-foreground mb-1">
              Ready to secure your booth?
            </h3>
            <p className="text-primary-foreground/80">
              Spaces fill up fast — apply today and lock in your spot.
            </p>
          </div>
          <Link
            href="/vendors"
            id="bottom-cta-vendor"
            className="relative z-10 shrink-0 px-8 py-4 rounded-none bg-white text-primary font-bold hover:bg-white/90 transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          >
            Apply to Exhibit →
          </Link>
        </div>
      </section>
    </div>
  );
}
