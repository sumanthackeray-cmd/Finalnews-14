import type { VercelRequest, VercelResponse } from "@vercel/node";
// @ts-ignore
import app from '../dist/server/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Reconstruct the full URL
    const protocol = (req.headers['x-forwarded-proto'] as string) || 'https';
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost';
    const url = `${protocol}://${host}${req.url}`;

        // 2. Map Node headers to Web Headers
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v: string) => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    // 3. Reconstruct the Request Body (if any)
    let body: any = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
        body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
      } else {
        body = await new Promise((resolve, reject) => {
          let chunks: any[] = [];
          req.on('data', (chunk: any) => chunks.push(chunk));
          req.on('end', () => resolve(Buffer.concat(chunks)));
          req.on('error', (err: any) => reject(err));
        });
      }
    }

    // 4. Create standard Web Request
    const webRequest = new Request(url, {
      method: req.method,
      headers,
      body,
    });

    // 5. Call SSR Fetch
    const webResponse = await app.fetch(webRequest, process.env, {
      waitUntil: () => {},
      passThroughOnException: () => {}
    });

    // 6. Map Web Response to Node Response
    res.statusCode = webResponse.status;
    res.statusMessage = webResponse.statusText;

    webResponse.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

    const responseBody = await webResponse.arrayBuffer();
    res.end(Buffer.from(responseBody));

  } catch (error: any) {
    console.error("[Vogats SSR Error]:", error);
    res.statusCode = 500;
    res.end(`Server Error: ${error.message}`);
  }
}


