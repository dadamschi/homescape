import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock navigate function
const mockNavigate = vi.fn();
let mockCurrentPage = "home";

vi.mock("../store", () => ({
  default: (selector) => {
    const state = {
      currentPage: mockCurrentPage,
      theme: "green",
      setTheme: vi.fn(),
    };
    return selector(state);
  },
  navigate: (...args) => mockNavigate(...args),
}));

import Nav from "./Nav";

describe("Nav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentPage = "home";
  });

  it("renders all nav links", () => {
    render(<Nav />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Testimonials")).toBeInTheDocument();
  });

  it("calls navigate with correct page key when link is clicked", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    await user.click(screen.getByText("Projects"));

    expect(mockNavigate).toHaveBeenCalledWith("projects");
  });

  it("renders hamburger button for mobile menu", () => {
    render(<Nav />);

    // The hamburger is a button with the menu icon
    const hamburger = document.querySelector(".nav-hamburger");
    expect(hamburger).toBeInTheDocument();
  });

  it("opens mobile menu when hamburger is clicked", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    const hamburger = document.querySelector(".nav-hamburger");
    await user.click(hamburger);

    // Mobile menu should appear with nav links
    const mobileMenu = document.querySelector(".mobile-menu");
    expect(mobileMenu).toBeInTheDocument();
  });

  it("closes mobile menu when a link inside it is clicked", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    // Open menu
    const hamburger = document.querySelector(".nav-hamburger");
    await user.click(hamburger);

    // Click a link in the mobile menu
    const mobileMenu = document.querySelector(".mobile-menu");
    const aboutLink = mobileMenu.querySelector("a");
    await user.click(aboutLink);

    // Menu should be closed
    expect(document.querySelector(".mobile-menu")).not.toBeInTheDocument();
  });

  it("closes mobile menu when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    // Open menu
    const hamburger = document.querySelector(".nav-hamburger");
    await user.click(hamburger);

    // Click close button
    const closeButton = document.querySelector(".mobile-menu-close");
    await user.click(closeButton);

    // Menu should be closed
    expect(document.querySelector(".mobile-menu")).not.toBeInTheDocument();
  });

  it("navigates to home when logo is clicked", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    const logo = document.querySelector(".nav-logo");
    await user.click(logo);

    expect(mockNavigate).toHaveBeenCalledWith("home");
  });
});
