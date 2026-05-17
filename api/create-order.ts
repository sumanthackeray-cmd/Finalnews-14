import type { VercelRequest, VercelResponse } from "@vercel/node";
import Razorpay from "razorpay";

export const config = { maxDuration: 30 };

const KEY_ID     = process.env.RAZORPAY_KEY_ID     as string;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET as string;

function generateReceiptId(planId: string): string {
  const ts   = Date.now();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `VOGATS_${planId.toUpperCase()}_${ts}_${rand}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!KEY_ID || !KEY_SECRET) {
    return res.status(500).json({ error: "Razorpay API keys are not configured on the server." });
  }

  const body = req.body || {};
  const { customerName, customerEmail, amount, planName, planId } = body;

  // Validate inputs
  if (!customerName?.trim())
    return res.status(400).json({ error: "Customer name is required." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
    return res.status(400).json({ error: "Invalid email address." });
  if (!amount || isNaN(Number(amount)) || Number(amount) < 1)
    return res.status(400).json({ error: "Amount must be at least ₹1." });

  // Razorpay expects amount in paise (₹1 = 100 paise)
  const amountPaise = Math.round(Number(amount) * 100);
  if (amountPaise < 100)
    return res.status(400).json({ error: "Minimum amount is ₹1 (100 paise)." });

  const razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

  try {
    const order = await razorpay.orders.create({
      amount:   amountPaise,
      currency: "INR",
      receipt:  generateReceiptId(planId || "plan"),
      notes: {
        plan_id:         planId   || "",
        plan_name:       planName || "",
        customer_name:   customerName.trim(),
        customer_email:  customerEmail.trim().toLowerCase(),
      },
    });

    console.log("[Razorpay] Order created:", order.id, "| Amount:", amountPaise, "paise");

    return res.json({
      order_id: order.id,
      amount:   order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    console.error("[Razorpay] Order creation error:", err);
    return res.status(500).json({ error: err?.error?.description || err.message || "Internal server error" });
  }
}
