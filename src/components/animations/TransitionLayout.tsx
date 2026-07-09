"use client";

import { ReactNode, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";

export default function TransitionLayout({ children }: { children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      // Basic fade-in animation on route change
      gsap.fromTo(container.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    },
    { dependencies: [pathname], scope: container }
  );

  return (
    <div ref={container} className="flex-1 w-full flex flex-col">
      {children}
    </div>
  );
}
