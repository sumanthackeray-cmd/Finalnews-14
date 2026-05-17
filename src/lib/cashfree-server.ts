// Cashfree Production Payment Gateway
// Keys are injected at build-time via Vite's import.meta.env

export interface CashfreeOrderPayload {
  amount: number;
  planId: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
}

export interface CashfreeOrderResponse {
  order_id: string;
  payment_session_id: string;
  order_status: string;
  cf_order_id?: string;
}

// Switch between production and sandbox based on env var
const CF_ENV = (import.meta.env.VITE_CASHFREE_ENV as string) || "production";
const CASHFREE_BASE = CF_ENV === "sandbox"
  ? "https://sandbox.cashfree.com/pg"
  : "https://api.cashfree.com/pg";
const APP_ID = import.meta.env.VITE_CASHFREE_APP_ID as string;
const SECRET_KEY = import.meta.env.VITE_CASHFREE_SECRET_KEY as string;

const APP_URL =
  (import.meta.env.VITE_APP_URL as string) ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:8080");

function getHeaders() {
  return {
    "x-client-id": APP_ID,
    "x-client-secret": SECRET_KEY,
    "x-api-version": "2023-08-01",
    "Content-Type": "application/json",
  };
}

/** Sanitise Firebase UID for Cashfree customer_id (alphanumeric + _ - only, max 50 chars) */
function sanitiseCustomerId(uid: string): string {
  return uid.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
}

/** Create a Cashfree order and return the payment_session_id needed for checkout */
export async function createCashfreeOrder(
  data: CashfreeOrderPayload
): Promise<CashfreeOrderResponse> {
  if (!APP_ID || !SECRET_KEY) {
    throw new Error(
      "Cashfree API keys are missing. Please add VITE_CASHFREE_APP_ID and VITE_CASHFREE_SECRET_KEY to your .env file and restart the dev server."
    );
  }

  // Unique order ID: order_<timestamp>_<planId>  (max 50 chars)
  const orderId = `order_${Date.now()}_${data.planId}`.slice(0, 50);

  const payload = {
    order_id: orderId,
    order_amount: data.amount,
    order_currency: "INR",
    customer_details: {
      customer_id: sanitiseCustomerId(data.customerId),
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
    },
    order_meta: {
      return_url: `${APP_URL}/dashboard?order_id={order_id}`,
    },
    order_note: `Vogats CV - ${data.planId} Plan`,
  };

  let response: Response;
  try {
    response = await fetch(`${CASHFREE_BASE}/orders`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (networkErr: any) {
    throw new Error(
      `Network error while creating order: ${networkErr.message}. Check CORS / VPN settings.`
    );
  }

  if (!response.ok) {
    let errBody: any = {};
    try { errBody = await response.json(); } catch {}
    const msg =
      errBody?.message ||
      errBody?.error ||
      `Order creation failed (HTTP ${response.status})`;
    console.error("[Cashfree] Order creation error:", errBody);
    throw new Error(msg);
  }

  return response.json();
}

/** Verify an existing Cashfree order by ID to check payment status */
export async function verifyCashfreeOrder(
  orderId: string
): Promise<{ paid: boolean; amount?: number; orderId?: string }> {
  if (!APP_ID || !SECRET_KEY) {
    console.error("[Cashfree] Cannot verify — API keys missing");
    return { paid: false };
  }

  try {
    const response = await fetch(`${CASHFREE_BASE}/orders/${orderId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error("[Cashfree] Verification HTTP error:", response.status);
      return { paid: false };
    }

    const order = await response.json();
    console.log("[Cashfree] Order status:", order.order_status, "| ID:", orderId);

    return {
      paid: order.order_status === "PAID",
      amount: order.order_amount,
      orderId: order.order_id,
    };
  } catch (error: any) {
    console.error("[Cashfree] Verification exception:", error);
    return { paid: false };
  }
}
