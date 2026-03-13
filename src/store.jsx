import { create } from "zustand";

const useStore = create((set) => ({
  currentPage: window.location.hash?.slice(1) || "home",
  menuOpen: false,
  leadFormSubmitting: false,
  leadFormSuccess: false,

  setPage: (page) => set({ currentPage: page }),
  setMenuOpen: (open) => set({ menuOpen: open }),
  setLeadFormSubmitting: (val) => set({ leadFormSubmitting: val }),
  setLeadFormSuccess: (val) => set({ leadFormSuccess: val }),
}));

export const navigate = (page) => {
  window.location.hash = page;
  useStore.getState().setPage(page);
};

export default useStore;
