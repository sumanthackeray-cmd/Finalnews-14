"use client";

import { useState } from "react";
import CheckoutForm from "@/components/CheckoutForm";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import OrderSummary from "@/components/OrderSummary";
import TrustBadges from "@/components/TrustBadges";
import LoadingOverlay from "@/components/LoadingOverlay";

export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet" | "emi";

export interface FormData {
  name: string;
  email: string;
  phone: string;
  amount: string;
  description: string;
}

export default function CheckoutPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    amount: "",
    description: "",
  });
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");

  const handlePay = async () => {
    setError("");

    // Validation
    if (!formData.name.trim()) return setError("Please enter your full name.");
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return setError("Please enter a valid email address.");
    if (!formData.phone.match(/^[6-9]\d{9}$/)) return setError("Please enter a valid 10-digit Indian mobile number.");
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) < 1)
      return setError("Please enter a valid amount (minimum ₹1).");
    if (!selectedMethod) return setError("Please select a payment method.");

    setLoading(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name.trim(),
          customerEmail: formData.email.trim().toLowerCase(),
          customerPhone: formData.phone.trim(),
          amount: Number(formData.amount),
          orderNote: formData.description.trim() || "Payment via Vogats CV",
          paymentMethod: selectedMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.payment_session_id) {
        throw new Error(data.error || "Failed to create payment order. Please try again.");
      }

      setOrderId(data.order_id);

      // Redirect to Cashfree hosted checkout
      const checkoutUrl = `https://payments.cashfree.com/order/#${data.payment_session_id}`;
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingOverlay orderId={orderId} />}

      <div className="min-h-screen py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8 fade-up">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white/80 text-xs font-semibold uppercase tracking-widest mb-4">
            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            256-bit SSL Secured
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Complete Your Payment
          </h1>
          <p className="text-white/60 mt-2 text-sm">
            Fast, secure, and easy payments powered by Cashfree
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Form + Methods */}
          <div className="lg:col-span-2 space-y-5">
            {/* Customer Details */}
            <div className="glass rounded-3xl shadow-2xl p-6 md:p-8 fade-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                <h2 className="text-lg font-bold text-gray-800">Your Details</h2>
              </div>
              <CheckoutForm formData={formData} onChange={setFormData} />
            </div>

            {/* Payment Method */}
            <div className="glass rounded-3xl shadow-2xl p-6 md:p-8 fade-up-delay">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                <h2 className="text-lg font-bold text-gray-800">Payment Method</h2>
              </div>
              <PaymentMethodSelector selected={selectedMethod} onSelect={setSelectedMethod} />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 fade-up">
                <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-5 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 fade-up-delay2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {loading ? "Creating Order…" : `Pay ${formData.amount ? `₹${Number(formData.amount).toLocaleString("en-IN")}` : "Securely"}`}
            </button>
          </div>

          {/* Right — Summary + Trust */}
          <div className="space-y-5">
            <OrderSummary formData={formData} selectedMethod={selectedMethod} />
            <TrustBadges />
          </div>
        </div>
      </div>
    </>
  );
}
