"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Calendar, Ticket, MapPin, Clock, Users } from "lucide-react";
import Link from "next/link";

const schedule = [
  { time: "9:00 AM", title: "Doors Open", desc: "Welcome to the 2026 Home Show. Registration and initial vendor walkthrough." },
  { time: "11:00 AM", title: "Live Entertainment: Music Starts", desc: "Local artists begin their sets on the main stage." },
  { time: "1:00 PM", title: "Grand Prize Giveaway #1", desc: "First major hourly giveaway drawing at the center stage." },
  { time: "2:00 PM", title: "Children's Museum Activities", desc: "Interactive exhibits and face painting open in the kids zone." },
  { time: "4:00 PM", title: "Food & Beverage Tasting", desc: "Sample local craft beverages and culinary delights." },
  { time: "6:00 PM", title: "Day 1 Concludes", desc: "Doors close for Saturday. See you on Sunday!" }
];

export default function AttendeesPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(".fade-in-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
      gsap.fromTo(".timeline-item",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
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
            Plan Your <span className="text-primary">Visit</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Everything you need for an amazing weekend. Buy your tickets, review the schedule, and prepare for a home show like no other.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Timeline Column */}
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 border-b pb-4">
              <Calendar className="text-primary" />
              Event Schedule
            </h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {schedule.map((item, idx) => (
                <div key={idx} className="timeline-item relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <Clock size={16} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-none border border-border shadow-sm hover:border-primary/40 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-foreground">{item.title}</h3>
                      <time className="text-xs font-semibold text-primary px-2 py-1 bg-primary/10 rounded-none">{item.time}</time>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
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
                  <span>Jan 31 - Feb 1, 2026</span>
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
