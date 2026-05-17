import { NextRequest, NextResponse } from "next/server";

const APP_ID = process.env.CASHFREE_APP_ID!;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
const CASHFREE_ENV = process.env.CASHFREE_ENV || "production";

const BASE_URL =
  CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json({ error: "order_id is required" }, { status: 400 });
    }

    if (!APP_ID || !SECRET_KEY) {
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: "GET",
      headers: {
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
        "x-api-version": "2023-08-01",
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: (err as any).message || "Failed to fetch order" },
        { status: response.status }
      );
    }

    const order = await response.json();

    return NextResponse.json({
      order_id: order.order_id,
      order_status: order.order_status,   // PAID | ACTIVE | EXPIRED | CANCELLED
      order_amount: order.order_amount,
      order_currency: order.order_currency,
      customer_details: {
        customer_name: order.customer_details?.customer_name,
        customer_email: order.customer_details?.customer_email,
        customer_phone: order.customer_details?.customer_phone,
      },
      order_note: order.order_note,
      created_at: order.created_at,
      // Payment details (available after PAID)
      payment: order.payments?.[0] ?? null,
    });
  } catch (err: any) {
    console.error("[Cashfree] Verify order exception:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
