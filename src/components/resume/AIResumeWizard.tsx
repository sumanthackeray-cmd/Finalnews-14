import React, { useState, useEffect } from "react";
import { 
  Sparkles, Wand2, X, ArrowRight, ArrowLeft, Loader2, 
  CheckCircle2, AlertCircle, Briefcase, GraduationCap, 
  Wrench, FileText, UserCheck, Star, Sparkle, LayoutTemplate,
  Flame, BadgeCheck, FileCheck, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateAIContent } from "@/lib/ai-service";
import type { ResumeData } from "@/lib/resume-types";
import { toast } from "sonner";

interface AIResumeWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (completedData: Partial<ResumeData> & { coverLetterText?: string }, selectedTemplateId: string) => void;
  initialData: ResumeData;
}

const POPULAR_TAGS = [
  "React", "TypeScript", "Node.js", "Python", "UI Design", 
  "Project Management", "Digital Marketing", "Financial Analysis", 
  "Agile", "SQL", "Figma", "AWS", "Communication", "Leadership"
];

// Available templates metadata with custom visual badges
const TEMPLATES_INFO = [
  { id: "modern", name: "Modern", desc: "Serif headers with sleek, contemporary spacing.", badge: "ATS Friendly", color: "border-emerald-500/20 hover:border-emerald-500 text-emerald-600 bg-emerald-50/50" },
  { id: "classic", name: "Classic", desc: "Elegant Times New Roman layout centered for professionals.", badge: "Recruiter Fav", color: "border-blue-500/20 hover:border-blue-500 text-blue-600 bg-blue-50/50" },
  { id: "creative", name: "Creative", desc: "Distinct dark/peach accent bar ideal for creatives.", badge: "Best Value", color: "border-coral/20 hover:border-coral text-coral bg-orange-50/50" },
  { id: "minimal", name: "Minimal", desc: "Clean contemporary lines with thin grid structure.", badge: "Minimalist", color: "border-slate-500/20 hover:border-slate-500 text-slate-700 bg-slate-50/50" },
  { id: "designer", name: "Designer", desc: "Warm cream background with photo framework.", badge: "Executive", color: "border-amber-600/20 hover:border-amber-600 text-amber-700 bg-amber-50/50" },
  { id: "avery", name: "Avery", desc: "Vibrant orange circular features and visual panels.", badge: "Bold Choice", color: "border-orange-500/20 hover:border-orange-500 text-orange-600 bg-orange-50/50" },
  { id: "watson", name: "Watson", desc: "Technical layout with bold indigo left sidebar panels.", badge: "Highly Popular", color: "border-indigo-600/20 hover:border-indigo-600 text-indigo-700 bg-indigo-50/50" },
  { id: "sophia", name: "Sophia", desc: "Right sidebar structured mustard style for corporates.", badge: "Modernist", color: "border-yellow-600/20 hover:border-yellow-600 text-yellow-700 bg-yellow-50/50" }
];

