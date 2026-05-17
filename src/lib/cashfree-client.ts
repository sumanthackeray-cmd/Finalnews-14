import { createCashfreeOrder } from "./cashfree-server";

/**
 * Polls until window.Cashfree SDK is available (loaded async via script tag).
 * Rejects after `timeoutMs` milliseconds.
 */
async function waitForCashfreeSDK(timeoutMs = 15_000): Promise<(...args: any[]) => any> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      // @ts-ignore — injected by the Cashfree JS SDK script tag
      if (typeof window !== "undefined" && typeof window.Cashfree === "function") {
        // @ts-ignore
        return resolve(window.Cashfree);
      }
      if (Date.now() - start > timeoutMs) {
        return reject(
          new Error(
            "Cashfree SDK failed to load. Check your internet connection or ad-blocker settings."
          )
        );
      }
      setTimeout(check, 150);
    };
    check();
  });
}

/**
 * Initiates a Cashfree production payment:
 * 1. Creates a server-side order (returns payment_session_id)
 * 2. Waits for the Cashfree JS SDK to be ready
 * 3. Redirects the user to Cashfree's hosted checkout page
 */
export async function initiateCashfreePayment(params: {
  amount: number;
  planId: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
}) {
  // Step 1 — Create the order
  const order = await createCashfreeOrder(params);

  if (!order.payment_session_id) {
    throw new Error(
      "Cashfree did not return a payment session. Please try again or contact support."
    );
  }

  console.log("[Cashfree] Order created:", order.order_id, "| Session:", order.payment_session_id);

  // Step 2 — Wait for SDK
  const CashfreeSDK = await waitForCashfreeSDK();

  // Step 3 — Initialise using the configured environment (sandbox or production)
  const cfEnv = (import.meta.env.VITE_CASHFREE_ENV as string) || "production";
  const cashfree = CashfreeSDK({ mode: cfEnv === "sandbox" ? "sandbox" : "production" });

  const result = await cashfree.checkout({
    paymentSessionId: order.payment_session_id,
    redirectTarget: "_self", // Full-page redirect to Cashfree hosted page
  });

  return result;
}
