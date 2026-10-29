import { Container } from "@/components/ui/Container";
import { Section, headingId } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WpImage } from "@/components/ui/WpImage";
import type { SectionProps } from "./types";

export function Cards({ section }: SectionProps<"cards">) {
  const { heading, intro, numbered, items } = section;

  if (items.length === 0) {
    return null;
  }

  const List = numbered ? "ol" : "ul";

  return (
    <Section section={section} labelled={Boolean(heading)} className="bg-surface">
      <Container className="py-16 sm:py-24">
        <SectionHeading id={headingId(section)} heading={heading} intro={intro} />
        <List className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.title} className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
              {numbered ? (
                <span
                  aria-hidden="true"
                  className="flex size-11 items-center justify-center rounded-full bg-brand font-display text-lg font-extrabold"
                >
                  {index + 1}
                </span>
              ) : (
                item.icon && <WpImage image={item.icon} sizes="48px" className="size-12" />
              )}
              <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
              {item.body && <p className="mt-2 text-muted">{item.body}</p>}
            </li>
          ))}
        </List>
      </Container>
    </Section>
  );
}
