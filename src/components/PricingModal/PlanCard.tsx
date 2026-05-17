import type { PlanId } from "@/lib/subscription";
import { PLANS } from "@/lib/subscription";
import { CheckCircle, Zap, Shield, Crown } from "lucide-react";

interface PlanCardProps {
  planId: PlanId;
  index: number;
  selected: boolean;
  onSelect: (planId: PlanId) => void;
}

const PLAN_META: Record<PlanId, {
  icon: React.ReactNode;
  daysLabel: string;
  isPopular: boolean;
  btnStyle: "outline" | "amber" | "outline";
}> = {
  STARTER: {
    icon: <Zap className="w-5 h-5" />,
    daysLabel: "3D",
    isPopular: false,
    btnStyle: "outline",
  },
  PRO: {
    icon: <Shield className="w-5 h-5" />,
    daysLabel: "15D",
    isPopular: true,
    btnStyle: "amber",
  },
  UNLIMITED: {
    icon: <Crown className="w-5 h-5" />,
    daysLabel: "60D",
    isPopular: false,
    btnStyle: "outline",
  },
};

export function PlanCard({ planId, index, selected, onSelect }: PlanCardProps) {
  const plan   = PLANS[planId];
  const meta   = PLAN_META[planId];
  const isPro  = planId === "PRO";

  return (
    <div
      className="plan-card"
      style={{
        animation: `staggerIn 0.45s cubic-bezier(0.22,1,0.36,1) ${index * 0.12}s both`,
        transform: isPro ? "scale(1.04)" : "scale(1)",
        position: "relative",
        flex: "1 1 0%",
        minWidth: 0,
        background: isPro
          ? "rgba(245,158,11,0.07)"
          : "rgba(255,255,255,0.04)",
        border: selected
          ? "1.5px solid #f59e0b"
          : isPro
          ? "1.5px solid rgba(245,158,11,0.35)"
          : "1.5px solid rgba(255,255,255,0.09)",
        borderRadius: 20,
        padding: "28px 24px 24px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: isPro
          ? "0 0 32px rgba(245,158,11,0.15), 0 4px 24px rgba(0,0,0,0.4)"
          : "0 4px 20px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
      onClick={() => onSelect(planId)}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#f59e0b";
        (e.currentTarget as HTMLDivElement).style.transform = isPro ? "scale(1.06) translateY(-4px)" : "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 28px rgba(245,158,11,0.25), 0 8px 32px rgba(0,0,0,0.5)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = selected ? "#f59e0b" : isPro ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.09)";
        (e.currentTarget as HTMLDivElement).style.transform = isPro ? "scale(1.04)" : "scale(1)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = isPro ? "0 0 32px rgba(245,158,11,0.15), 0 4px 24px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.3)";
      }}
    >
      {/* Most Popular badge */}
      {meta.isPopular && (
        <div style={{
          position: "absolute",
          top: -14,
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(90deg, #f59e0b, #f97316, #f59e0b)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2.5s linear infinite",
          color: "#000",
          fontWeight: 800,
          fontSize: 10,
          letterSpacing: "0.12em",
          padding: "5px 14px",
          borderRadius: 999,
          whiteSpace: "nowrap",
          boxShadow: "0 0 16px rgba(245,158,11,0.4)",
        }}>
          ✦ MOST POPULAR
        </div>
      )}

      {/* Plan name + icon */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: "rgba(245,158,11,0.15)",
          border: "1px solid rgba(245,158,11,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#f59e0b",
        }}>
          {meta.icon}
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, lineHeight: 1.2 }}>
            {plan.label}
          </div>
          <div style={{ color: "#71717a", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" }}>
            {plan.durationDays} days access
          </div>
        </div>
      </div>

      {/* Price row */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 20 }}>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 42, lineHeight: 1 }}>
          ₹{plan.price}
        </span>
        <span style={{
          background: "rgba(245,158,11,0.18)",
          color: "#f59e0b",
          fontWeight: 700, fontSize: 11,
          padding: "3px 9px", borderRadius: 999,
          letterSpacing: "0.07em",
          border: "1px solid rgba(245,158,11,0.25)",
        }}>
          {meta.daysLabel}
        </span>
      </div>

      {/* Features */}
      <ul style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
        {plan.perks.slice(0, 4).map(perk => (
          <li key={perk} style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <CheckCircle style={{ width: 15, height: 15, color: "#f59e0b", flexShrink: 0 }} />
            <span style={{ color: "#a1a1aa", fontSize: 13, fontWeight: 500 }}>{perk}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        style={meta.btnStyle === "amber" ? {
          width: "100%", height: 48,
          background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
          color: "#000", fontWeight: 800, fontSize: 13,
          letterSpacing: "0.07em", border: "none",
          borderRadius: 12, cursor: "pointer",
          boxShadow: "0 0 20px rgba(245,158,11,0.35)",
          transition: "all 0.15s ease",
        } : {
          width: "100%", height: 48,
          background: "transparent",
          color: "#fff", fontWeight: 700, fontSize: 13,
          letterSpacing: "0.07em",
          border: "1.5px solid rgba(255,255,255,0.25)",
          borderRadius: 12, cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={e => {
          if (meta.btnStyle === "amber") {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(245,158,11,0.5)";
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
          } else {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#f59e0b";
            (e.currentTarget as HTMLButtonElement).style.color = "#f59e0b";
          }
        }}
        onMouseLeave={e => {
          if (meta.btnStyle === "amber") {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(245,158,11,0.35)";
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          } else {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)";
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          }
        }}
        onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
        onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        onClick={e => { e.stopPropagation(); onSelect(planId); }}
      >
        BUY {plan.label.toUpperCase()} NOW
      </button>
    </div>
  );
}
