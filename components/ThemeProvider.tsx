"use client";

import { useEffect } from "react";
import useStore from "@/lib/store";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  // Hydrate theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("hc-theme") || "green";
    setTheme(savedTheme);
  }, [setTheme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <>{children}</>;
}
