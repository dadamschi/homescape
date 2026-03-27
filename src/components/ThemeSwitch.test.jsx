import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the store
const mockSetTheme = vi.fn();
let mockTheme = "green";

vi.mock("../store", () => ({
  default: (selector) => {
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

  it("renders with the current theme label", () => {
    render(<ThemeSwitch />);
    expect(screen.getByText("Green")).toBeInTheDocument();
  });

  it("shows button to switch to the other theme", () => {
    render(<ThemeSwitch />);
    expect(screen.getByRole("button", { name: /switch to copper theme/i })).toBeInTheDocument();
  });

  it("clicking toggles to the other theme", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch />);

    await user.click(screen.getByRole("button", { name: /switch to copper theme/i }));

    expect(mockSetTheme).toHaveBeenCalledWith("copper");
  });

  it("shows copper label when theme is copper", () => {
    mockTheme = "copper";
    render(<ThemeSwitch />);

    expect(screen.getByText("Copper")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /switch to green theme/i })).toBeInTheDocument();
  });
});
