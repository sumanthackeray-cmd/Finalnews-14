import { createAPIFileRoute } from "@tanstack/react-start/api";
import { createHmac, timingSafeEqual } from "crypto";

const SECRET_KEY = import.meta.env.VITE_CASHFREE_SECRET_KEY as string;

function verifySignature(rawBody: string, timestamp: string, received: string): boolean {
  try {
    const message = `${timestamp}${rawBody}`;
    const expected = createHmac("sha256", SECRET_KEY).update(message).digest("base64");
    return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  } catch { return false; }
}

export const APIRoute = createAPIFileRoute("/api/webhook")({
  POST: async ({ request }) => {
    const rawBody  = await request.text();
    const timestamp = request.headers.get("x-webhook-timestamp") || "";
    const signature = request.headers.get("x-webhook-signature") || "";

    if (SECRET_KEY && signature) {
      if (!verifySignature(rawBody, timestamp, signature)) {
        console.warn("[Webhook] Invalid signature");
        return Response.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    let event: any;
    try { event = JSON.parse(rawBody); }
    catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

    const type    = event.type || event.event_name;
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

    return Response.json({ received: true });
  },
});
