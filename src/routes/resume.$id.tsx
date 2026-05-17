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
import { Sparkles, ArrowLeft, Download, Plus, Trash2, Wand2, Loader2, FileText, Mail, Copy, FileDown, Eye, User, Briefcase, GraduationCap, Wrench, FolderGit2, Star } from "lucide-react";
import { toast } from "sonner";
import { ResumePreview, TEMPLATES, isValidPhoto } from "@/components/resume/templates";
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

async function downloadBlob(blob: Blob, filename: string) {
  try {
    const buf = await blob.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = window.btoa(binary);

    // Create a hidden form and submit it to the server endpoint
    const form = document.createElement("form");
    form.action = "/api/download";
    form.method = "POST";
    form.style.display = "none";

    const addInput = (name: string, value: string) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    addInput("base64", base64);
    addInput("filename", filename);
    addInput("mimeType", blob.type);

    document.body.appendChild(form);
    form.submit();
    
    setTimeout(() => {
      document.body.removeChild(form);
    }, 250);
  } catch (error) {
    console.error("Server download failed, falling back to basic link:", error);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  }
}

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
  const [clSignature, setClSignature] = useState("");
  const [activeMobileView, setActiveMobileView] = useState<"edit" | "preview">("edit");

  // ── AI Pro Tools state ────────────────────────────────────────────────────
  const [tailorJd, setTailorJd] = useState("");
  const [tailorBusy, setTailorBusy] = useState(false);
  const [showInterviewCoach, setShowInterviewCoach] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<{ type: string; question: string; tip: string }[]>([]);
  const [interviewBusy, setInterviewBusy] = useState(false);
  const [completeResumeBusy, setCompleteResumeBusy] = useState(false);

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
        setClText(r.coverLetterText || "");
        setClCompany(r.coverLetterCompany || "");
        setClRole(r.coverLetterRole || "");
        setClJd(r.coverLetterJd || "");
        setClTone(r.coverLetterTone || "professional");
        setClSignature(r.coverLetterSignature || "");
        
        // Fetch subscription
        const sub = await getUserSubscription(user.uid);
        setSubscription(sub);
        
        // Mark as initialized so autosave can start
        setIsInitialized(true);
      } catch (error: any) {
        console.error("Resume load error:", error);
        if (error.message?.includes("permission") || error.code === "permission-denied" || error.message?.includes("Missing or insufficient permissions")) {
          toast.error("Database Rule Error: Firestore rules are locked or not configured for 'vogats-news' in your Firebase Console.", {
            description: "Please copy the rules from firestore.rules to the 'vogats-news' database in your Firebase Console > Rules tab.",
            duration: 10000
          });
        } else {
          toast.error(error.message || "Failed to load resume");
        }
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
          coverLetterText: clText,
          coverLetterCompany: clCompany,
          coverLetterRole: clRole,
          coverLetterJd: clJd,
          coverLetterTone: clTone,
          coverLetterSignature: clSignature,
          updatedAt: new Date().toISOString()
        });
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setSaving(false);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [title, template, data, clText, clCompany, clRole, clJd, clTone, clSignature, user, id, isInitialized]);

  const update = <K extends keyof ResumeData>(k: K, v: ResumeData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const updateBasicsPhoto = async (photoBase64: string | undefined) => {
    update("basics", { ...data.basics, photo: photoBase64 });
    if (user && photoBase64) {
      try {
        const { updateProfile } = await import("firebase/auth");
        await updateProfile(user, { photoURL: photoBase64 });
        await updateDoc(doc(db, "users", user.uid), {
          photoURL: photoBase64,
          updatedAt: new Date().toISOString()
        });
        toast.success("Profile picture updated and synced successfully!");
      } catch (err: any) {
        console.error("Failed to sync profile picture:", err);
      }
    }
  };

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

  // ── AI Pro: Tailor Resume to Job Description ─────────────────────────────
  const tailorToJob = async () => {
    if (tailorJd.trim().length < 50) {
      toast.error("Please paste at least 50 characters of the job description.");
      return;
    }
    setTailorBusy(true);
    try {
      const res = await generateAIContent({
        action: "tailor-to-job",
        data: {
          jobDescription: tailorJd,
          name: data.basics.name,
          title: data.basics.title,
          summary: data.basics.summary,
          experience: data.experience,
          skills: data.skills,
        },
      });
      if (res?.error) throw new Error(res.error);
      let updated = { ...data };
      if (res.summary) updated = { ...updated, basics: { ...updated.basics, summary: res.summary } };
      if (res.suggestedSkills?.length) {
        const merged = Array.from(new Set([...updated.skills, ...res.suggestedSkills]));
        updated = { ...updated, skills: merged };
      }
      if (res.experienceBullets && typeof res.experienceBullets === "object") {
        const newExp = updated.experience.map((e: any, i: number) => {
          const newBullets = res.experienceBullets[e.id] || res.experienceBullets[String(i)];
          return newBullets ? { ...e, bullets: newBullets } : e;
        });
        updated = { ...updated, experience: newExp };
      }
      update("basics", updated.basics);
      update("skills", updated.skills);
      update("experience", updated.experience);
      toast.success("✨ Resume tailored to the job! Summary, bullets & skills updated.");
    } catch (e: any) {
      toast.error(e.message ?? "Tailoring failed. Please try again.");
    } finally {
      setTailorBusy(false);
    }
  };

  // ── AI Pro: Interview Coach ───────────────────────────────────────────────
  const generateInterviewQuestions = async () => {
    setInterviewBusy(true);
    try {
      const res = await generateAIContent({
        action: "interview-questions",
        data: {
          name: data.basics.name,
          title: data.basics.title,
          experience: data.experience,
          skills: data.skills,
        },
      });
      if (res?.error) throw new Error(res.error);
      setInterviewQuestions(res.questions || []);
      setShowInterviewCoach(true);
      toast.success("🎯 Interview questions generated!");
    } catch (e: any) {
      toast.error(e.message ?? "Interview prep failed. Please try again.");
    } finally {
      setInterviewBusy(false);
    }
  };

  // ── AI Pro: Complete Resume Auto-Fill ────────────────────────────────────
  const completeResumeWithAI = async () => {
    if (!data.basics.name && !data.basics.title) {
      toast.error("Please enter your Name and Job Title first.");
      return;
    }
    setCompleteResumeBusy(true);
    try {
      const res = await generateAIContent({
        action: "complete-resume",
        data: {
          name: data.basics.name,
          title: data.basics.title,
          company: data.experience?.[0]?.company || "",
          experience: data.experience,
          skills: data.skills,
        },
      });
      if (res?.error) throw new Error(res.error);
      let updated = { ...data };
      if (res.summary && !data.basics.summary) updated = { ...updated, basics: { ...updated.basics, summary: res.summary } };
      if (res.skills?.length && data.skills.length === 0) updated = { ...updated, skills: res.skills };
      if (res.hobbies?.length && (!data.hobbies || data.hobbies.length === 0)) updated = { ...updated, hobbies: res.hobbies };
      if (res.suggestedBullets && typeof res.suggestedBullets === "object") {
        const newExp = updated.experience.map((e: any, i: number) => {
          const b = res.suggestedBullets[e.id] || res.suggestedBullets[String(i)];
          return (b && (!e.bullets || e.bullets.join("").trim() === "")) ? { ...e, bullets: b } : e;
        });
        updated = { ...updated, experience: newExp };
      }
      update("basics", updated.basics);
      update("skills", updated.skills);
      update("hobbies", updated.hobbies);
      update("experience", updated.experience);
      toast.success("🚀 Resume auto-completed by Vogats AI!");
    } catch (e: any) {
      toast.error(e.message ?? "Auto-complete failed. Please try again.");
    } finally {
      setCompleteResumeBusy(false);
    }
  };

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
    const access = checkAccess(subscription);
    if (!access.allowed) {
      toast.error("Download requires an active plan", {
        description: access.reason + ". Upgrade to download your cover letter.",
        action: {
          label: "Upgrade Now",
          onClick: () => nav({ to: "/dashboard", search: { buy: "PRO", template: undefined } }),
        },
        duration: 6000,
      });
      return;
    }

    setExporting(true);
    try {
      const node = document.getElementById("cover-letter-preview-node");
      if (!node) {
        throw new Error("Please generate a cover letter first to view and download it.");
      }

      // Hide all invalid photos before canvas render
      const restoreImages = sanitizeImagesForExport(node);

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 820,
        height: 1160,
        logging: false,
      });

      restoreImages();

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const imgData = canvas.toDataURL("image/jpeg", 0.96);
      pdf.addImage(imgData, "JPEG", 0, 0, 595.28, 841.89);
      const blob = pdf.output("blob");
      downloadBlob(blob, `cover-letter-${(clCompany || title || "resume").toLowerCase().replace(/\s+/g, "-")}.pdf`);
      toast.success("Cover letter PDF downloaded!");
    } catch (error: any) {
      console.error("Cover letter PDF export error:", error);
      toast.error(error.message || "Failed to download cover letter PDF");
    } finally {
      setExporting(false);
    }
  };

  const downloadCoverLetterDocx = async () => {
    const access = checkAccess(subscription);
    if (!access.allowed) {
      toast.error("Download requires an active plan", {
        description: access.reason + ". Upgrade to download your cover letter as Word document.",
        action: {
          label: "Upgrade Now",
          onClick: () => nav({ to: "/dashboard", search: { buy: "PRO", template: undefined } }),
        },
        duration: 6000,
      });
      return;
    }

    setExporting(true);
    try {
      const node = document.getElementById("cover-letter-preview-node");
      if (!node) {
        throw new Error("Please generate a cover letter first to view and download it.");
      }

      // Hide all invalid photos before canvas render
      const restoreImages = sanitizeImagesForExport(node);

      const [{ default: html2canvas }, { Document, Packer, Paragraph, ImageRun }, { saveAs }] = await Promise.all([
        import("html2canvas-pro"),
        import("docx"),
        import("file-saver"),
      ]);

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 820,
        height: 1160,
        logging: false,
      });

      restoreImages();

      // Use JPEG blob for high quality Word document insertion
      const blob: Blob = await new Promise((res, rej) =>
        canvas.toBlob(
          (b) => (b ? res(b) : rej(new Error("Failed to generate image."))),
          "image/jpeg",
          0.97,
        ),
      );
      const buf = await blob.arrayBuffer();

      const targetW = 550;
      const targetH = Math.round((canvas.height / canvas.width) * targetW);
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    type: "jpg",
                    data: buf,
                    transformation: { width: targetW, height: targetH },
                  } as any),
                ],
              }),
            ],
          },
        ],
      });

      const docxBlob = await Packer.toBlob(doc);
      downloadBlob(docxBlob, `cover-letter-${(clCompany || title || "resume").toLowerCase().replace(/\s+/g, "-")}.docx`);
      toast.success("Cover letter Word document downloaded!");
    } catch (error: any) {
      console.error("Cover letter Word export error:", error);
      toast.error(error.message || "Failed to download cover letter as Word");
    } finally {
      setExporting(false);
    }
  };

  /**
   * Sanitize all <img> elements inside the resume preview node before html2canvas renders.
   * This prevents canvas taint (which produces invalid PNG data URLs that jsPDF rejects).
   * Returns a cleanup function that restores all original src attributes.
   */
  const sanitizeImagesForExport = (node: HTMLElement): (() => void) => {
    const imgEls = Array.from(node.querySelectorAll<HTMLImageElement>("img"));
    const origSrcs: string[] = imgEls.map((img) => img.src);

    imgEls.forEach((img) => {
      // If image is not loaded, broken, or cross-origin (non data:), hide it for export
      if (!img.complete || img.naturalWidth === 0) {
        img.style.visibility = "hidden";
      }
      // If the image source is not a valid photo, hide it
      if (!isValidPhoto(img.src)) {
        img.style.visibility = "hidden";
      }
      // If it's an external URL (not a data: URL), convert cross-origin images to avoid taint
      // by hiding them — html2canvas useCORS handles data: URLs natively
      if (img.src && !img.src.startsWith("data:") && !img.src.startsWith("blob:")) {
        img.style.visibility = "hidden";
      }
    });

    return () => {
      imgEls.forEach((img, i) => {
        img.src = origSrcs[i];
        img.style.visibility = "";
      });
    };
  };

  const renderCanvas = async () => {
    const node = previewRef.current?.querySelector<HTMLElement>("[data-resume-page]");
    if (!node) throw new Error("Preview not ready");
    const { default: html2canvas } = await import("html2canvas-pro");

    // Reset on-screen scale so the export captures at full 820px width
    const prevTransform = node.style.transform;
    node.style.transform = "none";

    // Sanitize cross-origin / broken images to prevent canvas taint & wrong PNG signature
    const restoreImages = sanitizeImagesForExport(node);

    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        width: 820,
        logging: false,
      });
      return canvas;
    } finally {
      node.style.transform = prevTransform;
      restoreImages();
    }
  };

  const exportPDF = async () => {
    // Check subscription before allowing download
    const access = checkAccess(subscription);
    if (!access.allowed) {
      toast.error("Download requires an active plan", {
        description: access.reason + ". Upgrade to download your resume as PDF.",
        action: {
          label: "Upgrade Now",
          onClick: () => nav({ to: "/dashboard", search: { buy: "PRO" } }),
        },
        duration: 6000,
      });
      return;
    }

    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const canvas = await renderCanvas();

      // Use JPEG format — avoids jsPDF's strict PNG header validation entirely
      const imgDataUrl = canvas.toDataURL("image/jpeg", 0.97);

      // Validate data URL before passing to jsPDF
      if (!imgDataUrl || imgDataUrl === "data:," || !imgDataUrl.startsWith("data:image/")) {
        throw new Error("Failed to generate image from resume. Please try again.");
      }

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.height / canvas.width;
      const imgH = pageW * ratio;

      if (imgH <= pageH) {
        // Single page — fits perfectly
        pdf.addImage(imgDataUrl, "JPEG", 0, 0, pageW, imgH);
      } else {
        // Multi-page slicing
        let yPos = 0;
        const pageCanvasH = Math.floor((canvas.width * pageH) / pageW);
        while (yPos < canvas.height) {
          const sliceH = Math.min(pageCanvasH, canvas.height - yPos);
          const slice = document.createElement("canvas");
          slice.width = canvas.width;
          slice.height = sliceH;
          const ctx = slice.getContext("2d")!;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, slice.width, slice.height);
          ctx.drawImage(canvas, 0, yPos, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
          const sliceData = slice.toDataURL("image/jpeg", 0.97);
          if (yPos > 0) pdf.addPage();
          pdf.addImage(sliceData, "JPEG", 0, 0, pageW, (sliceH * pageW) / canvas.width);
          yPos += pageCanvasH;
        }
      }

      const blob = pdf.output("blob");
      downloadBlob(blob, `${title || "resume"}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (e: any) {
      console.error("[PDF Export Error]:", e);
      toast.error("Export failed: " + (e.message ?? "Unknown error"), {
        description: "Try removing your profile photo and re-downloading.",
      });
    } finally {
      setExporting(false);
    }
  };

  const exportDOCX = async () => {
    // DOCX download requires PRO or UNLIMITED plan
    const access = checkAccess(subscription);
    if (!access.allowed) {
      toast.error("DOCX download requires an active plan", {
        description: access.reason + ". Upgrade to download as Word document.",
        action: {
          label: "Upgrade Now",
          onClick: () => nav({ to: "/dashboard", search: { buy: "PRO", template: undefined } }),
        },
        duration: 6000,
      });
      return;
    }


    setExporting(true);
    try {
      const canvas = await renderCanvas();

      // Use JPEG blob for DOCX too
      const blob: Blob = await new Promise((res, rej) =>
        canvas.toBlob(
          (b) => (b ? res(b) : rej(new Error("Failed to generate image. Try removing profile photo."))),
          "image/jpeg",
          0.97,
        ),
      );
      const buf = await blob.arrayBuffer();
      const [{ Document, Packer, Paragraph, ImageRun }, { saveAs }] = await Promise.all([
        import("docx"),
        import("file-saver"),
      ]);
      const targetW = 550;
      const targetH = Math.round((canvas.height / canvas.width) * targetW);
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    type: "jpg",
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
      downloadBlob(out, `${title || "resume"}.docx`);
      toast.success("Word document downloaded successfully!");
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
            <Link to="/dashboard" search={{ buy: undefined, template: undefined } as any} className="text-muted-foreground hover:text-foreground shrink-0 inline-flex items-center justify-center min-w-10 min-h-10">
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

      {/* Mobile Sticky View Toggle Navigation Bar */}
      <div className="lg:hidden sticky top-[56px] z-[90] bg-background/95 backdrop-blur border-b px-3 py-2.5 flex gap-2 shadow-sm">
        <Button
          variant={activeMobileView === "edit" ? "ink" : "outline"}
          className="flex-1 h-9 text-xs font-semibold rounded-md shadow-sm transition-all duration-200"
          onClick={() => setActiveMobileView("edit")}
        >
          <Wand2 className="h-3.5 w-3.5 mr-1.5" /> Edit Details & AI
        </Button>
        <Button
          variant={activeMobileView === "preview" ? "ink" : "outline"}
          className="flex-1 h-9 text-xs font-semibold rounded-md shadow-sm transition-all duration-200"
          onClick={() => setActiveMobileView("preview")}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" /> Live Preview ({clText ? "2 Pages" : "1 Page"})
        </Button>
      </div>

      <div className="grid lg:grid-cols-[440px_1fr] gap-0 max-w-[1400px] mx-auto">
        {/* Editor */}
        <aside className={`bg-background border-r px-3 pt-3 pb-28 sm:px-5 sm:pt-5 sm:pb-10 lg:pb-10 lg:max-h-[calc(100vh-56px)] lg:overflow-y-auto ${activeMobileView !== "edit" ? "hidden lg:block" : "block"}`}>
          <Tabs defaultValue="basics">
            <TabsList className="grid grid-cols-7 w-full h-auto gap-0.5 p-1 bg-secondary/30 rounded-lg">
              <TabsTrigger value="basics" className="text-[10px] px-0.5 min-h-12 flex flex-col items-center justify-center gap-1 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all rounded-md">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[9.5px] font-semibold tracking-tight">Basics</span>
              </TabsTrigger>
              <TabsTrigger value="exp" className="text-[10px] px-0.5 min-h-12 flex flex-col items-center justify-center gap-1 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all rounded-md">
                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[9.5px] font-semibold tracking-tight">Work</span>
              </TabsTrigger>
              <TabsTrigger value="edu" className="text-[10px] px-0.5 min-h-12 flex flex-col items-center justify-center gap-1 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all rounded-md">
                <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[9.5px] font-semibold tracking-tight">Edu</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="text-[10px] px-0.5 min-h-12 flex flex-col items-center justify-center gap-1 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all rounded-md">
                <Wrench className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[9.5px] font-semibold tracking-tight">Skills</span>
              </TabsTrigger>
              <TabsTrigger value="proj" className="text-[10px] px-0.5 min-h-12 flex flex-col items-center justify-center gap-1 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all rounded-md">
                <FolderGit2 className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[9.5px] font-semibold tracking-tight">Proj</span>
              </TabsTrigger>
              <TabsTrigger value="ats" className="text-[10px] px-0.5 min-h-12 flex flex-col items-center justify-center gap-1 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all rounded-md">
                <Star className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[9.5px] font-semibold tracking-tight">ATS</span>
              </TabsTrigger>
              <TabsTrigger value="cover" className="text-[10px] px-0.5 min-h-12 text-accent flex flex-col items-center justify-center gap-1 py-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-sm transition-all rounded-md">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[9.5px] font-semibold tracking-tight">Letter</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="space-y-3 mt-4">

              {/* ── AI Pro Tools Banner ─────────────────────────────────── */}
              <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-accent/20">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Vogats AI Pro Tools</p>
                    <p className="text-[10px] text-muted-foreground">Save time · Get best results · Impress recruiters</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {/* Complete Resume */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-auto py-2 px-2.5 flex-col items-start gap-1 text-left border-accent/30 hover:border-accent hover:bg-accent/10 transition-all group"
                    onClick={completeResumeWithAI}
                    disabled={completeResumeBusy}
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      {completeResumeBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin text-accent shrink-0" /> : <Wand2 className="h-3.5 w-3.5 text-accent shrink-0" />}
                      <span className="text-[11px] font-semibold text-foreground">Auto-Complete</span>
                    </div>
                    <span className="text-[9.5px] text-muted-foreground leading-tight">AI fills empty sections instantly</span>
                  </Button>
                  {/* Interview Coach */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-auto py-2 px-2.5 flex-col items-start gap-1 text-left border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 transition-all group"
                    onClick={generateInterviewQuestions}
                    disabled={interviewBusy}
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      {interviewBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-500 shrink-0" /> : <Star className="h-3.5 w-3.5 text-purple-500 shrink-0" />}
                      <span className="text-[11px] font-semibold text-foreground">Interview Coach</span>
                    </div>
                    <span className="text-[9.5px] text-muted-foreground leading-tight">AI-powered mock interview prep</span>
                  </Button>
                </div>

                {/* Tailor to Job */}
                <div className="space-y-2 pt-1 border-t border-accent/15">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 text-green-500" />
                    <span className="text-[11px] font-semibold text-foreground">Tailor Resume to Job</span>
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600 font-semibold">PRO TIP</span>
                  </div>
                  <Textarea
                    rows={3}
                    className="text-xs resize-none"
                    value={tailorJd}
                    onChange={(e) => setTailorJd(e.target.value)}
                    placeholder="Paste the job description here… AI rewrites your entire resume to match."
                  />
                  <Button
                    className="w-full h-9 text-xs font-semibold bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white border-0 transition-all"
                    onClick={tailorToJob}
                    disabled={tailorBusy || tailorJd.trim().length < 10}
                  >
                    {tailorBusy
                      ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Tailoring Resume…</>
                      : <><Sparkles className="h-3.5 w-3.5 mr-2" />Tailor My Resume to This Job</>}
                  </Button>
                </div>
              </div>

              {/* Interview Coach Results Panel */}
              {showInterviewCoach && interviewQuestions.length > 0 && (
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 text-purple-500" />
                      <span className="text-xs font-bold text-purple-600">AI Interview Prep — {interviewQuestions.length} Questions</span>
                    </div>
                    <button onClick={() => setShowInterviewCoach(false)} className="text-muted-foreground hover:text-foreground text-xs">✕ Close</button>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                    {interviewQuestions.map((q, i) => (
                      <div key={i} className="rounded-lg bg-background border border-purple-500/20 p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600">{q.type}</span>
                          <span className="text-[10px] text-muted-foreground">Q{i + 1}</span>
                        </div>
                        <p className="text-[11.5px] font-semibold text-foreground leading-snug">{q.question}</p>
                        <div className="flex items-start gap-1.5">
                          <Sparkles className="h-2.5 w-2.5 text-accent mt-0.5 shrink-0" />
                          <p className="text-[10px] text-muted-foreground leading-snug italic">{q.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={generateInterviewQuestions} disabled={interviewBusy}>
                    {interviewBusy ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Refreshing…</> : <><Wand2 className="h-3 w-3 mr-1.5" />Refresh Questions</>}
                  </Button>
                </div>
              )}

              <PhotoField
                value={data.basics.photo}
                onChange={updateBasicsPhoto}
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
                <Card key={e.id} className="p-3 space-y-2 border-l-2 border-l-accent/30 hover:border-l-accent/60 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-foreground truncate block">{e.role || `Experience ${idx + 1}`}</span>
                      {e.company && <span className="text-[10px] text-muted-foreground truncate block">{e.company}</span>}
                    </div>
                    <button onClick={() => update("experience", data.experience.filter((x) => x.id !== e.id))} className="text-muted-foreground hover:text-destructive ml-2 shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Field label="Role" value={e.role} onChange={(v) => update("experience", data.experience.map((x) => x.id === e.id ? { ...x, role: v } : x))} />
                  <Field label="Company" value={e.company} onChange={(v) => update("experience", data.experience.map((x) => x.id === e.id ? { ...x, company: v } : x))} />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Start" value={e.start} onChange={(v) => update("experience", data.experience.map((x) => x.id === e.id ? { ...x, start: v } : x))} />
                    <Field label="End" value={e.end} onChange={(v) => update("experience", data.experience.map((x) => x.id === e.id ? { ...x, end: v } : x))} />
                  </div>
                  <Field label="Location" value={e.location} onChange={(v) => update("experience", data.experience.map((x) => x.id === e.id ? { ...x, location: v } : x))} />
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-xs">Bullets (one per line)</Label>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-[10px] text-accent hover:bg-accent/10"
                          onClick={() => generateBullets(e.id)}
                          disabled={aiBusy === e.id}
                        >
                          {aiBusy === e.id ? <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" /> : <Sparkles className="h-2.5 w-2.5 mr-1" />}
                          AI Write
                        </Button>
                        <AIImproveButton
                          label="Improve"
                          currentValue={e.bullets}
                          context="bullets"
                          profileData={data}
                          onUpdate={(v) => update("experience", data.experience.map((x) => x.id === e.id ? { ...x, bullets: v as string[] } : x))}
                        />
                      </div>
                    </div>
                    <Textarea
                      rows={4}
                      value={e.bullets.join("\n")}
                      onChange={(ev) => update("experience", data.experience.map((x) => x.id === e.id ? { ...x, bullets: ev.target.value.split("\n") } : x))}
                      placeholder="• Achieved X by doing Y, resulting in Z&#10;• Led team of N people to accomplish…"
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
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] text-muted-foreground self-center">Quick add:</span>
                  {POPULAR_SKILLS.filter(s => !data.skills.includes(s)).slice(0, 6).map(s => (
                    <button
                      key={s}
                      onClick={() => update("skills", [...data.skills, s])}
                      className="text-[11px] font-medium px-3 py-1.5 min-h-[36px] rounded-full bg-secondary hover:bg-accent/20 border border-transparent hover:border-accent/40 transition-all active:scale-95"
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
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] text-muted-foreground self-center">Quick add:</span>
                  {POPULAR_HOBBIES.filter(h => !data.hobbies?.includes(h)).slice(0, 6).map(h => (
                    <button
                      key={h}
                      onClick={() => update("hobbies", [...(data.hobbies || []), h])}
                      className="text-[11px] font-medium px-3 py-1.5 min-h-[36px] rounded-full bg-secondary hover:bg-accent/20 border border-transparent hover:border-accent/40 transition-all active:scale-95"
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

              <div className="space-y-1.5 p-3 rounded-lg border bg-secondary/20">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-accent">
                  <FileText className="h-3 w-3" /> Digital Signature (optional)
                </Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="w-24 h-12 rounded bg-background border flex items-center justify-center overflow-hidden shrink-0">
                    {clSignature ? (
                      <img src={clSignature} alt="Uploaded Signature" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">No Signature</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="inline-flex h-8 items-center justify-center rounded border bg-background px-3 text-xs font-medium cursor-pointer hover:bg-accent transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error("Signature image is too large (max 2MB)");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => setClSignature(String(reader.result));
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {clSignature ? "Change Signature" : "Upload Signature PNG/JPG"}
                    </label>
                    {clSignature && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-1.5 text-[10px] text-destructive hover:bg-destructive/10 self-start"
                        onClick={() => setClSignature("")}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground mt-1.5">
                  Upload a cropped signature with transparent or white background. It will show beautifully at the sign-off!
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Job Description <span className="text-muted-foreground">(paste the full posting)</span></Label>
                <Textarea
                  rows={5}
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
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground block">Your cover letter — edit freely</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button size="sm" variant="outline" className="h-10 text-xs" onClick={copyCoverLetter}>
                        <Copy className="h-3.5 w-3.5 mr-1.5" />Copy Text
                      </Button>
                      <Button size="sm" variant="outline" className="h-10 text-xs" onClick={downloadCoverLetterTxt}>
                        <Download className="h-3.5 w-3.5 mr-1.5" />Download .txt
                      </Button>
                      <Button size="sm" variant="ink" className="h-10 text-xs" onClick={downloadCoverLetterPdf}>
                        <FileDown className="h-3.5 w-3.5 mr-1.5" />Download PDF
                      </Button>
                      <Button size="sm" variant="outline" className="h-10 text-xs" onClick={downloadCoverLetterDocx}>
                        <FileText className="h-3.5 w-3.5 mr-1.5" />Download Word
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
        <main className={`p-3 sm:p-6 lg:p-10 overflow-x-auto ${activeMobileView !== "preview" ? "hidden lg:block" : "block"}`} style={{ touchAction: "pan-x pan-y", WebkitOverflowScrolling: "touch" } as any} ref={previewRef}>
          <ResponsivePreview template={template} data={data} clText={clText} clCompany={clCompany} clRole={clRole} clSignature={clSignature} />
        </main>
      </div>
    </div>
  );
}

function CoverLetterPagePreview({ data, clText, clCompany, clRole, clSignature }: { data: ResumeData; clText: string; clCompany?: string; clRole?: string; clSignature?: string }) {
  // Extract paragraphs
  const paragraphs = clText.split(/\n\n+/).map(p => p.trim()).filter(Boolean);

  // Fallback skills
  const fallbackSkills = [
    { name: "Executive Leadership", level: 90 },
    { name: "Strategic Operations", level: 85 },
    { name: "Financial Stewardship", level: 80 },
    { name: "Cross-Functional Collaboration", level: 95 }
  ];
  const skillsToRender = data.skills && data.skills.length > 0 
    ? data.skills.slice(0, 4).map(s => { const skill = s as any; return { name: skill.name || skill, level: skill.level || 85 }; }) 
    : fallbackSkills;

  return (
    <div style={{
      width: "820px",
      height: "1160px",
      backgroundColor: "#ffffff",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', 'Roboto', 'Outfit', sans-serif"
    }}>
      {/* 1. Diagonal Header SVG Shapes */}
      <svg 
        viewBox="0 0 820 280" 
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: "820px", 
          height: "280px", 
          zIndex: 1, 
          pointerEvents: "none" 
        }}
      >
        {/* Peach diagonal right shape */}
        <polygon points="290,0 820,0 820,160 290,80" fill="#fbc4b6" />
        {/* Dark Charcoal left shape */}
        <polygon points="0,0 290,0 290,190 0,250" fill="#4d4d4d" />
      </svg>

      {/* 2. Portrait circular photo frame overlapping the boundary */}
      <div 
        style={{ 
          position: "absolute", 
          left: "65px", 
          top: "85px", 
          width: "160px", 
          height: "160px", 
          borderRadius: "50%", 
          border: "6px solid #fbc4b6", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
          overflow: "hidden",
          zIndex: 10,
          backgroundColor: "#ffffff"
        }}
      >
        {isValidPhoto(data.basics.photo) ? (
          <img src={data.basics.photo} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 text-zinc-400 font-bold text-xs uppercase">
            PHOTO
          </div>
        )}
      </div>

      {/* 3. Left Sidebar Column */}
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "290px",
        height: "1160px",
        backgroundColor: "#f4f5f7",
        padding: "270px 28px 40px 28px",
        display: "flex",
        flexDirection: "column",
        gap: "28px"
      }}>
        {/* Name and Professional Title */}
        <div>
          <h1 style={{
            fontSize: "22px",
            fontWeight: "800",
            letterSpacing: "0.05em",
            color: "#1e293b",
            textTransform: "uppercase",
            lineHeight: "1.2"
          }}>
            {data.basics.name || "Katie Slater"}
          </h1>
          <p style={{
            fontSize: "11px",
            fontWeight: "600",
            letterSpacing: "0.1em",
            color: "#fbc4b6",
            textTransform: "uppercase",
            marginTop: "6px"
          }}>
            {data.basics.title || "Digital Marketing"}
          </p>
          <div style={{
            width: "50px",
            height: "2.5px",
            backgroundColor: "#fbc4b6",
            marginTop: "16px"
          }} />
        </div>

        {/* WHO AM I Section */}
        <div>
          <h3 style={{
            fontSize: "13px",
            fontWeight: "800",
            letterSpacing: "0.05em",
            color: "#0f172a",
            textTransform: "uppercase"
          }}>
            Who Am I
          </h3>
          <p style={{
            fontSize: "10.5px",
            lineHeight: "1.6",
            color: "#475569",
            marginTop: "10px",
            textAlign: "justify"
          }}>
            {data.basics.summary || "A highly motivated and strategic professional with extensive background in building systems, driving growth, and leading successful teams."}
          </p>
        </div>

        {/* SKILLS Section */}
        <div>
          <h3 style={{
            fontSize: "13px",
            fontWeight: "800",
            letterSpacing: "0.05em",
            color: "#0f172a",
            textTransform: "uppercase"
          }}>
            Skills
          </h3>
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {skillsToRender.map((skill, index) => (
              <div key={index}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: "600", color: "#475569" }}>
                  <span>{skill.name}</span>
                </div>
                <div style={{
                  height: "8px",
                  backgroundColor: "#e2e8f0",
                  borderRadius: "4px",
                  marginTop: "4px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: `${skill.level}%`,
                    height: "100%",
                    backgroundColor: "#fbc4b6",
                    borderRadius: "4px"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT Section */}
        <div>
          <h3 style={{
            fontSize: "13px",
            fontWeight: "800",
            letterSpacing: "0.05em",
            color: "#0f172a",
            textTransform: "uppercase"
          }}>
            Contact
          </h3>
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "10px", color: "#475569" }}>
            {/* Phone */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg style={{ width: "12px", height: "12px", fill: "currentColor" }} viewBox="0 0 24 24">
                <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z" />
              </svg>
              <span>{data.basics.phone || "+03 123 456 789"}</span>
            </div>
            {/* Email */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg style={{ width: "12px", height: "12px", fill: "currentColor" }} viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span style={{ wordBreak: "break-all" }}>{data.basics.email || "yourname@domain.com"}</span>
            </div>
            {/* Website */}
            {(data.basics as any).url && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg style={{ width: "12px", height: "12px", fill: "none", stroke: "currentColor", strokeWidth: 2 }} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>{(data.basics as any).url}</span>
              </div>
            )}
            {/* Location */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg style={{ width: "12px", height: "12px", fill: "currentColor" }} viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>
                {data.basics.location 
                  ? [
                      (data.basics.location as any).address,
                      (data.basics.location as any).city,
                      (data.basics.location as any).country
                    ].filter(Boolean).join(", ") 
                  : "3553 Blackwell Street, Taksokk"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Right Main Column (Cover Letter Text Area) */}
      <div style={{
        position: "absolute",
        left: "290px",
        top: 0,
        width: "530px",
        height: "1160px",
        backgroundColor: "#ffffff",
        padding: "240px 44px 40px 44px",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Recipient Details & Date Header Block */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          fontSize: "11px",
          color: "#475569",
          marginTop: "16px"
        }}>
          {/* Recipient details (left aligned) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontWeight: "700", color: "#1e293b" }}>
              {clCompany ? `Hiring Team at ${clCompany}` : "Hiring Manager"}
            </span>
            <span>{clRole || "Senior Manager"}</span>
            <span>{clCompany || "Target Company"}</span>
            {clCompany && <span style={{ opacity: 0.8 }}>Corporate Office</span>}
          </div>
          {/* Date (right aligned) */}
          <span style={{ fontWeight: "700", color: "#1e293b" }}>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Salutation */}
        <div style={{
          fontSize: "13px",
          fontWeight: "700",
          color: "#0f172a",
          marginTop: "32px",
          marginBottom: "16px"
        }}>
          Dear {clCompany ? `${clCompany} Team` : "Hiring Manager"},
        </div>

        {/* Cover Letter Body Text */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "14px"
        }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{
              fontSize: "11px",
              lineHeight: "1.65",
              color: "#334155",
              textAlign: "justify",
              margin: 0
            }}>
              {p}
            </p>
          ))}
        </div>

        {/* Signature & Sign-off Section */}
        <div style={{
          marginTop: "auto",
          paddingTop: "20px",
          borderTop: "1px solid #f1f5f9"
        }}>
          <span style={{ fontSize: "11px", color: "#475569" }}>Sincerely Yours,</span>
          {/* Renders uploaded digital signature image only if present, hiding dummy signature entirely */}
          {clSignature ? (
            <div style={{ margin: "6px 0", display: "block" }}>
              <img src={clSignature} alt="Signature" style={{ maxHeight: "40px", maxWidth: "160px", objectFit: "contain" }} />
            </div>
          ) : (
            <div style={{ height: "20px" }} />
          )}
          {/* Name and Professional Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#1e293b" }}>
              {data.basics.name || "Katie Slater"}
            </span>
            <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "500" }}>
              {data.basics.title || "Digital Marketing"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResponsivePreview({ template, data, clText, clCompany, clRole, clSignature }: { template: string; data: ResumeData; clText?: string; clCompany?: string; clRole?: string; clSignature?: string }) {
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
      setHeight(content.offsetHeight * s);
    });

    ro.observe(el);
    ro.observe(content);
    return () => ro.disconnect();
  }, [data, template]);

  return (
    <div ref={wrapRef} className="w-full space-y-8 pb-10">
      {/* Page 1: Resume */}
      <div 
        className="mx-auto shadow-elegant bg-white overflow-hidden transition-all duration-300 rounded-md" 
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
            minHeight: "1160px" 
          }}
        >
          <ResumePreview template={template} data={data} />
        </div>
      </div>

      {/* Page 2: Cover Letter (Only if generated and contains text!) */}
      {clText && clText.trim().length > 0 && (
        <div 
          className="mx-auto shadow-elegant bg-white overflow-hidden transition-all duration-300 rounded-md animate-in fade-in zoom-in-95 duration-500" 
          style={{ 
            width: 820 * scale, 
            height: 1160 * scale
          }}
        >
          <div
            id="cover-letter-preview-node"
            style={{ 
              width: 820, 
              height: 1160,
              transform: `scale(${scale})`, 
              transformOrigin: "top left",
              position: "relative"
            }}
          >
            <CoverLetterPagePreview data={data} clText={clText} clCompany={clCompany} clRole={clRole} clSignature={clSignature} />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs capitalize text-muted-foreground font-medium">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-11 text-base sm:text-sm rounded-md" />
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
    <div className="rounded-xl border bg-secondary/20 p-3 space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground">Profile Photo (optional)</Label>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-background border-2 border-dashed border-accent/30 overflow-hidden shrink-0 shadow-sm">
          {value
            ? <img src={value} alt="Profile" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex flex-col items-center justify-center text-[9px] text-muted-foreground gap-0.5"><User className="h-5 w-5 opacity-30" /><span>No photo</span></div>
          }
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="flex-1">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            <span className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background text-xs font-medium cursor-pointer hover:bg-accent/10 transition-colors active:scale-95">
              {value ? "Change Photo" : "Upload Photo"}
            </span>
          </label>
          {value && (
            <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:bg-destructive/10" onClick={() => onChange(undefined)}>
              Remove Photo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
