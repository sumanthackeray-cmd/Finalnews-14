import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, ArrowLeft, Download, Plus, Trash2, Wand2, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { ResumePreview, TEMPLATES } from "@/components/resume/templates";
import { TemplatePicker } from "@/components/resume/template-picker";
import { TemplateCompare } from "@/components/resume/template-compare";
import { ATSPanel } from "@/components/resume/ats-panel";
import type { ResumeData } from "@/lib/resume-types";
import { emptyResume } from "@/lib/resume-types";

export const Route = createFileRoute("/resume/$id")({
  head: () => ({ meta: [{ title: "Builder — Resumé.ai" }] }),
  component: Builder,
});

const uid = () => Math.random().toString(36).slice(2, 9);

function Builder() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [title, setTitle] = useState("Untitled");
  const [template, setTemplate] = useState("modern");
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: r, error } = await supabase.from("resumes").select("*").eq("id", id).single();
      if (error) {
        toast.error(error.message);
        nav({ to: "/dashboard" });
        return;
      }
      setTitle(r.title);
      setTemplate(r.template);
      setData({ ...emptyResume, ...(r.data as any) });
    })();
  }, [user, id, nav]);

  // Autosave
  useEffect(() => {
    if (!user) return;
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      return;
    }
    const t = setTimeout(async () => {
      setSaving(true);
      const { error } = await supabase
        .from("resumes")
        .update({ title, template, data: data as any })
        .eq("id", id);
      setSaving(false);
      if (error) toast.error(error.message);
    }, 800);
    return () => clearTimeout(t);
  }, [title, template, data, user, id]);

  const update = <K extends keyof ResumeData>(k: K, v: ResumeData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const aiAssist = async (action: "summary" | "bullets" | "improve", payload: any) => {
    setAiBusy(action + (payload?.id ?? ""));
    try {
      const { data: res, error } = await supabase.functions.invoke("ai-resume", {
        body: { action, payload, basics: data.basics },
      });
      if (error) throw error;
      if (res?.error) throw new Error(res.error);
      return res;
    } catch (e: any) {
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
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto flex flex-wrap h-auto min-h-14 max-w-[1400px] items-center justify-between gap-2 px-3 py-2 sm:px-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground shrink-0 inline-flex items-center justify-center min-w-10 min-h-10">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Sparkles className="h-4 w-4 text-coral shrink-0" />
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
            <TabsList className="grid grid-cols-6 w-full h-auto gap-1 p-1">
              <TabsTrigger value="basics" className="text-[11px] sm:text-xs px-1 min-h-10">Basics</TabsTrigger>
              <TabsTrigger value="exp" className="text-[11px] sm:text-xs px-1 min-h-10">Work</TabsTrigger>
              <TabsTrigger value="edu" className="text-[11px] sm:text-xs px-1 min-h-10">Edu</TabsTrigger>
              <TabsTrigger value="skills" className="text-[11px] sm:text-xs px-1 min-h-10">Skills</TabsTrigger>
              <TabsTrigger value="proj" className="text-[11px] sm:text-xs px-1 min-h-10">Proj</TabsTrigger>
              <TabsTrigger value="ats" className="text-[11px] sm:text-xs px-1 min-h-10">ATS</TabsTrigger>
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
                  <Button size="sm" variant="ghost" onClick={generateSummary} disabled={aiBusy === "summary"}>
                    {aiBusy === "summary" ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Wand2 className="h-3.5 w-3.5 mr-1" />}
                    AI write
                  </Button>
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
                      <Button size="sm" variant="ghost" onClick={() => generateBullets(e.id)} disabled={aiBusy === "bullets" + e.id}>
                        {aiBusy === "bullets" + e.id ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Wand2 className="h-3.5 w-3.5 mr-1" />}
                        AI bullets
                      </Button>
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
                  <Field label="Notes" value={e.notes} onChange={(v) => update("education", data.education.map((x) => x.id === e.id ? { ...x, notes: v } : x))} />
                </Card>
              ))}
              <Button variant="outline" size="sm" className="w-full" onClick={() => update("education", [...data.education, { id: uid(), school: "", degree: "", start: "", end: "", notes: "" }])}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add education
              </Button>
            </TabsContent>

            <TabsContent value="skills" className="space-y-3 mt-4">
              <Label>Skills (comma separated)</Label>
              <Textarea
                rows={5}
                value={data.skills.join(", ")}
                onChange={(e) => update("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              />
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
                  <Textarea rows={2} value={p.description} onChange={(e) => update("projects", data.projects.map((x) => x.id === p.id ? { ...x, description: e.target.value } : x))} />
                </Card>
              ))}
              <Button variant="outline" size="sm" className="w-full" onClick={() => update("projects", [...data.projects, { id: uid(), name: "", description: "", link: "" }])}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add project
              </Button>
            </TabsContent>

            <TabsContent value="ats" className="mt-4">
              <ATSPanel resume={data} />
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
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setScale(Math.min(1, Math.max(0.3, w / 820)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={wrapRef} className="w-full">
      <div className="mx-auto shadow-elegant bg-white" style={{ width: 820 * scale, height: "auto" }}>
        <div
          data-resume-page
          style={{ width: 820, transform: `scale(${scale})`, transformOrigin: "top left" }}
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
