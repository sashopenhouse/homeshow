import "server-only";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Receives RegFox webhook events (Pages → Extras → Integrations → Webhooks
// in the RegFox dashboard). We only act on "registration" events; other
// event types (cancel_registrant, edit_registrant, coupon, etc.) are
// acknowledged but not processed — out of scope for this first pass.
//
// Every registrant is inserted into `regfox_registrations` as a PENDING row
// for a human to review at /admin/regfox — never written straight into the
// public `vendors` table. See supabase_migration_regfox_webhook.sql for why.

// RegFox's own webhook docs don't spell out which header the HMAC covers or
// exactly how the "App/API Token" you set in RegFox's webhook config is
// used — this assumes it's the HMAC signing secret, matched against the
// X-Webconnex-Signature header. If registrations arrive but signature
// verification keeps failing, that assumption is the first thing to check.
function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

interface RegfoxFieldDatum {
  label?: string;
  path?: string;
  value?: unknown;
}

interface RegfoxRegistrant {
  id?: string | number;
  fieldData?: RegfoxFieldDatum[];
  orderEmail?: string;
}

// Fuzzy label matching: we don't know your RegFox form's exact field labels,
// so we match on common substrings. Anything that doesn't match lands as
// null and gets filled in by hand during review — check raw_payload for the
// real label if a field keeps missing and this list needs another synonym.
// The company_name pattern excludes labels that also look like a website/
// email/phone field (e.g. "Company Website URL") so it can't steal a value
// meant for one of those — otherwise "company" alone would match it too.
const LABEL_PATTERNS: Record<string, RegExp> = {
  company_name: /^(?!.*(website|web site|\burl\b|e-?mail|phone)).*(company|business|organization|exhibitor)/i,
  contact_name: /contact name|your name|full name|^name$|first name/i,
  email: /e-?mail/i,
  phone: /phone|cell|mobile/i,
  website: /website|web site|\burl\b/i,
  ticket_type: /booth|ticket type|space type/i,
};

function extractField(fieldData: RegfoxFieldDatum[] | undefined, pattern: RegExp): string | null {
  if (!fieldData) return null;
  const hit = fieldData.find((f) => f.label && pattern.test(f.label));
  if (!hit || hit.value == null) return null;
  const value = Array.isArray(hit.value) ? hit.value.join(", ") : String(hit.value);
  return value.trim() || null;
}

export async function POST(req: NextRequest) {
  const secret = process.env.REGFOX_WEBHOOK_SECRET;
  if (!secret) {
    console.error("REGFOX_WEBHOOK_SECRET is not set — rejecting webhook.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  // Read the raw body FIRST — HMAC verification needs the exact bytes RegFox
  // signed, not a re-serialized copy of the parsed JSON.
  const rawBody = await req.text();
  const signature = req.headers.get("x-webconnex-signature");

  if (!verifySignature(rawBody, signature, secret)) {
    console.error("RegFox webhook signature verification failed.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    eventType?: string;
    formId?: string | number;
    data?: {
      id?: string | number;
      orderNumber?: string;
      registrants?: RegfoxRegistrant[];
    };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload.eventType ?? "unknown";
  if (eventType !== "registration") {
    // Acknowledge so RegFox doesn't retry, but we don't process it.
    return NextResponse.json({ ok: true, skipped: eventType });
  }

  const registrants = payload.data?.registrants ?? [];
  if (registrants.length === 0) {
    return NextResponse.json({ ok: true, skipped: "no registrants" });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server misconfigured — SUPABASE_SERVICE_ROLE_KEY is not set" }, { status: 500 });
  }

  const rows = registrants
    .filter((r) => r.id != null)
    .map((registrant) => ({
      regfox_order_id: payload.data?.orderNumber ? String(payload.data.orderNumber) : null,
      regfox_registrant_id: String(registrant.id),
      regfox_form_id: payload.formId != null ? String(payload.formId) : null,
      event_type: eventType,
      mapped_company_name: extractField(registrant.fieldData, LABEL_PATTERNS.company_name),
      mapped_contact_name: extractField(registrant.fieldData, LABEL_PATTERNS.contact_name),
      mapped_contact_email: extractField(registrant.fieldData, LABEL_PATTERNS.email) ?? registrant.orderEmail ?? null,
      mapped_contact_phone: extractField(registrant.fieldData, LABEL_PATTERNS.phone),
      mapped_website_url: extractField(registrant.fieldData, LABEL_PATTERNS.website),
      mapped_ticket_type: extractField(registrant.fieldData, LABEL_PATTERNS.ticket_type),
      raw_payload: registrant,
    }));

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, skipped: "no registrant ids" });
  }

  // Upsert on regfox_registrant_id: a RegFox redelivery (failed ack, retry)
  // refreshes the mapped fields instead of creating a duplicate row. status,
  // vendor_id, reviewed_at, and reviewed_by aren't in the upserted objects,
  // so Postgres's ON CONFLICT DO UPDATE leaves them untouched — a redelivery
  // can't undo an admin's review.
  const { error } = await admin
    .from("regfox_registrations")
    .upsert(rows, { onConflict: "regfox_registrant_id", ignoreDuplicates: false });

  if (error) {
    console.error("Failed to store RegFox registration:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: rows.length });
}
