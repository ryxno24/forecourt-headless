import { Container } from "@/components/ui/Container";
import { PlusIcon } from "@/components/ui/Icons";
import { RichText } from "@/components/ui/RichText";
import { Section, headingId } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SectionProps } from "./types";

export function Faq({ section }: SectionProps<"faq">) {
  const { heading, items } = section;

  if (items.length === 0) {
    return null;
  }

  return (
    <Section section={section} labelled={Boolean(heading)} className="bg-paper">
      <Container className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <SectionHeading id={headingId(section)} heading={heading} />
        <div className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <details key={item.question} className="faq-item group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-semibold transition-colors hover:text-ink-strong [&::-webkit-details-marker]:hidden">
                {item.question}
                <PlusIcon className="size-6 shrink-0 transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none" />
              </summary>
              <RichText html={item.answer} className="pb-6 text-muted" />
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
