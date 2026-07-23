"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Calendar, Ticket, MapPin, Clock, Users } from "lucide-react";

const days = [
  {
    label: "Saturday",
    date: "January 30, 2027",
    hours: "9:00 AM – 6:00 PM",
    events: [
      { time: "9:00 AM", title: "Doors Open", desc: "Welcome to the 2027 Home Show. Registration and vendor walkthrough begins." },
      { time: "11:00 AM", title: "Live Music Starts", desc: "Local and regional artists perform on the main stage." },
      { time: "1:00 PM", title: "Grand Prize Giveaway", desc: "First major giveaway drawing at center stage." },
      { time: "2:00 PM", title: "Children's Museum & Zoomobile", desc: "Interactive exhibits, face painting, and live wildlife in the kids zone." },
      { time: "4:00 PM", title: "Food & Beverage Tasting", desc: "Sample local craft beverages and culinary delights." },
      { time: "6:00 PM", title: "Day 1 Concludes", desc: "Doors close for Saturday — see you tomorrow!" },
    ],
  },
  {
    label: "Sunday",
    date: "January 31, 2027",
    hours: "10:00 AM – 5:00 PM",
    events: [
      { time: "10:00 AM", title: "Doors Open", desc: "Day two of the 2027 Home Show kicks off." },
      { time: "12:00 PM", title: "Live Music Returns", desc: "More performances from local artists on the main stage." },
      { time: "1:00 PM", title: "Exhibitor Demos", desc: "Hands-on demonstrations from home improvement experts across the floor." },
      { time: "2:30 PM", title: "$25,000 Grand Prize Drawing", desc: "The big giveaway drawing — must be present to win." },
      { time: "4:00 PM", title: "Final Giveaways", desc: "Last round of door prizes and vendor raffles." },
      { time: "5:00 PM", title: "Show Concludes", desc: "Doors close for the 2027 Home Show. Thanks for coming!" },
    ],
  },
];

export default function AttendeesPage() {
  const container = useRef<HTMLDivElement>(null);
  const [activeDay, setActiveDay] = useState(0);

  useGSAP(
    () => {
      gsap.fromTo(".fade-in-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
      gsap.fromTo(".ticket-box",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.2)", delay: 0.4 }
      );
    },
    { scope: container }
  );

  // Re-animate the timeline whenever the day toggles
  useGSAP(
    () => {
      gsap.fromTo(".timeline-item",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out" }
      );
    },
    { scope: container, dependencies: [activeDay] }
  );

  const day = days[activeDay];

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
            Everything you need for an amazing weekend. Buy your tickets, review each day&apos;s schedule, and prepare for a home show like no other.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Timeline Column */}
          <div className="lg:col-span-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="text-primary" />
                Event Schedule
              </h2>
              {/* Day toggle */}
              <div className="inline-flex bg-muted border border-border rounded-none p-1 self-start">
                {days.map((d, i) => (
                  <button
                    key={d.label}
                    onClick={() => setActiveDay(i)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-none transition-all ${
                      activeDay === i
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 mb-8 text-sm">
              <span className="font-bold text-foreground">{day.date}</span>
              <span className="text-muted-foreground">· {day.hours}</span>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {day.events.map((item, idx) => (
                <div key={`${activeDay}-${idx}`} className="timeline-item relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
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
                  <span>Jan 30 - 31, 2027</span>
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
