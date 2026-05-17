"use client";

import type { FormData, PaymentMethod } from "@/app/page";

const METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: "UPI",
  card: "Credit / Debit Card",
  netbanking: "Net Banking",
  wallet: "Wallet",
  emi: "EMI",
};

interface Props {
  formData: FormData;
  selectedMethod: PaymentMethod | null;
}

export default function OrderSummary({ formData, selectedMethod }: Props) {
  const amount = Number(formData.amount) || 0;
  const hasAmount = amount > 0;

  return (
    <div className="glass rounded-3xl shadow-2xl p-6 fade-up-delay">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Order Summary
      </h3>

      <div className="space-y-3">
        <Row
          label="Customer"
          value={formData.name || <span className="text-gray-300 italic text-xs">Not filled</span>}
        />
        <Row
          label="Email"
          value={
            formData.email ? (
              <span className="truncate max-w-[140px] block">{formData.email}</span>
            ) : (
              <span className="text-gray-300 italic text-xs">Not filled</span>
            )
          }
        />
        <Row
          label="Phone"
          value={
            formData.phone ? `+91 ${formData.phone}` : <span className="text-gray-300 italic text-xs">Not filled</span>
          }
        />
        {formData.description && (
          <Row label="Description" value={formData.description} />
        )}
        {selectedMethod && (
          <Row label="Method" value={METHOD_LABELS[selectedMethod]} />
        )}

        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Amount</span>
            <span className={`text-2xl font-black ${hasAmount ? "text-indigo-700" : "text-gray-300"}`}>
              {hasAmount ? `₹${amount.toLocaleString("en-IN")}` : "₹ ---"}
            </span>
          </div>
        </div>
      </div>

      {/* Cashfree badge */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span className="text-[10px] text-gray-400 font-medium">Powered by Cashfree Payments</span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-gray-400 font-medium shrink-0">{label}</span>
      <span className="text-xs text-gray-700 font-semibold text-right">{value}</span>
    </div>
  );
}
