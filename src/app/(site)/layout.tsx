import TransitionLayout from "@/components/animations/TransitionLayout";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Public marketing site chrome (fixed Navbar + Footer). Scoped to this route
// group only — /admin has its own header/sidebar in admin/layout.tsx and
// must NOT get this Navbar, since it's `fixed top-0` and previously covered
// the top of every admin page (it rendered from the true root layout, which
// wraps every route including /admin).
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <TransitionLayout>{children}</TransitionLayout>
      <Footer />
    </>
  );
}
