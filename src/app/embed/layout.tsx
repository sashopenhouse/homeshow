import type { Metadata } from "next";

// Bare pages meant to be loaded in an <iframe> on other sites: no Navbar/Footer,
// and kept out of search results so they don't compete with the real pages.
export const metadata: Metadata = {
  title: "Home Show Floor Plan",
  robots: { index: false, follow: false },
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
