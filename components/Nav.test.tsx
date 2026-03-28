import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock the store
vi.mock("@/lib/store", () => ({
  default: (selector: (state: { theme: string; setTheme: () => void }) => string | (() => void)) => {
    const state = {
      theme: "green",
      setTheme: vi.fn(),
    };
    return selector(state);
  },
}));

import Nav from "./Nav";

describe("Nav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all nav links", () => {
    render(<Nav />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Testimonials")).toBeInTheDocument();
  });

  it("renders hamburger button for mobile menu", () => {
    render(<Nav />);

    const hamburger = document.querySelector(".nav-hamburger");
    expect(hamburger).toBeInTheDocument();
  });

  it("opens mobile menu when hamburger is clicked", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    const hamburger = document.querySelector(".nav-hamburger");
    expect(hamburger).not.toBeNull();
    await user.click(hamburger!);

    const mobileMenu = document.querySelector(".mobile-menu");
    expect(mobileMenu).toBeInTheDocument();
  });

  it("closes mobile menu when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    // Open menu
    const hamburger = document.querySelector(".nav-hamburger");
    await user.click(hamburger!);

    // Click close button
    const closeButton = document.querySelector(".mobile-menu-close");
    await user.click(closeButton!);

    // Menu should be closed
    expect(document.querySelector(".mobile-menu")).not.toBeInTheDocument();
  });

  it("renders the logo with correct styling", () => {
    render(<Nav />);

    const logo = document.querySelector(".nav-logo");
    expect(logo).toBeInTheDocument();
    expect(screen.getByText("homescape")).toBeInTheDocument();
    expect(screen.getByText(/construction, inc./i)).toBeInTheDocument();
  });
});
