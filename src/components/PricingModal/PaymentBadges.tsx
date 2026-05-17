export function PaymentBadges() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      flexWrap: "wrap",
    }}>
      {/* UPI */}
      <div style={badgeStyle}>
        <svg width="28" height="12" viewBox="0 0 280 120" fill="none">
          <rect width="280" height="120" rx="8" fill="#fff" fillOpacity="0.08"/>
          <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="#5f259f" fontSize="52" fontWeight="900" fontFamily="system-ui">UPI</text>
        </svg>
      </div>

      {/* Visa */}
      <div style={badgeStyle}>
        <svg width="34" height="12" viewBox="0 0 750 250" fill="none">
          <path d="M278 200L312 50H359L325 200H278ZM522 55c-18-7-47-14-82-14-91 0-155 48-155 117 0 51 46 79 81 96 36 17 48 28 48 43 0 23-29 34-55 34-37 0-57-5-88-19l-12-6-13 80c22 10 62 19 104 19 96 0 158-47 159-120 0-40-24-71-78-96-32-16-52-26-52-42 0-14 17-29 53-29 30-1 52 6 69 14l8 4 13-81ZM636 50h-71c-22 0-38 6-48 29L377 200h96l19-52h118l11 52h85L636 50zm-112 100l37-99 21 99h-58ZM229 50l-90 102-10-50c-16-53-68-102-126-128l83 226h97L327 50h-98Z" fill="#1434CB"/>
        </svg>
      </div>

      {/* Mastercard */}
      <div style={badgeStyle}>
        <svg width="28" height="18" viewBox="0 0 152 95" fill="none">
          <circle cx="56" cy="47" r="47" fill="#EB001B"/>
          <circle cx="96" cy="47" r="47" fill="#F79E1B"/>
          <path d="M76 76a47 47 0 0 0 20-29 47 47 0 0 0-40 0 47 47 0 0 0 20 29Z" fill="#FF5F00"/>
        </svg>
      </div>

      {/* RuPay */}
      <div style={badgeStyle}>
        <svg width="38" height="12" viewBox="0 0 380 120" fill="none">
          <rect width="380" height="120" rx="8" fill="#fff" fillOpacity="0.06"/>
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#e91e8c" fontSize="44" fontWeight="800" fontFamily="system-ui">RuPay</text>
        </svg>
      </div>

      {/* Net Banking text badge */}
      <div style={{
        ...badgeStyle,
        color: "#a1a1aa",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        padding: "4px 8px",
      }}>
        NET BANKING
      </div>
    </div>
  );
}

const badgeStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: "5px 8px",
  minWidth: 44,
  height: 28,
};
