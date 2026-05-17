import { Sparkles, Heart } from "lucide-react";
import logo from "@/assets/logo.png";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="relative py-12 md:py-20 overflow-hidden border-t border-border">
      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-12">
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={logo} alt="Vogats CV Logo" className="w-10 h-10 rounded-xl object-cover" />
              <span className="font-display text-2xl font-bold tracking-tight text-text">Vogats CV</span>
            </Link>
            <p className="max-w-xs text-sm text-muted font-medium leading-relaxed">
              The smartest way to build your next professional resume. 
              Powered by Vogats AI.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-20">
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Product</h4>
              <a href="#features" className="text-sm font-semibold text-text hover:text-accent transition-colors">Features</a>
              <a href="#templates" className="text-sm font-semibold text-text hover:text-accent transition-colors">Templates</a>
              <a href="#pricing" className="text-sm font-semibold text-text hover:text-accent transition-colors">Pricing</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Company</h4>
              <Link to="/contact" className="text-sm font-semibold text-text hover:text-accent transition-colors">Contact</Link>
              <a href="#" className="text-sm font-semibold text-text hover:text-accent transition-colors">About Us</a>
              <a href="#" className="text-sm font-semibold text-text hover:text-accent transition-colors">Blog</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Legal</h4>
              <Link to="/privacy" className="text-sm font-semibold text-text hover:text-accent transition-colors">Privacy</Link>
              <Link to="/privacy" className="text-sm font-semibold text-text hover:text-accent transition-colors">Terms</Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
            © {new Date().getFullYear()} Vogats CV · All Rights Reserved
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>by Vogats Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
