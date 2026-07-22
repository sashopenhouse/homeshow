import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-muted py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4">Home Show at Nexus Center</h3>
          <p className="text-muted-foreground text-sm">
            January 30th & 31st, 2027<br />
            Utica University Nexus Center<br />
            Utica, NY
          </p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/attendees" className="text-muted-foreground hover:text-foreground">
                Attendees
              </Link>
            </li>
            <li>
              <Link href="/vendors" className="text-muted-foreground hover:text-foreground">
                Vendors
              </Link>
            </li>
            <li>
              <Link href="/sponsors" className="text-muted-foreground hover:text-foreground">
                Sponsors
              </Link>
            </li>
            <li>
              <Link href="/news" className="text-muted-foreground hover:text-foreground">
                News
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4">Presented By</h3>
          <div className="flex gap-4 items-center">
             <Image src="/sponsors/new-york-sash.png" alt="New York Sash" width={100} height={40} className="object-contain" />
             <Image src="/logo.png" alt="Home Show" width={80} height={40} className="object-contain" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Home Show at Nexus Center. All rights reserved.
      </div>
    </footer>
  );
}
