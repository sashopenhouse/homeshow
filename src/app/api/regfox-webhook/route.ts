import "server-only";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { mapRegistrant, type RegfoxRegistrant } from "@/lib/regfox-mapper";

// Receives RegFox webhook events (Pages → Extras → Integrations → Webhooks
// in the RegFox dashboard). We only act on "registration" events; other
// event types (cancel_registrant, edit_registrant, coupon, etc.) are
// acknowledged but not processed — out of scope for this first pass.
//
// Every registrant is inserted into `regfox_registrations` as a PENDING row
// for a human to review at /admin/regfox — never written straight into the
// public `vendors` table. See supabase_migration_regfox_webhook.sql for why.
// Field mapping lives in src/lib/regfox-mapper.ts (key-based, not label-based).

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

interface RegfoxWebhookPayload {
  eventType?: string;
  formId?: string | number;
  data?: {
    id?: string | number;
    orderNumber?: string;
    registrants?: RegfoxRegistrant[];
  };
}

export async function POST(req: NextRequest) {
  const secret = process.env.REGFOX_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[regfox-webhook] REGFOX_WEBHOOK_SECRET is not set — rejecting webhook.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  // Read the raw body FIRST — HMAC verification needs the exact bytes RegFox
  // signed, not a re-serialized copy of the parsed JSON.
  const rawBody = await req.text();
  const signature = req.headers.get("x-webconnex-signature");

  if (!verifySignature(rawBody, signature, secret)) {
    console.error("[regfox-webhook] signature verification failed.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: RegfoxWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("[regfox-webhook] body is not valid JSON.");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload.eventType ?? "unknown";
  const orderId = payload.data?.orderNumber ? String(payload.data.orderNumber) : null;

  if (eventType !== "registration") {
    // Acknowledge so RegFox doesn't retry, but we don't process it.
    console.log(`[regfox-webhook] order=${orderId ?? "n/a"} event=${eventType} result=skipped (not a registration)`);
    return NextResponse.json({ ok: true, skipped: eventType });
  }

  const registrants = (payload.data?.registrants ?? []).filter((r) => r && r.id != null);
  if (registrants.length === 0) {
    console.log(`[regfox-webhook] order=${orderId ?? "n/a"} event=${eventType} result=skipped (no registrants with ids)`);
    return NextResponse.json({ ok: true, skipped: "no registrants" });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (err) {
    console.error(`[regfox-webhook] order=${orderId ?? "n/a"} result=failed (admin client)`, err);
    return NextResponse.json({ error: "Server misconfigured — SUPABASE_SERVICE_ROLE_KEY is not set" }, { status: 500 });
  }

  const rows = registrants.map((registrant) => ({
    regfox_order_id: orderId,
    regfox_registrant_id: String(registrant.id),
    regfox_form_id: payload.formId != null ? String(payload.formId) : null,
    event_type: eventType,
    ...mapRegistrant(registrant),
    raw_payload: registrant,
  }));

  // Upsert on regfox_registrant_id: a RegFox redelivery of an already-stored
  // order refreshes the mapped fields instead of failing on the unique
  // constraint, so RegFox gets a 200 and stops retrying. status, vendor_id,
  // reviewed_at, and reviewed_by aren't in the upserted objects, so Postgres's
  // ON CONFLICT DO UPDATE leaves them untouched — a redelivery can't undo an
  // admin's review.
  const { data: stored, error } = await admin
    .from("regfox_registrations")
    .upsert(rows, { onConflict: "regfox_registrant_id", ignoreDuplicates: false })
    .select("id");

  if (error) {
    // 500 so RegFox retries — a 200 here would silently drop the registration.
    console.error(`[regfox-webhook] order=${orderId ?? "n/a"} registrants=${rows.length} result=failed (db)`, error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const storedCount = stored?.length ?? rows.length;
  console.log(`[regfox-webhook] order=${orderId ?? "n/a"} registrants=${rows.length} result=stored (${storedCount} rows)`);
  return NextResponse.json({ ok: true, stored: storedCount });
}
