import type { ComponentType } from "react";
import type { Section, Settings } from "@/lib/schemas";
import { registry } from "./registry";

type AnySectionComponent = ComponentType<{ section: Section; settings: Settings }>;

export function SectionRenderer({ sections, settings }: { sections: Section[]; settings: Settings }) {
  return sections.map((section) => {
    const Component = registry[section.layout] as AnySectionComponent | undefined;

    return Component ? <Component key={section.id} section={section} settings={settings} /> : null;
  });
}
