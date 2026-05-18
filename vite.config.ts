// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      {
        name: 'local-api-downloader',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/api/download' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  let base64 = '';
                  let filename = '';
                  let mimeType = '';

                  try {
                    // Try parsing as JSON first since the client sends Content-Type: application/json
                    const parsed = JSON.parse(body);
                    base64 = parsed.base64 || '';
                    filename = parsed.filename || '';
                    mimeType = parsed.mimeType || '';
                  } catch {
                    // Fallback to URL encoded params
                    const params = new URLSearchParams(body);
                    base64 = params.get('base64') || '';
                    filename = params.get('filename') || '';
                    mimeType = params.get('mimeType') || '';
                  }

                  if (!base64 || !filename) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: "Missing required fields" }));
                    return;
                  }

                  const buffer = Buffer.from(base64, 'base64');
                  
                  let finalMime = mimeType || "application/octet-stream";
                  if (filename.endsWith(".pdf")) finalMime = "application/pdf";
                  if (filename.endsWith(".docx")) finalMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                  if (filename.endsWith(".txt")) finalMime = "text/plain";

                  res.setHeader("Content-Type", finalMime);
                  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
                  res.setHeader("Content-Length", buffer.length);
                  res.end(buffer);
                } catch (err: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ]
  },
});
