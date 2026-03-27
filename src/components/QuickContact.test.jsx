import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../leads", () => ({
  submitLead: vi.fn().mockResolvedValue({}),
}));

import QuickContact from "./QuickContact";
import { submitLead } from "../leads";

// Helper to get form fields by their label text (since labels aren't properly associated)
const getFieldByLabel = (labelText) => {
  const label = screen.getByText(labelText);
  const formGroup = label.closest(".form-group");
  return formGroup.querySelector("input, textarea, select");
};

describe("QuickContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "";
  });

  it("renders the tab button on initial load", () => {
    render(<QuickContact />);
    expect(screen.getByRole("button", { name: /get a free quote/i })).toBeInTheDocument();
  });

  it("opens the drawer when the tab is clicked", async () => {
    const user = userEvent.setup();
    render(<QuickContact />);

    await user.click(screen.getByRole("button", { name: /get a free quote/i }));

    expect(screen.getByText("Get a Free Quote")).toBeInTheDocument();
  });

  it("closes the drawer when backdrop is clicked", async () => {
    const user = userEvent.setup();
    render(<QuickContact />);

    await user.click(screen.getByRole("button", { name: /get a free quote/i }));
    expect(screen.getByText("Get a Free Quote")).toBeInTheDocument();

    // Click the backdrop
    const backdrop = document.querySelector(".qc-backdrop");
    await user.click(backdrop);

    // Tab button should reappear
    expect(screen.getByRole("button", { name: /get a free quote/i })).toBeInTheDocument();
  });

  it("closes the drawer when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<QuickContact />);

    await user.click(screen.getByRole("button", { name: /get a free quote/i }));
    await user.click(screen.getByRole("button", { name: /close/i }));

    expect(screen.getByRole("button", { name: /get a free quote/i })).toBeInTheDocument();
  });

  it("renders all form fields inside the open drawer", async () => {
    const user = userEvent.setup();
    render(<QuickContact />);

    await user.click(screen.getByRole("button", { name: /get a free quote/i }));

    expect(getFieldByLabel("Name")).toBeInTheDocument();
    expect(getFieldByLabel("Email")).toBeInTheDocument();
    expect(getFieldByLabel("Phone")).toBeInTheDocument();
    expect(getFieldByLabel("Service")).toBeInTheDocument();
    expect(getFieldByLabel("Message")).toBeInTheDocument();
  });

  it("calls submitLead with correct payload including source on submit", async () => {
    const user = userEvent.setup();
    render(<QuickContact />);

    await user.click(screen.getByRole("button", { name: /get a free quote/i }));
    await user.type(getFieldByLabel("Name"), "Jane Smith");
    await user.type(getFieldByLabel("Email"), "jane@example.com");
    await user.type(getFieldByLabel("Message"), "Need a quote");
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));

    expect(submitLead).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Jane Smith",
        email: "jane@example.com",
        message: "Need a quote",
        source: "Quick Contact Widget",
      })
    );
  });

  it("renders success state after submit resolves", async () => {
    const user = userEvent.setup();
    render(<QuickContact />);

    await user.click(screen.getByRole("button", { name: /get a free quote/i }));
    await user.type(getFieldByLabel("Name"), "Jane Smith");
    await user.type(getFieldByLabel("Email"), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));

    await waitFor(() => {
      expect(screen.getByText(/thanks/i)).toBeInTheDocument();
    });
  });

  it("closes drawer and resets success state when Done button is clicked", async () => {
    const user = userEvent.setup();
    render(<QuickContact />);

    await user.click(screen.getByRole("button", { name: /get a free quote/i }));
    await user.type(getFieldByLabel("Name"), "Jane Smith");
    await user.type(getFieldByLabel("Email"), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));

    await waitFor(() => {
      expect(screen.getByText(/thanks/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /done/i }));

    expect(screen.getByRole("button", { name: /get a free quote/i })).toBeInTheDocument();
  });

  it("locks body scroll when drawer is open", async () => {
    const user = userEvent.setup();
    render(<QuickContact />);

    expect(document.body.style.overflow).toBe("");

    await user.click(screen.getByRole("button", { name: /get a free quote/i }));

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("releases body scroll when drawer is closed", async () => {
    const user = userEvent.setup();
    render(<QuickContact />);

    await user.click(screen.getByRole("button", { name: /get a free quote/i }));
    expect(document.body.style.overflow).toBe("hidden");

    await user.click(screen.getByRole("button", { name: /close/i }));

    expect(document.body.style.overflow).toBe("");
  });
});
