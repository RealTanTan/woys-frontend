"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: "light", toggle: () => {} });

function readSavedTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem("woys_theme");
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

function writeSavedTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("woys_theme", theme);
  } catch {
    // Theme preference is optional in demo mode.
  }
}

function preferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const t = readSavedTheme() ?? preferredTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      applyTheme(next);
      writeSavedTheme(next);
      return next;
    });
  };

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
