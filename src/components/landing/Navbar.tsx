import { Link } from "@tanstack/react-router";
import { Sparkles, Menu, X } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-hide navbar on scroll-down, reveal on scroll-up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollState = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 10);

      if (Math.abs(scrollY - lastScrollY) < 15) {
        ticking = false;
        return;
      }

      if (scrollY > lastScrollY && scrollY > 60) {
        setIsVisible(false);
      } else if (scrollY < lastScrollY) {
        setIsVisible(true);
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll and handle system back-button dismiss on mobile (Android/swipe style)
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      
      // Push unique history state to intercept back action
      if (window.history.state?.mobileMenu !== true) {
        window.history.pushState({ mobileMenu: true }, "");
      }

      const handlePopState = (e: PopStateEvent) => {
        setIsMobileMenuOpen(false);
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileMenuOpen]);

  const closeMobileMenu = (isNavigating = false) => {
    setIsMobileMenuOpen(false);
    if (!isNavigating && window.history.state?.mobileMenu === true) {
      window.history.back();
    }
  };

  // ── Mobile menu portal ──────────────────────────────────────────────────────
  const mobileMenuPortal = typeof document !== "undefined"
    ? createPortal(
        <div 
          className={cn(
            "fixed inset-0 z-[9999] transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          {/* ── Overlay ── semi-transparent backdrop behind the drawer ── */}
          <div 
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={closeMobileMenu}
          />

          {/* ── Drawer ── 100% OPAQUE, strictly following the provided structure ── */}
          <div
            className={cn(
              "absolute top-0 left-0 bottom-0 w-full max-w-[320px] bg-bg flex flex-col transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
            style={{ opacity: 1 }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-display text-lg font-black tracking-tighter text-text">
                  Vogats AI
                </span>
              </div>
              <button
                className="p-2 bg-surface rounded-xl text-text hover:bg-border transition-colors"
                onClick={closeMobileMenu}
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto py-2">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-vogats-ai"));
                  closeMobileMenu();
                }}
                className="w-full flex items-center gap-4 px-6 py-4 text-[15px] font-bold text-accent hover:bg-accent/5 transition-colors border-l-4 border-transparent hover:border-accent"
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
                Chat with AI
              </button>
              <Link
                to="/"
                className="flex items-center gap-4 px-6 py-4 text-[15px] font-bold text-text/80 hover:text-accent hover:bg-accent/5 transition-all border-l-4 border-transparent hover:border-accent"
                onClick={() => closeMobileMenu(true)}
              >
                <span className="text-xl w-6">🏠</span>
                Home
              </Link>
              <a
                href="/#pricing"
                className="flex items-center gap-4 px-6 py-4 text-[15px] font-bold text-text/80 hover:text-accent hover:bg-accent/5 transition-all border-l-4 border-transparent hover:border-accent"
                onClick={() => closeMobileMenu(true)}
              >
                <span className="text-xl w-6">💳</span>
                Pricing
              </a>
              <Link
                to="/templates"
                className="flex items-center gap-4 px-6 py-4 text-[15px] font-bold text-text/80 hover:text-accent hover:bg-accent/5 transition-all border-l-4 border-transparent hover:border-accent"
                onClick={() => closeMobileMenu(true)}
              >
                <span className="text-xl w-6">📄</span>
                Templates
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-4 px-6 py-4 text-[15px] font-bold text-text/80 hover:text-accent hover:bg-accent/5 transition-all border-l-4 border-transparent hover:border-accent"
                onClick={() => closeMobileMenu(true)}
              >
                <span className="text-xl w-6">🚀</span>
                About Us
              </Link>
              <Link
                to="/contact"
                className="flex items-center gap-4 px-6 py-4 text-[15px] font-bold text-text/80 hover:text-accent hover:bg-accent/5 transition-all border-l-4 border-transparent hover:border-accent"
                onClick={() => closeMobileMenu(true)}
              >
                <span className="text-xl w-6">📬</span>
                Contact
              </Link>
            </nav>

            {/* Footer actions */}
            <div className="p-4 border-t border-border/10 flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between px-1 py-2">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">
                  Switch Theme
                </span>
                <ThemeToggle />
              </div>
              
              <Link
                to={user ? "/dashboard" : "/auth"}
                className="w-full"
                onClick={() => closeMobileMenu(true)}
              >
                <button className="btn-premium w-full py-4 text-xs font-black uppercase tracking-widest shadow-lg">
                  {user ? "Dashboard" : "Get Started"}
                </button>
              </Link>
              
              {user && (
                <button
                  onClick={() => {
                    signOut();
                    closeMobileMenu(true);
                  }}
                  className="w-full py-3 text-sm font-bold text-muted hover:text-text transition-colors border border-border/10 rounded-xl"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
          isVisible ? "translate-y-0" : "-translate-y-full",
          isScrolled
            ? "bg-bg/95 backdrop-blur-2xl border-b border-border shadow-sm py-1 sm:py-0 px-4 sm:px-12"
            : "bg-transparent py-2 sm:py-0 px-4 sm:px-12"
        )}
      >
        <div className="container mx-auto max-w-7xl h-6 sm:h-[35px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-2 bg-accent/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src={logo}
                alt="Vogats AI Logo"
                className="relative w-5 h-5 sm:w-7 sm:h-7 rounded-sm sm:rounded-lg object-cover shadow-sm"
              />
            </div>
            <span className="font-display text-sm sm:text-lg font-black tracking-tighter text-text whitespace-nowrap">
              Vogats AI
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-10 lg:flex">
            <Link
              to="/"
              className="text-[11px] font-black uppercase tracking-[0.2em] text-muted hover:text-accent transition-all duration-300 relative group/nav"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover/nav:w-full" />
            </Link>
            <a
              href="/#pricing"
              className="text-[11px] font-black uppercase tracking-[0.2em] text-muted hover:text-accent transition-all duration-300 relative group/nav"
            >
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover/nav:w-full" />
            </a>
            <Link
              to="/templates"
              className="text-[11px] font-black uppercase tracking-[0.2em] text-muted hover:text-accent transition-all duration-300 relative group/nav"
            >
              Templates
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover/nav:w-full" />
            </Link>
            <Link
              to="/about"
              className="text-[11px] font-black uppercase tracking-[0.2em] text-muted hover:text-accent transition-all duration-300 relative group/nav"
            >
              About Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover/nav:w-full" />
            </Link>
            <Link
              to="/contact"
              className="text-[11px] font-black uppercase tracking-[0.2em] text-muted hover:text-accent transition-all duration-300 relative group/nav"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover/nav:w-full" />
            </Link>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-vogats-ai"))}
              className="text-[11px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2 hover:scale-110 transition-transform"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Chat with AI
            </button>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center border-r border-border pr-4 mr-1">
              <ThemeToggle />
            </div>

            <Link to={user ? "/dashboard" : "/auth"} className="hidden sm:block">
              <button className="btn-premium px-6 py-1.5 sm:px-8 sm:py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-xl">
                {user ? "Dashboard" : "Join Now"}
              </button>
            </Link>

            {/* Hamburger */}
            <button
              className="lg:hidden p-1 text-text hover:bg-surface rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu portal */}
      {mobileMenuPortal}
    </>
  );
}
