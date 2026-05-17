import { createAPIFileRoute } from "@tanstack/react-start/api";

// These VITE_ vars are baked at build time by Vite and available server-side in Cloudflare Workers.
const APP_ID     = import.meta.env.VITE_CASHFREE_APP_ID     as string;
const SECRET_KEY = import.meta.env.VITE_CASHFREE_SECRET_KEY as string;
const CF_ENV     = (import.meta.env.VITE_CASHFREE_ENV as string) || "sandbox";
const APP_URL    = (import.meta.env.VITE_APP_URL as string || "https://cv.vogats.com").replace(/\/$/, "");

// Switch between production and sandbox based on environment variable
const CASHFREE_BASE_URL =
  CF_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

function generateOrderId(planId: string): string {
  const ts   = Date.now();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `VOGATS_${planId.toUpperCase()}_${ts}_${rand}`;
}

export const APIRoute = createAPIFileRoute("/api/create-order")({
  POST: async ({ request }) => {
    if (!APP_ID || !SECRET_KEY) {
      return Response.json(
        { error: "Cashfree API keys are not configured on the server." },
        { status: 500 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { customerName, customerEmail, customerPhone, amount, planName, planId } = body;

    // ── Server-side validation ─────────────────────────────────────────────
    if (!customerName?.trim())
      return Response.json({ error: "Customer name is required." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
      return Response.json({ error: "Invalid email address." }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(customerPhone))
      return Response.json({ error: "Invalid 10-digit Indian mobile number." }, { status: 400 });
    if (!amount || isNaN(Number(amount)) || Number(amount) < 1)
      return Response.json({ error: "Amount must be at least ₹1." }, { status: 400 });

    const orderId     = generateOrderId(planId || "plan");
    const orderAmount = Math.round(Number(amount) * 100) / 100;

    const payload = {
      order_id:       orderId,
      order_amount:   orderAmount,
      order_currency: "INR",
      order_note:     `Vogats CV – ${planName || planId} Plan`,
      customer_details: {
        customer_id:    `CUST_${customerPhone}`,
        customer_name:  customerName.trim(),
        customer_email: customerEmail.trim().toLowerCase(),
        customer_phone: customerPhone.trim(),
      },
      order_meta: {
        return_url: `${APP_URL}/dashboard?order_id={order_id}`,
        // notify_url only works on public HTTPS
        ...(APP_URL.startsWith("https://") ? { notify_url: `${APP_URL}/api/webhook` } : {}),
      },
      order_tags: {
        plan_id:   planId   || "",
        plan_name: planName || "",
        env:       CF_ENV,
      },
    };

    try {
      const cfRes = await fetch(`${CASHFREE_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type":    "application/json",
          "x-api-version":   "2023-08-01",
          "x-client-id":     APP_ID,
          "x-client-secret": SECRET_KEY,
        },
        body: JSON.stringify(payload),
      });

      const data = await cfRes.json();

      if (!cfRes.ok) {
        console.error("[Cashfree] Order creation failed:", data);
        return Response.json(
          { error: data.message || `Cashfree error (${cfRes.status})` },
          { status: cfRes.status }
        );
      }

      console.log("[Cashfree] Order created:", orderId, "| Env:", CF_ENV, "| Status:", data.order_status);

      return Response.json({
        order_id:           data.order_id,
        payment_session_id: data.payment_session_id,
        order_status:       data.order_status,
        order_amount:       orderAmount,
      });
    } catch (err: any) {
      console.error("[Cashfree] Exception:", err);
      return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
  },
});
