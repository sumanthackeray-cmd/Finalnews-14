// Generate a tailored cover letter from a resume + job description.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resume, jobDescription, tone = "professional", company = "", role = "" } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!jobDescription || jobDescription.trim().length < 30) {
      return new Response(JSON.stringify({ error: "Paste a job description (≥ 30 chars) first." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resumeText = [
      `${resume?.basics?.name ?? ""} — ${resume?.basics?.title ?? ""}`,
      `Email: ${resume?.basics?.email ?? ""}  Phone: ${resume?.basics?.phone ?? ""}  Location: ${resume?.basics?.location ?? ""}`,
      `Summary: ${resume?.basics?.summary ?? ""}`,
      "Skills: " + (resume?.skills ?? []).join(", "),
      "Experience:",
      ...(resume?.experience ?? []).map((e: any) =>
        `- ${e.role} at ${e.company} (${e.start}-${e.end})\n  ${(e.bullets ?? []).join("\n  ")}`),
      "Education:",
      ...(resume?.education ?? []).map((e: any) => `- ${e.degree}, ${e.school}`),
    ].join("\n");

    const system =
      "You are a senior career coach who writes cover letters that get interviews. " +
      "Rules: 250-350 words. Three short paragraphs plus opening + sign-off. " +
      "Open with a hook that ties the candidate to the company's mission/role — never 'I am writing to apply'. " +
      "Body: connect 2-3 specific achievements from the resume to concrete needs in the job description. " +
      "Quantify impact. Use the candidate's voice: confident, warm, no clichés, no buzzwords, no em-dashes. " +
      "Close with clear interest and a forward-looking line. Output plain prose only — no markdown, no headers.";

    const user = `TONE: ${tone}\nCOMPANY: ${company || "(infer from JD)"}\nROLE: ${role || "(infer from JD)"}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resumeText}`;

    const tools = [{
      type: "function",
      function: {
        name: "write_cover_letter",
        description: "Return a tailored cover letter",
        parameters: {
          type: "object",
          properties: {
            greeting: { type: "string", description: "e.g. 'Dear Hiring Team,' — infer name only if present in JD" },
            body: { type: "string", description: "Three paragraphs separated by \\n\\n. Plain prose, no markdown." },
            closing: { type: "string", description: "e.g. 'Best regards,'" },
          },
          required: ["greeting", "body", "closing"],
          additionalProperties: false,
        },
      },
    }];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        tools,
        tool_choice: { type: "function", function: { name: "write_cover_letter" } },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit hit. Try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI error:", resp.status, t);
      throw new Error("AI request failed");
    }

    const json = await resp.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("No tool call returned");
    const args = JSON.parse(call.function.arguments);

    const name = resume?.basics?.name ?? "";
    const fullText = [
      args.greeting,
      "",
      args.body,
      "",
      args.closing,
      name,
    ].filter(Boolean).join("\n");

    return new Response(JSON.stringify({ ...args, fullText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
