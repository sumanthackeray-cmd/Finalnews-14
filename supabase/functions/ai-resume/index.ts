// AI resume helper edge function. Uses Lovable AI Gateway.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, payload, basics } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not configured");

    const system =
      "You are an expert resume writer. Write concise, ATS-friendly, achievement-focused content. " +
      "Use strong action verbs, quantified outcomes, no fluff or buzzwords.";

    let userPrompt = "";
    let tools: any[] | undefined;
    let toolChoice: any | undefined;

    if (action === "summary") {
      userPrompt = `Write a 2-3 sentence professional summary for ${basics?.name || "the candidate"}, ${basics?.title || ""}. ` +
        `Skills: ${(payload.skills || []).join(", ")}. ` +
        `Experience: ${JSON.stringify((payload.experience || []).map((e: any) => ({ role: e.role, company: e.company })))}. ` +
        (payload.current ? `Current draft: "${payload.current}". Improve it.` : "");
      tools = [{
        type: "function",
        function: {
          name: "set_summary",
          description: "Return improved professional summary",
          parameters: {
            type: "object",
            properties: { text: { type: "string" } },
            required: ["text"],
            additionalProperties: false,
          },
        },
      }];
      toolChoice = { type: "function", function: { name: "set_summary" } };
    } else if (action === "bullets") {
      userPrompt = `Write 3-5 strong resume bullets for the role "${payload.role}" at "${payload.company}". ` +
        `Each bullet: starts with an action verb, includes a measurable outcome where possible, under 24 words. ` +
        (payload.current?.length ? `Current bullets to improve: ${JSON.stringify(payload.current)}` : "");
      tools = [{
        type: "function",
        function: {
          name: "set_bullets",
          description: "Return improved resume bullets",
          parameters: {
            type: "object",
            properties: {
              bullets: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
            },
            required: ["bullets"],
            additionalProperties: false,
          },
        },
      }];
      toolChoice = { type: "function", function: { name: "set_bullets" } };
    } else {
      throw new Error("Unknown action");
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: toolChoice,
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
    const args = call ? JSON.parse(call.function.arguments) : {};

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
