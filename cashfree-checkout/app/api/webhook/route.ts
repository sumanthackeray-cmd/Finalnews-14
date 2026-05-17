import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;

/**
 * Verify Cashfree webhook HMAC-SHA256 signature.
 * Cashfree sends: x-webhook-signature header = base64(HMAC-SHA256(timestamp + rawBody, secret))
 * Docs: https://docs.cashfree.com/docs/webhook-verification
 */
function verifyWebhookSignature(
  rawBody: string,
  timestamp: string,
  receivedSignature: string
): boolean {
  try {
    const message = `${timestamp}${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(message)
      .digest("base64");
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const timestamp = req.headers.get("x-webhook-timestamp") || "";
    const signature = req.headers.get("x-webhook-signature") || "";

    // Verify signature if secret key is set
    if (SECRET_KEY && signature) {
      const isValid = verifyWebhookSignature(rawBody, timestamp, signature);
      if (!isValid) {
        console.warn("[Webhook] Invalid signature received");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const eventType = event.type || event.event_name;
    const orderId = event.data?.order?.order_id || event.order_id;
    const paymentStatus = event.data?.payment?.payment_status || event.payment_status;

    console.log(`[Webhook] Event: ${eventType} | Order: ${orderId} | Status: ${paymentStatus}`);

    // Handle different event types
    switch (eventType) {
      case "PAYMENT_SUCCESS":
      case "PAYMENT_SUCCESS_WEBHOOK":
        console.log(`✅ Payment successful: ${orderId} — ₹${event.data?.payment?.payment_amount}`);
        // TODO: Update your database, send confirmation email, activate subscription, etc.
        break;

      case "PAYMENT_FAILED":
      case "PAYMENT_FAILED_WEBHOOK":
        console.log(`❌ Payment failed: ${orderId} — Reason: ${event.data?.payment?.payment_message}`);
        // TODO: Send failure notification
        break;

      case "PAYMENT_PENDING":
        console.log(`⏳ Payment pending: ${orderId}`);
        break;

      case "REFUND_SUCCESS":
        console.log(`↩️ Refund processed: ${orderId}`);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true, order_id: orderId });
  } catch (err: any) {
    console.error("[Webhook] Exception:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
