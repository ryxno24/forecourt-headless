import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { CheckIcon, PhoneIcon } from "@/components/ui/Icons";
import { telHref } from "@/lib/navigation";
import { getPage, getSettings } from "@/lib/wordpress";

const OUTCOMES = ["sent", "failed"] as const;
type Outcome = (typeof OUTCOMES)[number];

export function generateStaticParams() {
  return OUTCOMES.map((outcome) => ({ outcome }));
}

export const metadata: Metadata = {
  title: "Your valuation request",
  robots: { index: false, follow: false },
};

export default async function EnquiryOutcome({ params }: { params: Promise<{ outcome: string }> }) {
  const { outcome } = await params;

  if (!OUTCOMES.includes(outcome as Outcome)) {
    notFound();
  }

  const [page, { phone }] = await Promise.all([getPage("home"), getSettings()]);
  const contact = page?.sections.find((section) => section.layout === "contact");
  const sent = outcome === "sent";

  return (
    <Container className="max-w-2xl py-20 sm:py-28">
      {sent ? (
        <CheckIcon className="size-12 text-go" />
      ) : (
        <PhoneIcon className="size-12" />
      )}
      <h1 className="mt-6 font-display text-4xl font-bold sm:text-5xl">
        {sent ? "Thanks, we've got your details" : "Sorry, we couldn't send your details"}
      </h1>
      <p className="mt-6 text-lg text-muted">
        {sent
          ? (contact?.layout === "contact" && contact.successMessage) || "One of our buyers will be in touch shortly."
          : "Please check your details and try again."}
      </p>
      {phone && (
        <p className="mt-6 text-lg">
          {sent ? "Questions in the meantime? " : "Or call us on "}
          <a href={telHref(phone)} className="font-bold underline underline-offset-4">
            {phone}
          </a>
        </p>
      )}
      <a
        href={sent ? "/" : "/#contact"}
        className="mt-10 inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 font-semibold text-white hover:bg-ink-strong"
      >
        {sent ? "Back to the homepage" : "Try again"}
      </a>
    </Container>
  );
}
