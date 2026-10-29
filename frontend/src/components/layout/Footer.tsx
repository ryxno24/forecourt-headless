import { Container } from "@/components/ui/Container";
import { telHref } from "@/lib/navigation";
import type { Settings } from "@/lib/schemas";

export function Footer({ settings }: { settings: Settings }) {
  const { siteName, address, phone, email, footerText } = settings;

  return (
    <footer className="on-dark bg-ink pb-24 text-white md:pb-0">
      <Container className="grid gap-10 py-12 sm:py-16 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-extrabold">{siteName}</p>
          {footerText && <p className="mt-3 max-w-sm text-sm text-muted">{footerText}</p>}
        </div>
        {address && (
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase">Find us</p>
            <address className="mt-3 whitespace-pre-line text-muted not-italic">{address}</address>
          </div>
        )}
        {(phone || email) && (
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase">Talk to us</p>
            <ul className="mt-3 space-y-2 text-muted">
              {phone && (
                <li>
                  <a href={telHref(phone)} className="hover:text-white hover:underline">
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-white hover:underline">
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </Container>
    </footer>
  );
}
