// Pure mapper from a RegFox registrant object to the mapped_* columns on
// `regfox_registrations`. No server-only imports: the admin page also uses
// it client-side to re-run the mapping from a stored raw_payload.
//
// Payload shape (per registrant, as stored in raw_payload):
//   { id, data: [...], amount, lookupId }
// Each `data` entry has key / type / label and usually `value`. Compound
// fields nest their parts as sibling objects (name.first.value,
// address.city.value). Choice fields carry an `options` array where the
// chosen option has `value: true`. donationBox fields carry a `repeater`.
//
// Matching is on `key`, never on `label` — the Home Show form labels the
// `contactName` key "Company Name", so labels are not trustworthy.

export interface RegfoxOption {
  key?: string;
  label?: string;
  value?: unknown;
  amount?: unknown;
}

export interface RegfoxDataEntry {
  key?: string;
  type?: string;
  label?: string;
  value?: unknown;
  options?: RegfoxOption[];
  repeater?: Array<Record<string, unknown>>;
  [part: string]: unknown;
}

export interface RegfoxRegistrant {
  id?: string | number;
  data?: RegfoxDataEntry[];
  amount?: unknown;
  lookupId?: unknown;
  orderEmail?: string;
}

export interface MappedRegistration {
  mapped_company_name: string | null;
  mapped_contact_name: string | null;
  mapped_contact_email: string | null;
  mapped_contact_phone: string | null;
  mapped_website_url: string | null;
  mapped_ticket_type: string | null;
  mapped_address: string | null;
  mapped_booth_choices: string[] | null;
  mapped_sponsor_amount: number | null;
  mapped_is_sponsor: boolean | null;
  mapped_returning_vendor: boolean | null;
  mapped_product_description: string | null;
  mapped_needs_electricity: boolean | null;
  mapped_outlets_110: number | null;
  mapped_outlets_220: number | null;
  mapped_notes: string | null;
  order_total: number | null;
  regfox_lookup_id: string | null;
}

export function getField(data: RegfoxDataEntry[] | undefined, key: string): RegfoxDataEntry | undefined {
  if (!Array.isArray(data)) return undefined;
  return data.find((entry) => entry && typeof entry === "object" && entry.key === key);
}

function toStr(value: unknown): string | null {
  if (value == null) return null;
  if (Array.isArray(value)) value = value.join(", ");
  const s = String(value).trim();
  return s ? s : null;
}

function toNum(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function toInt(value: unknown): number | null {
  const n = toNum(value);
  return n == null ? null : Math.trunc(n);
}

function part(entry: RegfoxDataEntry | undefined, name: string): string | null {
  const sub = entry?.[name];
  if (!sub || typeof sub !== "object") return null;
  return toStr((sub as { value?: unknown }).value);
}

function chosenOption(entry: RegfoxDataEntry | undefined): RegfoxOption | undefined {
  return entry?.options?.find((o) => o && o.value === true);
}

function toBool(entry: RegfoxDataEntry | undefined): boolean | null {
  if (!entry) return null;
  if (typeof entry.value === "boolean") return entry.value;
  const chosen = chosenOption(entry);
  const text = chosen?.label ?? chosen?.key ?? toStr(entry.value);
  if (text == null) return null;
  if (/^(yes|true|y)$/i.test(text)) return true;
  if (/^(no|false|n)$/i.test(text)) return false;
  return null;
}

export function mapRegistrant(registrant: RegfoxRegistrant | null | undefined): MappedRegistration {
  const data = registrant?.data;

  const nameEntry = getField(data, "name");
  const contactName = [part(nameEntry, "first"), part(nameEntry, "last")].filter(Boolean).join(" ").trim() || null;

  const addressEntry = getField(data, "address");
  const address =
    [part(addressEntry, "street1"), part(addressEntry, "city"), part(addressEntry, "state"), part(addressEntry, "postalCode")]
      .filter(Boolean)
      .join(", ") || null;

  const boothChoices = ["choice1", "choice12", "choice2"]
    .map((key) => toStr(getField(data, key)?.value))
    .filter((v): v is string => v != null);

  const sponsorRepeater = getField(data, "sponsorAmount")?.repeater?.[0];
  const sponsorAmountRaw =
    sponsorRepeater && typeof sponsorRepeater.amount === "object" && sponsorRepeater.amount
      ? (sponsorRepeater.amount as { value?: unknown }).value
      : undefined;

  return {
    mapped_company_name: toStr(getField(data, "contactName")?.value),
    mapped_contact_name: contactName,
    mapped_contact_email: toStr(getField(data, "email")?.value) ?? toStr(registrant?.orderEmail),
    mapped_contact_phone: toStr(getField(data, "phone")?.value),
    mapped_website_url: toStr(getField(data, "website")?.value),
    mapped_ticket_type: toStr(chosenOption(getField(data, "registrationOptions"))?.label),
    mapped_address: address,
    mapped_booth_choices: boothChoices.length ? boothChoices : null,
    mapped_sponsor_amount: toNum(sponsorAmountRaw),
    mapped_is_sponsor: toBool(getField(data, "doYouNeedAdditional")),
    mapped_returning_vendor: toBool(getField(data, "areYouReturningVendor")),
    mapped_product_description: toStr(getField(data, "productDescription")?.value),
    mapped_needs_electricity: toBool(getField(data, "doYouNeedElectricity2")),
    mapped_outlets_110: toInt(getField(data, "howMany110vOutlets")?.value),
    mapped_outlets_220: toInt(getField(data, "howMany220Outlets")?.value),
    mapped_notes: toStr(getField(data, "additionalNotescomments")?.value),
    order_total: toNum(registrant?.amount),
    regfox_lookup_id: toStr(registrant?.lookupId),
  };
}
