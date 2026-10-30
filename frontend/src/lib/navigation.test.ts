import { describe, expect, it } from "vitest";
import { page, settings } from "@/components/sections/test-utils";
import { buildNav, homeHref, navLabel, telHref } from "./navigation";

const withAnchor = (anchor: string | null) => ({ ...page.sections[0], anchor });

describe("navLabel", () => {
  it("turns an anchor into a sentence case label", () => {
    expect(navLabel(withAnchor("how-it-works"), "Forecourt")).toBe("How it works");
    expect(navLabel(withAnchor("reviews"), "Forecourt")).toBe("Reviews");
  });

  it("keeps the brand name's capitals", () => {
    expect(navLabel(withAnchor("why-forecourt"), "Forecourt")).toBe("Why Forecourt");
    expect(navLabel(withAnchor("why-acme"), "ACME")).toBe("Why ACME");
  });

  it("uses the override for known abbreviations", () => {
    expect(navLabel(withAnchor("faq"), "Forecourt")).toBe("FAQs");
  });

  it("falls back to the site name without an anchor", () => {
    expect(navLabel(withAnchor(null), "Forecourt")).toBe("Forecourt");
  });
});

describe("buildNav", () => {
  it("links to every anchored section except contact", () => {
    const nav = buildNav(page.sections, settings.siteName);

    expect(nav.map((item) => item.href)).toEqual(["/#how-it-works", "/#why-forecourt", "/#reviews", "/#faq"]);
    expect(nav.map((item) => item.label)).toEqual(["How it works", "Why Forecourt", "Reviews", "FAQs"]);
  });

  it("skips sections without an anchor", () => {
    const sections = page.sections.map((section) => ({ ...section, anchor: null }));

    expect(buildNav(sections, settings.siteName)).toEqual([]);
  });
});

describe("telHref", () => {
  it("strips spaces and punctuation from the phone number", () => {
    expect(telHref("0161 496 0000")).toBe("tel:01614960000");
    expect(telHref("+44 (0)161-496-0000")).toBe("tel:+4401614960000");
  });
});

describe("homeHref", () => {
  it("points in-page anchors at the home page so they work from any route", () => {
    expect(homeHref("#contact")).toBe("/#contact");
  });

  it("leaves other links alone", () => {
    expect(homeHref("https://example.com/")).toBe("https://example.com/");
    expect(homeHref("/privacy")).toBe("/privacy");
  });
});
