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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { base64, filename, mimeType } = req.body || {};

    if (!base64 || !filename) {
      return res.status(400).json({ error: "Missing required fields: base64, filename" });
    }

    const buffer = Buffer.from(base64, "base64");
    
    // Explicitly enforce the MIME type
    let finalMime = mimeType || "application/octet-stream";
    if (filename.endsWith(".pdf")) finalMime = "application/pdf";
    if (filename.endsWith(".docx")) finalMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (filename.endsWith(".txt")) finalMime = "text/plain";

    res.setHeader("Content-Type", finalMime);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);
    
    return res.send(buffer);
  } catch (error: any) {
    console.error("[Download API Error]:", error);
    return res.status(500).json({ error: error.message || "Failed to process download request" });
  }
}
