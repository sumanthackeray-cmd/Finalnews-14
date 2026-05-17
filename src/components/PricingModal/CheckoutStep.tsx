import { useState, useEffect } from "react";
import { ArrowLeft, Shield } from "lucide-react";
import type { PlanId } from "@/lib/subscription";
import { PLANS } from "@/lib/subscription";

const RZP_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string;

declare global { interface Window { Razorpay: any; } }
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

interface CheckoutStepProps {
  planId: PlanId;
  onBack: () => void;
  userName?: string;   // auto-fill from profile
  userEmail?: string;  // auto-fill from profile
}

interface FormState { name: string; email: string; phone: string; }
type Step = "form" | "loading";

export function CheckoutStep({ planId, onBack, userName, userEmail }: CheckoutStepProps) {
  const plan = PLANS[planId];

  // Pre-fill name & email from Firebase profile; phone must be entered manually
  const [form, setForm] = useState<FormState>({
    name:  userName  || "",
    email: userEmail || "",
    phone: "",
  });

  // Re-sync if parent updates the user values after mount
  useEffect(() => {
    setForm(f => ({
      name:  f.name  || userName  || "",
      email: f.email || userEmail || "",
      phone: f.phone,
    }));
  }, [userName, userEmail]);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [step, setStep] = useState<Step>("form");
  const [apiError, setApiError] = useState("");

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: field === "phone" ? e.target.value.replace(/\D/g, "") : e.target.value }));
    setErrors(err => ({ ...err, [field]: "" }));
  };

  const validate = (): Partial<FormState> => {
    const e: Partial<FormState> = {};
    if (!form.name.trim())                               e.name  = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!/^[6-9]\d{9}$/.test(form.phone))               e.phone = "Valid 10-digit Indian mobile required";
    return e;
  };

  const handlePay = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setApiError("");
    setStep("loading");

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay. Check your connection.");

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName:  form.name.trim(),
          customerEmail: form.email.trim().toLowerCase(),
          customerPhone: form.phone.trim(),
          amount:        plan.price,
          planName:      plan.label,
          planId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.order_id) throw new Error(data.error || "Order creation failed.");

      const rzp = new window.Razorpay({
        key:         RZP_KEY_ID,
        order_id:    data.order_id,
        amount:      data.amount,
        currency:    data.currency || "INR",
        name:        "Vogats CV",
        description: `${plan.label} Plan`,
        prefill: { name: form.name.trim(), email: form.email.trim(), contact: `+91${form.phone.trim()}` },
        theme: { color: "#f59e0b" },
        handler: async (resp: any) => {
          const vRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id:   resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature:  resp.razorpay_signature,
            }),
          });
          const vData = await vRes.json();
          if (!vRes.ok || !vData.success) {
            setApiError(vData.error || "Payment verification failed.");
            setStep("form"); return;
          }
          setStep("form"); // parent will handle success
        },
        modal: { ondismiss: () => setStep("form") },
      });
      rzp.on("payment.failed", (r: any) => {
        setApiError(r?.error?.description || "Payment failed. Please retry.");
        setStep("form");
      });
      rzp.open();
    } catch (err: any) {
      setApiError(err.message || "Something went wrong. Please retry.");
      setStep("form");
    }
  };

  const planIcon = planId === "STARTER" ? "⚡" : planId === "PRO" ? "🛡️" : "👑";

  return (
    <div style={{ animation: "slideRight 0.3s cubic-bezier(0.22,1,0.36,1) both" }}>
      {/* Back + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10, padding: "8px 10px", cursor: "pointer", color: "#a1a1aa",
            display: "flex", alignItems: "center", transition: "all 0.15s ease",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#a1a1aa"; }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
        </button>
        <div>
          <div style={{ color: "#71717a", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>
            Checkout
          </div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>Order Summary</div>
        </div>
      </div>

      {/* Order Summary card */}
      <div style={{
        background: "rgba(245,158,11,0.07)",
        border: "1px solid rgba(245,158,11,0.22)",
        borderRadius: 16, padding: "16px 20px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{planIcon}</span>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{plan.label} Plan</div>
              <div style={{ color: "#71717a", fontSize: 12 }}>{plan.durationDays} days validity · {plan.resumeLimit === Infinity ? "Unlimited" : plan.resumeLimit} resumes</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#f59e0b", fontWeight: 800, fontSize: 26 }}>₹{plan.price}</div>
            <div style={{ color: "#71717a", fontSize: 11 }}>fixed price</div>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        <FormField
          label="Full Name" type="text" placeholder="Your full name"
          value={form.name} onChange={set("name")} error={errors.name}
          autoComplete="name" prefilled={!!(userName && form.name === (userName || ""))}
        />
        <FormField
          label="Email Address" type="email" placeholder="your@email.com"
          value={form.email} onChange={set("email")} error={errors.email}
          autoComplete="email" prefilled={!!(userEmail && form.email === (userEmail || ""))}
        />
        <div>
          <label style={labelStyle}>
            Mobile Number
            <span style={{ color: "#f59e0b", marginLeft: 4, fontSize: 13 }}>*</span>
            <span style={{
              marginLeft: 8, fontSize: 10, color: "#71717a",
              fontWeight: 500, letterSpacing: 0, textTransform: "none",
            }}>required for payment</span>
          </label>
          <div style={{ display: "flex" }}>
            <div style={{
              ...inputStyle, width: 56, justifyContent: "center",
              borderRadius: "12px 0 0 12px", borderRight: "none",
              background: "rgba(245,158,11,0.08)", color: "#f59e0b",
              fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center",
            }}>
              +91
            </div>
            <input
              type="tel" inputMode="numeric" maxLength={10}
              placeholder="Enter 10-digit mobile number"
              value={form.phone} onChange={set("phone")}
              autoComplete="tel"
              autoFocus
              style={{
                ...inputStyle,
                flex: 1, borderRadius: "0 12px 12px 0",
                borderColor: errors.phone ? "#ef4444" : form.phone.length === 10 ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.1)",
              }}
            />
          </div>
          {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
          {!errors.phone && form.phone.length > 0 && form.phone.length < 10 && (
            <p style={{ color: "#71717a", fontSize: 11, marginTop: 5 }}>
              {10 - form.phone.length} more digit{10 - form.phone.length !== 1 ? "s" : ""} needed
            </p>
          )}
          {!errors.phone && form.phone.length === 10 && (
            <p style={{ color: "#22c55e", fontSize: 11, marginTop: 5 }}>✓ Valid mobile number</p>
          )}
        </div>
      </div>

      {/* API error */}
      {apiError && (
        <div style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 12, padding: "10px 14px", marginBottom: 16,
          color: "#fca5a5", fontSize: 13,
        }}>
          ⚠️ {apiError}
        </div>
      )}

      {/* Pay Button */}
      <button
        onClick={handlePay}
        disabled={step === "loading"}
        style={{
          width: "100%", height: 52,
          background: step === "loading"
            ? "rgba(245,158,11,0.4)"
            : "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
          color: "#000", fontWeight: 800, fontSize: 15,
          letterSpacing: "0.05em", border: "none",
          borderRadius: 14, cursor: step === "loading" ? "not-allowed" : "pointer",
          boxShadow: "0 0 24px rgba(245,158,11,0.35)",
          transition: "all 0.15s ease",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}
        onMouseEnter={e => { if (step !== "loading") (e.currentTarget as HTMLElement).style.boxShadow = "0 0 36px rgba(245,158,11,0.55)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(245,158,11,0.35)"; }}
        onMouseDown={e => { if (step !== "loading") (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
        onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
      >
        {step === "loading" ? (
          <>
            <span style={{
              width: 18, height: 18, border: "2.5px solid rgba(0,0,0,0.3)",
              borderTopColor: "#000", borderRadius: "50%",
              animation: "cfSpin 0.7s linear infinite", display: "inline-block",
            }} />
            Creating order…
          </>
        ) : (
          <>
            <Shield style={{ width: 16, height: 16 }} />
            PAY ₹{plan.price} SECURELY →
          </>
        )}
      </button>

      <div style={{
        marginTop: 14, textAlign: "center",
        color: "#52525b", fontSize: 11, letterSpacing: "0.06em",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        🔒 Powered by Razorpay · PCI DSS Compliant · 256-bit SSL
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function FormField({
  label, type, placeholder, value, onChange, error, autoComplete, prefilled,
}: {
  label: string; type: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; autoComplete?: string; prefilled?: boolean;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>{label}</label>
        {prefilled && (
          <span style={{
            fontSize: 10, color: "#f59e0b", fontWeight: 600,
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 6, padding: "2px 7px",
          }}>✓ From profile</span>
        )}
      </div>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={onChange} autoComplete={autoComplete}
        style={{
          ...inputStyle,
          borderColor: error ? "#ef4444" : prefilled ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.1)",
          background: prefilled ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.05)",
        }}
      />
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", color: "#71717a",
  fontSize: 11, fontWeight: 700,
  letterSpacing: "0.08em", textTransform: "uppercase",
  marginBottom: 7,
};

const inputStyle: React.CSSProperties = {
  width: "100%", height: 46,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12, padding: "0 14px",
  color: "#fff", fontSize: 14, fontWeight: 500,
  outline: "none", boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const errorStyle: React.CSSProperties = {
  color: "#f87171", fontSize: 11, marginTop: 5, fontWeight: 500,
};