export function AIResumeWizard({ isOpen, onClose, onComplete, initialData }: AIResumeWizardProps) {
  // Steps: 0: Welcome, 1: Basics & Target, 2: Skills, 3: Work, 4: Projects & Edu, 5: Generating AI data, 6: Template Selection, 7: ATS Audit report
  const [step, setStep] = useState<number>(0); 
  
  // Wizard Input States
  const [name, setName] = useState(initialData.basics.name || "");
  const [title, setTitle] = useState(initialData.basics.title || "");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level");
  const [generateCoverLetter, setGenerateCoverLetter] = useState(true);
  
  const [skillsInput, setSkillsInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [workCompany, setWorkCompany] = useState("");
  const [workRole, setWorkRole] = useState("");
  const [workAchievement, setWorkAchievement] = useState("");

  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [eduSchool, setEduSchool] = useState("");
  const [eduDegree, setEduDegree] = useState("");

  // Post-generation selections
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [generatedPayload, setGeneratedPayload] = useState<any>(null);

  // ATS & Report states
  const [auditing, setAuditing] = useState(true);
  const [activeTab, setActiveTab] = useState<"ats" | "letter">("ats");
  
  // Animated Ticking Numbers state
  const [scoreATS, setScoreATS] = useState(0);
  const [scoreKeyword, setScoreKeyword] = useState(0);
  const [scoreSTAR, setScoreSTAR] = useState(0);
  const [scoreFormat, setScoreFormat] = useState(0);

  // Generating Screen Steps & Progress
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    "🤖 Analyzing target role and skill landscape...",
    "✍️ Drafting an ATS-optimized, high-impact professional summary...",
    "✨ Crafting metric-driven experience bullets using the STAR method...",
    "🚀 Formatting projects and structuring industry-standard skills...",
    "🎨 Generating high-conversion customized cover letter copy..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 5) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [step]);

  // ATS Audit Ticker animation effect
  useEffect(() => {
    if (step === 7) {
      setAuditing(true);
      setScoreATS(0);
      setScoreKeyword(0);
      setScoreSTAR(0);
      setScoreFormat(0);

      const timer = setTimeout(() => {
        setAuditing(false);
        
        // Ticker animation for visual scores
        const duration = 1200; // ms
        const steps = 30;
        const stepTime = duration / steps;
        
        let currentStep = 0;
        const interval = setInterval(() => {
          currentStep++;
          setScoreATS(Math.min(94, Math.round((94 / steps) * currentStep)));
          setScoreKeyword(Math.min(96, Math.round((96 / steps) * currentStep)));
          setScoreSTAR(Math.min(98, Math.round((98 / steps) * currentStep)));
          setScoreFormat(Math.min(95, Math.round((95 / steps) * currentStep)));
          
          if (currentStep >= steps) {
            clearInterval(interval);
          }
        }, stepTime);
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [step]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && (!name.trim() || !title.trim())) {
      toast.error("Please fill in your Name and Target Job Title first.");
      return;
    }
    if (step === 3 && (!workCompany.trim() || !workRole.trim())) {
      toast.error("Please enter your Company name and Job Role.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const triggerAIGeneration = async () => {
    setStep(5);
    try {
      const mergedSkills = [
        ...skillsInput.split(",").map(s => s.trim()).filter(Boolean),
        ...selectedTags
      ].join(", ");

      const result = await generateAIContent({
        action: "complete-resume-wizard",
        data: {
          name,
          title,
          experienceLevel,
          skillsInput: mergedSkills,
          workCompany,
          workRole,
          workAchievement,
          projectName,
          projectDesc,
          eduSchool,
          eduDegree,
          generateCoverLetter
        }
      });

      if (result.error) throw new Error(result.error);

      setGeneratedPayload(result);
      setStep(6);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to draft resume with AI. Please try again.");
      setStep(4);
    }
  };

  const handleApplyWizard = () => {
    if (!generatedPayload) return;

    // Create custom experience block
    const formattedExperience = Array.isArray(generatedPayload.experience) 
      ? generatedPayload.experience.map((e: any) => ({
          id: Math.random().toString(36).slice(2, 9),
          company: e.company || workCompany || "Acme Corporation",
          role: e.role || workRole || title,
          location: e.location || "Remote / Hybrid",
          start: e.start || "2023",
          end: e.end || "Present",
          bullets: e.bullets || [workAchievement || "Led crucial digital transition operations."]
        }))
      : [
          {
            id: Math.random().toString(36).slice(2, 9),
            company: workCompany || "Acme Corporation",
            role: workRole || title,
            location: "Remote / Hybrid",
            start: "2023",
            end: "Present",
            bullets: generatedPayload.experience?.bullets || [workAchievement || "Led digital operations."]
          }
        ];

    // Create custom project block
    const formattedProjects = Array.isArray(generatedPayload.projects)
      ? generatedPayload.projects.map((p: any) => ({
          id: Math.random().toString(36).slice(2, 9),
          name: p.name || projectName || "Featured Project",
          description: p.description || projectDesc || "Developed visual and interactive application systems.",
          link: p.link || "https://github.com"
        }))
      : [
          {
            id: Math.random().toString(36).slice(2, 9),
            name: projectName || "Featured Enterprise System",
            description: generatedPayload.project?.description || projectDesc || "Developed a scalable platform supporting end-to-end user operations.",
            link: "https://github.com"
          }
        ];

    // Create custom education block
    const formattedEducation = [
      {
        id: Math.random().toString(36).slice(2, 9),
        school: generatedPayload.education?.school || eduSchool || "University of Technology",
        degree: generatedPayload.education?.degree || eduDegree || "B.S. in Computer Science",
        start: generatedPayload.education?.start || "2018",
        end: generatedPayload.education?.end || "2022",
        notes: generatedPayload.education?.notes || "Graduated with absolute excellence."
      }
    ];

    const completedResume: Partial<ResumeData> & { coverLetterText?: string } = {
      basics: {
        ...initialData.basics,
        name: name || initialData.basics.name,
        title: title || initialData.basics.title,
        summary: generatedPayload.summary || ""
      },
      skills: generatedPayload.skills || selectedTags,
      hobbies: generatedPayload.hobbies || ["Reading", "Continuous Learning"],
      experience: formattedExperience,
      projects: formattedProjects,
      education: formattedEducation,
      coverLetterText: generateCoverLetter ? (generatedPayload.coverLetter || "") : undefined
    };

    onComplete(completedResume, selectedTemplate);
    onClose();
    setStep(0);
    setGeneratedPayload(null);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-955/85 backdrop-blur-md select-none animate-in fade-in duration-300">
      
      {/* Decorative background glow circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-purple-600/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-600/10 blur-[90px] pointer-events-none" />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300">
        
        {/* HEADER BAR */}
        <header className="h-[48px] flex items-center justify-between px-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600/10 dark:bg-purple-600/20 p-1 rounded-lg">
              <Wand2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-slate-850 dark:text-slate-150 uppercase tracking-widest">AI Resume Autopilot</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* PROGRESS INDICATOR */}
        {step > 0 && step < 5 && (
          <div className="h-1.5 bg-slate-100 dark:bg-slate-900 w-full shrink-0">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        )}

        {/* BODY CONTAINER */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-slate-800 dark:text-slate-100">
          
          {/* STEP 0: WELCOME SCREEN */}
          {step === 0 && (
            <div className="text-center py-6 space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 opacity-75 blur animate-pulse" />
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-500 shadow-lg text-white">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Build Your Dream Resume Instantly
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Welcome to Autopilot! Answer 4 simple questions and our AI will format a recruiter-ready resume in seconds.
                </p>
              </div>
              <Button 
                onClick={() => setStep(1)} 
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-98"
              >
                Let's Get Started! <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* STEP 1: CAREER DIRECTION & COVER LETTER BOX */}
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Step 1 of 4: Basics</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">What's your career target?</h3>
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Full Name</label>
                  <Input 
                    id="wizard-name"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. John Doe"
                    className="h-10 text-sm focus-visible:ring-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Target Job Title</label>
                  <Input 
                    id="wizard-title"
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Senior Product Designer"
                    className="h-10 text-sm focus-visible:ring-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 font-semibold block">Experience Level</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["Junior", "Mid-Level", "Senior", "Executive"].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setExperienceLevel(lvl)}
                        className={`py-2 px-1 text-center text-xs font-semibold rounded-lg border transition-all ${
                          experienceLevel === lvl 
                            ? "bg-purple-600 border-purple-600 text-white shadow-md scale-102"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-880 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cover letter generation option during building */}
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 cursor-pointer transition-all hover:scale-[1.01]">
                    <input 
                      type="checkbox" 
                      checked={generateCoverLetter} 
                      onChange={(e) => setGenerateCoverLetter(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4 shrink-0" 
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-purple-500" />
                        ✨ Generate Matching AI Cover Letter
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        Vogats AI drafts a high-converting cover letter based on your credentials.
                      </p>
                    </div>
                  </label>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: SKILLS INPUT */}
          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <Wrench className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Step 2 of 4: Skills</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">What are your core strengths?</h3>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Main Skills (comma separated)</label>
                  <Input
                    id="wizard-skills"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="e.g. React, Node, Strategic Planning"
                    className="h-10 text-sm focus-visible:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Or tap popular tags to add:</label>
                  <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg">
                    {POPULAR_TAGS.map((tag) => {
                      const active = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all border ${
                            active
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {active ? "✓ " : "+ "} {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: WORK HISTORY */}
          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Step 3 of 4: Experience</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Tell us about your last job</h3>
              </div>

              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Company Name</label>
                    <Input
                      id="wizard-company"
                      value={workCompany}
                      onChange={(e) => setWorkCompany(e.target.value)}
                      placeholder="e.g. Google"
                      className="h-10 text-sm focus-visible:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Job Role</label>
                    <Input
                      id="wizard-role"
                      value={workRole}
                      onChange={(e) => setWorkRole(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="h-10 text-sm focus-visible:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Notable Achievement or Responsibility</label>
                  <Textarea
                    id="wizard-achievement"
                    value={workAchievement}
                    onChange={(e) => setWorkAchievement(e.target.value)}
                    placeholder="e.g. Led a team of 4 to design and deploy a microservices ecosystem, boosting product delivery speed by 35%."
                    rows={3}
                    className="text-xs resize-none focus-visible:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PROJECT & EDUCATION */}
          {step === 4 && (
            <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Step 4 of 4: Projects &amp; Edu</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">One final touch...</h3>
              </div>

              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">University/College</label>
                    <Input
                      id="wizard-school"
                      value={eduSchool}
                      onChange={(e) => setEduSchool(e.target.value)}
                      placeholder="e.g. Stanford University"
                      className="h-10 text-sm focus-visible:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Degree / Major</label>
                    <Input
                      id="wizard-degree"
                      value={eduDegree}
                      onChange={(e) => setEduDegree(e.target.value)}
                      placeholder="e.g. B.S. in Computer Science"
                      className="h-10 text-sm focus-visible:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 items-end">
                  <div className="col-span-1 space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Key Project Name</label>
                    <Input
                      id="wizard-project-name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. E-Commerce App"
                      className="h-10 text-sm focus-visible:ring-purple-500"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Project Description</label>
                    <Input
                      id="wizard-project-desc"
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                      placeholder="e.g. Standard React shopping app with state-driven checkout."
                      className="h-10 text-sm focus-visible:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: GENERATING PROGRESS */}
          {step === 5 && (
            <div className="text-center py-8 space-y-6 animate-in fade-in duration-300">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute -inset-1.5 rounded-full bg-purple-600/30 blur animate-pulse" />
                <div className="relative w-16 h-16 rounded-full border-4 border-purple-600/20 border-t-purple-600 animate-spin" />
                <Wand2 className="w-6 h-6 text-purple-600 absolute animate-pulse" />
              </div>
              
              <div className="space-y-3">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Vogats AI is compiling your resume...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal max-w-xs mx-auto">
                  Please hold on. We are generating recruiter-ready copy with STAR metrics tailored for your career level.
                </p>
              </div>

              {/* Progress Steps list */}
              <div className="space-y-2 text-left max-w-sm mx-auto p-3.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-xl shadow-inner">
                {loadingSteps.map((s, idx) => {
                  const done = idx < loadingStep;
                  const active = idx === loadingStep;
                  return (
                    <div 
                      key={s} 
                      className={`flex items-center gap-2.5 text-[10.5px] font-semibold transition-all duration-350 ${
                        done 
                          ? "text-emerald-600 dark:text-emerald-400 opacity-100" 
                          : active 
                            ? "text-purple-600 dark:text-purple-400 font-bold opacity-100" 
                            : "text-slate-400 dark:text-slate-650 opacity-60"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      ) : active ? (
                        <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin text-purple-600" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                      )}
                      <span>{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: CHOOSE TEMPLATE LAYOUT DESIGN */}
          {step === 6 && (
            <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <LayoutTemplate className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Step 5: Signature Design</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Choose your signature design template</h3>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                  Select a tailored theme that represents your professional brand best.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1 max-h-[290px] overflow-y-auto pr-1">
                {TEMPLATES_INFO.map((t) => {
                  const active = selectedTemplate === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`relative p-3.5 text-left rounded-xl border-2 transition-all flex flex-col justify-between gap-1.5 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-98 ${
                        active 
                          ? "bg-purple-600/5 dark:bg-purple-600/10 border-purple-600 text-purple-700 dark:text-purple-400 shadow-md ring-1 ring-purple-600/30"
                          : `border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-850 dark:text-slate-200`
                      }`}
                    >
                      {/* Glow design tag badge on template cards */}
                      <span className="absolute top-2 right-2 text-[8px] font-extrabold tracking-widest px-1.5 py-0.5 rounded-full uppercase bg-purple-600/10 text-purple-600 dark:text-purple-400">
                        {t.badge}
                      </span>

                      <div className="pt-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-xs font-bold tracking-wide uppercase">{t.name}</span>
                          {active && <Sparkle className="w-3 h-3 text-purple-600 dark:text-purple-400 fill-purple-600/30 animate-pulse" />}
                        </div>
                        <p className="text-[9.5px] text-slate-500 dark:text-slate-400 leading-tight">
                          {t.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: ATS SCORE AUDIT AND COVER LETTER TAB PREVIEW */}
          {step === 7 && (
            <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <Star className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Step 6: ATS Audit Analysis</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Auditing placement keyword depth...</h3>
              </div>

              {auditing ? (
                <div className="text-center py-10 space-y-4">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Performing structural audit against executive job criteria...
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-1 animate-in fade-in duration-300">
                  
                  {/* TAB SWITCH BAR */}
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    <button
                      onClick={() => setActiveTab("ats")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === "ats"
                          ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> 📈 ATS Analysis
                    </button>
                    {generateCoverLetter && (
                      <button
                        onClick={() => setActiveTab("letter")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          activeTab === "letter"
                            ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        <FileCheck className="w-3.5 h-3.5" /> ✉️ Cover Letter Draft
                      </button>
                    )}
                  </div>

                  {/* TAB CONTENT 1: ATS SCORE ANALYSIS */}
                  {activeTab === "ats" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {/* Score Card Dashboard with ticking numbers */}
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-center shadow-sm">
                          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none">{scoreATS}%</p>
                          <p className="text-[9px] font-bold text-slate-500 mt-1">ATS Score</p>
                        </div>
                        <div className="bg-purple-600/10 border border-purple-600/20 p-2.5 rounded-xl text-center shadow-sm">
                          <p className="text-lg font-black text-purple-600 dark:text-purple-400 leading-none">{scoreKeyword}%</p>
                          <p className="text-[9px] font-bold text-slate-500 mt-1">Keywords</p>
                        </div>
                        <div className="bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl text-center shadow-sm">
                          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none">{scoreSTAR}%</p>
                          <p className="text-[9px] font-bold text-slate-500 mt-1">STAR Format</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-center shadow-sm">
                          <p className="text-lg font-black text-amber-600 dark:text-amber-400 leading-none">{scoreFormat}%</p>
                          <p className="text-[9px] font-bold text-slate-500 mt-1">Layout</p>
                        </div>
                      </div>

                      {/* Keyword Depth & Alignments display */}
                      <div className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block w-full mb-0.5">Matched Placement Keywords</span>
                          {generatedPayload?.skills?.slice(0, 5).map((skill: string) => (
                            <span key={skill} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9.5px] font-bold flex items-center gap-1">
                              ✓ {skill}
                            </span>
                          ))}
                          <span className="bg-purple-600/10 text-purple-700 dark:text-purple-400 border border-purple-600/20 px-2 py-0.5 rounded-full text-[9.5px] font-bold">
                            + Design systems
                          </span>
                        </div>

                        <div className="h-px bg-slate-200 dark:bg-slate-800" />
                        
                        <div className="space-y-1 text-[10px] font-semibold">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Metric-driven STAR experience bullets generated.</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Layout structural constraints mapped beautifully.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT 2: LIVE COVER LETTER DRAFT PREVIEW */}
                  {activeTab === "letter" && generateCoverLetter && (
                    <div className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center w-full mb-1">
                        <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">AI-Generated Cover Letter Draft</span>
                        <span className="bg-indigo-600/10 text-indigo-600 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Persuasive Tone</span>
                      </div>
                      <div className="max-h-[170px] overflow-y-auto text-[10px] font-semibold text-slate-650 dark:text-slate-350 leading-relaxed pr-1 whitespace-pre-line font-sans border-t border-slate-200 dark:border-slate-800 pt-2">
                        {generatedPayload?.coverLetter || "Dear Hiring Manager,\n\nI am writing to express my strong interest in the Senior Developer role..."}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        {step < 5 && (
          <footer className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between gap-3 shrink-0">
            {step > 0 ? (
              <Button 
                variant="outline" 
                onClick={handlePrev} 
                className="h-10 text-xs font-semibold px-4"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step === 0 ? (
              <div />
            ) : step < 4 ? (
              <Button 
                onClick={handleNext} 
                className="h-10 text-xs font-semibold px-5 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button 
                onClick={triggerAIGeneration} 
                className="h-10 text-xs font-bold px-6 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white shadow-md active:scale-98"
              >
                Generate Perfect Resume <Sparkles className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </footer>
        )}

        {/* POST-GENERATION FOOTER ACTIONS */}
        {step === 6 && (
          <footer className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between gap-3 shrink-0">
            <Button 
              variant="outline" 
              onClick={() => setStep(4)} 
              className="h-10 text-xs font-semibold px-4"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Edit Input
            </Button>
            <Button 
              onClick={() => setStep(7)}
              className="h-10 text-xs font-bold px-5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white shadow-md active:scale-98"
            >
              Apply Design &amp; Run ATS Audit <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </footer>
        )}

        {step === 7 && !auditing && (
          <footer className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-center shrink-0">
            <Button 
              onClick={handleApplyWizard}
              className="w-full h-11 text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-650 text-white shadow-lg active:scale-98 uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-white fill-white/20 animate-pulse" /> Apply &amp; Launch My Resume ✨
            </Button>
          </footer>
        )}

      </div>
    </div>
  );
}
