import { Container } from "@/components/ui/Container";
import { Section, headingId } from "@/components/ui/Section";
import type { SectionProps } from "./types";

export function Stats({ section }: SectionProps<"stats">) {
  const { heading, items } = section;

  if (items.length === 0) {
    return null;
  }

  return (
    <Section section={section} labelled={Boolean(heading)} className="on-dark bg-ink text-white">
      <Container className="py-12 sm:py-16">
        {heading && (
          <h2 id={headingId(section)} className="text-sm font-semibold tracking-widest text-muted uppercase">
            {heading}
          </h2>
        )}
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col-reverse gap-1">
              <dt className="text-muted">{item.label}</dt>
              <dd className="font-display text-4xl font-extrabold text-brand sm:text-5xl">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
