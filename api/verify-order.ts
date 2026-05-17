import type { VercelRequest, VercelResponse } from "@vercel/node";

const APP_ID = process.env.VITE_CASHFREE_APP_ID as string;
const SECRET_KEY = process.env.VITE_CASHFREE_SECRET_KEY as string;
const CF_ENV = (process.env.VITE_CASHFREE_ENV as string) || "sandbox";

const CASHFREE_BASE_URL =
  CF_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const orderId = req.query.order_id as string;

  if (!orderId)
    return res.status(400).json({ error: "order_id is required" });

  if (!APP_ID || !SECRET_KEY)
    return res.status(500).json({ error: "Server configuration error." });

  try {
    const cfRes = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
      headers: {
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
        "x-api-version": "2023-08-01",
      },
    });

    if (!cfRes.ok) {
      const err = await cfRes.json().catch(() => ({}));
      return res
        .status(cfRes.status)
        .json({ error: (err as any).message || "Failed to fetch order" });
    }

    const order: any = await cfRes.json();

    return res.json({
      order_id: order.order_id,
      order_status: order.order_status,
      order_amount: order.order_amount,
      order_currency: order.order_currency,
      order_note: order.order_note,
      customer_details: {
        customer_name: order.customer_details?.customer_name,
        customer_email: order.customer_details?.customer_email,
        customer_phone: order.customer_details?.customer_phone,
      },
      created_at: order.created_at,
      payment: order.payments?.[0] ?? null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
