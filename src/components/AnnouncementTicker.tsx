import Link from "next/link";
import { Megaphone } from "lucide-react";

// Slim scrolling announcement bar that sits at the top of the fixed Navbar.
// Edit `items` to change the messages. Keep it to one line: the public
// pages pad for the navbar with pt-32 (128px), and the desktop navbar is
// ~96px tall, so this bar has ~30px to work with.
const items = [
  "Vendor registration for the 2027 Home Show is now open",
  "April 24–25, 2027 · Utica University Nexus Center",
  "Booths from $395 · 10x10 standard, 10x20 end caps, tasting & non-profit rates",
  "Apply to Exhibit →",
];

export default function AnnouncementTicker() {
  // The track is rendered twice so the loop is seamless: the animation slides
  // the whole track left by exactly one copy's width, then restarts.
  const track = items.map((text, i) => (
    <span key={i} className="inline-flex items-center gap-3 whitespace-nowrap">
      {text}
      <span aria-hidden className="text-white/40">•</span>
    </span>
  ));

  return (
    <Link
      href="/vendors"
      aria-label="Vendor registration is open — apply to exhibit"
      className="ticker group block w-full bg-primary text-white text-xs font-semibold tracking-wide overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-3 h-[30px]">
        <span className="shrink-0 inline-flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">
          <Megaphone size={12} />
          Now Open
        </span>
        <div className="relative flex-1 overflow-hidden" aria-hidden>
          <div className="ticker-track flex gap-3 w-max group-hover:[animation-play-state:paused]">
            <div className="flex gap-3">{track}</div>
            <div className="flex gap-3">{track}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
