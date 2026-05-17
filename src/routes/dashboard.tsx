import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { collection, query, where, getDocs, setDoc, deleteDoc, doc, orderBy, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FileText, Trash2, LogOut, LayoutGrid, FileType, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { sampleResume, ResumeData } from "@/lib/resume-types";
import { TemplateThumb } from "@/components/resume/TemplateThumb";
import { UserProfileCard } from "@/components/dashboard/UserProfileCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";
import { getUserSubscription, checkAccess, incrementResumeUsage, PLANS, Subscription, saveSubscription, createSubscription, PlanId } from "@/lib/subscription";
import { BadgeCheck, Infinity as InfinityIcon, AlertCircle, Loader2 } from "lucide-react";
import { PricingModal } from "@/components/PricingModal";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Vogats CV" }] }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      template: (search.template as string) || undefined,
      buy: (search.buy as PlanId) || undefined,
    };
  },
  component: Dashboard,
});

type Resume = { id: string; title: string; templateId: string; updatedAt: string; data: ResumeData };
type ProfileData = { displayName: string; email: string; photoURL?: string; createdAt: string; resumeCount: number };

function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const { template: autoCreateTemplate, buy: autoBuyPlan } = Route.useSearch();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Tracks which plan was requested via ?buy=PLANID URL param (guest → login flow)
  const [triggeredPlanId, setTriggeredPlanId] = useState<PlanId | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [user, loading, nav]);

  const load = useCallback(async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, "resumes"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const resumeData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resume[];
      
      // Sort manually to avoid index requirement
      resumeData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      setResumes(resumeData);

      // Fetch profile
      const profileSnap = await getDoc(doc(db, "users", user.uid));
      if (profileSnap.exists()) {
        const p = profileSnap.data();
        setProfile({
          displayName: p.displayName || user.displayName || "User",
          email: p.email || user.email || "",
          photoURL: p.photoURL || user.photoURL || undefined,
          createdAt: p.createdAt || new Date().toISOString(),
          resumeCount: resumeData.length
        });
      } else {
        setProfile({
          displayName: user.displayName || "User",
          email: user.email || "",
          photoURL: user.photoURL || undefined,
          createdAt: new Date().toISOString(),
          resumeCount: resumeData.length
        });
      }
      
      // Fetch subscription
      const sub = await getUserSubscription(user.uid);
      setSubscription(sub);
    } catch (error: any) {
      console.error("Load error:", error);
    }
  }, [user]);

  const create = useCallback(async (template = "modern") => {
    if (!user || busy) return;

    // Check subscription access
    // Allow creation for free; download is gated in the editor
    setBusy(true);
    try {
      const resumesRef = collection(db, "resumes");
      const newDocRef = doc(resumesRef);
      const newId = newDocRef.id;

      await setDoc(newDocRef, {
        userId: user.uid,
        title: "Untitled Resume",
        templateId: template,
        data: sampleResume,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      
      toast.success("Creating your resume...");
      await incrementResumeUsage(user.uid);
      setSubscription(s => s ? { ...s, resumesUsed: s.resumesUsed + 1 } : null);
      nav({ to: "/resume/$id", params: { id: newId }, search: { template: template } });
    } catch (error: any) {
      console.error("Immediate create error:", error);
      if (error.message?.includes("permission") || error.code === "permission-denied" || error.message?.includes("Missing or insufficient permissions")) {
        toast.error("Database Rule Error: Firestore rules are locked or not configured for 'vogats-news' in your Firebase Console.", {
          description: "Please copy the rules from firestore.rules to the 'vogats-news' database in your Firebase Console > Rules tab.",
          duration: 10000
        });
      } else if (error.message?.includes("Database '(default)' not found")) {
        toast.error("Database Error: Firestore has not been initialized in your Firebase Console.", {
          description: "Please go to Firebase Console > Firestore Database and click 'Create Database'.",
          duration: 8000
        });
      } else {
        toast.error(error.message || "Failed to initiate resume creation");
      }
    } finally {
      setBusy(false);
    }
  }, [user, busy, nav]);

  useEffect(() => {
    if (autoCreateTemplate && user && !busy) {
      create(autoCreateTemplate);
      nav({ to: "/dashboard", search: { template: undefined }, replace: true });
    }
  }, [autoCreateTemplate, user, busy, nav, create]);

  useEffect(() => {
    if (autoBuyPlan && user && !busy) {
      // Guest clicked "Buy" on landing page → redirected here after login
      // Open the PricingModal pre-selecting the requested plan
      setTriggeredPlanId(autoBuyPlan as PlanId);
      setShowPlanModal(true);
      nav({ to: "/dashboard", search: { buy: undefined }, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoBuyPlan, user]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const del = async (id: string) => {
    try {
      await deleteDoc(doc(db, "resumes", id));
      setResumes((r) => r.filter((x) => x.id !== id));
      toast.success("Resume deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Called by CheckoutModal after successful redirect (Cashfree handles the payment)
  const handlePaymentSuccess = useCallback(async (planId: PlanId, orderId: string) => {
    const sub = createSubscription(planId, orderId);
    try {
      await saveSubscription(user!.uid, sub);
      setSubscription(sub);
      toast.success("🎉 Payment Successful!", {
        description: `Your ${PLANS[planId].label} plan is now active.`
      });
    } catch (error: any) {
      console.error("Database subscription save error:", error);
      // Still set it locally so they can proceed without being locked out due to DB rules!
      setSubscription(sub);
      toast.success("🎉 Payment Successful!", {
        description: `Your ${PLANS[planId].label} plan is now active.`
      });
      toast.error("Database Error: Failed to save subscription in cloud.", {
        description: "Your session is temporarily activated locally. Please ensure Firestore Security Rules are configured for 'vogats-news' database.",
        duration: 15000
      });
    }
    setShowPayModal(null);
  }, [user]);

  if (loading || !user) return null;

  const access = checkAccess(subscription);
  const remainingDays = subscription ? Math.max(0, Math.ceil((new Date(subscription.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="min-h-screen pt-12 sm:pt-20 pb-20 sm:pb-12 bg-bg text-text flex flex-col justify-between">
      <Navbar />

      <main className="container mx-auto max-w-5xl px-6 py-10 relative z-10">
        {/* SUBSCRIPTION STATUS BANNER */}
        <div className={`mb-10 p-6 rounded-[2rem] border overflow-hidden relative group transition-all ${
          access.allowed 
            ? "bg-gradient-to-br from-accent/20 to-sage/10 border-accent/20 shadow-[0_0_40px_-15px_rgba(var(--accent-rgb),0.1)]" 
            : "bg-red-500/5 border-red-500/20"
        }`}>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-10 -mt-10" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                access.allowed ? "bg-accent/20 text-accent" : "bg-red-500/20 text-red-400"
              }`}>
                {access.allowed ? <BadgeCheck className="h-7 w-7" /> : <AlertCircle className="h-7 w-7" />}
              </div>
              <div>
                <h2 className="text-xl font-bold font-display">
                  {access.allowed ? `${PLANS[subscription!.planId].label} Access Active` : "No Active Subscription"}
                </h2>
                <p className="text-sm text-muted mt-1">
                  {access.allowed 
                    ? `Premium features active. PDF + Word downloads enabled. ${remainingDays} days remaining.` 
                    : "Build and edit your resume for free. Upgrade to unlock PDF + Word downloads."}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {access.allowed && (
                <div className="flex items-center gap-6 px-6 border-r border-border/50 hidden lg:flex">
                  <div className="text-center">
                    <div className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Used</div>
                    <div className="text-lg font-bold">{subscription?.resumesUsed}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Limit</div>
                    <div className="text-lg font-bold">{subscription?.unlimited ? <InfinityIcon className="h-5 w-5 mx-auto" /> : subscription?.resumeLimit}</div>
                  </div>
                </div>
              )}
              <button 
                onClick={() => setShowPlanModal(true)}
                className="btn-premium px-8 py-3 text-sm"
              >
                {access.allowed ? "Change Plan" : "Upgrade Now"}
              </button>
            </div>
          </div>
        </div>

        {/* PROFILE HERO */}
        {profile && <UserProfileCard profile={profile} onUpdate={load} />}

        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 fade-in">
          {[
            { num: resumes.length, label: "Resumes" },
            { num: "0", label: "Downloads" },
            { num: "18+", label: "Templates" }
          ].map((s, i) => (
            <div key={i} className="p-5 bg-card border border-border rounded-2xl text-center relative overflow-hidden group hover:border-accent transition-colors">
              <div className="text-3xl font-bold text-accent mb-1 group-hover:scale-110 transition-transform font-display">{s.num}</div>
              <div className="text-[10px] text-muted font-bold uppercase tracking-wider">{s.label}</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-accent opacity-30" />
            </div>
          ))}
        </div>

        {/* MY RESUMES */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold">Your Resumes</h2>
              <p className="text-muted text-sm mt-1">Manage and edit your polished career documents.</p>
            </div>
            <button className="btn-premium h-10 px-5 hidden sm:flex gap-2" onClick={() => create()}>
              <Plus className="h-4 w-4" /> New Resume
            </button>
          </div>

          {resumes.length === 0 ? (
            <div className="resumes-empty p-12 bg-card border-2 border-dashed border-border rounded-3xl text-center">
              <div className="empty-icon w-16 h-16 bg-soft rounded-full grid place-items-center text-3xl mx-auto mb-4">📄</div>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                You haven't created any resumes yet.<br />Start with a professional template we've pre-designed for you.
              </p>
              <button className="btn-premium px-8 h-12" onClick={() => create()}>
                <Plus className="h-4 w-4 mr-2" /> Create your first resume
              </button>
            </div>
          ) : (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {resumes.map((r) => (
                  <div className="relative">
                    <Link to="/resume/$id" params={{ id: r.id }} className="block group/card">
                      <div className="aspect-[3/4] rounded-2xl bg-white mb-5 relative overflow-hidden border border-border/50 shadow-sm group-hover/card:shadow-[0_20px_50px_rgba(0,0,0,0.1)] group-hover/card:border-accent/50 transition-all duration-500">
                        <TemplateThumb 
                          templateId={r.templateId} 
                          data={r.data} 
                          className="w-full h-full pointer-events-none transition-transform duration-700 group-hover/card:scale-105"
                        />
                        {/* Realistic Hover Overlay */}
                        <div className="absolute inset-0 bg-accent/10 backdrop-blur-[2px] opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <div className="bg-white text-accent px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300">
                            Continue Editing
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display font-black text-lg text-text truncate group-hover/card:text-accent transition-colors">{r.title || "Untitled Resume"}</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-muted font-black uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {r.templateId} · Last edited {new Date(r.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                    
                    <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                      <Link 
                        to="/resume/$id" 
                        params={{ id: r.id }} 
                        className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest hover:translate-x-1 transition-transform"
                      >
                        Edit Document
                      </Link>
                      <button
                        onClick={() => del(r.id)}
                        className="flex items-center gap-2 text-[10px] font-black text-muted hover:text-red-500 uppercase tracking-widest transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </section>

        {/* DIVIDER */}
        <div className="flex items-center gap-4 my-12 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
          <div className="flex-1 h-px bg-border" />
          Choose a Template
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* TEMPLATES */}
        <section id="templates">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold">Resume Templates</h2>
            <p className="text-muted text-sm mt-1">Pick a starting point and build your future.</p>
          </div>

          <div className="flex gap-2 flex-wrap mb-8">
            {["all", "professional", "creative", "minimal"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-5 py-2 rounded-full text-xs font-bold capitalize transition-all border ${
                  filter === t 
                    ? "bg-accent border-accent text-[#1a1500]" 
                    : "bg-card border-border text-muted hover:text-text hover:border-soft"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {([
              { id: "modern",   name: "Modern",        badge: "Free",    tags: "professional" },
              { id: "classic",  name: "Classic",       badge: "Free",    tags: "professional" },
              { id: "creative", name: "Creative Dark", badge: "New",     tags: "creative" },
              { id: "minimal",  name: "Minimal",       badge: "Free",    tags: "minimal" },
              { id: "designer", name: "Designer",      badge: "Pro",     tags: "creative" },
              { id: "avery",    name: "Avery",          badge: "Pro",     tags: "professional" },
              { id: "slater",   name: "Slater",        badge: "Premium", tags: "creative" },
              { id: "watson",   name: "Watson",        badge: "Pro",     tags: "professional" },
              { id: "sophia",   name: "Sophia",        badge: "Hot",     tags: "professional" },
              { id: "turquoise",name: "Turquoise Sidebar",badge: "Hot",  tags: "creative" },
              { id: "saurabh",  name: "Saurabh Sidebar",  badge: "New",  tags: "creative" },
            ] as const).filter(t => filter === "all" || t.tags === filter).map((t) => (
              <div key={t.id} className="template-card bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-accent hover:-translate-y-1 transition-all group relative">
                <TemplateThumb
                  templateId={t.id}
                  className="w-full"
                  onUse={() => create(t.id)}
                />
                <div className="p-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-text">{t.name}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    t.badge === 'Free' ? 'bg-green-500/10 text-green-400' : 
                    t.badge === 'Pro' ? 'bg-accent/10 text-accent' : 'bg-accent2/10 text-accent2'
                  }`}>
                    {t.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ══ REDESIGNED DARK PRICING MODAL ══ */}
      <PricingModal
        isOpen={showPlanModal}
        onClose={() => { setShowPlanModal(false); setTriggeredPlanId(null); }}
        defaultPlanId={triggeredPlanId || "PRO"}
        startAtCheckout={!!triggeredPlanId}
        userName={user?.displayName || profile?.displayName || ""}
        userEmail={user?.email || profile?.email || ""}
      />
      <Footer />
    </div>
  );
}
