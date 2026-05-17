"use client";

import type { PaymentMethod } from "@/app/page";

interface Props {
  selected: PaymentMethod | null;
  onSelect: (m: PaymentMethod) => void;
}

const methods: {
  id: PaymentMethod;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  apps?: string;
}[] = [
  {
    id: "upi",
    label: "UPI",
    subtitle: "Instant transfer",
    apps: "GPay · PhonePe · Paytm · BHIM",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <rect width="48" height="48" rx="10" fill="#6D28D9" />
        <text x="24" y="32" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="system-ui">UPI</text>
      </svg>
    ),
  },
  {
    id: "card",
    label: "Card",
    subtitle: "Credit / Debit",
    apps: "Visa · Mastercard · RuPay · Amex",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <rect width="48" height="48" rx="10" fill="#1E40AF" />
        <rect x="8" y="14" width="32" height="20" rx="3" fill="#3B82F6" />
        <rect x="8" y="20" width="32" height="6" fill="#1D4ED8" />
        <rect x="10" y="27" width="8" height="4" rx="1" fill="#60A5FA" />
      </svg>
    ),
  },
  {
    id: "netbanking",
    label: "Net Banking",
    subtitle: "All major banks",
    apps: "SBI · HDFC · ICICI · Axis · 200+ banks",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <rect width="48" height="48" rx="10" fill="#065F46" />
        <path d="M8 20h32M12 20V32M20 20V32M28 20V32M36 20V32M8 32h32" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 10L40 18H8L24 10Z" fill="white" />
      </svg>
    ),
  },
  {
    id: "wallet",
    label: "Wallets",
    subtitle: "Digital wallets",
    apps: "Paytm · Amazon Pay · Mobikwik",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <rect width="48" height="48" rx="10" fill="#B45309" />
        <rect x="8" y="16" width="32" height="20" rx="3" fill="#D97706" />
        <circle cx="34" cy="26" r="4" fill="#FCD34D" />
        <rect x="8" y="16" width="32" height="5" rx="3" fill="#92400E" />
      </svg>
    ),
  },
  {
    id: "emi",
    label: "EMI",
    subtitle: "Easy installments",
    apps: "No-cost EMI · 3–24 months",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <rect width="48" height="48" rx="10" fill="#7C3AED" />
        <text x="24" y="30" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="system-ui">EMI</text>
        <path d="M14 22c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function PaymentMethodSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-3">
      {methods.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect(m.id)}
          className={`pm-card w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 text-left ${
            selected === m.id ? "selected" : ""
          }`}
        >
          {/* Radio */}
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            selected === m.id
              ? "border-indigo-600 bg-indigo-600"
              : "border-gray-300"
          }`}>
            {selected === m.id && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>

          {/* Icon */}
          <div className="shrink-0">{m.icon}</div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800 text-sm">{m.label}</div>
            <div className="text-xs text-gray-500 mt-0.5 truncate">{m.apps}</div>
          </div>

          {/* Badge */}
          {selected === m.id && (
            <div className="shrink-0 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
              Selected
            </div>
          )}

          {m.id === "upi" && selected !== "upi" && (
            <div className="shrink-0 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
              Instant
            </div>
          )}
        </button>
      ))}

      {/* Info note */}
      <p className="text-xs text-gray-400 text-center pt-1">
        All payment methods are handled securely on Cashfree&apos;s checkout page
      </p>
    </div>
  );
}
