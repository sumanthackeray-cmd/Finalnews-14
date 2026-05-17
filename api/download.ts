import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Preflight setup
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    let base64 = "";
    let filename = "";
    let mimeType = "";

    // Robust request body parser for Node / Vercel
    if (req.body) {
      if (typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
        base64 = req.body.base64 || "";
        filename = req.body.filename || "";
        mimeType = req.body.mimeType || "";
      } else if (typeof req.body === "string") {
        try {
          const parsed = JSON.parse(req.body);
          base64 = parsed.base64 || "";
          filename = parsed.filename || "";
          mimeType = parsed.mimeType || "";
        } catch {
          const params = new URLSearchParams(req.body);
          base64 = params.get("base64") || "";
          filename = params.get("filename") || "";
          mimeType = params.get("mimeType") || "";
        }
      } else if (Buffer.isBuffer(req.body)) {
        const rawStr = req.body.toString("utf-8");
        try {
          const parsed = JSON.parse(rawStr);
          base64 = parsed.base64 || "";
          filename = parsed.filename || "";
          mimeType = parsed.mimeType || "";
        } catch {
          const params = new URLSearchParams(rawStr);
          base64 = params.get("base64") || "";
          filename = params.get("filename") || "";
          mimeType = params.get("mimeType") || "";
        }
      }
    }

    // Try fallback to query parameters if body was not resolved
    if (!base64 && req.query) {
      base64 = (req.query.base64 as string) || "";
      filename = (req.query.filename as string) || "";
      mimeType = (req.query.mimeType as string) || "";
    }

    if (!base64 || !filename) {
      return res.status(400).json({ 
        error: "Missing required fields: base64, filename",
        debug: {
          hasBody: !!req.body,
          bodyType: typeof req.body,
          isBuffer: Buffer.isBuffer(req.body),
          keys: req.body && typeof req.body === "object" ? Object.keys(req.body) : []
        }
      });
    }

    // Clean up base64 payload if it includes data URL headers
    if (base64.includes(",")) {
      base64 = base64.split(",")[1];
    }

    const buffer = Buffer.from(base64, "base64");
    
    // Explicitly enforce the MIME type
    let finalMime = mimeType || "application/octet-stream";
    if (filename.endsWith(".pdf")) finalMime = "application/pdf";
    if (filename.endsWith(".docx")) finalMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (filename.endsWith(".txt")) finalMime = "text/plain";

    res.setHeader("Content-Type", finalMime);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Transfer-Encoding", "binary");
    res.setHeader("Content-Length", buffer.length);
    
    return res.send(buffer);
  } catch (error: any) {
    console.error("[Download API Error]:", error);
    return res.status(500).json({ error: error.message || "Failed to process download request" });
  }
}
