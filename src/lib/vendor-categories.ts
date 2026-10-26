// Exhibitor categories, taken from last year's directory (see
// supabase_seed_vendors.sql). Used as the dropdown in the admin vendor
// editor and the RegFox review card so the public directory filter stays
// consistent. Add to this list rather than typing new free-text values.
export const VENDOR_CATEGORIES = [
  "Exterior Remodeling",
  "Interior Remodeling",
  "HVAC",
  "Solar",
  "Outdoor",
  "Services",
  "Shopping",
  "Tasting",
  "Non-Profit",
] as const;

export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];
