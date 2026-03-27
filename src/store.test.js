import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Must mock before importing the store
const mockLocalStorage = {
  store: {},
  getItem: vi.fn((key) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key, value) => {
    mockLocalStorage.store[key] = value;
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  }),
};

const mockSetAttribute = vi.fn();

vi.stubGlobal("localStorage", mockLocalStorage);
vi.stubGlobal("location", { hash: "" });

describe("store", () => {
  let useStore;
  let navigate;

  beforeEach(async () => {
    vi.resetModules();
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();

    // Mock document.documentElement.setAttribute
    document.documentElement.setAttribute = mockSetAttribute;
    mockSetAttribute.mockClear();

    // Dynamically import to get fresh store instance
    const storeModule = await import("./store");
    useStore = storeModule.default;
    navigate = storeModule.navigate;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("setPage updates currentPage", () => {
    useStore.getState().setPage("projects");
    expect(useStore.getState().currentPage).toBe("projects");
  });

  it("setTheme updates theme state", () => {
    useStore.getState().setTheme("copper");
    expect(useStore.getState().theme).toBe("copper");
  });

  it("setTheme writes to localStorage", () => {
    useStore.getState().setTheme("copper");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("hc-theme", "copper");
  });

  it("setTheme sets data-theme attribute on document.documentElement", () => {
    useStore.getState().setTheme("copper");
    expect(mockSetAttribute).toHaveBeenCalledWith("data-theme", "copper");
  });

  it("initial theme reads from localStorage if present", async () => {
    mockLocalStorage.store["hc-theme"] = "copper";

    // Re-import to test initial state
    vi.resetModules();
    const freshStore = await import("./store");
    expect(freshStore.default.getState().theme).toBe("copper");
  });

  it("initial theme defaults to green if localStorage is empty", async () => {
    mockLocalStorage.store = {};

    vi.resetModules();
    const freshStore = await import("./store");
    expect(freshStore.default.getState().theme).toBe("green");
  });

  it("navigate updates location hash and currentPage", () => {
    navigate("about");
    expect(window.location.hash).toBe("about");
    expect(useStore.getState().currentPage).toBe("about");
  });

  it("setMenuOpen updates menuOpen state", () => {
    useStore.getState().setMenuOpen(true);
    expect(useStore.getState().menuOpen).toBe(true);

    useStore.getState().setMenuOpen(false);
    expect(useStore.getState().menuOpen).toBe(false);
  });
});
