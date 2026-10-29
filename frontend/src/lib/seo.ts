import type { Metadata } from "next";
import type { Page, SectionOf, Settings } from "./schemas";

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => ENTITIES[name.toLowerCase()] ?? match)
    .replace(/\s+/g, " ")
    .trim();
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildMetadata(page: Page, settings: Settings, siteUrl: string): Metadata {
  const { seo } = page;
  const { defaultSeo, siteName } = settings;
  const title = seo.title ?? defaultSeo.title ?? siteName;
  const description = seo.description ?? defaultSeo.description ?? undefined;
  const image = seo.ogImage ?? defaultSeo.ogImage;
  const images = image ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt }] : undefined;

  return {
    metadataBase: new URL(siteUrl),
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: { type: "website", locale: "en_GB", siteName, url: "/", title, description, images },
    twitter: { card: "summary_large_image", title, description, images: images?.map((entry) => entry.url) },
    ...(seo.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

function postalAddress(address: string | null) {
  const lines = address?.split("\n").map((line) => line.trim()).filter(Boolean) ?? [];

  if (lines.length === 0) {
    return undefined;
  }

  if (lines.length < 3) {
    return { "@type": "PostalAddress", streetAddress: lines.join(", "), addressCountry: "GB" };
  }

  return {
    "@type": "PostalAddress",
    streetAddress: lines.slice(0, -2).join(", "),
    addressLocality: lines.at(-2),
    postalCode: lines.at(-1),
    addressCountry: "GB",
  };
}

export function buildJsonLd(page: Page, settings: Settings, siteUrl: string): object[] {
  const url = `${siteUrl}/`;
  const image = page.seo.ogImage ?? settings.defaultSeo.ogImage;
  const address = postalAddress(settings.address);

  const dealer = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${url}#business`,
    name: settings.siteName,
    url,
    ...(settings.phone && { telephone: settings.phone }),
    ...(settings.email && { email: settings.email }),
    ...(image && { image: new URL(image.url, siteUrl).href }),
    ...(address && { address }),
    ...(settings.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: settings.rating.score,
        reviewCount: settings.rating.count,
        bestRating: 5,
      },
    }),
  };

  const questions = page.sections
    .filter((section): section is SectionOf<"faq"> => section.layout === "faq")
    .flatMap((section) => section.items);

  if (questions.length === 0) {
    return [dealer];
  }

  return [
    dealer,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: questions.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: stripHtml(item.answer) },
      })),
    },
  ];
}
