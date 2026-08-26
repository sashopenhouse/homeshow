"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Package, Truck, Plug, FileText, AlertCircle, ExternalLink, DollarSign } from "lucide-react";
import Link from "next/link";

const REGFOX_APPLY_URL = "https://kesslerpromotionsinc.regfox.com/2027-home-show-nexus-center-";

const infoSections = [
  {
    title: "Load-In & Setup",
    icon: Truck,
    content: "Setup is Friday, April 23 (9am – 7pm) or Saturday, April 24 morning (7am – 8:30am sharp, before doors open at 9am). Booths must be ready before the show opens — no load-ins once doors are open."
  },
  {
    title: "Booth Guidelines",
    icon: Package,
    content: "Standard booths are 10x10, with a 10x20 end cap option available. Loading doors are 9ft high by 8.5ft wide. Displays must stay within your assigned booth space."
  },
  {
    title: "Power & Utilities",
    icon: Plug,
    content: "Electricity is available as an add-on during registration — duplex or 220 outlets. Bring your own heavy-duty extension cords and power strips."
  },
  {
    title: "Required Documents",
    icon: FileText,
    content: "A Certificate of Insurance ($1M per occurrence / $2M aggregate) naming Kessler Promotions, the Nexus Center, and Garden Entertainment as additional insured is due by Friday, April 2, 2027."
  }
];

const boothOptions = [
  { size: "10' x 10'", price: "$995", note: "Standard booth" },
  { size: "10' x 20'", price: "$1,895", note: "End cap — premium positioning" },
  { size: "Tasting Booth", price: "$395", note: "Food & beverage tasting vendors" },
  { size: "Non-Profit", price: "$395", note: "Registered non-profit organizations" }
];

const addOns = [
  { label: "Duplex electrical outlet", price: "$50" },
  { label: "220v electrical outlet", price: "$175" },
  { label: "Furnishings (8' table + chairs)", price: "$40" },
  { label: "Vendor spotlight feature", price: "$100" }
];

export default function VendorInfoPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(".fade-in-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
      gsap.fromTo(".info-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
      );
      gsap.fromTo(".alert-box",
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.2)", delay: 0.6 }
      );
    },
    { scope: container }
  );

  return (
    <main ref={container} className="flex-1 bg-background py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="fade-in-header text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
            <FileText size={14} />
            Vendor Resources
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            Exhibitor <span className="text-primary">Kit</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Everything you need to know for a successful event. Review the guidelines below to prepare for your exhibition at the Home Show.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {infoSections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx} className="info-card bg-white border border-border rounded-none p-8 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center mb-6">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{section.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {section.content}
                </p>
              </div>
            );
          })}
        </div>

        {/* Booth Pricing */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign size={20} className="text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Booth Pricing</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {boothOptions.map((b) => (
              <div key={b.size} className="info-card bg-white border border-border rounded-none p-6 shadow-sm">
                <span className="text-2xl font-black text-primary">{b.price}</span>
                <h3 className="font-bold text-foreground text-sm mt-2">{b.size}</h3>
                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{b.note}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Prices exclude processing fees. A $100 nonrefundable deposit per booth is due at application —
            pay in full by January 1 for a $200 discount. Remaining balance is due March 26, 2027.
          </p>
        </div>

        {/* Add-Ons */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Add-Ons</h2>
          <div className="bg-white border border-border rounded-none divide-y divide-border">
            {addOns.map((a) => (
              <div key={a.label} className="flex items-center justify-between px-6 py-4">
                <span className="text-sm font-semibold text-foreground">{a.label}</span>
                <span className="text-sm font-bold text-primary">{a.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Alert */}
        <div className="alert-box bg-secondary/30 border border-secondary p-6 md:p-8 rounded-none flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="shrink-0">
            <AlertCircle size={40} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Key Deadlines</h3>
            <p className="text-muted-foreground text-sm">
              Certificate of Insurance due <strong>April 2, 2027</strong>. Final balance due <strong>March 26, 2027</strong> —
              unpaid balances are automatically charged to the card on file. Full terms are reviewed during
              application.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0 md:ml-auto flex flex-col gap-2">
            <a
              href={REGFOX_APPLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 flex items-center justify-center gap-2 rounded-none bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              View Full Terms &amp; Apply
              <ExternalLink size={15} />
            </a>
            <Link
              href="/contact-us"
              className="px-6 py-3 block text-center rounded-none bg-white border border-border font-bold text-sm text-foreground hover:bg-muted transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
