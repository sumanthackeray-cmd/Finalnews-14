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
import { MockInterviewSimulator } from "@/components/resume/MockInterviewSimulator";
import { AIResumeWizard } from "@/components/resume/AIResumeWizard";
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

async function downloadBlob(blob: Blob, filename: string, userId?: string) {
  try {
    const reader = new FileReader();
    const base64: string = await new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Gold Standard Form-Iframe POST download: Completely bypasses client-side Object URLs
    // and is 100% immune to IDM/Antivirus/Chrome sandbox UUID renaming bugs!
    let iframe = document.getElementById("download-iframe") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "download-iframe";
      iframe.name = "download-iframe";
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/download";
    form.target = "download-iframe";
    form.style.display = "none";

    const base64Input = document.createElement("input");
    base64Input.type = "hidden";
    base64Input.name = "base64";
    base64Input.value = base64;
    form.appendChild(base64Input);

    const filenameInput = document.createElement("input");
    filenameInput.type = "hidden";
    filenameInput.name = "filename";
    filenameInput.value = filename;
    form.appendChild(filenameInput);

    const mimeInput = document.createElement("input");
    mimeInput.type = "hidden";
    mimeInput.name = "mimeType";
    mimeInput.value = blob.type;
    form.appendChild(mimeInput);

    if (userId) {
      const userInput = document.createElement("input");
      userInput.type = "hidden";
      userInput.name = "userId";
      userInput.value = userId;
      form.appendChild(userInput);
    }

    document.body.appendChild(form);
    form.submit();

    // Clean up the temporary form element
    setTimeout(() => {
      if (document.body.contains(form)) {
        document.body.removeChild(form);
      }
    }, 2000);

    // Track download count and logs in Firestore
    if (userId) {
      const { doc, updateDoc, setDoc, collection, increment } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        downloadCount: increment(1),
        lastDownloadAt: new Date().toISOString()
      }).catch(err => console.error("[Download Track Error]:", err));

      const logRef = doc(collection(db, "download_logs"));
      await setDoc(logRef, {
        userId,
        filename,
        fileType: filename.endsWith(".pdf") ? "pdf" : "docx",
        downloadedAt: new Date().toISOString()
      }).catch(err => console.error("[Download Log Error]:", err));
    }
  } catch (e: any) {
    console.error("Vercel download API fallback:", e);
    // Legacy client-side fallback as absolute last resort
    const typedBlob = new Blob([blob], { type: blob.type || "application/octet-stream" });
    const url = URL.createObjectURL(typedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 2000);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 30000);
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
  const [showAIWizard, setShowAIWizard] = useState(false);

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
    let prevTransform = "";
    let restoreImages = () => {};
    try {
      const node = document.getElementById("cover-letter-preview-node");
      if (!node) {
        throw new Error("Please generate a cover letter first to view and download it.");
      }

      // Reset on-screen scale so the export captures at full 820px width
      prevTransform = node.style.transform;
      node.style.transform = "none";

      // Hide all invalid photos before canvas render
      restoreImages = await sanitizeImagesForExport(node);

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: 820,
        height: 1160,
        logging: false,
      });

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const imgData = canvas.toDataURL("image/jpeg", 0.96);
      pdf.addImage(imgData, "JPEG", 0, 0, 595.28, 841.89);

      const clFilename = `cover-letter-${(clCompany || title || "resume").toLowerCase().replace(/[^a-z0-9\-_\s]/gi, "").trim().replace(/\s+/g, "-")}.pdf`;
      pdf.save(clFilename);

      // Fire-and-forget download tracking
      if (user?.uid) {
        Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase"),
        ]).then(async ([{ doc, updateDoc, setDoc, collection, increment }, { db }]) => {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            downloadCount: increment(1),
            lastDownloadAt: new Date().toISOString()
          }).catch(() => {});
        }).catch(() => {});
      }

      toast.success("Cover letter PDF downloaded!");
    } catch (error: any) {
      console.error("Cover letter PDF export error:", error);
      toast.error(error.message || "Failed to download cover letter PDF");
    } finally {
      const node = document.getElementById("cover-letter-preview-node");
      if (node && prevTransform) {
        node.style.transform = prevTransform;
      }
      restoreImages();
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
    let prevTransform = "";
    let restoreImages = () => {};
    try {
      const node = document.getElementById("cover-letter-preview-node");
      if (!node) {
        throw new Error("Please generate a cover letter first to view and download it.");
      }

      // Reset on-screen scale so the export captures at full 820px width
      prevTransform = node.style.transform;
      node.style.transform = "none";

      // Hide all invalid photos before canvas render
      restoreImages = await sanitizeImagesForExport(node);

      const [{ default: html2canvas }, { Document, Packer, Paragraph, ImageRun }, { saveAs }] = await Promise.all([
        import("html2canvas-pro"),
        import("docx"),
        import("file-saver"),
      ]);

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: 820,
        height: 1160,
        logging: false,
      });

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
      await downloadBlob(docxBlob, `cover-letter-${(clCompany || title || "resume").toLowerCase().replace(/\s+/g, "-")}.docx`, user?.uid);
      toast.success("Cover letter Word document downloaded!");
    } catch (error: any) {
      console.error("Cover letter Word export error:", error);
      toast.error(error.message || "Failed to download cover letter as Word");
    } finally {
      const node = document.getElementById("cover-letter-preview-node");
      if (node && prevTransform) {
        node.style.transform = prevTransform;
      }
      restoreImages();
      setExporting(false);
    }
  };

  /**
   * Sanitize all <img> elements inside the resume preview node before html2canvas renders.
   * This prevents canvas taint (which produces invalid PNG data URLs that jsPDF rejects).
   * Returns a cleanup function that restores all original src attributes.
   */
  const sanitizeImagesForExport = async (node: HTMLElement): Promise<(() => void)> => {
    const imgEls = Array.from(node.querySelectorAll<HTMLImageElement>("img"));
    const origSrcs: string[] = imgEls.map((img) => img.src);

    const blankGif = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    for (let i = 0; i < imgEls.length; i++) {
      const img = imgEls[i];

      // If image is not complete or naturalWidth is 0 (broken/loading), replace it
      if (img.src && !img.complete && img.naturalWidth === 0) {
        img.src = blankGif;
        continue;
      }
      // If the image source is not a valid photo, replace it
      if (!isValidPhoto(img.src)) {
        img.src = blankGif;
        continue;
      }
      // If it's an external URL (not a data: URL), convert cross-origin images to base64
      // to avoid canvas taint, falling back to blank gif if CORS is not allowed by the server.
      if (img.src && !img.src.startsWith("data:") && !img.src.startsWith("blob:")) {
        try {
          const res = await fetch(img.src, { mode: "cors", cache: "no-cache" });
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const blob = await res.blob();
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          img.src = base64;
        } catch (err) {
          console.warn("Failed to fetch cross-origin image with CORS, using blank fallback to prevent taint:", err);
          img.src = blankGif;
        }
      }
    }

    return () => {
      imgEls.forEach((img, i) => {
        img.src = origSrcs[i];
      });
    };
  };

  const renderCanvas = async () => {
    const node = previewRef.current?.querySelector<HTMLElement>("[data-resume-page]");
    if (!node) throw new Error("Preview not ready");
    const { default: html2canvas } = await import("html2canvas-pro");

    // Reset on-screen scale so export captures at full 820px width
    const prevTransform = node.style.transform;
    const prevWidth = node.style.width;
    node.style.transform = "none";
    node.style.width = "820px"; // Explicitly lock width — prevents mobile columns collapsing

    // Sanitize cross-origin / broken images to prevent canvas taint
    const restoreImages = await sanitizeImagesForExport(node);

    try {
      // Wait for custom Google Fonts to fully load
      await document.fonts.ready;
      // Extra 500ms buffer for late-loading fonts and images
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        width: 820,
        windowWidth: 820,   // KEY FIX: prevents responsive CSS from collapsing columns
        scrollX: 0,
        scrollY: 0,
        logging: false,
        onclone: (clonedDoc) => {
          const cloned = clonedDoc.querySelector("[data-resume-page]") as HTMLElement;
          if (!cloned) return;

          // Lock width in clone too
          cloned.style.width = "820px";
          cloned.style.transform = "none";
          cloned.style.webkitPrintColorAdjust = "exact";
          cloned.style.printColorAdjust = "exact";
          cloned.style.colorAdjust = "exact";

          // Copy ALL computed styles — background colors, fonts, colors
          const allElements = cloned.querySelectorAll("*");
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const computed = window.getComputedStyle(htmlEl);

            if (computed.backgroundColor && computed.backgroundColor !== "rgba(0, 0, 0, 0)" && computed.backgroundColor !== "transparent") {
              htmlEl.style.backgroundColor = computed.backgroundColor;
            }
            if (computed.color) htmlEl.style.color = computed.color;
            if (computed.fontFamily) htmlEl.style.fontFamily = computed.fontFamily;
            if (computed.fontSize) htmlEl.style.fontSize = computed.fontSize;
            if (computed.fontWeight) htmlEl.style.fontWeight = computed.fontWeight;
            if (computed.lineHeight) htmlEl.style.lineHeight = computed.lineHeight;

            htmlEl.style.webkitPrintColorAdjust = "exact";
            htmlEl.style.printColorAdjust = "exact";
            htmlEl.style.colorAdjust = "exact";
          });

          // Explicitly force sidebar background (golden/colored sidebars)
          const sidebar = cloned.querySelector('.resume-sidebar, [class*="sidebar"], [class*="right-panel"]') as HTMLElement;
          if (sidebar) {
            const bg = window.getComputedStyle(sidebar).backgroundColor;
            sidebar.style.backgroundColor = bg;
            sidebar.style.webkitPrintColorAdjust = "exact";
          }

          // Force skill/progress bars
          cloned.querySelectorAll('[class*="skill"], [class*="progress"], [class*="bar"]').forEach((bar) => {
            (bar as HTMLElement).style.webkitPrintColorAdjust = "exact";
            (bar as HTMLElement).style.printColorAdjust = "exact";
          });
        }
      });
      return canvas;
    } finally {
      node.style.transform = prevTransform;
      node.style.width = prevWidth;
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
    let clRestoreImages = () => {};
    let clPrevTransform = "";
    const clNode = clText ? document.getElementById("cover-letter-preview-node") : null;

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas-pro");
      
      const canvas = await renderCanvas();

      // Render cover letter canvas if available
      let clCanvas = null;
      if (clNode) {
        clPrevTransform = clNode.style.transform;
        clNode.style.transform = "none";
        clRestoreImages = await sanitizeImagesForExport(clNode);
        
        // Ensure all custom fonts are ready
        await document.fonts.ready;

        clCanvas = await html2canvas(clNode, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          width: 820,
          height: 1160,
          logging: false,
          onclone: (clonedDoc) => {
            const cloned = clonedDoc.getElementById("cover-letter-preview-node") as HTMLElement;
            if (!cloned) return;

            cloned.style.webkitPrintColorAdjust = "exact";
            cloned.style.printColorAdjust = "exact";
            cloned.style.colorAdjust = "exact";

            const allElements = cloned.querySelectorAll("*");
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const computed = window.getComputedStyle(htmlEl);

              if (computed.backgroundColor && computed.backgroundColor !== "rgba(0, 0, 0, 0)" && computed.backgroundColor !== "transparent") {
                htmlEl.style.backgroundColor = computed.backgroundColor;
              }
              if (computed.color) {
                htmlEl.style.color = computed.color;
              }
              if (computed.fontFamily) {
                htmlEl.style.fontFamily = computed.fontFamily;
              }
              if (computed.fontSize) {
                htmlEl.style.fontSize = computed.fontSize;
              }
              if (computed.fontWeight) {
                htmlEl.style.fontWeight = computed.fontWeight;
              }
              htmlEl.style.webkitPrintColorAdjust = "exact";
              htmlEl.style.printColorAdjust = "exact";
              htmlEl.style.colorAdjust = "exact";
            });
          }
        });
      }

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

      // Smart A4 Auto-Fit: If the resume only overflows slightly (up to 25% beyond a single A4 page),
      // scale it proportionally to fit 100% perfectly on a single A4 page!
      const maxCanvasHeightForSinglePage = canvas.width * (pageH / pageW) * 1.25;

      if (imgH <= pageH || canvas.height <= maxCanvasHeightForSinglePage) {
        // Single page — fits perfectly
        pdf.addImage(imgDataUrl, "JPEG", 0, 0, pageW, pageH);
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
          pdf.addImage(sliceData, "JPEG", 0, 0, pageW, pageH);
          yPos += pageCanvasH;
        }
      }

      // Append Cover Letter as 2nd page if available
      if (clCanvas) {
        const clImgDataUrl = clCanvas.toDataURL("image/jpeg", 0.97);
        pdf.addPage();
        pdf.addImage(clImgDataUrl, "JPEG", 0, 0, pageW, pageH);
      }

      // Use pdf.save() directly — jsPDF sets the 'download' attribute on the anchor
      // which IDM and all download managers respect → correct filename, not a UUID
      const safeFilename = `${(data.basics.name || title || "resume").replace(/[^a-z0-9\-_\s]/gi, "").trim().replace(/\s+/g, "-") || "resume"}.pdf`;
      pdf.save(safeFilename);

      // Fire-and-forget download tracking (does not block UI)
      if (user?.uid) {
        Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase"),
        ]).then(async ([{ doc, updateDoc, setDoc, collection, increment }, { db }]) => {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            downloadCount: increment(1),
            lastDownloadAt: new Date().toISOString()
          }).catch(() => {});
          const logRef = doc(collection(db, "download_logs"));
          await setDoc(logRef, {
            userId: user.uid,
            filename: safeFilename,
            fileType: "pdf",
            downloadedAt: new Date().toISOString()
          }).catch(() => {});
        }).catch(() => {});
      }

      if (clCanvas) {
        toast.success("Resume + Cover Letter PDF downloaded!");
      } else {
        toast.success("PDF downloaded successfully!");
      }
    } catch (e: any) {
      console.error("[PDF Export Error]:", e);
      toast.error("Export failed: " + (e.message ?? "Unknown error"), {
        description: "Try removing your profile photo and re-downloading.",
      });
    } finally {
      if (clNode) {
        if (clPrevTransform) clNode.style.transform = clPrevTransform;
        clRestoreImages();
      }
      setExporting(false);
    }
  };

  const exportDOCX = async () => {
    // DOCX download requires an active plan
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
    let clRestoreImages = () => {};
    let clPrevTransform = "";
    const clNode = clText ? document.getElementById("cover-letter-preview-node") : null;

    try {
      const { Document, Packer, Paragraph, ImageRun } = await import("docx");
      const { default: html2canvas } = await import("html2canvas-pro");

      // Screenshot the rendered template at full 820px resolution — pixel-perfect visual fidelity
      const canvas = await renderCanvas();

      // Convert to JPEG blob for maximum quality
      const imgBlob: Blob = await new Promise((res, rej) =>
        canvas.toBlob(
          (b) => (b ? res(b) : rej(new Error("Canvas toBlob failed"))),
          "image/jpeg",
          0.97,
        ),
      );
      const imgBuf = await imgBlob.arrayBuffer();

      // Handle cover letter canvas if available
      let clBuf = null;
      if (clNode) {
        clPrevTransform = clNode.style.transform;
        clNode.style.transform = "none";
        clRestoreImages = await sanitizeImagesForExport(clNode);
        const clCanvas = await html2canvas(clNode, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          width: 820,
          height: 1160,
          logging: false,
        });

        const clBlob: Blob = await new Promise((res, rej) =>
          clCanvas.toBlob(
            (b) => (b ? res(b) : rej(new Error("Cover letter canvas failed"))),
            "image/jpeg",
            0.97,
          ),
        );
        clBuf = await clBlob.arrayBuffer();
      }

      // A4 in EMUs: 9906000 wide × 14031360 tall (portrait)
      const emuW = 9144000; // ~10.16 cm inside margins ≈ full-width at 1-inch margins
      const emuH = Math.round((canvas.height / canvas.width) * emuW);

      const sections = [
        {
          properties: {},
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0 },
              children: [
                new ImageRun({
                  type: "jpg",
                  data: imgBuf,
                  transformation: { width: Math.round(emuW / 9144), height: Math.round(emuH / 9144) },
                } as any),
              ],
            }),
          ],
        }
      ];

      // Add cover letter as page 2 if buffer exists
      if (clBuf) {
        sections.push({
          properties: {},
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0 },
              children: [
                new ImageRun({
                  type: "jpg",
                  data: clBuf,
                  transformation: { width: Math.round(emuW / 9144), height: Math.round(emuH / 9144) },
                } as any),
              ],
            }),
          ],
        });
      }

      const doc = new Document({ sections });
      const docxBlob = await Packer.toBlob(doc);
      await downloadBlob(docxBlob, `${title || "resume"}.docx`, user?.uid);
      
      if (clBuf) {
        toast.success("Word document (Resume + Cover Letter) downloaded successfully!");
      } else {
        toast.success("Word document downloaded — exact template design preserved!");
      }
    } catch (e: any) {
      console.error("[DOCX Export Error]:", e);
      toast.error(e.message ?? "DOCX export failed");
    } finally {
      if (clNode) {
        if (clPrevTransform) clNode.style.transform = clPrevTransform;
        clRestoreImages();
      }
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
                    className="h-auto py-2 px-2.5 flex-col items-start gap-1 text-left border-accent/30 hover:border-accent hover:bg-accent/10 transition-all group animate-pulse border-purple-500/40"
                    onClick={() => setShowAIWizard(true)}
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-foreground">AI Autopilot</span>
                    </div>
                    <span className="text-[9.5px] text-muted-foreground leading-tight">AI guides &amp; drafts your best resume</span>
                  </Button>
                  {/* Interview Coach */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-auto py-2 px-2.5 flex-col items-start gap-1 text-left border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 transition-all group"
                    onClick={() => setShowInterviewCoach(true)}
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      <Star className="h-3.5 w-3.5 text-purple-500 shrink-0" />
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
                      <Button size="sm" variant="ink" className="h-10 text-xs col-span-2" onClick={downloadCoverLetterPdf}>
                        <FileDown className="h-3.5 w-3.5 mr-1.5" />Download PDF
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

      <MockInterviewSimulator
        isOpen={showInterviewCoach}
        onClose={() => setShowInterviewCoach(false)}
        resumeData={data}
        user={user}
      />

      <AIResumeWizard
        isOpen={showAIWizard}
        onClose={() => setShowAIWizard(false)}
        onComplete={(completedData, selectedTemplateId) => {
          // Automatically set selected design template
          setTemplate(selectedTemplateId);

          // Prefill custom Cover Letter details if generated
          if (completedData.coverLetterText) {
            setClText(completedData.coverLetterText);
            setClCompany(completedData.experience?.[0]?.company || "");
            setClRole(completedData.basics?.title || "");
          }

          // Populate fields
          if (completedData.basics) {
            update("basics", { ...data.basics, ...completedData.basics });
          }
          if (completedData.skills) {
            update("skills", completedData.skills);
          }
          if (completedData.hobbies) {
            update("hobbies", completedData.hobbies);
          }
          if (completedData.experience) {
            update("experience", completedData.experience);
          }
          if (completedData.projects) {
            update("projects", completedData.projects);
          }
          if (completedData.education) {
            update("education", completedData.education);
          }
        }}
        initialData={data}
      />
    </div>
  );
}

