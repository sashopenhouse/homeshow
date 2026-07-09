"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Award, Building2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Sponsor {
  id: string;
  name: string;
  description: string;
  tier: string;
  logo_url?: string;
  order_index: number;
}

const defaultSponsors: Sponsor[] = [
  {
    id: "1",
    name: "New York Sash",
    description: "Utica's premier home improvement company specializing in windows, siding, and baths.",
    tier: "Presenting Sponsor",
    logo_url: "/sponsors/nysash.png",
    order_index: 0
  },
  {
    id: "2",
    name: "Utica University Nexus Center",
    description: "The state-of-the-art sports and event facility hosting this year's Home Show.",
    tier: "Major Partners",
    logo_url: "/sponsors/nexus.png",
    order_index: 1
  },
  {
    id: "3",
    name: "Kessler Promotions",
    description: "Leading event organizers bringing communities together.",
    tier: "Major Partners",
    logo_url: "/sponsors/kessler.png",
    order_index: 2
  }
];

const tierList = ["Presenting Sponsor", "Major Partners", "Support Sponsors", "Media Partners"];

export default function SponsorsPage() {
  const container = useRef<HTMLDivElement>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSponsors() {
      try {
        const { data, error } = await supabase
          .from("sponsors")
          .select("*")
          .order("order_index", { ascending: true });

        if (error) {
          console.error("Error fetching sponsors:", error);
          setSponsors(defaultSponsors);
        } else if (data && data.length > 0) {
          setSponsors(data);
        } else {
          setSponsors(defaultSponsors);
        }
      } catch (err) {
        console.error("Failed to connect to Supabase:", err);
        setSponsors(defaultSponsors);
      } finally {
        setLoading(false);
      }
    }
    fetchSponsors();
  }, []);

  useGSAP(
    () => {
      if (sponsors.length > 0) {
        gsap.fromTo(".fade-in-header",
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        );
        gsap.fromTo(".sponsor-card",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
        );
      }
    },
    { scope: container, dependencies: [sponsors] }
  );

  return (
    <main ref={container} className="flex-1 bg-background py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="fade-in-header text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
            <Award size={14} />
            Our Partners
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            Home Show <span className="text-primary">Sponsors</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Sponsors play a major role in allowing the Home Show to take place. Thank you so much to our amazing partners!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            Loading sponsors...
          </div>
        ) : (
          /* Sponsor Tiers */
          <div className="space-y-12 mb-20">
            {tierList.map((tier) => {
              const tierSponsors = sponsors.filter((s) => s.tier === tier);
              if (tierSponsors.length === 0) return null;

              return (
                <div key={tier} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
                      {tier}
                    </h2>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tierSponsors.map((sponsor) => (
                      <div
                        key={sponsor.id}
                        className="sponsor-card bg-white border border-border rounded-none p-8 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          {/* Logo placeholder */}
                          <div className="h-20 bg-muted/40 rounded-none flex items-center justify-center mb-6 border border-border/60">
                            <Building2 size={32} className="text-muted-foreground/60" />
                            <span className="ml-2 font-bold text-muted-foreground/80">{sponsor.name}</span>
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-2">{sponsor.name}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">{sponsor.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="sponsor-card bg-primary text-primary-foreground rounded-none p-10 text-center relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-transparent pointer-events-none" />
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Interested in Becoming a Sponsor?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Gain premier exposure, connect directly with homeowners, and showcase your brand alongside the region's top home services.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/contact-us"
              className="px-6 py-3.5 rounded-none bg-white text-primary font-bold hover:bg-white/95 transition-all hover:scale-105 active:scale-95"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
