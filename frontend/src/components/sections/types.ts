import type { Layout, SectionOf, Settings } from "@/lib/schemas";

export type SectionProps<L extends Layout> = { section: SectionOf<L>; settings: Settings };
