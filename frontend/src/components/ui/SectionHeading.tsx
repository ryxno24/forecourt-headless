export function SectionHeading({
  id,
  heading,
  intro,
  align = "left",
}: {
  id: string;
  heading: string | null;
  intro?: string | null;
  align?: "left" | "center";
}) {
  if (!heading && !intro) {
    return null;
  }

  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {heading && (
        <h2 id={id} className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          {heading}
        </h2>
      )}
      {intro && <p className="mt-4 text-lg text-muted">{intro}</p>}
    </div>
  );
}
