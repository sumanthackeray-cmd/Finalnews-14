import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Target, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import type { ResumeData } from "@/lib/resume-types";

type Recommendation = { area: string; suggestion: string; priority: "high" | "medium" | "low" };
type ATSResult = {
  overallScore: number;
  keywordScore: number;
  experienceScore: number;
  impactScore: number;
  formatScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  recommendations: Recommendation[];
  summary: string;
};

export function ATSPanel({ resume }: { resume: ResumeData }) {
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  const score = async () => {
    if (jd.trim().length < 30) {
      toast.error("Paste a job description first (≥ 30 chars).");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ats-score", {
        body: { resume, jobDescription: jd },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as ATSResult);
    } catch (e: any) {
      toast.error(e.message ?? "Scoring failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium block mb-1.5">Paste job description</label>
        <Textarea
          rows={6}
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the job posting here. The more detail, the better the match score…"
        />
      </div>
      <Button variant="ink" className="w-full" onClick={score} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Target className="h-4 w-4 mr-1.5" />}
        {busy ? "Analyzing…" : "Score against this job"}
      </Button>

      {result && (
        <div className="space-y-4">
          <ScoreRing score={result.overallScore} />
          <p className="text-sm text-muted-foreground italic">"{result.summary}"</p>

          <div className="grid grid-cols-2 gap-2">
            <Sub label="Keywords" value={result.keywordScore} />
            <Sub label="Experience" value={result.experienceScore} />
            <Sub label="Impact" value={result.impactScore} />
            <Sub label="Format" value={result.formatScore} />
          </div>

          {result.matchedKeywords.length > 0 && (
            <Card className="p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-sage flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" /> Matched ({result.matchedKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {result.matchedKeywords.map((k) => (
                  <span key={k} className="text-[11px] px-2 py-0.5 rounded-full bg-sage/15 text-foreground">{k}</span>
                ))}
              </div>
            </Card>
          )}

          {result.missingKeywords.length > 0 && (
            <Card className="p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-coral flex items-center gap-1.5 mb-2">
                <AlertCircle className="h-3.5 w-3.5" /> Missing ({result.missingKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {result.missingKeywords.map((k) => (
                  <span key={k} className="text-[11px] px-2 py-0.5 rounded-full bg-coral/15 text-foreground">{k}</span>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">Weave the relevant ones naturally into your summary, skills, or bullets.</p>
            </Card>
          )}

          {result.strengths.length > 0 && (
            <Card className="p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide mb-2">Strengths</h4>
              <ul className="space-y-1 text-sm">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-sage shrink-0 mt-0.5" /><span>{s}</span></li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-3.5 w-3.5" /> Recommendations
            </h4>
            <ul className="space-y-2.5">
              {result.recommendations.map((r, i) => (
                <li key={i} className="text-sm border-l-2 pl-3" style={{ borderColor: priorityColor(r.priority) }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: priorityColor(r.priority) }}>
                      {r.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">· {r.area}</span>
                  </div>
                  <p className="mt-0.5">{r.suggestion}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function priorityColor(p: "high" | "medium" | "low") {
  return p === "high" ? "oklch(0.62 0.22 27)" : p === "medium" ? "oklch(0.74 0.17 65)" : "oklch(0.6 0.05 260)";
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "oklch(0.65 0.15 160)" : score >= 60 ? "oklch(0.74 0.17 65)" : "oklch(0.62 0.22 27)";
  const r = 38;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <Card className="p-4 flex items-center gap-4">
      <div className="relative w-[100px] h-[100px] shrink-0">
        <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="oklch(0.9 0.01 80)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 600ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-[24px] font-display font-bold leading-none">{score}</div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">/ 100</div>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">ATS Match Score</p>
        <p className="font-display text-lg leading-tight mt-0.5">
          {score >= 80 ? "Strong match" : score >= 60 ? "Decent match" : "Needs work"}
        </p>
      </div>
    </Card>
  );
}

function Sub({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-2">
      <div className="flex justify-between items-baseline">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold tabular-nums">{value}</span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-secondary overflow-hidden">
        <div className="h-full bg-foreground transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
