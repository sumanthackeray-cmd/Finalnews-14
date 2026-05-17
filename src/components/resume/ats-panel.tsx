import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Target, CheckCircle2, AlertCircle, TrendingUp, Sparkles } from "lucide-react";
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

export function ATSPanel({ 
  resume,
  onUpdateSummary
}: { 
  resume: ResumeData;
  onUpdateSummary?: (val: string) => void;
}) {
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  
  const jdRef = useRef<HTMLTextAreaElement>(null);
  const summaryRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  const autoResize = (ref: React.RefObject<HTMLTextAreaElement>) => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  useEffect(() => autoResize(jdRef), [jd]);
  useEffect(() => autoResize(summaryRef), [resume.basics.summary]);

  const score = async () => {
    if (jd.trim().length < 30) {
      toast.error("Paste a job description first (≥ 30 chars).");
      return;
    }
    setBusy(true);
    try {
      const { generateAIContent } = await import("@/lib/ai-service");
      const res = await generateAIContent({
        action: "ats-score",
        data: { resume, jobDescription: jd },
      });
      if (res.error) throw new Error(res.error);
      
      const data = res as unknown as ATSResult;
      setResult({
        overallScore: data.overallScore ?? data.score ?? 70,
        keywordScore: data.keywordScore ?? 65,
        experienceScore: data.experienceScore ?? 75,
        impactScore: data.impactScore ?? 60,
        formatScore: data.formatScore ?? 90,
        matchedKeywords: data.matchedKeywords ?? [],
        missingKeywords: data.missingKeywords ?? [],
        strengths: data.strengths ?? [],
        recommendations: data.recommendations ?? [],
        summary: data.summary ?? "AI analysis complete.",
      });
    } catch (e: any) {
      toast.error(e.message ?? "Scoring failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Summary Editor - Shown in ATS for quick optimization */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-coral" /> Your Professional Summary
        </label>
        <Textarea
          ref={summaryRef}
          value={resume.basics.summary}
          onChange={(e) => onUpdateSummary?.(e.target.value)}
          placeholder="Your current summary..."
          className="min-h-[80px] resize-none overflow-hidden bg-secondary/20"
        />
        <p className="text-[10px] text-muted-foreground italic">Optimize this to match keywords below.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Target Job Description</label>
        <Textarea
          ref={jdRef}
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the job posting here..."
          className="min-h-[120px] resize-none overflow-hidden"
        />
      </div>

      <Button variant="ink" className="w-full h-11" onClick={score} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
        {busy ? "Analyzing Match..." : "Check ATS Compatibility"}
      </Button>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <ScoreRing score={result.overallScore} />
          
          <div className="p-3 bg-secondary/30 rounded-xl border italic text-sm text-foreground/80">
            "{result.summary}"
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Sub label="Keywords" value={result.keywordScore} />
            <Sub label="Experience" value={result.experienceScore} />
            <Sub label="Impact" value={result.impactScore} />
            <Sub label="Format" value={result.formatScore} />
          </div>

          {result.matchedKeywords.length > 0 && (
            <Card className="p-4 border-sage/30 bg-sage/5">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-sage flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="h-3.5 w-3.5" /> Matched Keywords ({result.matchedKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedKeywords.map((k) => (
                  <span key={k} className="text-[10px] px-2.5 py-1 rounded-full bg-sage/10 text-sage-foreground border border-sage/20">{k}</span>
                ))}
              </div>
            </Card>
          )}

          {result.missingKeywords.length > 0 && (
            <Card className="p-4 border-coral/30 bg-coral/5">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-coral flex items-center gap-1.5 mb-3">
                <AlertCircle className="h-3.5 w-3.5" /> Missing Keywords ({result.missingKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.map((k) => (
                  <span key={k} className="text-[10px] px-2.5 py-1 rounded-full bg-coral/10 text-coral-foreground border border-coral/20">{k}</span>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">Add these into your summary or experience naturally.</p>
            </Card>
          )}

          <Card className="p-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-4">
              <TrendingUp className="h-3.5 w-3.5" /> Improvement Roadmap
            </h4>
            <ul className="space-y-4">
              {result.recommendations.map((r, i) => (
                <li key={i} className="text-sm border-l-2 pl-4 py-0.5" style={{ borderColor: priorityColor(r.priority) }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded bg-foreground/5" style={{ color: priorityColor(r.priority) }}>
                      {r.priority} Priority
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">{r.area}</span>
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{r.suggestion}</p>
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
    <Card className="p-5 flex items-center gap-6 bg-gradient-to-br from-card to-secondary/10 border-border/50 shadow-soft">
      <div className="relative w-24 h-24 shrink-0">
        <svg width="96" height="96" viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="oklch(0.9 0.01 80)" strokeWidth="7" />
          <circle
            cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-2xl font-display font-bold tabular-nums leading-none">{score}</div>
            <div className="text-[8px] uppercase tracking-widest text-muted-foreground mt-0.5">Score</div>
          </div>
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">ATS Optimization</p>
        <p className="font-display text-xl font-bold leading-tight">
          {score >= 80 ? "Optimized" : score >= 60 ? "Average Match" : "Significant Gaps"}
        </p>
      </div>
    </Card>
  );
}

function Sub({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-background/50 p-3 shadow-sm">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>
        <span className="text-xs font-bold tabular-nums">{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-secondary overflow-hidden">
        <div className="h-full bg-foreground transition-all duration-700" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

