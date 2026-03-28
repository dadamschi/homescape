import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock fetch
global.fetch = vi.fn();

import QuickContact from "./QuickContact";

describe("QuickContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it("renders the floating contact tab", () => {
    render(<QuickContact />);

    const tab = screen.getByRole("button", { name: /contact us/i });
    expect(tab).toBeInTheDocument();
  });

  it("opens the drawer when tab is clicked", async () => {
    const user = userEvent.setup();
    render(<QuickContact />);

    const tab = screen.getByRole("button", { name: /contact us/i });
    await user.click(tab);

    // Drawer should be open with the title
    expect(screen.getByText("Contact Us About Your Project!")).toBeInTheDocument();
  });

  it("closes the drawer when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<QuickContact />);

    // Open drawer
    const tab = screen.getByRole("button", { name: /contact us/i });
    await user.click(tab);

    // Close drawer
    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    // Tab should be visible again (drawer closed)
    expect(screen.getByRole("button", { name: /contact us/i })).toBeInTheDocument();
  });

  it("shows form fields when drawer is open", async () => {
    const user = userEvent.setup();
    render(<QuickContact />);

    const tab = screen.getByRole("button", { name: /contact us/i });
    await user.click(tab);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it("submits the form and shows success message", async () => {
    const user = userEvent.setup();
    render(<QuickContact />);

    // Open drawer
    await user.click(screen.getByRole("button", { name: /contact us/i }));

    // Fill form
    await user.type(screen.getByLabelText(/name/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");

    // Submit
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));

    // Check success message
    expect(await screen.findByText(/thanks/i)).toBeInTheDocument();
  });
});
