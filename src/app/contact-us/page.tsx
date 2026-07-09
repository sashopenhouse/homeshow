"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactUsPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(".fade-in-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
      gsap.fromTo(".contact-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
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
            <Mail size={14} />
            Contact Info
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Have questions about the upcoming Home Show, tickets, or booking a booth? Drop us a line.
          </p>
        </div>

        {/* Contact info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="contact-card bg-white border border-border rounded-none p-6 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider mb-1">Email Us</h3>
              <a href="mailto:deborah@kesslerpromotions.com" className="text-muted-foreground hover:text-primary transition-colors text-sm break-all">
                deborah@kesslerpromotions.com
              </a>
            </div>
          </div>

          <div className="contact-card bg-white border border-border rounded-none p-6 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider mb-1">Call Us</h3>
              <a href="tel:+13157948259" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                (315) 794-8259
              </a>
            </div>
          </div>

          <div className="contact-card bg-white border border-border rounded-none p-6 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider mb-1">Location</h3>
              <p className="text-muted-foreground text-sm">
                Utica University Nexus Center<br />
                Utica, NY
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-card bg-white border border-border rounded-none p-8 md:p-12 shadow-sm max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Send a Message</h2>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 rounded-none border bg-background text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input
                  type="email"
                  required
                  className="w-full p-3 rounded-none border bg-background text-sm"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Subject</label>
              <input
                type="text"
                required
                className="w-full p-3 rounded-none border bg-background text-sm"
                placeholder="Exhibitor Inquiry"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Message</label>
              <textarea
                required
                rows={5}
                className="w-full p-3 rounded-none border bg-background text-sm min-h-[120px]"
                placeholder="Tell us what you're looking for..."
              />
            </div>
            <Button type="submit" className="w-full rounded-none flex items-center justify-center gap-2">
              <Send size={16} />
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
