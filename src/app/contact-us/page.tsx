"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function ContactUsPage() {
  const container = useRef<HTMLDivElement>(null);
  const openedAt = useRef(Date.now());

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bot traps: filled honeypot or impossibly-fast submit — pretend it worked, drop it.
    if (hp.trim() !== "" || Date.now() - openedAt.current < 2500) {
      setSubmitted(true);
      return;
    }

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill out your name, email, and message.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { error: insErr } = await supabase.from("contact_messages").insert([
        {
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || null,
          message: message.trim(),
          created_at: new Date().toISOString(),
        },
      ]);
      if (insErr) throw insErr;
      setSubmitted(true);
    } catch (err: any) {
      console.error("Contact submit error:", err);
      setError(err?.message || "Something went wrong sending your message. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

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

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                <CheckCircle2 size={28} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Thanks — your message is on its way</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We&apos;ll get back to you at the email you provided. For anything urgent, call us at{" "}
                <a href="tel:+13157948259" className="text-primary font-semibold">(315) 794-8259</a>.
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3.5 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm rounded-none">
                  {error}
                </div>
              )}

              {/* Honeypot — hidden from real users */}
              <div
                aria-hidden="true"
                style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" }}
              >
                <label htmlFor="company_url">Company URL</label>
                <input
                  id="company_url"
                  name="company_url"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-none border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-none border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 rounded-none border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Exhibitor Inquiry"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-none border bg-background text-sm min-h-[120px] focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Tell us what you're looking for..."
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full rounded-none flex items-center justify-center gap-2">
                <Send size={16} />
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>

        {/* Location Map */}
        <div className="mt-20 border border-border bg-white p-2 md:p-4 shadow-sm fade-in-header">
          <div className="w-full aspect-[21/9] md:aspect-[3/1] bg-muted relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2931.2581622383816!2d-75.23439402345521!3d43.10427327113117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d94121e7855555%3A0xc34ccfa9f0a20f92!2sUtica%20University%20Nexus%20Center!5e0!3m2!1sen!2sus!4v1707073235655!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale contrast-125 opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            ></iframe>
          </div>
        </div>
      </div>
    </main>
  );
}
