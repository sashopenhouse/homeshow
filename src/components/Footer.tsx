import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Mail, Phone, MapPin, ArrowUpRight, Ticket, Percent, Store, Gift } from "lucide-react";

const quickLinks = [
  { href: "/attendees", label: "Attendees" },
  { href: "/vendors", label: "Vendors" },
  { href: "/vendors/list", label: "Floor Plan" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/news", label: "News" },
  { href: "/contact-us", label: "Contact Us" },
];

const newsletterPerks = [
  { icon: Ticket, label: "Show updates", desc: "on dates, hours, and what's new this year" },
  { icon: Percent, label: "Admission coupons", desc: "and other subscriber-only discounts" },
  { icon: Store, label: "Vendor & exhibitor news", desc: "so you know who's showing up" },
  { icon: Gift, label: "Giveaway alerts", desc: "so you never miss a drawing" },
];

export default function Footer() {
  return (
    <footer className="relative bg-muted border-t border-border">
      {/* Newsletter sign-up — Constant Contact form "HS form for NYS web".
          Two-column card: our own headline/perks on the left (the CC form
          has no fields for a benefit list, so that's static markup here),
          the embed restyled down to just "Subscribe" + pill input + arrow
          button on the right — see #hs-footer-signup rules in globals.css. */}
      <div className="px-6 py-14">
        <div id="hs-footer-signup" className="max-w-5xl mx-auto bg-background border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-10 md:border-r border-border">
              <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-3">
                Join the Home Show Mailing List
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Get important show information, updates on entertainment, admission coupons, and more!
              </p>
              <div className="border-t border-border pt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {newsletterPerks.map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <Icon size={16} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-snug">
                      <span className="font-semibold text-foreground">{label}</span> {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 md:p-10 flex flex-col justify-center bg-muted/40">
              <h4 className="text-xl font-extrabold text-foreground tracking-tight mb-4">Subscribe</h4>
              <div className="ctct-inline-form" data-form-id="82a535c0-21ad-4091-bd8f-081bd3d66787" />
            </div>
          </div>
        </div>
      </div>

      {/* Brand accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-primary" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand column */}
          <div className="md:col-span-5">
            <Image src="/logo.png" alt="The Spring Home Show at Utica University Nexus Center, presented by New York SASH" width={3908} height={1313} className="h-14 w-auto mb-5" />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-6">
              The region&apos;s premier spring event for home improvement, architectural
              design, and modern lifestyle — all under one roof.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-wider">
              April 24 &amp; 25, 2027 · Nexus Center
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3">
            <h3 className="font-bold text-xs uppercase tracking-widest text-foreground mb-5">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h3 className="font-bold text-xs uppercase tracking-widest text-foreground mb-5">Get In Touch</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Utica+University+Nexus+Center+Utica+NY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors leading-relaxed"
                >
                  Utica University Nexus Center<br />
                  Utica, NY
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary shrink-0" />
                <a href="tel:+13157948259" className="text-muted-foreground hover:text-primary transition-colors">
                  (315) 794-8259
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary shrink-0" />
                <a href="mailto:deborah@kesslerpromotions.com" className="text-muted-foreground hover:text-primary transition-colors break-all">
                  deborah@kesslerpromotions.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs text-muted-foreground order-2 sm:order-1">
            © {new Date().getFullYear()} Home Show at Nexus Center. All rights reserved.
          </p>
          <div className="flex items-center gap-6 order-1 sm:order-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Presented By</span>
            <a
              href="https://www.newyorksash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1"
            >
              <Image src="/sponsors/new-york-sash.png" alt="New York Sash" width={100} height={40} className="h-8 w-auto object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
              <ArrowUpRight size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </div>

      {/* Constant Contact Active Forms widget — powers every .ctct-inline-form
          on the page. Load once per page, hence the guard here rather than
          in globals.css: Footer renders once per page via the (site) layout. */}
      <Script id="ctct-signup-active-data" strategy="lazyOnload">
        {`var _ctct_m = "fd10809d1b986689766601ea7d1efbf2";`}
      </Script>
      <Script
        id="ctct-signup-widget"
        src="https://static.ctctcdn.com/js/signup-form-widget/current/signup-form-widget.min.js"
        strategy="lazyOnload"
      />
    </footer>
  );
}
