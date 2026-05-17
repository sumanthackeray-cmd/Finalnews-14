import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { AIChatbot } from "@/components/chat/AIChatbot";
import appCss from "../styles.css?url";

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
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="font-display text-6xl">404</h1>
        <p className="text-muted-foreground mt-2">Page not found.</p>
        <Link to="/" className="mt-6 inline-block underline">Back to home</Link>
      </div>
    </div>
  ),
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
