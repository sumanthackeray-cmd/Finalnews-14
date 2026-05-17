import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { AIChatbot } from "@/components/chat/AIChatbot";
import appCss from "../styles.css?url";

// Custom Error boundary component for premium error handling
function RootErrorFallback({ error, reset }: { error: any; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg text-text transition-colors duration-300">
      <div className="w-full max-w-md p-8 rounded-3xl border border-border bg-card shadow-2xl text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 text-3xl mb-6">
          ⚠️
        </div>
        <h1 className="font-display text-3xl font-black tracking-tight mb-3">Something went wrong</h1>
        <p className="text-sm text-muted mb-6 leading-relaxed font-semibold">
          An unexpected system error occurred. We'll fix it immediately.
        </p>
        {error && (
          <pre className="w-full text-[11px] font-mono p-3 bg-soft rounded-lg text-left overflow-x-auto max-h-32 mb-6 border border-border/40 text-muted">
            {error.message || String(error)}
          </pre>
        )}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => {
              reset();
              window.location.reload();
            }}
            className="flex-1 btn-premium py-3 text-sm font-bold shadow-lg"
          >
            Try Again
          </button>
          <Link
            to="/"
            className="flex-1 py-3 text-sm font-bold text-muted hover:text-text border border-border rounded-xl transition-colors bg-surface hover:bg-soft"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Custom 404 page for premium NotFound layout
function RootNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg text-text transition-colors duration-300">
      <div className="w-full max-w-md p-8 rounded-3xl border border-border bg-card shadow-2xl text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent text-3xl mb-6 animate-bounce">
          🔍
        </div>
        <h1 className="font-display text-6xl font-black tracking-tighter text-gradient mb-3">404</h1>
        <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
        <p className="text-sm text-muted mb-6 leading-relaxed font-semibold">
          The page you are looking for does not exist, has been moved, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            to="/"
            className="flex-1 btn-premium py-3 text-sm font-bold shadow-lg"
          >
            Back to Home
          </Link>
          <Link
            to="/contact"
            className="flex-1 py-3 text-sm font-bold text-muted hover:text-text border border-border rounded-xl transition-colors bg-surface hover:bg-soft"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ]
  }),
  component: RootComponent,
  errorComponent: ({ error, reset }) => <RootErrorFallback error={error} reset={reset} />,
  notFoundComponent: () => <RootNotFound />,
});

function RootComponent() {
  const [qc] = useState(() => new QueryClient());
  return (
    <ThemeProvider>
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <QueryClientProvider client={qc}>
            <AuthProvider>
              <Outlet />
              <Toaster />
              <AIChatbot />
            </AuthProvider>
          </QueryClientProvider>
          <Scripts />
        </body>
      </html>
    </ThemeProvider>
  );
}
