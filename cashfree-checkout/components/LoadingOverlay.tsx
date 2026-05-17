"use client";

interface Props {
  orderId?: string;
}

export default function LoadingOverlay({ orderId }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-[90%] text-center shadow-2xl">
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">Creating Secure Order</h3>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
          Please wait while we prepare your payment session with Cashfree…
        </p>

        {orderId && (
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 font-mono">
            Order: {orderId}
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secured by Cashfree · 256-bit SSL
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
