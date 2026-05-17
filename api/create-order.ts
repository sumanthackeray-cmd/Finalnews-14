import type { VercelRequest, VercelResponse } from "@vercel/node";
export const config = { maxDuration: 30 };


const APP_ID = process.env.VITE_CASHFREE_APP_ID as string;
const SECRET_KEY = process.env.VITE_CASHFREE_SECRET_KEY as string;
const CF_ENV = (process.env.VITE_CASHFREE_ENV as string) || "sandbox";
const APP_URL = (
  process.env.VITE_APP_URL || "https://finalnews-14.vercel.app"
).replace(/\/$/, "");

const CASHFREE_BASE_URL =
  CF_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

function generateOrderId(planId: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `VOGATS_${planId.toUpperCase()}_${ts}_${rand}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!APP_ID || !SECRET_KEY) {
    return res
      .status(500)
      .json({ error: "Cashfree API keys are not configured on the server." });
  }

  const body = req.body || {};
  const { customerName, customerEmail, customerPhone, amount, planName, planId } = body;

  if (!customerName?.trim())
    return res.status(400).json({ error: "Customer name is required." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
    return res.status(400).json({ error: "Invalid email address." });
  if (!/^[6-9]\d{9}$/.test(customerPhone))
    return res.status(400).json({ error: "Invalid 10-digit Indian mobile number." });
  if (!amount || isNaN(Number(amount)) || Number(amount) < 1)
    return res.status(400).json({ error: "Amount must be at least ₹1." });

  const orderId = generateOrderId(planId || "plan");
  const orderAmount = Math.round(Number(amount) * 100) / 100;

  const payload = {
    order_id: orderId,
    order_amount: orderAmount,
    order_currency: "INR",
    order_note: `Vogats CV – ${planName || planId} Plan`,
    customer_details: {
      customer_id: `CUST_${customerPhone}`,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim().toLowerCase(),
      customer_phone: customerPhone.trim(),
    },
    order_meta: {
      return_url: `${APP_URL}/dashboard?order_id={order_id}`,
      ...(APP_URL.startsWith("https://")
        ? { notify_url: `${APP_URL}/api/webhook` }
        : {}),
    },
    order_tags: {
      plan_id: planId || "",
      plan_name: planName || "",
      env: CF_ENV,
    },
  };

  try {
    const cfRes = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await cfRes.json();

    if (!cfRes.ok) {
      return res
        .status(cfRes.status)
        .json({ error: (data as any).message || `Cashfree error (${cfRes.status})` });
    }

    return res.json({
      order_id: (data as any).order_id,
      payment_session_id: (data as any).payment_session_id,
      order_status: (data as any).order_status,
      order_amount: orderAmount,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
