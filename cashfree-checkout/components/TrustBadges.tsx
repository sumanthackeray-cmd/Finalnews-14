export default function TrustBadges() {
  return (
    <div className="glass rounded-3xl shadow-xl p-5 fade-up-delay2">
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            icon: (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ),
            label: "256-bit SSL",
            sub: "Encrypted",
          },
          {
            icon: (
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            label: "PCI DSS",
            sub: "Compliant",
          },
          {
            icon: (
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ),
            label: "Instant",
            sub: "Activation",
          },
          {
            icon: (
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
            label: "24/7",
            sub: "Support",
          },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
            <div className="shrink-0">{b.icon}</div>
            <div>
              <div className="text-xs font-bold text-gray-700">{b.label}</div>
              <div className="text-[10px] text-gray-400">{b.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-[10px] text-center text-gray-400 leading-relaxed">
          All payments are processed securely through{" "}
          <span className="font-bold text-indigo-500">Cashfree Payments</span>.
          <br />
          Your financial data is never stored on our servers.
        </p>
      </div>

      {/* Card network icons */}
      <div className="mt-3 flex items-center justify-center gap-3 opacity-50">
        {["VISA", "MC", "RUPAY", "UPI"].map((n) => (
          <div
            key={n}
            className="text-[8px] font-black tracking-wider px-1.5 py-0.5 border border-gray-300 rounded text-gray-500"
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}
