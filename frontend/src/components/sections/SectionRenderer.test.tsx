import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionRenderer } from "./SectionRenderer";
import { page, settings } from "./test-utils";

describe("SectionRenderer", () => {
  it("renders sections in order", () => {
    const { container } = render(<SectionRenderer sections={page.sections} settings={settings} />);

    const sections = container.querySelectorAll(":scope > section");
    expect(sections).toHaveLength(8);
    expect(sections[0].querySelector("h1")).not.toBeNull();
  });

  it("renders exactly one h1", () => {
    render(<SectionRenderer sections={page.sections} settings={settings} />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("uses the editor's anchor as the section id", () => {
    const { container } = render(<SectionRenderer sections={page.sections} settings={settings} />);

    for (const anchor of ["how-it-works", "why-forecourt", "reviews", "faq", "contact"]) {
      expect(container.querySelector(`section#${anchor}`)).not.toBeNull();
    }
  });

  it("renders nothing for an empty page", () => {
    const { container } = render(<SectionRenderer sections={[]} settings={settings} />);

    expect(container.innerHTML).toBe("");
  });
});
