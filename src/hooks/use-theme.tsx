import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// SSR-safe helper — returns undefined when running on the server
function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    return (localStorage.getItem("theme") as Theme) || null;
  } catch {
    return null;
  }
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  } catch {
    return "dark";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with "dark" on the server so SSR HTML is deterministic.
  // The client effect below reads localStorage and corrects it if needed.
  const [theme, setTheme] = useState<Theme>("dark");
  // Track whether we've hydrated so we avoid a flash
  const [mounted, setMounted] = useState(false);

  // Runs once on the client after mount — reads the persisted preference
  useEffect(() => {
    const stored = getStoredTheme();
    const resolved = stored ?? getSystemTheme();
    setTheme(resolved);
    setMounted(true);
  }, []);

  // Sync the <html> class and localStorage whenever theme changes (client-only)
  useEffect(() => {
    if (!mounted) return; // skip the first server-side render pass
    if (typeof window === "undefined") return;
    try {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      localStorage.setItem("theme", theme);
    } catch {
      // localStorage may be unavailable in private-browsing or SSR
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
