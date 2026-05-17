"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

interface OrderData {
  order_id: string;
  order_status: string;
  order_amount: number;
  order_currency: string;
  order_note?: string;
  customer_details?: {
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
  };
  created_at?: string;
  payment?: any;
}

function StatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const fetchStatus = useCallback(async () => {
    if (!orderId) {
      setError("No order ID provided.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/verify-order?order_id=${encodeURIComponent(orderId)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to verify payment.");

      setOrderData(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to fetch payment status.");
      setLoading(false);
    }
  }, [orderId]);

  // Initial fetch
  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Auto-refresh for ACTIVE/PENDING orders every 5 seconds (max 12 retries = 60s)
  useEffect(() => {
    if (!orderData) return;
    const isPending = ["ACTIVE", "PENDING"].includes(orderData.order_status);
    if (!isPending || retryCount >= 12) return;

    const timer = setTimeout(() => {
      setRetryCount(c => c + 1);
      fetchStatus();
    }, 5000);

    return () => clearTimeout(timer);
  }, [orderData, retryCount, fetchStatus]);

  const isPaid    = orderData?.order_status === "PAID";
  const isFailed  = ["EXPIRED", "CANCELLED", "FAILED"].includes(orderData?.order_status || "");
  const isPending = ["ACTIVE", "PENDING"].includes(orderData?.order_status || "");
  const amount    = orderData?.order_amount
    ? `₹${orderData.order_amount.toLocaleString("en-IN")}`
    : "—";

  const downloadReceipt = () => {
    if (!orderData) return;
    const lines = [
      "PAYMENT RECEIPT",
      "================",
      `Order ID   : ${orderData.order_id}`,
      `Status     : ${orderData.order_status}`,
      `Amount     : ${amount}`,
      `Currency   : ${orderData.order_currency}`,
      `Note       : ${orderData.order_note || "—"}`,
      `Customer   : ${orderData.customer_details?.customer_name || "—"}`,
      `Email      : ${orderData.customer_details?.customer_email || "—"}`,
      `Phone      : ${orderData.customer_details?.customer_phone || "—"}`,
      `Date       : ${orderData.created_at ? new Date(orderData.created_at).toLocaleString("en-IN") : "—"}`,
      "",
      "Powered by Cashfree Payments",
    ].join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt_${orderData.order_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Loading */}
        {loading && (
          <div className="glass rounded-3xl shadow-2xl p-10 text-center fade-up">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Verifying Payment…</h2>
            <p className="text-gray-400 text-sm">Please wait while we confirm your transaction.</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="glass rounded-3xl shadow-2xl p-8 text-center fade-up">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button onClick={() => router.push("/")} className="btn-primary">Try Again</button>
          </div>
        )}

        {/* SUCCESS */}
        {!loading && !error && isPaid && (
          <div className="glass rounded-3xl shadow-2xl p-8 text-center fade-up">
            {/* Checkmark circle */}
            <div className="relative w-24 h-24 mx-auto mb-6 pulse-ring rounded-full">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Payment Successful
            </div>

            <h2 className="text-2xl font-black text-gray-800 mb-1">🎉 Thank You!</h2>
            <p className="text-gray-500 text-sm mb-6">Your payment has been confirmed.</p>

            {/* Amount */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-5 text-left">
              <div className="text-3xl font-black text-green-700 mb-3">{amount}</div>
              <InfoRow label="Order ID" value={orderData!.order_id} mono />
              {orderData?.customer_details?.customer_name && (
                <InfoRow label="Customer" value={orderData.customer_details.customer_name} />
              )}
              {orderData?.order_note && (
                <InfoRow label="Description" value={orderData.order_note} />
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={downloadReceipt} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Receipt
              </button>
              <button onClick={() => router.push("/")} className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-sm transition-all hover:shadow-lg">
                Done
              </button>
            </div>
          </div>
        )}

        {/* FAILED / EXPIRED */}
        {!loading && !error && isFailed && (
          <div className="glass rounded-3xl shadow-2xl p-8 text-center fade-up">
            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {orderData?.order_status}
            </div>

            <h2 className="text-2xl font-black text-gray-800 mb-1">Payment Failed</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your payment could not be processed. No amount has been deducted.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 text-left">
              <InfoRow label="Order ID" value={orderData!.order_id} mono />
              <InfoRow label="Amount" value={amount} />
              <InfoRow label="Status" value={orderData!.order_status} />
            </div>

            <button
              onClick={() => router.push("/")}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* PENDING / ACTIVE */}
        {!loading && !error && isPending && (
          <div className="glass rounded-3xl shadow-2xl p-8 text-center fade-up">
            <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-5 animate-pulse">
              <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" /> Verifying…
            </div>

            <h2 className="text-2xl font-black text-gray-800 mb-1">Payment Pending</h2>
            <p className="text-gray-500 text-sm mb-2">
              Your payment is being verified. This usually takes a few seconds.
            </p>
            <p className="text-indigo-500 text-xs font-semibold mb-6">
              Auto-refreshing every 5 seconds… (attempt {retryCount}/12)
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-5 text-left">
              <InfoRow label="Order ID" value={orderId || "—"} mono />
              <InfoRow label="Amount" value={amount} />
            </div>

            <button onClick={fetchStatus} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
              Check Status Now
            </button>
          </div>
        )}

        {/* Cashfree footer */}
        {!loading && (
          <div className="text-center mt-6 text-white/50 text-xs flex items-center justify-center gap-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Powered by Cashfree Payments · 256-bit SSL
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className={`text-xs font-bold text-gray-700 text-right max-w-[200px] truncate ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <StatusContent />
    </Suspense>
  );
}
