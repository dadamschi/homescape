import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, "localStorage", { value: localStorageMock });

// Mock document
Object.defineProperty(global, "document", {
  value: {
    documentElement: {
      setAttribute: vi.fn(),
    },
  },
});

// Import store after mocks are set up
import useStore from "./store";

describe("Store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    // Reset store state
    useStore.setState({
      menuOpen: false,
      leadFormSubmitting: false,
      leadFormSuccess: false,
      theme: "green",
    });
  });

  it("has correct initial state", () => {
    const state = useStore.getState();

    expect(state.menuOpen).toBe(false);
    expect(state.leadFormSubmitting).toBe(false);
    expect(state.leadFormSuccess).toBe(false);
    expect(state.theme).toBe("green");
  });

  it("setMenuOpen updates menuOpen state", () => {
    useStore.getState().setMenuOpen(true);
    expect(useStore.getState().menuOpen).toBe(true);

    useStore.getState().setMenuOpen(false);
    expect(useStore.getState().menuOpen).toBe(false);
  });

  it("setLeadFormSubmitting updates state", () => {
    useStore.getState().setLeadFormSubmitting(true);
    expect(useStore.getState().leadFormSubmitting).toBe(true);
  });

  it("setLeadFormSuccess updates state", () => {
    useStore.getState().setLeadFormSuccess(true);
    expect(useStore.getState().leadFormSuccess).toBe(true);
  });

  it("setTheme updates theme and persists to localStorage", () => {
    useStore.getState().setTheme("copper");

    expect(useStore.getState().theme).toBe("copper");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("hc-theme", "copper");
  });
});
