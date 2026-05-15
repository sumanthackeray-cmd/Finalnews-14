// ATS scoring edge function. Compares a resume against a job description.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resume, jobDescription } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!jobDescription || jobDescription.trim().length < 30) {
      return new Response(JSON.stringify({ error: "Paste a job description (at least 30 chars) to score against." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Flatten resume to plain text for the model
    const resumeText = [
      `${resume?.basics?.name ?? ""} — ${resume?.basics?.title ?? ""}`,
      resume?.basics?.summary ?? "",
      "Skills: " + (resume?.skills ?? []).join(", "),
      "Experience:",
      ...(resume?.experience ?? []).map((e: any) =>
        `- ${e.role} at ${e.company} (${e.start}-${e.end})\n  ${(e.bullets ?? []).join("\n  ")}`),
      "Education:",
      ...(resume?.education ?? []).map((e: any) => `- ${e.degree}, ${e.school} (${e.start}-${e.end})`),
      "Projects:",
      ...(resume?.projects ?? []).map((p: any) => `- ${p.name}: ${p.description}`),
    ].join("\n");

    const system =
      "You are an ATS (applicant tracking system) and senior recruiter. " +
      "Score a resume against a job description for keyword match, hard/soft skills coverage, " +
      "experience relevance, and quantifiable impact. Be strict, specific, and actionable.";

    const user = `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resumeText}`;

    const tools = [{
      type: "function",
      function: {
        name: "score_resume",
        description: "Return ATS scoring breakdown",
        parameters: {
          type: "object",
          properties: {
            overallScore: { type: "integer", minimum: 0, maximum: 100, description: "Overall match score 0-100" },
            keywordScore: { type: "integer", minimum: 0, maximum: 100 },
            experienceScore: { type: "integer", minimum: 0, maximum: 100 },
            impactScore: { type: "integer", minimum: 0, maximum: 100, description: "Quantified achievements / measurable impact" },
            formatScore: { type: "integer", minimum: 0, maximum: 100, description: "ATS-friendliness of structure & content" },
            matchedKeywords: { type: "array", items: { type: "string" }, description: "Important keywords from JD present in resume" },
            missingKeywords: { type: "array", items: { type: "string" }, description: "Important keywords from JD missing from resume" },
            strengths: { type: "array", items: { type: "string" }, description: "3-5 strengths" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string", description: "e.g. Summary, Experience, Skills, Format" },
                  suggestion: { type: "string", description: "Specific, actionable improvement" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                },
                required: ["area", "suggestion", "priority"],
                additionalProperties: false,
              },
              minItems: 3,
              maxItems: 8,
            },
            summary: { type: "string", description: "1-2 sentence verdict" },
          },
          required: ["overallScore", "keywordScore", "experienceScore", "impactScore", "formatScore", "matchedKeywords", "missingKeywords", "strengths", "recommendations", "summary"],
          additionalProperties: false,
        },
      },
    }];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "score_resume" } },
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
    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
