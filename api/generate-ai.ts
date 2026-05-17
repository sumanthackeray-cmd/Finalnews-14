import type { VercelRequest, VercelResponse } from "@vercel/node";
export const config = { maxDuration: 60 };


// ── Vogats AI Configuration ──────────────────────────────────────────────────
const VOGATS_AI_KEY = process.env.VITE_DEEPSEEK_API_KEY as string;
const VOGATS_AI_URL = "https://api.deepseek.com/chat/completions";
const VOGATS_AI_MODEL = "deepseek-chat"; // stable production model

// ── Core DeepSeek fetch helper ────────────────────────────────────────────────
async function vogatsAIChat(
  systemPrompt: string,
  userPrompt: string,
  jsonMode = false
): Promise<string> {
  if (!VOGATS_AI_KEY) throw new Error("Vogats AI key is not configured.");

  const body: any = {
    model: VOGATS_AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(VOGATS_AI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VOGATS_AI_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as any).error?.message || `Vogats AI error: ${res.status}`
    );
  }

  const data = await res.json();
  return (data as any).choices?.[0]?.message?.content ?? "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { action, data } = req.body || {};

  if (!action) {
    return res.status(400).json({ error: "Missing action" });
  }

  try {
    // ── Professional Summary ────────────────────────────────────────────────
    if (action === "summary") {
      const system = `You are a world-class executive resume writer. Your task is to craft a high-impact professional summary.
Guidelines:
1. Use the "Who + What + Achievement" formula.
2. Maintain a sophisticated, professional tone.
3. Include relevant keywords for ATS optimization.
4. Quantify achievements with data/metrics if possible.
5. Output ONLY the summary text (3-5 sentences).`;

      const user = `Write a 3-4 sentence professional resume summary for:
Name: ${data.name || "the candidate"}
Title: ${data.title || "Professional"}
Experience: ${JSON.stringify(data.experience || [])}
Skills: ${(data.skills || []).join(", ")}
Current summary (improve if provided): ${data.current || "none"}`;

      const text = await vogatsAIChat(system, user);
      return res.json({ text: text.trim() });
    }

    // ── Experience Bullet Points ────────────────────────────────────────────
    if (action === "bullets") {
      const system = `You are an expert resume writer specialising in achievement-oriented bullet points.
Write concise, ATS-optimised bullets using the CAR (Challenge-Action-Result) or STAR method.
Use strong action verbs. Quantify impact where possible. Output ONLY a JSON array of strings.`;

      const user = `Generate 4-5 powerful resume bullet points for:
Role: ${data.role || "Professional"}
Company: ${data.company || "Company"}
Current bullets (improve these): ${JSON.stringify(data.current || [])}
Return as a JSON array like: ["bullet 1", "bullet 2", ...]`;

      const text = await vogatsAIChat(system, user, true);
      try {
        const parsed = JSON.parse(text);
        const bullets = Array.isArray(parsed)
          ? parsed
          : parsed.bullets ?? Object.values(parsed)[0];
        return res.json({
          bullets: (bullets as string[])
            .map((b: string) => b.replace(/^[•\-*]\s*/, "").trim())
            .filter(Boolean),
        });
      } catch {
        const bullets = text
          .split("\n")
          .map((b: string) => b.replace(/^[•\-*\d.]\s*/, "").trim())
          .filter(Boolean);
        return res.json({ bullets });
      }
    }

    // ── ATS Score ───────────────────────────────────────────────────────────
    if (action === "ats-score") {
      const system = `You are an expert ATS analyst and recruiter.
Analyse resumes against job descriptions and return a structured JSON assessment.`;

      const user = `Score this resume against this Job Description.
Job Description: ${data.jobDescription || "general"}
Resume data: ${JSON.stringify(data.resume || data)}

Return ONLY valid JSON with this exact structure:
{
  "overallScore": <number 0-100>,
  "keywordScore": <number 0-100>,
  "experienceScore": <number 0-100>,
  "impactScore": <number 0-100>,
  "formatScore": <number 0-100>,
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "strengths": ["strength1"],
  "recommendations": [
    { "area": "Experience", "suggestion": "Specific advice...", "priority": "high|medium|low" }
  ],
  "summary": "2-sentence executive summary of the match."
}`;

      const text = await vogatsAIChat(system, user, true);
      try {
        return res.json(JSON.parse(text));
      } catch {
        return res.json({ overallScore: 70, summary: "Unable to parse detailed analysis." });
      }
    }

    // ── Cover Letter ────────────────────────────────────────────────────────
    if (action === "cover-letter") {
      const system = `You are an expert career consultant. Write a high-conversion, professional cover letter.
Tone: ${data.tone || "professional"}.
Format: Standard 3-4 paragraph business letter.
Output ONLY the letter body (exclude date, addresses, and headers).`;

      const user = `Write a ${data.tone || "professional"} cover letter for:
Name: ${data.name || "the candidate"}
Role: ${data.role || "this position"} at ${data.company || "the company"}
Resume Summary: ${data.summary || ""}
Experience: ${JSON.stringify(data.experience || [])}
Job Description: ${data.jobDescription || "general"}
Skills: ${(data.skills || []).join(", ")}`;

      const text = await vogatsAIChat(system, user);
      return res.json({ text: text.trim() });
    }

    // ── Skills Suggestions ──────────────────────────────────────────────────
    if (action === "skills") {
      const system = `You are a career expert. Suggest relevant, in-demand professional skills.
Output ONLY a comma-separated list of skills, nothing else.`;

      const user = `Suggest 8-10 professional skills for a ${data.title || "professional"}.
Their experience: ${JSON.stringify(data.experience || [])}
Return ONLY a comma-separated list like: React, Node.js, Leadership, ...`;

      const text = await vogatsAIChat(system, user);
      return res.json({ text: text.trim() });
    }

    // ── Hobbies Suggestions ─────────────────────────────────────────────────
    if (action === "hobbies") {
      const system = `Suggest 5-6 interesting hobbies that demonstrate character or skills.
Output ONLY a comma-separated list.`;
      const user = `Suggest hobbies for a ${data.title || "professional"}.`;
      const text = await vogatsAIChat(system, user);
      return res.json({ text: text.trim().replace(/^[•\-*]\s*/, "") });
    }

    // ── Education Notes ─────────────────────────────────────────────────────
    if (action === "education-notes") {
      const system = `You are a career counselor. Suggest 2-3 concise, professional bullet points for the "Notes" section of an education entry.
Focus on: Relevant coursework, Honors, Dean's list, or specific academic achievements.
Output ONLY the bullet points (one per line, no symbols).`;

      const user = `Generate academic highlights for:
School: ${data.school || "University"}
Degree: ${data.degree || "Degree"}
Return ONLY the text.`;

      const text = await vogatsAIChat(system, user);
      return res.json({ text: text.trim() });
    }

    // ── Project Descriptions ────────────────────────────────────────────────
    if (action === "projects") {
      const system = `You are a technical writer. Write a concise, impact-oriented description for a professional project.
Focus on: Technology stack used, problem solved, and the final result.
Output ONLY a 2-3 sentence description.`;

      const user = `Write a description for this project:
Project Name: ${data.name || "Project"}
Current info: ${data.current || ""}
Return ONLY the description text.`;

      const text = await vogatsAIChat(system, user);
      return res.json({ text: text.trim() });
    }

    // ── AI Help Chatbot ─────────────────────────────────────────────────────
    if (action === "chat") {
      const system = `You are Vogats AI, the official AI assistant for Vogats CV.
Your goal is to help users build perfect resumes, answer questions about the site, and provide career advice.

Guidelines:
1. Identify yourself ONLY as Vogats AI.
2. NEVER disclose that you are powered by DeepSeek, OpenAI, or any other company. If asked, you are a proprietary AI developed for Vogats CV.
3. Be professional, encouraging, and helpful.
4. Keep responses concise and focused on resume building or site features.
5. If you don't know something about the site, suggest they contact support@vogats.com.

FAQs for your reference:
- How to download PDF? Click the 'Download PDF' button in the builder header.
- Is it free? Yes, you can start for free. Some premium templates require a PRO plan.
- How to change template? Use the 'Template' button in the builder header.
- Can I make a cover letter? Yes, go to the 'Cover Letter' page or use the AI Cover Letter feature in the builder.`;

      const user = data.message || "Hello";
      const text = await vogatsAIChat(system, user);
      return res.json({ text: text.trim() });
    }

    return res.status(400).json({ error: "Unknown AI action." });
  } catch (error: any) {
    console.error("[Vogats AI] Error:", error.message);
    return res
      .status(500)
      .json({ error: error.message || "AI generation failed. Please try again." });
  }
}
