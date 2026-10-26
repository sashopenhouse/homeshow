"use client";

import { VENDOR_CATEGORIES } from "@/lib/vendor-categories";

// Dropdown of the standard exhibitor categories. If the current value isn't
// one of them (older free-text data), it's kept as an extra option so saving
// the form doesn't silently wipe it.
interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  allowEmpty?: boolean;
}

export default function CategorySelect({ value, onChange, className, allowEmpty = true }: CategorySelectProps) {
  const known = (VENDOR_CATEGORIES as readonly string[]).includes(value);
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      {allowEmpty && <option value="">— No category —</option>}
      {!known && value && <option value={value}>{value} (legacy)</option>}
      {VENDOR_CATEGORIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
