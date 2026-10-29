import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Container } from "@/components/ui/Container";
import { CheckIcon, PhoneIcon } from "@/components/ui/Icons";
import { Rating } from "@/components/ui/Rating";
import { Section, headingId } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { telHref } from "@/lib/navigation";
import type { SectionProps } from "./types";

export function Contact({ section, settings }: SectionProps<"contact">) {
  const { heading, intro, trustPoints, successMessage } = section;
  const { rating, phone } = settings;

  return (
    <Section section={section} labelled={Boolean(heading)} className="bg-surface">
      <Container className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading id={headingId(section)} heading={heading} intro={intro} />

          {trustPoints.length > 0 && (
            <ul className="mt-8 grid gap-3 text-lg font-medium">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <CheckIcon className="size-6 shrink-0 text-go" />
                  {point}
                </li>
              ))}
            </ul>
          )}

          {rating && (
            <p className="mt-8 flex flex-wrap items-center gap-2 text-muted">
              <Rating value={rating.score} />
              <span>
                <strong className="text-ink">{rating.score}/5</strong> from {rating.count.toLocaleString("en-GB")} reviews
              </span>
            </p>
          )}

          {phone && (
            <p className="mt-8 text-muted">
              Prefer to talk?
              <a href={telHref(phone)} className="mt-1 flex min-h-12 items-center gap-2 text-2xl font-bold text-ink">
                <PhoneIcon className="size-6" />
                <span className="sr-only">Call us on </span>
                {phone}
              </a>
            </p>
          )}
        </div>

        <EnquiryForm successMessage={successMessage} />
      </Container>
    </Section>
  );
}
