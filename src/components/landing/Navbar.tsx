import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-ivory">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Resumé.ai</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#templates" className="text-muted-foreground transition-colors hover:text-foreground">Templates</a>
          <a href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
          <a href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm" className="hidden md:inline-flex">Sign in</Button></Link>
          <Link to="/auth"><Button variant="ink" size="sm" className="rounded-full">Get started</Button></Link>
        </div>
      </div>
    </header>
  );
}
