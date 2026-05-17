import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET as string;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!KEY_SECRET) {
    return res.status(500).json({ error: "Server configuration error." });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      error: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature",
    });
  }

  try {
    const payload   = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated = crypto.createHmac("sha256", KEY_SECRET).update(payload).digest("hex");

    if (generated !== razorpay_signature) {
      console.warn("[Razorpay] Signature mismatch:", razorpay_order_id);
      return res.status(400).json({ error: "Payment signature verification failed." });
    }

    console.log("[Razorpay] Payment verified:", razorpay_payment_id);
    return res.json({ success: true, payment_id: razorpay_payment_id, order_id: razorpay_order_id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
