import { createAPIFileRoute } from "@tanstack/react-start/api";
import { createHmac, timingSafeEqual } from "crypto";

const APP_ID     = import.meta.env.VITE_CASHFREE_APP_ID     as string;
const SECRET_KEY = import.meta.env.VITE_CASHFREE_SECRET_KEY as string;
const CF_ENV     = (import.meta.env.VITE_CASHFREE_ENV as string) || "sandbox";

const CASHFREE_BASE_URL =
  CF_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export const APIRoute = createAPIFileRoute("/api/verify-order")({
  GET: async ({ request }) => {
    const url     = new URL(request.url);
    const orderId = url.searchParams.get("order_id");

    if (!orderId)
      return Response.json({ error: "order_id is required" }, { status: 400 });

    if (!APP_ID || !SECRET_KEY)
      return Response.json({ error: "Server configuration error." }, { status: 500 });

    try {
      const res = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
        headers: {
          "x-client-id":     APP_ID,
          "x-client-secret": SECRET_KEY,
          "x-api-version":   "2023-08-01",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return Response.json(
          { error: (err as any).message || "Failed to fetch order" },
          { status: res.status }
        );
      }

      const order = await res.json();

      return Response.json({
        order_id:       order.order_id,
        order_status:   order.order_status,
        order_amount:   order.order_amount,
        order_currency: order.order_currency,
        order_note:     order.order_note,
        customer_details: {
          customer_name:  order.customer_details?.customer_name,
          customer_email: order.customer_details?.customer_email,
          customer_phone: order.customer_details?.customer_phone,
        },
        created_at: order.created_at,
        payment:    order.payments?.[0] ?? null,
      });
    } catch (err: any) {
      return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
  },
});
