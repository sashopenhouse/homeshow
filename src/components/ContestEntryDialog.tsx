"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

// "Enter to Win" popup for the Spring Home Show giveaway banner on the homepage.
export default function ContestEntryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const openedAt = useRef(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [hp, setHp] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyEntered, setAlreadyEntered] = useState(false);
  const [error, setError] = useState("");

  // Start the bot timer each time the popup opens, not when the page loads.
  useEffect(() => {
    if (open) openedAt.current = Date.now();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bot traps: filled honeypot or impossibly-fast submit — pretend it worked, drop it.
    if (hp.trim() !== "" || Date.now() - openedAt.current < 2500) {
      setSubmitted(true);
      return;
    }

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill out your name, email, and phone number.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { error: insErr } = await supabase.from("contest_entries").insert([
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          opt_in: optIn,
        },
      ]);
      // 23505 = unique violation: this email has already entered.
      if (insErr?.code === "23505") {
        setAlreadyEntered(true);
        setSubmitted(true);
        return;
      }
      if (insErr) throw insErr;
      setSubmitted(true);
    } catch (err) {
      console.error("Contest entry error:", err);
      setError((err as { message?: string })?.message || "Something went wrong submitting your entry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => onOpenChange(next)}>
      <DialogContent className="rounded-none p-8 sm:max-w-md bg-white">
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
              <CheckCircle2 size={28} className="text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground mb-2">
              {alreadyEntered ? "You're already entered" : "You're entered — good luck!"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground max-w-sm mx-auto">
              {alreadyEntered
                ? "We already have an entry for that email. Only one entry per person."
                : "We'll contact the winner by email or phone before the show."}
            </DialogDescription>
          </div>
        ) : (
          <>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                <Gift size={14} />
                Giveaway
              </div>
              <DialogTitle className="text-2xl font-extrabold tracking-tight text-foreground mb-1">
                Enter to <span className="text-primary italic">Win</span>
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                4 tickets, a $100 Cliff&apos;s gift card and $25 to the tasting area at the Spring Home Show.
              </DialogDescription>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
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
                <label htmlFor="contest_company_url">Company URL</label>
                <input
                  id="contest_company_url"
                  name="company_url"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="contest_name" className="text-sm font-medium mb-1.5 block">Name</label>
                <input
                  id="contest_name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-none border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="contest_email" className="text-sm font-medium mb-1.5 block">Email</label>
                <input
                  id="contest_email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-none border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="contest_phone" className="text-sm font-medium mb-1.5 block">Phone</label>
                <input
                  id="contest_phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded-none border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="(315) 555-0123"
                />
              </div>
              <label className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <span>Yes, send me news and offers about future Home Shows.</span>
              </label>

              <Button type="submit" disabled={submitting} className="w-full rounded-none h-11 font-bold">
                {submitting ? "Submitting..." : "Enter to Win"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
