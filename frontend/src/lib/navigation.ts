import type { Section } from "./schemas";

export type NavItem = { href: string; label: string };

const LABELS: Record<string, string> = { faq: "FAQs" };

export function navLabel(section: Section, siteName: string): string {
  if (!section.anchor) return siteName;
  if (LABELS[section.anchor]) return LABELS[section.anchor];

  const label = section.anchor
    .split("-")
    .map((word) => (word === siteName.toLowerCase() ? siteName : word))
    .join(" ");

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function buildNav(sections: Section[], siteName: string): NavItem[] {
  return sections
    .filter((section) => section.anchor && section.layout !== "contact")
    .map((section) => ({ href: `#${section.anchor}`, label: navLabel(section, siteName) }));
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
