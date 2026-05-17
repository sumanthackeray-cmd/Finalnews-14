import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Wand2, Loader2, Copy, Download, FileDown } from "lucide-react";
import { toast } from "sonner";
import type { ResumeData } from "@/lib/resume-types";

export const Route = createFileRoute("/cover-letter")({
  head: () => ({
    meta: [
      { title: "Cover Letter — Vogats CV" },
      { name: "description", content: "Generate a tailored cover letter from your resume and a job description with Vogats CV." },
    ],
  }),
  component: CoverLetterPage,
});

type ResumeRow = { id: string; title: string; data: ResumeData };

function CoverLetterPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [resumeId, setResumeId] = useState<string>("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState("professional");
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { collection, query, where, getDocs, orderBy } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      try {
        const q = query(
          collection(db, "resumes"),
          where("user_id", "==", user.uid),
          orderBy("updated_at", "desc")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ResumeRow[];
        setResumes(data);
        if (data?.[0]) setResumeId(data[0].id);
      } catch (error: any) {
        toast.error(error.message);
      }
    })();
  }, [user]);

  const generate = async () => {
    const r = resumes.find((x) => x.id === resumeId);
    if (!r) return toast.error("Pick a resume first.");
    if (jd.trim().length < 30) return toast.error("Paste a job description (≥ 30 chars).");
    setBusy(true);
    try {
      const { generateAIContent } = await import("@/lib/ai-service");
      const res = await generateAIContent({
        action: "cover-letter",
        data: { summary: r.data.basics.summary, experience: r.data.experience, jobDescription: jd, tone, company, role, name: r.data.basics.name },
      });
      if (res.error) throw new Error(res.error);
      setText(res.text || "");
    } catch (e: any) {
      toast.error(e.message ?? "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const downloadTxt = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${(company || "untitled").toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 64;
    pdf.setFont("times", "normal");
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(text, pageW - margin * 2);
    let y = margin;
    const lineH = 16;
    for (const line of lines) {
      if (y > pageH - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += lineH;
    }
    pdf.save(`cover-letter-${(company || "untitled").toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Sparkles className="h-4 w-4 text-coral" />
            <h1 className="font-display text-lg">Cover Letter</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-[1400px] grid lg:grid-cols-[420px_1fr] gap-0">
        <aside className="bg-background border-r p-5 space-y-4 max-h-[calc(100vh-56px)] overflow-y-auto">
          <div>
            <Label className="text-xs">Resume</Label>
            <select
              className="mt-1 w-full h-9 rounded-md border bg-background px-2 text-sm"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
            >
              {resumes.length === 0 && <option value="">No resumes — create one first</option>}
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Company</Label>
              <Input className="h-9 mt-1" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Linear" />
            </div>
            <div>
              <Label className="text-xs">Role</Label>
              <Input className="h-9 mt-1" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Designer" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Tone</Label>
            <select
              className="mt-1 w-full h-9 rounded-md border bg-background px-2 text-sm"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="professional">Professional</option>
              <option value="confident">Confident</option>
              <option value="warm">Warm & personable</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="concise">Concise & direct</option>
            </select>
          </div>
          <div>
            <Label className="text-xs">Job description</Label>
            <Textarea
              rows={10}
              className="mt-1"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job posting here…"
            />
          </div>
          <Button variant="ink" className="w-full" onClick={generate} disabled={busy || !resumeId}>
            {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Wand2 className="h-4 w-4 mr-1.5" />}
            {busy ? "Writing…" : "Generate cover letter"}
          </Button>
        </aside>

        <section className="p-6 lg:p-10">
          {!text ? (
            <div className="h-full grid place-items-center text-center">
              <div className="max-w-sm">
                <div className="mx-auto w-12 h-12 rounded-full bg-coral/15 grid place-items-center">
                  <Wand2 className="h-5 w-5 text-coral" />
                </div>
                <h2 className="font-display text-2xl mt-4">Tailored in seconds</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Pick a resume, paste the job, and we'll write a recruiter-ready cover letter you can edit, copy, or export.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-[760px]">
              <div className="flex justify-end gap-2 mb-3">
                <Button size="sm" variant="outline" onClick={copy}><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</Button>
                <Button size="sm" variant="outline" onClick={downloadTxt}><Download className="h-3.5 w-3.5 mr-1.5" /> .txt</Button>
                <Button size="sm" variant="ink" onClick={downloadPdf}><FileDown className="h-3.5 w-3.5 mr-1.5" /> PDF</Button>
              </div>
              <Card className="p-10 shadow-elegant">
                <Textarea
                  className="min-h-[600px] border-none focus-visible:ring-0 resize-none text-[14px] leading-7 p-0 font-sans whitespace-pre-wrap"
                  style={{ fontFamily: "'Times New Roman', serif" }}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </Card>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
