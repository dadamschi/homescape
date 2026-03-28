"use client";

import { create } from "zustand";

interface StoreState {
  menuOpen: boolean;
  leadFormSubmitting: boolean;
  leadFormSuccess: boolean;
  theme: string;
  setMenuOpen: (open: boolean) => void;
  setLeadFormSubmitting: (val: boolean) => void;
  setLeadFormSuccess: (val: boolean) => void;
  setTheme: (theme: string) => void;
}

const getInitialTheme = (): string => {
  if (typeof window === "undefined") return "green";
  return localStorage.getItem("hc-theme") || "green";
};

const useStore = create<StoreState>((set) => ({
  menuOpen: false,
  leadFormSubmitting: false,
  leadFormSuccess: false,
  theme: "green", // Will be hydrated on client

  setMenuOpen: (open) => set({ menuOpen: open }),
  setLeadFormSubmitting: (val) => set({ leadFormSubmitting: val }),
  setLeadFormSuccess: (val) => set({ leadFormSuccess: val }),
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hc-theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
    set({ theme });
  },
}));

// Hydrate theme on client side
if (typeof window !== "undefined") {
  const savedTheme = localStorage.getItem("hc-theme") || "green";
  useStore.setState({ theme: savedTheme });
}

export default useStore;
