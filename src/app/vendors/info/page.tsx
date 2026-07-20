"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Package, Truck, Plug, FileText, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";

const infoSections = [
  {
    title: "Load-In & Setup",
    icon: Truck,
    content: "All exhibitors must load in on Thursday, Jan 29th (8am - 6pm) or Friday, Jan 30th (8am - 4pm). No load-ins will be permitted on Saturday morning. Large vehicles must schedule a dock time."
  },
  {
    title: "Booth Guidelines",
    icon: Package,
    content: "Standard booths are 10x10. Tents and canopies are not permitted indoors due to fire code. Displays must not block the sightlines of neighboring booths."
  },
  {
    title: "Power & Utilities",
    icon: Plug,
    content: "Basic 110v electrical hookups are provided if requested on the application. Exhibitors must bring their own heavy-duty extension cords and power strips."
  },
  {
    title: "Required Documents",
    icon: FileText,
    content: "A valid Certificate of Insurance (COI) naming Kessler Promotions and Nexus Center as additional insured must be submitted by January 15th, 2026."
  }
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

        {/* Important Alert */}
        <div className="alert-box bg-secondary/30 border border-secondary p-6 md:p-8 rounded-none flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="shrink-0">
            <AlertCircle size={40} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Important Deadline</h3>
            <p className="text-muted-foreground text-sm">
              All applications and COIs must be finalized by <strong>January 15th, 2026</strong>. Late submissions may result in forfeiture of booth space without refund.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0 md:ml-auto">
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
