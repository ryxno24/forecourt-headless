import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Section, headingId } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WpImage } from "@/components/ui/WpImage";
import type { SectionProps } from "./types";

export function TextImage({ section }: SectionProps<"text_image">) {
  const { heading, body, image, imagePosition, cta } = section;

  if (!heading && !body && !image) {
    return null;
  }

  return (
    <Section section={section} labelled={Boolean(heading)} className="bg-paper">
      <Container className={`grid gap-10 py-16 sm:py-24 ${image ? "lg:grid-cols-2 lg:items-center lg:gap-16" : ""}`}>
        {image && (
          <WpImage
            image={image}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={`aspect-[4/3] w-full rounded-3xl object-cover ${imagePosition === "right" ? "lg:order-last" : ""}`}
          />
        )}
        <div className="max-w-2xl">
          <SectionHeading id={headingId(section)} heading={heading} />
          {body && <RichText html={body} className="mt-5 text-lg text-muted" />}
          {cta && (
            <div className="mt-8">
              <Button link={cta} />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
