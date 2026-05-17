import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Sign in — Vogats CV" },
      { name: "description", content: "Sign in or create an account to build AI-powered resumes with Vogats CV." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
        if (redirect) window.location.href = redirect; // Force external/complex redirect if needed
        else nav({ to: "/dashboard" });
    }
  }, [user, loading, nav, redirect]);

  const handleGoogleSignIn = async () => {
    setBusy(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
        });
      }
      
      toast.success("Welcome to Vogats CV!");
      if (redirect) window.location.href = redirect;
      else nav({ to: "/dashboard" });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? "Google sign in failed");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        
        // Update Firebase Profile
        await updateProfile(fbUser, { displayName: name });
        
        // Create Firestore Profile
        await setDoc(doc(db, "users", fbUser.uid), {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: name,
          createdAt: new Date().toISOString(),
        });
        
        toast.success("Account created successfully!");
        if (redirect) window.location.href = redirect;
        else nav({ to: "/dashboard" });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        if (redirect) window.location.href = redirect;
        else nav({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-ink p-12 text-ivory">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Vogats CV Logo" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-display text-xl">Vogats CV</span>
        </Link>
        <div>
          <h1 className="font-display text-5xl leading-tight text-balance">
            Land your next role with a recruiter-ready resume.
          </h1>
          <p className="mt-6 max-w-md text-ivory/70">
            Built for product designers, engineers, and operators. AI writes it. You polish it. Export to PDF.
          </p>
        </div>
        <p className="text-sm text-ivory/60">© Vogats CV</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <h2 className="font-display text-3xl">{mode === "signin" ? "Welcome back" : "Create account"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to continue building." : "Free to start. No credit card."}
          </p>
          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={busy}
              className="flex items-center justify-center gap-3 w-full h-12 bg-white border border-border rounded-xl text-foreground font-medium hover:bg-muted/50 transition-colors shadow-sm disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="input-premium h-12" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-premium h-12" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input-premium h-12" />
            </div>
            <button type="submit" className="btn-premium w-full py-4 mt-4" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>New here? <button onClick={() => setMode("signup")} className="text-foreground underline">Create an account</button></>
            ) : (
              <>Already have one? <button onClick={() => setMode("signin")} className="text-foreground underline">Sign in</button></>
            )}
          </p>
        </Card>
      </div>
    </div>
  );
}
