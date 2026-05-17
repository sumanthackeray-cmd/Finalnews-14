import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { PlanId } from "@/lib/subscription";
import { PlanCard } from "./PlanCard";
import { CheckoutStep } from "./CheckoutStep";
import { PaymentBadges } from "./PaymentBadges";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlanId?: PlanId;
  userName?: string;   // pre-fill from Firebase user.displayName
  userEmail?: string;  // pre-fill from Firebase user.email
  startAtCheckout?: boolean; // skip plan selection, go directly to checkout
  onSuccess?: (planId: PlanId, orderId: string) => void;
}

type View = "plans" | "checkout";

export function PricingModal({ isOpen, onClose, defaultPlanId, userName, userEmail, startAtCheckout, onSuccess }: PricingModalProps) {
  const [view, setView] = useState<View>("plans");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(defaultPlanId || "PRO");
  const [mounted, setMounted] = useState(false);

  // Reset view when modal opens, push history state, and listen to system back gesture dismiss
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(defaultPlanId || "PRO");          // sync plan from prop
      setView(startAtCheckout ? "checkout" : "plans");  // skip to checkout if triggered by URL
      setMounted(false);
      const t = setTimeout(() => setMounted(true), 10);

      // Push history state to intercept Android back swipe / browser back click
      if (window.history.state?.pricingModal !== true) {
        window.history.pushState({ pricingModal: true }, "");
      }

      const handlePopState = (e: PopStateEvent) => {
        onClose();
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
        clearTimeout(t);
      };
    }
  }, [isOpen, defaultPlanId, startAtCheckout, onClose]);

  const handleClose = () => {
    onClose();
    if (window.history.state?.pricingModal === true) {
      window.history.back();
    }
  };

  if (!isOpen) return null;

  const handleSelectPlan = (planId: PlanId) => {
    setSelectedPlan(planId);
    setView("checkout");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleClose();
  };

  return (
    <>
      {/* ── Keyframe animations injected once ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes staggerIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes cfSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.25); }
        }

        .pm-input:focus {
          border-color: rgba(245,158,11,0.5) !important;
          background: rgba(245,158,11,0.04) !important;
          outline: none;
        }

        /* Horizontal scroll plan cards on mobile */
        @media (max-width: 640px) {
          .pm-cards-row {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .pm-card-wrap {
            transform: scale(1) !important;
          }
          .pm-modal-inner {
            border-radius: 24px 24px 0 0 !important;
            margin-top: auto !important;
          }
        }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        onKeyDown={handleKeyDown}
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(5,5,15,0.82)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
        }}
      >
        {/* ── Modal card ── */}
        <div
          className="pm-modal-inner"
          onClick={e => e.stopPropagation()}
          style={{
            fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif",
            width: "100%",
            maxWidth: view === "checkout" ? 480 : 720,
            maxHeight: "90vh",
            overflowY: "auto",
            background: "rgba(12,12,22,0.96)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: "32px 32px 28px",
            position: "relative",
            animation: mounted ? "modalIn 0.32s cubic-bezier(0.22,1,0.36,1) both" : "none",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.7)",
            scrollbarWidth: "none",
          }}
        >
          {/* Ambient glow in top-right corner */}
          <div style={{
            position: "absolute", top: -60, right: -60, width: 200, height: 200,
            background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              position: "absolute", top: 18, right: 18,
              width: 36, height: 36,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#71717a", transition: "all 0.15s",
              zIndex: 2,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
              (e.currentTarget as HTMLElement).style.color = "#71717a";
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>

          {/* ══════════ PLANS VIEW ══════════ */}
          {view === "plans" && (
            <div style={{ animation: "staggerIn 0.3s ease both" }}>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <h2 style={{
                  color: "#fff", fontWeight: 800,
                  fontSize: "clamp(22px, 4vw, 28px)",
                  margin: "0 0 8px", lineHeight: 1.2,
                }}>
                  Choose Your Plan
                </h2>
                <p style={{ color: "#71717a", fontSize: 14, margin: "0 0 14px", fontWeight: 500 }}>
                  Unlock premium templates, AI content &amp; PDF + Word downloads
                </p>
                {/* Secure badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: 999, padding: "5px 14px",
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", background: "#f59e0b",
                    animation: "pulseDot 2s ease-in-out infinite",
                    display: "inline-block",
                  }} />
                  <span style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em" }}>
                    🔒 SECURE CHECKOUT VIA RAZORPAY
                  </span>
                </div>
              </div>

              {/* Plan cards grid */}
              <div
                className="pm-cards-row"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 14,
                  marginBottom: 28,
                  alignItems: "stretch",
                }}
              >
                {(["STARTER", "PRO", "UNLIMITED"] as PlanId[]).map((pid, i) => (
                  <div
                    key={pid}
                    className="pm-card-wrap"
                    style={{ flex: "1 1 0%", minWidth: 0 }}
                  >
                    <PlanCard
                      planId={pid}
                      index={i}
                      selected={selectedPlan === pid}
                      onSelect={handleSelectPlan}
                    />
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <p style={{
                  color: "#52525b", fontSize: 10,
                  letterSpacing: "0.15em", fontWeight: 700,
                  textTransform: "uppercase", marginBottom: 14,
                }}>
                  INSTANT ACTIVATION &nbsp;·&nbsp; SECURE CHECKOUT VIA RAZORPAY
                </p>
                <PaymentBadges />
              </div>
            </div>
          )}

          {/* ══════════ CHECKOUT VIEW ══════════ */}
          {view === "checkout" && (
            <CheckoutStep
              planId={selectedPlan}
              onBack={() => setView("plans")}
              userName={userName}
              userEmail={userEmail}
              onSuccess={(orderId) => {
                onSuccess?.(selectedPlan, orderId);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
