import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Vendor websites are typed by hand (CSV import, admin edit, RegFox form) and
// often arrive as "www.example.com" or "example.com/page". Rendered as-is in
// an href the browser treats that as a path on OUR site and 404s, so every
// link goes through here. Returns null for blank input.
export function absoluteUrl(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed; // mailto:, tel:, etc.
  return `https://${trimmed.replace(/^\/+/, "")}`;
}
