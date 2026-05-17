import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const APP_ID = process.env.CASHFREE_APP_ID!;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
const CASHFREE_ENV = process.env.CASHFREE_ENV || "production";

// For production Cashfree API, return_url MUST be https.
// Set NEXT_PUBLIC_APP_URL to your deployed domain (e.g. https://yourapp.vercel.app)
// For local dev, Cashfree will redirect to this URL after payment (you can use ngrok too)
const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
).replace(/\/$/, "");

// Determine if we're in a local dev context
const IS_LOCAL = APP_URL.startsWith("http://localhost") || APP_URL.startsWith("http://127.");

const BASE_URL =
  CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

function generateOrderId(): string {
  const ts = Date.now();
  const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `ORDER_${ts}_${rand}`;
}

function sanitiseCustomerId(phone: string): string {
  return `CUST_${phone}`.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
}

export async function POST(req: NextRequest) {
  try {
    if (!APP_ID || !SECRET_KEY) {
      return NextResponse.json(
        { error: "Cashfree API credentials are not configured on the server." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { customerName, customerEmail, customerPhone, amount, orderNote, paymentMethod } = body;

    // Server-side validation
    if (!customerName?.trim()) return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    if (!customerEmail?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    if (!customerPhone?.match(/^[6-9]\d{9}$/)) return NextResponse.json({ error: "Invalid 10-digit Indian mobile number." }, { status: 400 });
    if (!amount || isNaN(Number(amount)) || Number(amount) < 1) return NextResponse.json({ error: "Amount must be at least ₹1." }, { status: 400 });

    const orderId = generateOrderId();
    const orderAmount = Math.round(Number(amount) * 100) / 100; // Round to 2 decimal places

    // Build order_meta — Cashfree production requires HTTPS for return_url.
    // If running locally, we skip notify_url (webhooks need a public URL).
    // The {order_id} placeholder is automatically replaced by Cashfree.
    const returnUrl = IS_LOCAL
      ? `${APP_URL}/payment-status?order_id={order_id}`   // http is OK as return only (no webhook)
      : `${APP_URL}/payment-status?order_id={order_id}`;

    const orderMeta: Record<string, string> = {
      return_url: returnUrl,
    };

    // Only add notify_url when we have a public HTTPS URL
    if (!IS_LOCAL && APP_URL.startsWith("https://")) {
      orderMeta.notify_url = `${APP_URL}/api/webhook`;
    }

    const payload = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: "INR",
      order_note: orderNote?.trim() || `Payment via Cashfree - ${paymentMethod}`,
      customer_details: {
        customer_id: sanitiseCustomerId(customerPhone),
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim().toLowerCase(),
        customer_phone: customerPhone.trim(),
      },
      order_meta: orderMeta,
    };

    const response = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Cashfree] Order creation failed:", data);
      return NextResponse.json(
        { error: data.message || `Cashfree error: ${response.status}` },
        { status: response.status }
      );
    }

    console.log("[Cashfree] Order created:", orderId, "| Status:", data.order_status);

    return NextResponse.json({
      order_id: data.order_id,
      payment_session_id: data.payment_session_id,
      order_status: data.order_status,
      order_amount: orderAmount,
    });
  } catch (err: any) {
    console.error("[Cashfree] Create order exception:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
