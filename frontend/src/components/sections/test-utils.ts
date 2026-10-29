import pageFixture from "@/lib/__fixtures__/page-home.json";
import settingsFixture from "@/lib/__fixtures__/settings.json";
import { PageSchema, SettingsSchema, type Layout, type SectionOf } from "@/lib/schemas";

export const page = PageSchema.parse(pageFixture);
export const settings = SettingsSchema.parse(settingsFixture);

export function fixtureSection<L extends Layout>(layout: L, overrides: Partial<SectionOf<L>> = {}): SectionOf<L> {
  const section = page.sections.find((entry): entry is SectionOf<L> => entry.layout === layout);

  if (!section) {
    throw new Error(`No ${layout} section in fixture`);
  }

  return { ...section, ...overrides };
}
