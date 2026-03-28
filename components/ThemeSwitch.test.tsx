import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Create mock functions
const mockSetTheme = vi.fn();
let mockTheme = "green";

// Mock the store
vi.mock("@/lib/store", () => ({
  default: (selector: (state: { theme: string; setTheme: typeof mockSetTheme }) => unknown) => {
    const state = {
      theme: mockTheme,
      setTheme: mockSetTheme,
    };
    return selector(state);
  },
}));

import ThemeSwitch from "./ThemeSwitch";

describe("ThemeSwitch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = "green";
  });

  it("renders the current theme label", () => {
    render(<ThemeSwitch />);
    expect(screen.getByText("Green")).toBeInTheDocument();
  });

  it("calls setTheme with the next theme when clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("copper");
  });

  it("shows the correct aria-label", () => {
    render(<ThemeSwitch />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Switch to Copper theme");
  });
});
