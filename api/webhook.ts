import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHmac, timingSafeEqual } from "crypto";

const SECRET_KEY = process.env.VITE_CASHFREE_SECRET_KEY as string;

function verifySignature(
  rawBody: string,
  timestamp: string,
  received: string
): boolean {
  try {
    const message = `${timestamp}${rawBody}`;
    const expected = createHmac("sha256", SECRET_KEY)
      .update(message)
      .digest("base64");
    return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Read raw body for signature verification
  const rawBody =
    typeof req.body === "string" ? req.body : JSON.stringify(req.body);

  const timestamp = (req.headers["x-webhook-timestamp"] as string) || "";
  const signature = (req.headers["x-webhook-signature"] as string) || "";

  if (SECRET_KEY && signature) {
    if (!verifySignature(rawBody, timestamp, signature)) {
      console.warn("[Webhook] Invalid signature");
      return res.status(401).json({ error: "Invalid signature" });
    }
  }

  let event: any;
  try {
    event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const type = event.type || event.event_name;
  const orderId = event.data?.order?.order_id || event.order_id;

  console.log(`[Webhook] ${type} | Order: ${orderId}`);

  if (type === "PAYMENT_SUCCESS_WEBHOOK") {
    const { order, payment } = event.data || {};
    console.log(`✅ Paid: ${order?.order_id} — ₹${payment?.payment_amount}`);
    // TODO: activate subscription in your DB
  }
  if (type === "PAYMENT_FAILED_WEBHOOK") {
    console.log(`❌ Failed: ${orderId}`);
  }

  return res.json({ received: true });
}
