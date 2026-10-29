import { describe, expect, it, vi } from "vitest";
import pageFixture from "./__fixtures__/page-home.json";
import settingsFixture from "./__fixtures__/settings.json";
import { PageSchema, SettingsSchema, parseSections } from "./schemas";

describe("parseSections", () => {
  it("parses the home fixture into 8 sections", () => {
    const sections = parseSections(pageFixture.sections);

    expect(sections.map((section) => section.layout)).toEqual([
      "hero",
      "stats",
      "cards",
      "text_image",
      "testimonials",
      "cta",
      "faq",
      "contact",
    ]);
  });

  it("drops an unknown layout and keeps the rest", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const sections = parseSections([
      ...pageFixture.sections,
      { layout: "carousel", id: "carousel-8", anchor: null },
    ]);

    expect(sections).toHaveLength(8);
    expect(warn).toHaveBeenCalledWith("[sections] dropped", "carousel", expect.anything());
  });

  it("drops a section that fails validation without throwing", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const [hero, ...rest] = pageFixture.sections;

    const sections = parseSections([{ ...hero, heading: null }, ...rest]);

    expect(sections).toHaveLength(7);
    expect(sections.some((section) => section.layout === "hero")).toBe(false);
  });

  it("drops entries that are not objects", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(parseSections([null, "hero", 42])).toEqual([]);
  });
});

describe("PageSchema", () => {
  it("parses the home fixture with typed sections", () => {
    const page = PageSchema.parse(pageFixture);

    expect(page.slug).toBe("home");
    expect(page.seo.noindex).toBe(false);
    expect(page.sections).toHaveLength(8);
  });

  it("keeps the page when one section is invalid", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const page = PageSchema.parse({ ...pageFixture, sections: [{ layout: "hero" }] });

    expect(page.sections).toEqual([]);
  });
});

describe("SettingsSchema", () => {
  it("parses the settings fixture", () => {
    const settings = SettingsSchema.parse(settingsFixture);

    expect(settings.siteName).toBe("Forecourt");
    expect(settings.rating).toEqual({ score: 4.8, count: 2316 });
  });

  it("accepts a missing rating", () => {
    expect(SettingsSchema.parse({ ...settingsFixture, rating: null }).rating).toBeNull();
  });
});