function CoverLetterPagePreview({ template = "slater", data, clText, clCompany, clRole, clSignature }: { template?: string; data: ResumeData; clText: string; clCompany?: string; clRole?: string; clSignature?: string }) {
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

  // Dynamic A4 Page Spacing & Typography Auto-Fit calculation based on text length
  const totalLength = clText.length;
  let letterFontSize = "11.5px";
  let letterLineHeight = "1.65";
  let letterGap = "14px";
  let letterMarginTop = "40px";
  let letterGreetingMargin = "10px 0 5px 0";
  let classicPadding = "60px 70px";
  let modernPadding = "60px 65px";
  let splitPaddingSide = "80px 40px 40px 40px";
  let splitPaddingSidebar = "80px 24px 40px 24px";
  let averyPadding = "50px 60px";

  if (totalLength > 1800) {
    letterFontSize = "9.5px";
    letterLineHeight = "1.35";
    letterGap = "8px";
    letterMarginTop = "15px";
    letterGreetingMargin = "4px 0 2px 0";
    classicPadding = "35px 50px";
    modernPadding = "35px 50px";
    splitPaddingSide = "45px 30px 30px 30px";
    splitPaddingSidebar = "45px 20px 20px 20px";
    averyPadding = "30px 45px";
  } else if (totalLength > 1400) {
    letterFontSize = "10px";
    letterLineHeight = "1.45";
    letterGap = "10px";
    letterMarginTop = "20px";
    letterGreetingMargin = "6px 0 3px 0";
    classicPadding = "45px 60px";
    modernPadding = "45px 55px";
    splitPaddingSide = "55px 35px 35px 35px";
    splitPaddingSidebar = "55px 22px 30px 22px";
    averyPadding = "35px 50px";
  } else if (totalLength > 1000) {
    letterFontSize = "10.5px";
    letterLineHeight = "1.55";
    letterGap = "12px";
    letterMarginTop = "30px";
    letterGreetingMargin = "8px 0 4px 0";
    classicPadding = "50px 65px";
    modernPadding = "50px 60px";
    splitPaddingSide = "70px 40px 40px 40px";
    splitPaddingSidebar = "70px 24px 35px 24px";
    averyPadding = "42px 55px";
  }

  if (template === "classic") {
    return (
      <div style={{
        width: "820px",
        height: "1160px",
        backgroundColor: "#ffffff",
        padding: classicPadding,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Times New Roman', Times, serif",
        color: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}>
        {/* Header (Classic Centered) */}
        <header style={{ textAlign: "center", borderBottom: "1px solid #1a1a1a", paddingBottom: "12px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
            {data.basics.name || "Your Name"}
          </h1>
          <p style={{ fontSize: "13px", fontStyle: "italic", color: "#444", marginTop: "4px", margin: 0 }}>
            {data.basics.title || "Career Professional"}
          </p>
          <p style={{ fontSize: "10.5px", color: "#555", marginTop: "8px", margin: 0 }}>
            {[data.basics.email, data.basics.phone, data.basics.location, data.basics.website].filter(Boolean).join("  •  ")}
          </p>
        </header>

        {/* Content */}
        <div style={{ flex: 1, marginTop: letterMarginTop, display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Date & Recipient */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: letterFontSize, color: "#333" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontWeight: "700" }}>{clCompany ? `Hiring Team at ${clCompany}` : "Hiring Manager"}</span>
              <span>{clRole || "Senior Manager"}</span>
              <span>{clCompany || "Target Company"}</span>
            </div>
            <span style={{ fontWeight: "700" }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>

          {/* Greeting */}
          <p style={{ fontSize: parseFloat(letterFontSize) + 1 + "px", fontWeight: "700", margin: letterGreetingMargin }}>
            Dear {clCompany ? `${clCompany} Team` : "Hiring Manager"},
          </p>

          {/* Letter Body */}
          <div style={{ display: "flex", flexDirection: "column", gap: letterGap }}>
            {paragraphs.map((p, i) => (
              <p key={i} style={{ fontSize: letterFontSize, lineHeight: letterLineHeight, textAlign: "justify", margin: 0 }}>
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Closing & Signature */}
        <footer style={{ borderTop: "1px solid #1a1a1a", paddingTop: "15px", marginTop: "20px" }}>
          <p style={{ fontSize: letterFontSize, margin: 0 }}>Sincerely yours,</p>
          {clSignature ? (
            <img src={clSignature} alt="Signature" style={{ maxHeight: "40px", maxWidth: "160px", margin: "6px 0", objectFit: "contain" }} />
          ) : (
            <div style={{ height: "24px" }} />
          )}
          <p style={{ fontSize: "12px", fontWeight: "700", margin: 0 }}>{data.basics.name}</p>
          <p style={{ fontSize: "10px", color: "#666", margin: 0 }}>{data.basics.title}</p>
        </footer>
      </div>
    );
  }

  if (template === "modern" || template === "minimal") {
    const isMin = template === "minimal";
    return (
      <div style={{
        width: "820px",
        height: "1160px",
        backgroundColor: "#ffffff",
        padding: isMin ? "70px 80px" : modernPadding,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        color: "#111",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}>
        {/* Header */}
        <header style={{ borderBottom: isMin ? "none" : "2px solid #111", paddingBottom: isMin ? "0" : "16px" }}>
          <h1 style={{ 
            fontSize: isMin ? "38px" : "32px", 
            fontWeight: isMin ? "300" : "800", 
            letterSpacing: "-0.5px",
            fontFamily: "'Fraunces', Georgia, serif",
            margin: 0 
          }}>
            {data.basics.name || "Your Name"}
          </h1>
          <p style={{ fontSize: "13px", color: "#444", marginTop: "4px", margin: 0 }}>
            {data.basics.title}
          </p>
          <div style={{ display: "flex", gap: "16px", marginTop: "12px", fontSize: "10.5px", color: "#555" }}>
            {data.basics.email && <span>{data.basics.email}</span>}
            {data.basics.phone && <span>· {data.basics.phone}</span>}
            {data.basics.location && <span>· {data.basics.location}</span>}
            {data.basics.website && <span>· {data.basics.website}</span>}
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, marginTop: isMin ? "40px" : letterMarginTop, display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Recipient & Date */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: letterFontSize, color: "#555" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontWeight: "700", color: "#111" }}>{clCompany ? `Hiring Team at ${clCompany}` : "Hiring Manager"}</span>
              <span>{clRole || "Senior Manager"}</span>
              <span>{clCompany || "Target Company"}</span>
            </div>
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <p style={{ fontSize: parseFloat(letterFontSize) + 1.5 + "px", fontWeight: "700", color: "#111", margin: "10px 0 0 0" }}>
            Dear {clCompany ? `${clCompany} Team` : "Hiring Manager"},
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: letterGap }}>
            {paragraphs.map((p, i) => (
              <p key={i} style={{ fontSize: letterFontSize, lineHeight: letterLineHeight, color: "#222", textAlign: "justify", margin: 0 }}>
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ borderTop: "1.5px solid #eaeaea", paddingTop: "20px" }}>
          <p style={{ fontSize: letterFontSize, color: "#666", margin: 0 }}>Sincerely,</p>
          {clSignature ? (
            <img src={clSignature} alt="Signature" style={{ maxHeight: "36px", maxWidth: "150px", margin: "8px 0", objectFit: "contain" }} />
          ) : (
            <div style={{ height: "24px" }} />
          )}
          <p style={{ fontSize: "12px", fontWeight: "700", margin: 0 }}>{data.basics.name}</p>
          <p style={{ fontSize: "10px", color: "#666", margin: 0 }}>{data.basics.title}</p>
        </footer>
      </div>
    );
  }

  // Split-screen Layout Templates
  let sidebarBg = "#f4f5f7";
  let sidebarWidth = "290px";
  let mainWidth = "530px";
  let leftColIsSidebar = true;
  let fontTheme = "'Inter', sans-serif";
  let accentColor = "#fbc4b6";
  let darkColor = "#1e293b";
  let accentText = "#fbc4b6";
  let textOnSidebar = "#475569";
  let isSplit = true;

  if (template === "creative") {
    sidebarBg = "#1a1a2e";
    textOnSidebar = "rgba(255,255,255,0.75)";
    accentColor = "#ff7e5f";
    accentText = "#ff7e5f";
    darkColor = "#ffffff";
  } else if (template === "designer") {
    sidebarBg = "#fbf3ec"; // CREAM
    accentColor = "#c89679"; // TAN
    darkColor = "#3a2418"; // DARK BROWN
    accentText = "#c89679";
    textOnSidebar = "#3a2418";
  } else if (template === "watson") {
    sidebarBg = "#3b4cb6";
    textOnSidebar = "rgba(255,255,255,0.85)";
    accentColor = "#a7b1e8";
    accentText = "#3b4cb6";
    darkColor = "#ffffff";
  } else if (template === "turquoise") {
    sidebarBg = "#3ba7c4";
    textOnSidebar = "rgba(255,255,255,0.9)";
    accentColor = "#ffffff";
    accentText = "#1c6075";
    darkColor = "#ffffff";
  } else if (template === "sophia") {
    leftColIsSidebar = false;
    sidebarBg = "#d9b84a"; // MUSTARD
    accentColor = "#d9b84a";
    accentText = "#d9b84a";
    darkColor = "#ffffff";
    textOnSidebar = "rgba(255,255,255,0.9)";
    sidebarWidth = "285px";
    mainWidth = "535px";
  } else if (template === "saurabh") {
    leftColIsSidebar = false;
    sidebarBg = "#46a2c1"; // OCEAN BLUE
    accentColor = "#46a2c1";
    accentText = "#1c6075";
    darkColor = "#ffffff";
    textOnSidebar = "rgba(255,255,255,0.9)";
    sidebarWidth = "295px";
    mainWidth = "525px";
  } else if (template === "avery") {
    isSplit = false;
  }

  if (isSplit) {
    const sidebarJSX = (
      <div style={{
        width: sidebarWidth,
        height: "1160px",
        backgroundColor: sidebarBg,
        padding: splitPaddingSidebar,
        display: "flex",
        flexDirection: "column",
        gap: "28px",
        color: textOnSidebar,
        fontFamily: fontTheme
      }}>
        {/* Photo Container */}
        <div style={{
          width: "140px",
          height: "140px",
          borderRadius: template === "designer" || template === "saurabh" ? "8px" : "50%",
          border: `5px solid ${accentColor}`,
          boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
          overflow: "hidden",
          margin: "0 auto 10px auto",
          backgroundColor: "#ffffff",
          flexShrink: 0
        }}>
          {isValidPhoto(data.basics.photo) ? (
            <img src={data.basics.photo} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400 font-bold text-[10px] uppercase">
              PHOTO
            </div>
          )}
        </div>

        {/* Name and Professional Title */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontSize: "20px",
            fontWeight: "800",
            letterSpacing: "0.03em",
            color: darkColor,
            textTransform: "uppercase",
            lineHeight: "1.25",
            margin: 0
          }}>
            {data.basics.name || "Katie Slater"}
          </h1>
          <p style={{
            fontSize: "11px",
            fontWeight: "600",
            letterSpacing: "0.1em",
            color: template === "creative" || template === "designer" ? accentColor : (template === "watson" ? "#a7b1e8" : darkColor),
            textTransform: "uppercase",
            marginTop: "6px",
            margin: 0
          }}>
            {data.basics.title || "Digital Marketing"}
          </p>
          <div style={{
            width: "40px",
            height: "2px",
            backgroundColor: accentColor,
            margin: "12px auto 0 auto"
          }} />
        </div>

        {/* Info Block */}
        <div>
          <h3 style={{
            fontSize: "12px",
            fontWeight: "800",
            letterSpacing: "0.05em",
            color: darkColor,
            textTransform: "uppercase",
            margin: "0 0 10px 0"
          }}>
            Contact Info
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "10.5px" }}>
            {data.basics.phone && <p style={{ margin: 0 }}>☎ &nbsp; {data.basics.phone}</p>}
            {data.basics.email && <p style={{ margin: 0, wordBreak: "break-all" }}>✉ &nbsp; {data.basics.email}</p>}
            {data.basics.location && <p style={{ margin: 0 }}>📍 &nbsp; {data.basics.location}</p>}
          </div>
        </div>

        {/* Skills Block */}
        <div>
          <h3 style={{
            fontSize: "12px",
            fontWeight: "800",
            letterSpacing: "0.05em",
            color: darkColor,
            textTransform: "uppercase",
            margin: "0 0 10px 0"
          }}>
            Key Skills
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {skillsToRender.map((s, idx) => (
              <div key={idx}>
                <span style={{ fontSize: "10px", fontWeight: "600" }}>{s.name}</span>
                <div style={{ height: "4px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "2px", marginTop: "3px" }}>
                  <div style={{ width: `${s.level}%`, height: "100%", backgroundColor: accentColor, borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    const mainJSX = (
      <div style={{
        width: mainWidth,
        height: "1160px",
        backgroundColor: "#ffffff",
        padding: splitPaddingSide,
        display: "flex",
        flexDirection: "column",
        fontFamily: fontTheme
      }}>
        {/* Recipient details */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          fontSize: letterFontSize,
          color: "#475569",
          marginTop: "16px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontWeight: "700", color: "#1e293b" }}>
              {clCompany ? `Hiring Team at ${clCompany}` : "Hiring Manager"}
            </span>
            <span>{clRole || "Senior Manager"}</span>
            <span>{clCompany || "Target Company"}</span>
          </div>
          <span style={{ fontWeight: "700", color: "#1e293b" }}>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Salutation */}
        <div style={{
          fontSize: parseFloat(letterFontSize) + 1.5 + "px",
          fontWeight: "700",
          color: "#0f172a",
          marginTop: "32px",
          marginBottom: "16px"
        }}>
          Dear {clCompany ? `${clCompany} Team` : "Hiring Manager"},
        </div>

        {/* Letter content */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: letterGap
        }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{
              fontSize: letterFontSize,
              lineHeight: letterLineHeight,
              color: "#334155",
              textAlign: "justify",
              margin: 0
            }}>
              {p}
            </p>
          ))}
        </div>

        {/* Signature */}
        <div style={{
          marginTop: "auto",
          paddingTop: "20px",
          borderTop: "1px solid #f1f5f9"
        }}>
          <span style={{ fontSize: letterFontSize, color: "#475569" }}>Sincerely Yours,</span>
          {clSignature ? (
            <div style={{ margin: "6px 0", display: "block" }}>
              <img src={clSignature} alt="Signature" style={{ maxHeight: "40px", maxWidth: "160px", objectFit: "contain" }} />
            </div>
          ) : (
            <div style={{ height: "20px" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#1e293b" }}>
              {data.basics.name || "Katie Slater"}
            </span>
            <span style={{ fontSize: "10px", color: accentText, textTransform: "uppercase", fontWeight: "600" }}>
              {data.basics.title || "Digital Marketing"}
            </span>
          </div>
        </div>
      </div>
    );

    return (
      <div style={{
        width: "820px",
        height: "1160px",
        backgroundColor: "#ffffff",
        position: "relative",
        overflow: "hidden",
        display: "flex"
      }}>
        {leftColIsSidebar ? (
          <>
            {sidebarJSX}
            {mainJSX}
          </>
        ) : (
          <>
            {mainJSX}
            {sidebarJSX}
          </>
        )}
      </div>
    );
  }

  // Avery Style (avery) Layout
  const ORANGE = "#f59121";
  return (
    <div style={{
      width: "820px",
      height: "1160px",
      backgroundColor: "#ffffff",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
      color: "#1a1a1a"
    }}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: "-40px", left: "-40px", width: "160px", height: "160px", borderRadius: "50%", background: ORANGE, zIndex: 1 }} />
      <div style={{ position: "absolute", top: "64px", left: "176px", width: "96px", height: "96px", borderRadius: "50%", background: ORANGE, zIndex: 1 }} />
      <div style={{ position: "absolute", top: "-64px", right: "40px", width: "224px", height: "224px", borderRadius: "50%", background: ORANGE, zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: "-64px", right: "24px", width: "176px", height: "176px", borderRadius: "50%", background: ORANGE, zIndex: 1 }} />

      <div style={{ position: "relative", padding: averyPadding, zIndex: 10, display: "flex", flexDirection: "column", height: "1160px" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: "32px", alignItems: "flex-end" }}>
          <div style={{ width: "130px", height: "130px", borderRadius: "50%", border: "4px solid #eaeaea", overflow: "hidden", backgroundColor: "#fff", flexShrink: 0 }}>
            {isValidPhoto(data.basics.photo) ? (
              <img src={data.basics.photo} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-300" />
            )}
          </div>
          <div style={{ flex: 1, paddingBottom: "8px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-0.5px", margin: 0 }}>
              {data.basics.name || "Your Name"}
            </h1>
            <p style={{ fontSize: "18px", fontWeight: "900", color: ORANGE, textTransform: "uppercase", marginTop: "4px", margin: 0 }}>
              {data.basics.title}
            </p>
            <div style={{ borderBottom: "2.5px solid black", marginTop: "12px" }} />
          </div>
        </div>

        {/* Content columns */}
        <div style={{ display: "grid", gridTemplateColumns: "35% 65%", gap: "32px", flex: 1, marginTop: "40px" }}>
          {/* Left info column */}
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "900", textDecoration: "underline", textUnderlineOffset: "4px", marginBottom: "16px", margin: 0 }}>
              Contact Details
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: letterFontSize, color: "#333" }}>
              {data.basics.phone && <p style={{ margin: 0 }}>☎ &nbsp; {data.basics.phone}</p>}
              {data.basics.email && <p style={{ margin: 0, wordBreak: "break-all" }}>✉ &nbsp; {data.basics.email}</p>}
              {data.basics.location && <p style={{ margin: 0 }}>📍 &nbsp; {data.basics.location}</p>}
            </div>

            <h2 style={{ fontSize: "16px", fontWeight: "900", textDecoration: "underline", textUnderlineOffset: "4px", marginTop: "32px", marginBottom: "16px", margin: 0 }}>
              Top Skills
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {skillsToRender.map((s, i) => (
                <div key={i} style={{ fontSize: "11px", display: "flex", gap: "6px" }}>
                  <span>•</span><span>{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right letter body column */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: letterFontSize, color: "#555" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontWeight: "900", color: "#111" }}>{clCompany ? `Hiring Team at ${clCompany}` : "Hiring Manager"}</span>
                <span>{clRole || "Senior Manager"}</span>
                <span>{clCompany || "Target Company"}</span>
              </div>
              <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <p style={{ fontSize: parseFloat(letterFontSize) + 1.5 + "px", fontWeight: "900", color: "#111", margin: "24px 0 16px 0" }}>
              Dear {clCompany ? `${clCompany} Team` : "Hiring Manager"},
            </p>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: letterGap }}>
              {paragraphs.map((p, i) => (
                <p key={i} style={{ fontSize: letterFontSize, lineHeight: letterLineHeight, color: "#333", textAlign: "justify", margin: 0 }}>
                  {p}
                </p>
              ))}
            </div>

            {/* Signature */}
            <div style={{ paddingTop: "20px", borderTop: "1.5px solid #eaeaea", marginTop: "auto" }}>
              <span style={{ fontSize: letterFontSize, color: "#555" }}>Sincerely Yours,</span>
              {clSignature ? (
                <div style={{ margin: "6px 0" }}>
                  <img src={clSignature} alt="Signature" style={{ maxHeight: "36px", maxWidth: "150px", objectFit: "contain" }} />
                </div>
              ) : (
                <div style={{ height: "24px" }} />
              )}
              <p style={{ fontSize: "12px", fontWeight: "900", margin: 0 }}>{data.basics.name}</p>
              <p style={{ fontSize: "10px", color: ORANGE, fontWeight: "900", textTransform: "uppercase", margin: 0 }}>{data.basics.title}</p>
            </div>
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
            <CoverLetterPagePreview template={template} data={data} clText={clText} clCompany={clCompany} clRole={clRole} clSignature={clSignature} />
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
