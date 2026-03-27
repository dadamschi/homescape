import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../leads", () => ({
  submitLead: vi.fn().mockResolvedValue({}),
}));

vi.mock("../data", () => ({
  default: () => ({
    locations: [
      { _id: "loc1", name: "Main Office", phone: "555-1234", hours: "9-5" },
    ],
    siteSettings: { email: "info@homescape.com" },
  }),
}));

import ContactPage from "./ContactPage";
import { submitLead } from "../leads";

// Helper to get form fields by their label text (since labels aren't properly associated)
const getFieldByLabel = (labelText) => {
  const label = screen.getByText(labelText);
  const formGroup = label.closest(".form-group");
  return formGroup.querySelector("input, textarea, select");
};

describe("ContactPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all five form fields", () => {
    render(<ContactPage />);

    expect(getFieldByLabel("Name")).toBeInTheDocument();
    expect(getFieldByLabel("Email")).toBeInTheDocument();
    expect(getFieldByLabel("Phone")).toBeInTheDocument();
    expect(getFieldByLabel("Service")).toBeInTheDocument();
    expect(getFieldByLabel("Message")).toBeInTheDocument();
  });

  it("calls submitLead with correct field values on submit", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    await user.type(getFieldByLabel("Name"), "John Doe");
    await user.type(getFieldByLabel("Email"), "john@example.com");
    await user.type(getFieldByLabel("Phone"), "555-9999");
    await user.selectOptions(getFieldByLabel("Service"), "residential");
    await user.type(getFieldByLabel("Message"), "I need a new house");

    await user.click(screen.getByRole("button", { name: /send inquiry/i }));

    expect(submitLead).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      phone: "555-9999",
      service: "residential",
      message: "I need a new house",
    });
  });

  it("displays success message after submission", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    await user.type(getFieldByLabel("Name"), "John Doe");
    await user.type(getFieldByLabel("Email"), "john@example.com");
    await user.type(getFieldByLabel("Message"), "Test message");

    await user.click(screen.getByRole("button", { name: /send inquiry/i }));

    await waitFor(() => {
      expect(screen.getByText(/thank you/i)).toBeInTheDocument();
    });
  });

  it("prevents submission when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    // Try to submit without filling required fields
    await user.click(screen.getByRole("button", { name: /send inquiry/i }));

    // submitLead should not be called due to HTML5 validation
    expect(submitLead).not.toHaveBeenCalled();
  });

  it("renders contact information from CMS", () => {
    render(<ContactPage />);

    // Phone number from mock data should render
    expect(screen.getByText(/555-1234/)).toBeInTheDocument();
  });

  it("renders email from site settings", () => {
    render(<ContactPage />);

    // Email from mock data should render
    expect(screen.getByText("info@homescape.com")).toBeInTheDocument();
  });
});
