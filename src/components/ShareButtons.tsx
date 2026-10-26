"use client";

import { useState } from "react";
import { Share2, Link as LinkIcon, Check, Mail } from "lucide-react";

// Share row for a post page. The URL is read at click time so it works for
// client-rendered pages and for the static fallback posts alike. On phones
// that support it, "Share" opens the native share sheet.
interface ShareButtonsProps {
  title: string;
  text?: string;
}

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2H21.5l-7.5 8.57L22.75 22h-6.9l-5.4-6.9L4.3 22H1.04l8.03-9.17L0.75 2h7.08l4.88 6.33L18.24 2Zm-1.21 18h1.9L7.05 3.9H5.02L17.03 20Z" />
    </svg>
  );
}

function FacebookIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 22v-8.2h2.8l.4-3.3h-3.2V8.4c0-.9.3-1.6 1.6-1.6h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.3h2.8V22h3.4Z" />
    </svg>
  );
}

function LinkedinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2ZM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2ZM7.1 20.5H3.5V9h3.6v11.5Z" />
    </svg>
  );
}

export default function ShareButtons({ title, text }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState<boolean | null>(null);

  const getUrl = () => (typeof window === "undefined" ? "" : window.location.href);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (http, permissions); fall back to a prompt.
      window.prompt("Copy this link:", getUrl());
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text: text || title, url: getUrl() });
    } catch {
      // User dismissed the sheet — nothing to do.
    }
  };

  // Detect native share lazily on first hover/focus so SSR markup matches.
  const detect = () => {
    if (canNativeShare === null) setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  };

  const open = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const encodedTitle = () => encodeURIComponent(title);
  const encodedUrl = () => encodeURIComponent(getUrl());

  const btn =
    "inline-flex items-center gap-1.5 px-3 py-2 border border-border bg-white text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors rounded-none";

  return (
    <div className="flex flex-wrap items-center gap-2" onMouseEnter={detect} onFocus={detect}>
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wide mr-1">
        <Share2 size={14} />
        Share
      </span>

      {canNativeShare && (
        <button type="button" onClick={nativeShare} className={btn}>
          <Share2 size={14} />
          Share…
        </button>
      )}

      <button
        type="button"
        onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl()}`)}
        className={btn}
        aria-label="Share on Facebook"
      >
        <FacebookIcon />
        Facebook
      </button>

      <button
        type="button"
        onClick={() => open(`https://twitter.com/intent/tweet?text=${encodedTitle()}&url=${encodedUrl()}`)}
        className={btn}
        aria-label="Share on X"
      >
        <XIcon />
        X
      </button>

      <button
        type="button"
        onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl()}`)}
        className={btn}
        aria-label="Share on LinkedIn"
      >
        <LinkedinIcon />
        LinkedIn
      </button>

      <a
        href={`mailto:?subject=${encodedTitle()}&body=${encodeURIComponent(`${text || title}\n\n`)}${encodedUrl()}`}
        className={btn}
        aria-label="Share by email"
      >
        <Mail size={14} />
        Email
      </a>

      <button type="button" onClick={copy} className={btn} aria-label="Copy link">
        {copied ? <Check size={14} className="text-green-600" /> : <LinkIcon size={14} />}
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
