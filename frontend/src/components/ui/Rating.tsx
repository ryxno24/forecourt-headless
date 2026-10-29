import { StarIcon } from "./Icons";

export function Rating({ value, className = "" }: { value: number; className?: string }) {
  const filled = Math.round(value);

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      <span className="sr-only">Rated {value} out of 5</span>
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon key={index} className={`size-5 ${index < filled ? "text-star" : "text-line"}`} />
      ))}
    </span>
  );
}
