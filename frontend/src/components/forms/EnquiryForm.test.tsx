import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EnquiryState } from "@/lib/enquiry-schema";
import { EnquiryForm } from "./EnquiryForm";

const submitEnquiry = vi.hoisted(() => vi.fn<(previous: EnquiryState, formData: FormData) => Promise<EnquiryState>>());

vi.mock("@/actions/enquiry", () => ({ submitEnquiry }));

async function submit() {
  await act(async () => {
    fireEvent.submit(screen.getByRole("button", { name: /get my free valuation/i }).closest("form")!);
  });
}

beforeEach(() => {
  submitEnquiry.mockReset();
  window.dataLayer = [];
});

describe("EnquiryForm", () => {
  it("labels every field", () => {
    render(<EnquiryForm successMessage={null} />);

    for (const label of [/registration/i, /mileage/i, /full name/i, /phone/i, /email/i]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("marks invalid fields, links their messages and keeps what was typed", async () => {
    submitEnquiry.mockResolvedValue({
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: { email: "Enter a valid email address." },
      values: { email: "nope", name: "Priya Shah" },
    });
    render(<EnquiryForm successMessage={null} />);

    await submit();

    const email = screen.getByLabelText(/email/i);
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription(/enter a valid email address/i);
    expect(email).toHaveFocus();
    expect(email).toHaveValue("nope");
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Priya Shah");
    expect(screen.getByRole("alert")).toHaveTextContent("Please check the highlighted fields.");
  });

  it("shows the success message, moves focus to it and records the conversion", async () => {
    submitEnquiry.mockResolvedValue({ status: "success" });
    render(<EnquiryForm successMessage="Thanks, we will call you within the hour." />);

    await submit();

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Thanks, we will call you within the hour.");
    expect(status).toHaveFocus();
    expect(window.dataLayer).toEqual([{ event: "enquiry_submitted" }]);
    expect(screen.queryByRole("button", { name: /get my free valuation/i })).toBeNull();
  });

  it("hides the honeypot from people and assistive technology", () => {
    const { container } = render(<EnquiryForm successMessage={null} />);
    const honeypot = container.querySelector('input[name="website"]')!;

    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("flags the submission as enhanced and swaps native validation for inline messages", () => {
    const { container } = render(<EnquiryForm successMessage={null} />);

    expect(container.querySelector('input[name="enhanced"]')).toHaveValue("1");
    expect(container.querySelector("form")).toHaveAttribute("novalidate");
    expect(screen.getByLabelText(/email/i)).toBeRequired();
  });
});
