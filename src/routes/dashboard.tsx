import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Plus, FileText, Trash2, LogOut, Mail } from "lucide-react";
import { toast } from "sonner";
import { sampleResume } from "@/lib/resume-types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Resumé.ai" }] }),
  component: Dashboard,
});

type Resume = { id: string; title: string; template: string; updated_at: string };

function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [user, loading, nav]);

  const load = async () => {
    const { data, error } = await supabase
      .from("resumes")
      .select("id,title,template,updated_at")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    else setResumes(data as Resume[]);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const create = async () => {
    setBusy(true);
    const { data, error } = await supabase
      .from("resumes")
      .insert({ user_id: user!.id, title: "Untitled Resume", template: "modern", data: sampleResume as any })
      .select("id")
      .single();
    setBusy(false);
    if (error) return toast.error(error.message);
    nav({ to: "/resume/$id", params: { id: data!.id } });
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setResumes((r) => r.filter((x) => x.id !== id));
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-ivory">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-xl">Resumé.ai</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/cover-letter">
              <Button variant="ghost" size="sm"><Mail className="h-4 w-4 mr-1.5" /> Cover letter</Button>
            </Link>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => signOut().then(() => nav({ to: "/" }))}>
              <LogOut className="h-4 w-4 mr-1.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl">Your resumes</h1>
            <p className="text-muted-foreground mt-1">Create, edit, and export polished resumes in minutes.</p>
          </div>
          <Button variant="ink" onClick={create} disabled={busy}>
            <Plus className="h-4 w-4 mr-1.5" /> New resume
          </Button>
        </div>

        {resumes.length === 0 ? (
          <Card className="p-16 text-center border-dashed">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-display text-2xl">No resumes yet</h3>
            <p className="text-muted-foreground mt-1">Start with a sample we'll prefill for you.</p>
            <Button variant="ink" className="mt-6" onClick={create} disabled={busy}>
              <Plus className="h-4 w-4 mr-1.5" /> Create your first resume
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((r) => (
              <Card key={r.id} className="p-6 group hover:shadow-elegant transition-shadow">
                <Link to="/resume/$id" params={{ id: r.id }} className="block">
                  <div className="aspect-[3/4] rounded-md bg-gradient-to-br from-ivory to-secondary mb-4 grid place-items-center">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium truncate">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.template} · updated {new Date(r.updated_at).toLocaleDateString()}
                  </p>
                </Link>
                <button
                  onClick={() => del(r.id)}
                  className="mt-4 inline-flex items-center text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
