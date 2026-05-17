import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/download")({
  POST: async ({ request }) => {
    try {
      const formData = await request.formData();
      const base64 = formData.get("base64") as string;
      const filename = formData.get("filename") as string;
      const mimeType = formData.get("mimeType") as string;

      if (!base64 || !filename) {
        return Response.json({ error: "Missing required fields: base64, filename" }, { status: 400 });
      }

      const buffer = Buffer.from(base64, "base64");
      return new Response(buffer, {
        headers: {
          "Content-Type": mimeType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (err: any) {
      console.error("[Download API Error]:", err);
      return Response.json({ error: err.message || "Failed to generate download" }, { status: 500 });
    }
  },
});
