import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CheckIcon } from "@/components/ui/Icons";
import { Rating } from "@/components/ui/Rating";
import { Section, headingId } from "@/components/ui/Section";
import { WpImage } from "@/components/ui/WpImage";
import type { SectionProps } from "./types";

export function Hero({ section, settings }: SectionProps<"hero">) {
  const { eyebrow, heading, body, primaryCta, secondaryCta, image, trustPoints } = section;
  const { rating } = settings;

  return (
    <Section section={section} labelled className="bg-paper">
      <Container className={`grid gap-10 py-12 sm:py-20 ${image ? "lg:grid-cols-2 lg:items-center lg:gap-16" : ""}`}>
        <div className="max-w-2xl">
          {eyebrow && <p className="text-sm font-semibold tracking-widest text-muted uppercase">{eyebrow}</p>}
          <h1
            id={headingId(section)}
            className="mt-3 font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {heading}
          </h1>
          {body && <p className="mt-5 text-lg text-muted sm:text-xl">{body}</p>}
          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {primaryCta && <Button link={primaryCta} />}
              {secondaryCta && <Button link={secondaryCta} variant="secondary" />}
            </div>
          )}
          {trustPoints.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-medium">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <CheckIcon className="size-5 shrink-0 text-go" />
                  {point}
                </li>
              ))}
            </ul>
          )}
          {rating && (
            <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted">
              <Rating value={rating.score} />
              <span>
                <strong className="text-ink">{rating.score}/5</strong> from {rating.count.toLocaleString("en-GB")} reviews
              </span>
            </p>
          )}
        </div>
        {image && (
          <WpImage
            image={image}
            preload
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-[4/3] w-full rounded-3xl object-cover"
          />
        )}
      </Container>
    </Section>
  );
}
