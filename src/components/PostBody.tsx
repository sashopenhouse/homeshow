"use client";

import { useEffect, useRef } from "react";
import { normalizePostHtml, sanitizeHtml } from "@/lib/post-html";

// Renders a stored post body (legacy plain text or editor HTML). Sanitizing
// needs DOMParser, so the markup is written into the element after mount;
// until then the container is empty rather than holding unsanitized HTML.
export default function PostBody({ content, className = "" }: { content: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = sanitizeHtml(normalizePostHtml(content));
  }, [content]);

  return <div ref={ref} className={`post-body ${className}`} />;
}
