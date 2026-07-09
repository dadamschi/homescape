import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock fetch
global.fetch = vi.fn();

// Mock SimpleCaptcha to auto-validate
vi.mock("./SimpleCaptcha", () => ({
  default: ({ onValidChange }: { onValidChange: (valid: boolean, honeypot: boolean) => void }) => {
    // Call onValidChange immediately to simulate valid captcha
    onValidChange(true, false);
    return <div data-testid="mock-captcha">Mocked Captcha</div>;
  },
}));

import ContactForm from "./ContactForm";

describe("ContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it("renders form fields", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it("submits form data to the API", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/phone/i), "555-1234");
    await user.type(screen.getByLabelText(/message/i), "Test message");

    await user.click(screen.getByRole("button", { name: /send inquiry/i }));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/lead",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("shows success message after submission", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/message/i), "Test message");

    await user.click(screen.getByRole("button", { name: /send inquiry/i }));

    expect(await screen.findByText(/thank you/i)).toBeInTheDocument();
  });

  it("shows disabled state while submitting", async () => {
    const user = userEvent.setup();

    // Make fetch hang
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));

    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/message/i), "Test");

    const submitBtn = screen.getByRole("button", { name: /send inquiry/i });
    await user.click(submitBtn);

    expect(screen.getByText(/sending/i)).toBeInTheDocument();
  });
});
