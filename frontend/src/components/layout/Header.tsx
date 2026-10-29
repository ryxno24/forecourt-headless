import NextLink from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PhoneIcon } from "@/components/ui/Icons";
import { telHref, type NavItem } from "@/lib/navigation";
import type { Settings } from "@/lib/schemas";

export function Header({ settings, nav }: { settings: Settings; nav: NavItem[] }) {
  const { siteName, phone, headerCta } = settings;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-6 lg:h-20">
        <NextLink href="/" className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight">
          <span aria-hidden="true" className="size-3 rounded-full bg-brand ring-2 ring-ink" />
          {siteName}
        </NextLink>

        {nav.length > 0 && (
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex gap-8 font-medium">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="underline-offset-8 hover:underline">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {phone && (
            <a href={telHref(phone)} className="flex min-h-12 items-center gap-2 font-semibold">
              <PhoneIcon className="size-5 text-go" />
              <span className="sr-only">Call us on</span>
              <span className="max-sm:sr-only">{phone}</span>
            </a>
          )}
          {headerCta && (
            <div className="hidden sm:block">
              <Button link={headerCta} />
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
