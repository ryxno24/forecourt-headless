import type { ReactNode } from "react";

type SectionBase = { id: string; anchor: string | null };

export const headingId = (section: SectionBase) => `${section.id}-heading`;

export function Section({
  section,
  labelled,
  className = "",
  children,
}: {
  section: SectionBase;
  labelled: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={section.anchor ?? undefined}
      aria-labelledby={labelled ? headingId(section) : undefined}
      className={`scroll-mt-24 ${className}`}
    >
      {children}
    </section>
  );
}
