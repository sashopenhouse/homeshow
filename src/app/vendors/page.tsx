"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import VendorForm from "@/components/VendorForm";
import { Sparkles } from "lucide-react";

export default function VendorApplicationPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(".fade-in-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
      gsap.fromTo(".form-container",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.2 }
      );
    },
    { scope: container }
  );

  return (
    <main ref={container} className="flex-1 bg-background py-32 px-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="fade-in-header text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
            <Sparkles size={14} />
            Join the Show
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            Become a <span className="text-primary">Vendor</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Secure your spot at the premier Home Show at Nexus Center. Fill out the application below to reserve your exhibition space.
          </p>
        </div>

        <div className="form-container">
          <VendorForm />
        </div>
      </div>
    </main>
  );
}
