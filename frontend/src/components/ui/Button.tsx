import NextLink from "next/link";
import type { Link } from "@/lib/schemas";

const variants = {
  primary: "bg-brand text-ink hover:bg-brand-strong",
  secondary: "border-2 border-current hover:bg-ink hover:text-white hover:border-ink",
  dark: "bg-ink text-white hover:bg-ink-strong",
} as const;

export function Button({ link, variant = "primary" }: { link: Link; variant?: keyof typeof variants }) {
  const className = `inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-base font-semibold transition-colors ${variants[variant]}`;
  const target = link.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {};

  if (link.url.startsWith("/") && !link.url.startsWith("//")) {
    return (
      <NextLink href={link.url} className={className} {...target}>
        {link.label}
      </NextLink>
    );
  }

  return (
    <a href={link.url} className={className} {...target}>
      {link.label}
    </a>
  );
}
