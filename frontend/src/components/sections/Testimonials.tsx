import { Container } from "@/components/ui/Container";
import { Rating } from "@/components/ui/Rating";
import { Section, headingId } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SectionProps } from "./types";

export function Testimonials({ section }: SectionProps<"testimonials">) {
  const { heading, items } = section;

  if (items.length === 0) {
    return null;
  }

  return (
    <Section section={section} labelled={Boolean(heading)} className="bg-surface">
      <Container className="py-16 sm:py-24">
        <SectionHeading id={headingId(section)} heading={heading} />
        <ul className="mt-10 grid gap-6 lg:grid-cols-3">
          {items.map((item) => (
            <li key={`${item.name}-${item.quote.slice(0, 20)}`}>
              <figure className="flex h-full flex-col rounded-2xl bg-paper p-6 ring-1 ring-line sm:p-8">
                {item.rating && <Rating value={item.rating} />}
                <blockquote className="mt-4 flex-1 text-lg">
                  <p>&ldquo;{item.quote}&rdquo;</p>
                </blockquote>
                <figcaption className="mt-6 font-semibold">
                  {item.name}
                  {item.location && <span className="font-normal text-muted">, {item.location}</span>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
