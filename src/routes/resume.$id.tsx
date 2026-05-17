import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, ArrowLeft, Download, Plus, Trash2, Wand2, Loader2, FileText, Mail, Copy, FileDown } from "lucide-react";
import { toast } from "sonner";
import { ResumePreview, TEMPLATES } from "@/components/resume/templates";
import { TemplatePicker } from "@/components/resume/template-picker";
import { TemplateCompare } from "@/components/resume/template-compare";
import { ATSPanel } from "@/components/resume/ats-panel";
import { AIImproveButton } from "@/components/resume/AIImproveButton";
import logo from "@/assets/logo.png";
import type { ResumeData } from "@/lib/resume-types";
import { emptyResume, sampleResume } from "@/lib/resume-types";
import { getUserSubscription, checkAccess, Subscription } from "@/lib/subscription";
import { generateAIContent } from "@/lib/ai-service";

export const Route = createFileRoute("/resume/$id")({
  head: () => ({ meta: [{ title: "Builder — Vogats CV" }] }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      template: (search.template as string) || undefined,
    };
  },
  component: Builder,
});

const uid = () => Math.random().toString(36).slice(2, 9);

function Builder() {
  const { id } = Route.useParams();
  const { template: initialTemplate } = Route.useSearch();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [title, setTitle] = useState("Untitled");
  const [template, setTemplate] = useState(initialTemplate || "modern");
  const [data, setData] = useState<ResumeData>(initialTemplate ? sampleResume : emptyResume);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const dirtyRef = useRef(false);

  // ── Cover Letter state ───────────────────────────────────────────────────
  const [clCompany, setClCompany] = useState("");
  const [clRole, setClRole] = useState("");
  const [clTone, setClTone] = useState("professional");
  const [clJd, setClJd] = useState("");
  const [clBusy, setClBusy] = useState(false);
  const [clText, setClText] = useState("");

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const docSnap = await getDoc(doc(db, "resumes", id));
        if (!docSnap.exists()) {
          toast.error("Resume not found");
          nav({ to: "/dashboard" });
          return;
        }
        const r = docSnap.data();
        setTitle(r.title);
        setTemplate(r.templateId || "modern");
        setData({ ...emptyResume, ...(r.data as any) });
        
        // Fetch subscription
        const sub = await getUserSubscription(user.uid);
        setSubscription(sub);
        
        // Mark as initialized so autosave can start
        setIsInitialized(true);
      } catch (error: any) {
        toast.error(error.message);
        nav({ to: "/dashboard" });
      }
    })();
  }, [user, id, nav]);

  // Autosave
  useEffect(() => {
    if (!user || !isInitialized) return;
    
    // Only save if dirty (ignore first run after initialization)
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      return;
    }

    const t = setTimeout(async () => {
      setSaving(true);
      try {
        await updateDoc(doc(db, "resumes", id), {
          title,
          templateId: template,
          data: data as any,
          updatedAt: new Date().toISOString()
        });
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setSaving(false);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [title, template, data, user, id, isInitialized]);

  const update = <K extends keyof ResumeData>(k: K, v: ResumeData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const aiAssist = async (action: string, payload: any) => {
    setAiBusy(action + (payload?.id ?? ""));
    try {
      const res = await generateAIContent({ 
        action: action === "improve" ? "summary" : action as any, 
        data: { ...payload, name: data.basics.name, title: data.basics.title, skills: data.skills, experience: data.experience, resume: data } 
      });
      if (!res || (res as any).error) throw new Error((res as any)?.error ?? "AI failed");
      return res;
    } catch (e: any) {
      console.error("[AI Assist Error]:", e);
      toast.error(e.message ?? "AI failed");
    } finally {
      setAiBusy(null);
    }
  };

  const generateSummary = async () => {
    const res = await aiAssist("summary", { current: data.basics.summary, experience: data.experience, skills: data.skills });
    if (res?.text) update("basics", { ...data.basics, summary: res.text });
  };

  const generateBullets = async (expId: string) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp) return;
    const res = await aiAssist("bullets", { id: expId, role: exp.role, company: exp.company, current: exp.bullets });
    if (res?.bullets) {
      update(
        "experience",
        data.experience.map((e) => (e.id === expId ? { ...e, bullets: res.bullets } : e)),
      );
    }
  };

  const generateSkills = async () => {
    const res = await aiAssist("skills", { title: data.basics.title, experience: data.experience });
    if (res?.text) update("skills", res.text.split(",").map((s: string) => s.trim()).filter(Boolean));
  };

  const generateHobbies = async () => {
    const res = await aiAssist("hobbies", {});
    if (res?.text) update("hobbies", res.text.split(",").map((s: string) => s.trim()).filter(Boolean));
  };

  const generateEduNotes = async (eduId: string) => {
    const edu = data.education.find(e => e.id === eduId);
    if (!edu) return;
    const res = await aiAssist("education-notes", { school: edu.school, degree: edu.degree });
    if (res?.text) {
      update("education", data.education.map(e => e.id === eduId ? { ...e, notes: res.text } : e));
    }
  };

  const generateProjDesc = async (projId: string) => {
    const proj = data.projects.find(p => p.id === projId);
    if (!proj) return;
    const res = await aiAssist("projects", { name: proj.name, current: proj.description });
    if (res?.text) {
      update("projects", data.projects.map(p => p.id === projId ? { ...p, description: res.text } : p));
    }
  };

  const POPULAR_SKILLS = ["Management", "Leadership", "Communication", "Problem Solving", "Strategic Planning", "Project Management", "Customer Service", "Technical Writing"];
  const POPULAR_HOBBIES = ["Photography", "Hiking", "Traveling", "Reading", "Chess", "Cooking", "Volunteering", "Gardening"];

  const generateCoverLetter = async () => {
    if (clJd.trim().length < 30) {
      toast.error("Paste a job description (at least 30 characters).");
      return;
    }
    setClBusy(true);
    try {
      const res = await generateAIContent({
        action: "cover-letter",
        data: {
          name: data.basics.name,
          summary: data.basics.summary,
          experience: data.experience,
          skills: data.skills,
          company: clCompany,
          role: clRole,
          tone: clTone,
          jobDescription: clJd,
        },
      });
      if (res?.error) throw new Error(res.error);
      setClText(res.text || "");
      toast.success("Cover letter generated!");
    } catch (e: any) {
      toast.error(e.message ?? "Generation failed");
    } finally {
      setClBusy(false);
    }
  };

  const copyCoverLetter = async () => {
    await navigator.clipboard.writeText(clText);
    toast.success("Copied to clipboard!");
  };

  const downloadCoverLetterTxt = () => {
    const blob = new Blob([clText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${(clCompany || title || "resume").toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCoverLetterPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 64;
    pdf.setFont("times", "normal");
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(clText, pageW - margin * 2);
    let y = margin;
    const lineH = 16;
    for (const line of lines) {
      if (y > pageH - margin) { pdf.addPage(); y = margin; }
      pdf.text(line, margin, y);
      y += lineH;
    }
    pdf.save(`cover-letter-${(clCompany || title || "resume").toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  const renderCanvas = async () => {
    const node = previewRef.current?.querySelector<HTMLElement>("[data-resume-page]");
    if (!node) throw new Error("Preview not ready");
    const { default: html2canvas } = await import("html2canvas-pro");
    // Reset on-screen scale so the export captures at full 820px width
    const prevTransform = node.style.transform;
    node.style.transform = "none";
    try {
      return await html2canvas(node, { scale: 2, backgroundColor: "#fff", useCORS: true, width: 820 });
    } finally {
      node.style.transform = prevTransform;
    }
  };
  const exportPDF = async () => {
    // Check subscription
    const access = checkAccess(subscription);
    if (!access.allowed) {
      toast.error(access.reason, {
        description: "Please upgrade your plan to download your resume.",
        action: {
          label: "Upgrade",
          onClick: () => nav({ to: "/dashboard", search: { buy: "PRO" } })
        }
      });
      return;
    }

    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const canvas = await renderCanvas();
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.height / canvas.width;
      const imgH = pageW * ratio;
      if (imgH <= pageH) {
        pdf.addImage(img, "PNG", 0, 0, pageW, imgH);
      } else {
        let y = 0;
        const pageCanvasH = (canvas.width * pageH) / pageW;
        while (y < canvas.height) {
          const slice = document.createElement("canvas");
          slice.width = canvas.width;
          slice.height = Math.min(pageCanvasH, canvas.height - y);
          slice.getContext("2d")!.drawImage(canvas, 0, y, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
          if (y > 0) pdf.addPage();
          pdf.addImage(slice.toDataURL("image/png"), "PNG", 0, 0, pageW, (slice.height * pageW) / canvas.width);
          y += pageCanvasH;
        }
      }
      pdf.save(`${title || "resume"}.pdf`);
    } catch (e: any) {
      toast.error(e.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const exportDOCX = async () => {
    // Check subscription
    const access = checkAccess(subscription);
    if (!access.allowed) {
      toast.error(access.reason, {
        description: "Please upgrade your plan to download your resume.",
        action: {
          label: "Upgrade",
          onClick: () => nav({ to: "/dashboard", search: { buy: "PRO" } })
        }
      });
      return;
    }

    setExporting(true);
    try {
      const canvas = await renderCanvas();
      const blob: Blob = await new Promise((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("Canvas conversion failed"))), "image/png"),
      );
      const buf = await blob.arrayBuffer();
      const [{ Document, Packer, Paragraph, ImageRun }, { saveAs }] = await Promise.all([
        import("docx"),
        import("file-saver"),
      ]);
      const targetW = 550;
      const targetH = (canvas.height / canvas.width) * targetW;
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    type: "png",
                    data: buf,
                    transformation: { width: targetW, height: targetH },
                  } as any),
                ],
              }),
            ],
          },
        ],
      });
      const out = await Packer.toBlob(doc);
      saveAs(out, `${title || "resume"}.docx`);
    } catch (e: any) {
      toast.error(e.message ?? "DOCX export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b glass sticky top-0 z-[100]">
        <div className="container mx-auto flex flex-wrap h-auto min-h-14 max-w-[1400px] items-center justify-between gap-2 px-3 py-2 sm:px-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground shrink-0 inline-flex items-center justify-center min-w-10 min-h-10">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <img src={logo} alt="Vogats CV Logo" className="h-6 w-6 rounded-md object-cover" />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 max-w-[260px] min-w-0 border-none focus-visible:ring-1 px-2 font-medium"
            />
            <span className="hidden sm:inline text-xs text-muted-foreground">{saving ? "Saving…" : "Saved"}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            <TemplatePicker value={template} onChange={setTemplate} data={data} />
            <TemplateCompare current={template} onSelect={setTemplate} data={data} />
            <Button size="sm" variant="outline" onClick={exportDOCX} disabled={exporting} className="h-10 min-w-10">
              <FileText className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">DOCX</span>
            </Button>
            <Button size="sm" variant="ink" onClick={exportPDF} disabled={exporting} className="h-10 min-w-10">
              {exporting ? <Loader2 className="h-4 w-4 sm:mr-1.5 animate-spin" /> : <Download className="h-4 w-4 sm:mr-1.5" />}
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[440px_1fr] gap-0 max-w-[1400px] mx-auto">
        {/* Editor */}
        <aside className="bg-background border-r p-3 sm:p-5 lg:max-h-[calc(100vh-56px)] lg:overflow-y-auto">
          <Tabs defaultValue="basics">
            <TabsList className="grid grid-cols-7 w-full h-auto gap-0.5 p-1">
              <TabsTrigger value="basics" className="text-[10px] sm:text-[11px] px-1 min-h-10">Basics</TabsTrigger>
              <TabsTrigger value="exp" className="text-[10px] sm:text-[11px] px-1 min-h-10">Work</TabsTrigger>
              <TabsTrigger value="edu" className="text-[10px] sm:text-[11px] px-1 min-h-10">Edu</TabsTrigger>
              <TabsTrigger value="skills" className="text-[10px] sm:text-[11px] px-1 min-h-10">Skills</TabsTrigger>
              <TabsTrigger value="proj" className="text-[10px] sm:text-[11px] px-1 min-h-10">Proj</TabsTrigger>
              <TabsTrigger value="ats" className="text-[10px] sm:text-[11px] px-1 min-h-10">ATS</TabsTrigger>
              <TabsTrigger value="cover" className="text-[10px] sm:text-[11px] px-1 min-h-10 text-accent">
                <Mail className="h-3 w-3 mr-0.5" />Letter
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="space-y-3 mt-4">
              <PhotoField
                value={data.basics.photo}
                onChange={(v) => update("basics", { ...data.basics, photo: v })}
              />
              {(["name", "title", "email", "phone", "location", "website"] as const).map((k) => (
                <Field key={k} label={k} value={data.basics[k]} onChange={(v) => update("basics", { ...data.basics, [k]: v })} />
              ))}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>Professional summary</Label>
                  <AIImproveButton
                    currentValue={data.basics.summary}
                    context="summary"
                    profileData={data}
                    onUpdate={(v) => update("basics", { ...data.basics, summary: v as string })}
                  />
                </div>
                <Textarea
                  rows={5}
                  value={data.basics.summary}
                  onChange={(e) => update("basics", { ...data.basics, summary: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="exp" className="space-y-4 mt-4">
              {data.experience.map((e, idx) => (
                <Card key={e.id} className="p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Experience {idx + 1}</span>
                    <button onClick={() => update("experience", data.experience.filter((x) => x.id !== e.id))} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Field label="Role" value={e.role} onChange={(v) => update("experience", data.experience.map((x) => x.id === e.id ? { ...x, role: v } : x))} />
                  <Field label="Company" value={e.company} onChange={(v) => update("experience", data.experience.map((x) => x.id === e.id ? { ...x, company: v } : x))} />
                  <div className="grid grid-cols-3 gap-2">
                    <Field label="Start" value={e.start} onChange={(v) => update("experience", data.experience.map((x) => x.id === e.id ? { ...x, start: v } : x))} />
                    <Field label="End" value={e.end} onChange={(v) => update("experience", data.experience.map((x) => x.id === e.id ? { ...x, end: v } : x))} />
                    <Field label="Location" value={e.location} onChange={(v) => update("experience", data.experience.map((x) => x.id === e.id ? { ...x, location: v } : x))} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-xs">Bullets (one per line)</Label>
                      <AIImproveButton
                        label="Vogats AI bullets"
                        currentValue={e.bullets}
                        context="bullets"
                        profileData={data}
                        onUpdate={(v) => update("experience", data.experience.map((x) => x.id === e.id ? { ...x, bullets: v as string[] } : x))}
                      />
                    </div>
                    <Textarea
                      rows={4}
                      value={e.bullets.join("\n")}
                      onChange={(ev) => update("experience", data.experience.map((x) => x.id === e.id ? { ...x, bullets: ev.target.value.split("\n") } : x))}
                    />
                  </div>
                </Card>
              ))}
              <Button variant="outline" size="sm" className="w-full" onClick={() => update("experience", [...data.experience, { id: uid(), company: "", role: "", location: "", start: "", end: "", bullets: [""] }])}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add experience
              </Button>
            </TabsContent>

            <TabsContent value="edu" className="space-y-4 mt-4">
              {data.education.map((e, idx) => (
                <Card key={e.id} className="p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Education {idx + 1}</span>
                    <button onClick={() => update("education", data.education.filter((x) => x.id !== e.id))} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Field label="School" value={e.school} onChange={(v) => update("education", data.education.map((x) => x.id === e.id ? { ...x, school: v } : x))} />
                  <Field label="Degree" value={e.degree} onChange={(v) => update("education", data.education.map((x) => x.id === e.id ? { ...x, degree: v } : x))} />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Start" value={e.start} onChange={(v) => update("education", data.education.map((x) => x.id === e.id ? { ...x, start: v } : x))} />
                    <Field label="End" value={e.end} onChange={(v) => update("education", data.education.map((x) => x.id === e.id ? { ...x, end: v } : x))} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Notes</Label>
                      <AIImproveButton
                        label="Vogats AI suggest"
                        currentValue={e.notes}
                        context="education-notes"
                        profileData={data}
                        onUpdate={(v) => update("education", data.education.map(x => x.id === e.id ? { ...x, notes: v as string } : x))}
                      />
                    </div>
                    <Input value={e.notes} onChange={(v) => update("education", data.education.map((x) => x.id === e.id ? { ...x, notes: v.target.value } : x))} className="h-10" />
                  </div>
                </Card>
              ))}
              <Button variant="outline" size="sm" className="w-full" onClick={() => update("education", [...data.education, { id: uid(), school: "", degree: "", start: "", end: "", notes: "" }])}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add education
              </Button>
            </TabsContent>

            <TabsContent value="skills" className="space-y-8 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider">Skills</Label>
                  <AIImproveButton
                    label="Vogats AI Suggest"
                    currentValue={data.skills}
                    context="skills"
                    profileData={data}
                    onUpdate={(v) => update("skills", Array.isArray(v) ? v : (v as string).split(",").map(s => s.trim()).filter(Boolean))}
                  />
                </div>
                <Textarea
                  rows={4}
                  value={data.skills.join(", ")}
                  onChange={(e) => update("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  placeholder="e.g. React, UI Design, Team Leadership"
                />
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-muted-foreground mr-1 self-center">Quick add:</span>
                  {POPULAR_SKILLS.filter(s => !data.skills.includes(s)).slice(0, 5).map(s => (
                    <button 
                      key={s} 
                      onClick={() => update("skills", [...data.skills, s])}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-secondary hover:bg-sage/20 border border-transparent hover:border-sage/30 transition-all"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider">Hobbies</Label>
                  <Button size="sm" variant="ghost" onClick={generateHobbies} disabled={aiBusy === "hobbies"}>
                    {aiBusy === "hobbies" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5 mr-1.5 text-coral" />}
                    AI Suggest
                  </Button>
                </div>
                <Textarea
                  rows={3}
                  value={data.hobbies?.join(", ") || ""}
                  onChange={(e) => update("hobbies", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  placeholder="e.g. Photography, Hiking, Traveling"
                />
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-muted-foreground mr-1 self-center">Quick add:</span>
                  {POPULAR_HOBBIES.filter(h => !data.hobbies?.includes(h)).slice(0, 5).map(h => (
                    <button 
                      key={h} 
                      onClick={() => update("hobbies", [...(data.hobbies || []), h])}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-secondary hover:bg-coral/20 border border-transparent hover:border-coral/30 transition-all"
                    >
                      + {h}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="proj" className="space-y-4 mt-4">
              {data.projects.map((p, idx) => (
                <Card key={p.id} className="p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Project {idx + 1}</span>
                    <button onClick={() => update("projects", data.projects.filter((x) => x.id !== p.id))} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Field label="Name" value={p.name} onChange={(v) => update("projects", data.projects.map((x) => x.id === p.id ? { ...x, name: v } : x))} />
                  <Field label="Link" value={p.link} onChange={(v) => update("projects", data.projects.map((x) => x.id === p.id ? { ...x, link: v } : x))} />
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Description</Label>
                      <AIImproveButton
                        label="Vogats AI write"
                        currentValue={p.description}
                        context="projects"
                        profileData={data}
                        onUpdate={(v) => update("projects", data.projects.map(x => x.id === p.id ? { ...x, description: v as string } : x))}
                      />
                    </div>
                    <Textarea rows={3} value={p.description} onChange={(e) => update("projects", data.projects.map((x) => x.id === p.id ? { ...x, description: e.target.value } : x))} />
                  </div>
                </Card>
              ))}
              <Button variant="outline" size="sm" className="w-full" onClick={() => update("projects", [...data.projects, { id: uid(), name: "", description: "", link: "" }])}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add project
              </Button>
            </TabsContent>

            <TabsContent value="ats" className="mt-4">
              <ATSPanel 
                resume={data} 
                onUpdateSummary={(val) => update("basics", { ...data.basics, summary: val })} 
              />
            </TabsContent>

            {/* ── Cover Letter Tab ──────────────────────────────────────── */}
            <TabsContent value="cover" className="mt-4 space-y-4">
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-semibold text-accent">Vogats AI Cover Letter</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Your resume data is pre-loaded. Just add the job details below.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Company</Label>
                  <Input
                    className="h-9 text-sm"
                    value={clCompany}
                    onChange={(e) => setClCompany(e.target.value)}
                    placeholder="e.g. Google"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Role</Label>
                  <Input
                    className="h-9 text-sm"
                    value={clRole}
                    onChange={(e) => setClRole(e.target.value)}
                    placeholder="e.g. Software Engineer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Tone</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={clTone}
                  onChange={(e) => setClTone(e.target.value)}
                >
                  <option value="professional">Professional</option>
                  <option value="confident">Confident</option>
                  <option value="warm">Warm &amp; personable</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="concise">Concise &amp; direct</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Job Description <span className="text-muted-foreground">(paste the full posting)</span></Label>
                <Textarea
                  rows={7}
                  value={clJd}
                  onChange={(e) => setClJd(e.target.value)}
                  placeholder="Paste the job description here…"
                />
              </div>

              <Button
                variant="ink"
                className="w-full h-11"
                onClick={generateCoverLetter}
                disabled={clBusy}
              >
                {clBusy
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Writing…</>
                  : <><Wand2 className="h-4 w-4 mr-2" />Generate Cover Letter</>}
              </Button>

              {clText && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Your cover letter — edit freely</span>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={copyCoverLetter}>
                        <Copy className="h-3 w-3 mr-1" />Copy
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={downloadCoverLetterTxt}>
                        <Download className="h-3 w-3 mr-1" />.txt
                      </Button>
                      <Button size="sm" variant="ink" className="h-7 text-[10px] px-2" onClick={downloadCoverLetterPdf}>
                        <FileDown className="h-3 w-3 mr-1" />PDF
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    rows={14}
                    className="text-sm leading-7 resize-none"
                    style={{ fontFamily: "'Times New Roman', serif" }}
                    value={clText}
                    onChange={(e) => setClText(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full h-8 text-xs text-muted-foreground"
                    onClick={generateCoverLetter}
                    disabled={clBusy}
                  >
                    {clBusy ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1.5" />}
                    Regenerate
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </aside>

        {/* Preview - auto fit on mobile, full size on desktop */}
        <main className="p-3 sm:p-6 lg:p-10 overflow-x-auto" style={{ touchAction: "pan-x pan-y", WebkitOverflowScrolling: "touch" } as any} ref={previewRef}>
          <ResponsivePreview template={template} data={data} />
        </main>
      </div>
    </div>
  );
}

function ResponsivePreview({ template, data }: { template: string; data: ResumeData }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    const content = contentRef.current;
    if (!el || !content) return;

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const s = Math.min(1, Math.max(0.3, w / 820));
      setScale(s);
      // Update height based on content's actual height multiplied by scale
      setHeight(content.offsetHeight * s);
    });

    ro.observe(el);
    ro.observe(content);
    return () => ro.disconnect();
  }, [data, template]); // Re-run if data changes as height might change

  return (
    <div ref={wrapRef} className="w-full">
      <div 
        className="mx-auto shadow-elegant bg-white overflow-hidden transition-all duration-300" 
        style={{ 
          width: 820 * scale, 
          height: height > 0 ? height : "auto" 
        }}
      >
        <div
          ref={contentRef}
          data-resume-page
          style={{ 
            width: 820, 
            transform: `scale(${scale})`, 
            transformOrigin: "top left",
            // Ensure content doesn't wrap unexpectedly
            minHeight: "1160px" 
          }}
        >
          <ResumePreview template={template} data={data} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs capitalize">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-10 text-base sm:text-sm" />
    </div>
  );
}

function PhotoField({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  const onFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) {
      toast.error("Image too large (max 3MB)");
      return;
    }
    const r = new FileReader();
    r.onload = () => onChange(String(r.result));
    r.readAsDataURL(f);
  };
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">Photo (optional)</Label>
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-secondary border overflow-hidden shrink-0">
          {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">None</div>}
        </div>
        <label className="flex-1">
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          <span className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs cursor-pointer hover:bg-accent">
            {value ? "Change" : "Upload"}
          </span>
        </label>
        {value && (
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-muted-foreground" onClick={() => onChange(undefined)}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
