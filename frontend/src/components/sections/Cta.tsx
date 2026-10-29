import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section, headingId } from "@/components/ui/Section";
import type { SectionProps } from "./types";

export function Cta({ section }: SectionProps<"cta">) {
  const { heading, body, cta, variant } = section;
  const dark = variant === "dark";

  return (
    <Section section={section} labelled className={dark ? "on-dark bg-ink text-white" : "bg-brand text-ink"}>
      <Container className="flex flex-col items-start gap-6 py-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 id={headingId(section)} className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {heading}
          </h2>
          {body && <p className="mt-3 text-lg">{body}</p>}
        </div>
        {cta && <Button link={cta} variant={dark ? "primary" : "dark"} />}
      </Container>
    </Section>
  );
}
