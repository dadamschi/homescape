import { create } from "zustand";

const useStore = create((set) => ({
  currentPage: window.location.hash?.slice(1) || "home",
  menuOpen: false,
  leadFormSubmitting: false,
  leadFormSuccess: false,
  theme: localStorage.getItem("hc-theme") || "green",

  setPage: (page) => set({ currentPage: page }),
  setMenuOpen: (open) => set({ menuOpen: open }),
  setLeadFormSubmitting: (val) => set({ leadFormSubmitting: val }),
  setLeadFormSuccess: (val) => set({ leadFormSuccess: val }),
  setTheme: (theme) => {
    localStorage.setItem("hc-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },
}));

export const navigate = (page) => {
  window.location.hash = page;
  useStore.getState().setPage(page);
};

export default useStore;
