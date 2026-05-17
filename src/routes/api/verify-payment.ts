import { createAPIFileRoute } from "@tanstack/react-start/api";
import crypto from "crypto";

const KEY_SECRET = import.meta.env.RAZORPAY_KEY_SECRET as string;

export const APIRoute = createAPIFileRoute("/api/verify-payment")({
  POST: async ({ request }) => {
    if (!KEY_SECRET) {
      return Response.json({ error: "Server configuration error." }, { status: 500 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json(
        { error: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature" },
        { status: 400 }
      );
    }

    try {
      // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
      const payload   = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generated = crypto.createHmac("sha256", KEY_SECRET).update(payload).digest("hex");

      if (generated !== razorpay_signature) {
        console.warn("[Razorpay] Signature mismatch for order:", razorpay_order_id);
        return Response.json(
          { error: "Payment signature verification failed." },
          { status: 400 }
        );
      }

      console.log("[Razorpay] Payment verified:", razorpay_payment_id);

      return Response.json({
        success:    true,
        payment_id: razorpay_payment_id,
        order_id:   razorpay_order_id,
      });
    } catch (err: any) {
      return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
  },
});
