import { useState } from "react";
import { PLANS, PlanId } from "@/lib/subscription";

const CASHFREE_ENV = (import.meta.env.VITE_CASHFREE_ENV as string) || "sandbox";
const CF_PAYMENT_BASE = CASHFREE_ENV === "production"
  ? "https://payments.cashfree.com/order/#"
  : "https://payments-test.cashfree.com/order/#";


interface CheckoutModalProps {
  planId: PlanId;
  onClose: () => void;
  onSuccess: (planId: PlanId, orderId: string) => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
}

type Step = "form" | "processing" | "error";

export function CheckoutModal({ planId, onClose, onSuccess }: CheckoutModalProps) {
  const plan = PLANS[planId];
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [step, setStep] = useState<Step>("form");
  const [errMsg, setErrMsg] = useState("");

  const validate = (): Partial<FormState> => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Valid 10-digit Indian mobile required";
    return e;
  };

  const handlePay = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep("processing");

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name.trim(),
          customerEmail: form.email.trim().toLowerCase(),
          customerPhone: form.phone.trim(),
          amount: plan.price,
          planName: plan.label,
          planId: planId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.payment_session_id) {
        throw new Error(data.error || "Order creation failed. Please try again.");
      }

      // Redirect to Cashfree hosted payment page
      window.location.href = `${CF_PAYMENT_BASE}${data.payment_session_id}`;
    } catch (err: any) {
      setStep("error");
      setErrMsg(err.message || "Something went wrong. Please retry.");
    }
  };

  const inputCls = (field: keyof FormState) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-medium ${
      errors[field]
        ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
        : "border-gray-200 bg-gray-50 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
    }`;

  const planIcon = planId === "STARTER" ? "⚡" : planId === "PRO" ? "🛡️" : "👑";
  const planDays = `${plan.durationDays} DAYS ACCESS`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,15,35,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget && step !== "processing") onClose(); }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: "slideUp 0.35s cubic-bezier(.22,1,.36,1)" }}
      >
        {/* ── Gradient Header ── */}
        <div
          className="px-7 pt-7 pb-5 relative"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
        >
          {step !== "processing" && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none transition-colors bg-transparent border-none cursor-pointer p-1"
              aria-label="Close"
            >
              ×
            </button>
          )}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{planIcon}</span>
            <div>
              <p className="text-white/70 text-xs font-semibold tracking-widest uppercase">Selected Plan</p>
              <h2 className="text-white text-xl font-bold">{plan.label}</h2>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-white text-4xl font-extrabold">₹{plan.price}</span>
            <span className="text-white/60 text-sm">/ fixed price</span>
          </div>
          <p className="text-white/60 text-xs mt-1">{planDays}</p>
        </div>

        {/* ── Body ── */}
        <div className="px-7 py-6">

          {/* FORM STEP */}
          {step === "form" && (
            <>
              <h3 className="text-gray-800 font-bold text-base mb-4">Enter your details to continue</h3>

              <div className="space-y-3">
                {/* Name */}
                <div>
                  <input
                    className={inputCls("name")}
                    placeholder="Full Name"
                    value={form.name}
                    autoComplete="name"
                    onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <input
                    className={inputCls("email")}
                    placeholder="Email Address"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <div className="flex">
                    <span className="px-3 py-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-gray-500 text-sm font-semibold flex items-center select-none">
                      +91
                    </span>
                    <input
                      className={`flex-1 px-4 py-3 rounded-r-xl border text-sm outline-none transition-all font-medium ${
                        errors.phone
                          ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 bg-gray-50 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      }`}
                      placeholder="10-digit mobile number"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => { setForm({ ...form, phone: e.target.value.replace(/\D/g, "") }); setErrors({ ...errors, phone: "" }); }}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Payment method chips */}
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-gray-400 text-xs">Pay via</span>
                {["UPI", "Card", "Net Banking", "Wallet"].map((m) => (
                  <span
                    key={m}
                    className="text-xs px-2 py-1 rounded-lg font-semibold"
                    style={{ background: "#f0f0ff", color: "#4f46e5" }}
                  >
                    {m}
                  </span>
                ))}
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePay}
                className="mt-5 w-full py-4 rounded-2xl font-bold text-white text-base tracking-wide transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer border-none"
                style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
              >
                Pay ₹{plan.price} Securely →
              </button>

              <div className="mt-3 flex items-center justify-center gap-2 text-gray-400 text-xs">
                <span>🔒</span>
                <span>256-bit SSL encrypted · Powered by Cashfree</span>
              </div>
            </>
          )}

          {/* PROCESSING STEP */}
          {step === "processing" && (
            <div className="py-10 flex flex-col items-center gap-4">
              <div
                className="w-14 h-14 rounded-full border-4 border-indigo-200 border-t-indigo-600"
                style={{ animation: "cfSpin 0.8s linear infinite" }}
              />
              <p className="text-gray-700 font-semibold text-base">Creating your order…</p>
              <p className="text-gray-400 text-sm text-center leading-relaxed">
                Please wait. You&apos;ll be redirected to Cashfree&apos;s secure payment page.
              </p>
              <div className="text-xs text-gray-300 font-medium mt-1">
                ₹{plan.price} · {plan.label} Plan
              </div>
            </div>
          )}

          {/* ERROR STEP */}
          {step === "error" && (
            <div className="py-8 flex flex-col items-center gap-4">
              <div className="text-5xl">⚠️</div>
              <p className="text-red-600 font-bold text-base">Payment Failed</p>
              <p className="text-gray-500 text-sm text-center leading-relaxed">{errMsg}</p>
              <button
                onClick={() => { setStep("form"); setErrMsg(""); }}
                className="px-8 py-3 rounded-xl font-bold text-white text-sm cursor-pointer border-none hover:shadow-lg transition-all"
                style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes cfSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
