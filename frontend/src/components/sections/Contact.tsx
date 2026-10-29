import { Container } from "@/components/ui/Container";
import { Section, headingId } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SectionProps } from "./types";

export function Contact({ section }: SectionProps<"contact">) {
  const { heading, intro } = section;

  return (
    <Section section={section} labelled={Boolean(heading)} className="bg-surface">
      <Container className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <SectionHeading id={headingId(section)} heading={heading} intro={intro} />
      </Container>
    </Section>
  );
}
