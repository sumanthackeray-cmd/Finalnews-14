import { createAPIFileRoute } from "@tanstack/react-start/api";
import crypto from "crypto";

// Server-side only — never exposed to frontend bundle
const KEY_ID     = import.meta.env.RAZORPAY_KEY_ID     as string;
const KEY_SECRET = import.meta.env.RAZORPAY_KEY_SECRET as string;

function generateReceiptId(planId: string): string {
  const ts   = Date.now();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `VOGATS_${planId.toUpperCase()}_${ts}_${rand}`;
}

export const APIRoute = createAPIFileRoute("/api/create-order")({
  POST: async ({ request }) => {
    if (!KEY_ID || !KEY_SECRET) {
      return Response.json(
        { error: "Razorpay API keys are not configured on the server." },
        { status: 500 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { customerName, customerEmail, amount, planName, planId } = body;

    // ── Server-side validation ────────────────────────────────────────────────
    if (!customerName?.trim())
      return Response.json({ error: "Customer name is required." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
      return Response.json({ error: "Invalid email address." }, { status: 400 });
    if (!amount || isNaN(Number(amount)) || Number(amount) < 1)
      return Response.json({ error: "Amount must be at least ₹1." }, { status: 400 });

    // Razorpay expects amount in paise (₹1 = 100 paise)
    const amountPaise = Math.round(Number(amount) * 100);
    if (amountPaise < 100)
      return Response.json({ error: "Minimum amount is ₹1 (100 paise)." }, { status: 400 });

    const receipt = generateReceiptId(planId || "plan");

    try {
      // Call Razorpay Orders API directly (no SDK needed in Cloudflare/edge runtime)
      const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
      const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount:   amountPaise,
          currency: "INR",
          receipt,
          notes: {
            plan_id:        planId   || "",
            plan_name:      planName || "",
            customer_name:  customerName.trim(),
            customer_email: customerEmail.trim().toLowerCase(),
          },
        }),
      });

      const data = await rpRes.json() as any;

      if (!rpRes.ok) {
        console.error("[Razorpay] Order creation failed:", data);
        return Response.json(
          { error: data?.error?.description || `Razorpay error (${rpRes.status})` },
          { status: rpRes.status }
        );
      }

      console.log("[Razorpay] Order created:", data.id, "| Amount:", amountPaise, "paise");

      return Response.json({
        order_id: data.id,
        amount:   data.amount,
        currency: data.currency,
      });
    } catch (err: any) {
      console.error("[Razorpay] Exception:", err);
      return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
  },

  // Verify payment signature — called after Razorpay modal success
  // POST /api/verify-payment  (separate endpoint below)
});
