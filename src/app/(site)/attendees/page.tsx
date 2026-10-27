"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Calendar, Ticket, MapPin, Clock, Users } from "lucide-react";

const SHOW_HOURS = [
  { day: "Saturday", date: "April 24, 2027", hours: "9:00 AM – 6:00 PM" },
  { day: "Sunday", date: "April 25, 2027", hours: "9:00 AM – 4:00 PM" },
];

const ADMISSION = [
  { who: "Adults", price: "$10", note: "$8 in advance" },
  { who: "Seniors (55+), Military, First Responders & Healthcare", price: "$8", note: "" },
  { who: "Children 16 and under", price: "Free", note: "" },
];

// Same pin as the contact page: Utica University Nexus Center.
const VENUE_MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2931.2581622383816!2d-75.23439402345521!3d43.10427327113117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d94121e7855555%3A0xc34ccfa9f0a20f92!2sUtica%20University%20Nexus%20Center!5e0!3m2!1sen!2sus!4v1707073235655!5m2!1sen!2sus";
const VENUE_DIRECTIONS_URL = "https://www.google.com/maps/search/?api=1&query=Utica+University+Nexus+Center+Utica+NY";

export default function AttendeesPage() {
  const container = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.fromTo(".fade-in-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
      gsap.fromTo(".info-block",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out", delay: 0.2 }
      );
      gsap.fromTo(".ticket-box",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.2)", delay: 0.4 }
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
            <Users size={14} />
            Attendee Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            Plan Your <span className="text-primary italic">Visit</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Everything you need for an amazing spring weekend. Check show hours and admission, find the Nexus Center, and grab your tickets ahead of time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Info Column */}
          <div className="lg:col-span-7 space-y-10">
            {/* Blurb */}
            <div className="info-block">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-3">
                <Calendar className="text-primary" />
                About the Show
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Two full days of home improvement under one roof at the Utica University Nexus Center. Meet
                hundreds of local exhibitors, watch live demos, enjoy live music and family activities, and
                enter to win giveaways throughout the weekend. The full event schedule will be posted here as
                the show approaches.
              </p>
            </div>

            {/* Hours */}
            <div className="info-block">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Clock className="text-primary" size={20} />
                Show Hours
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SHOW_HOURS.map((d) => (
                  <div key={d.day} className="bg-white border border-border p-5 rounded-none">
                    <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">{d.day}</div>
                    <div className="text-sm text-muted-foreground mb-2">{d.date}</div>
                    <div className="text-lg font-black text-foreground">{d.hours}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admission */}
            <div className="info-block">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Ticket className="text-primary" size={20} />
                Admission
              </h2>
              <ul className="bg-white border border-border divide-y divide-border rounded-none">
                {ADMISSION.map((row) => (
                  <li key={row.who} className="flex items-center justify-between gap-4 px-5 py-4">
                    <span className="text-sm font-medium text-foreground">{row.who}</span>
                    <span className="text-right shrink-0">
                      <span className="text-lg font-black text-foreground">{row.price}</span>
                      {row.note && <span className="block text-xs text-muted-foreground">{row.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Venue map */}
            <div className="info-block">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="text-primary" size={20} />
                  Getting There
                </h2>
                <a
                  href={VENUE_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-primary hover:underline underline-offset-4"
                >
                  Open in Google Maps
                </a>
              </div>
              <div className="w-full aspect-[4/3] sm:aspect-[16/9] border border-border bg-muted overflow-hidden">
                <iframe
                  src={VENUE_MAP_SRC}
                  title="Map to the Utica University Nexus Center"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-3">Utica University Nexus Center, Utica NY.</p>
            </div>
          </div>

          {/* Sticky Ticketing Column */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-32 ticket-box bg-secondary/20 border border-secondary p-8 rounded-none">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-none flex items-center justify-center mb-6 shadow-sm">
                <Ticket size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Secure Your Tickets</h3>
              <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                Skip the lines at the door. Purchase your admission tickets online to guarantee entry to the Utica University Nexus Center.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm font-medium">
                  <MapPin className="text-primary" size={18} />
                  <span>Nexus Center, Utica NY</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-medium">
                  <Calendar className="text-primary" size={18} />
                  <span>Apr 24 - 25, 2027</span>
                </li>
              </ul>

              <a
                href="https://kesslerpromotionsinc.ticketspice.com/2026-home-show-nexus-center-admission"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-none bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
              >
                Buy Tickets Now <Ticket size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
