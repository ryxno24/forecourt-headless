import { describe, expect, it } from "vitest";
import { page, settings } from "@/components/sections/test-utils";
import { buildJsonLd, buildMetadata, serializeJsonLd, stripHtml } from "./seo";

const SITE = "https://forecourt.example";

type Node = Record<string, unknown> & { "@type": string };

const ofType = (nodes: object[], type: string) => (nodes as Node[]).find((node) => node["@type"] === type);
const withoutFaq = { ...page, sections: page.sections.filter((section) => section.layout !== "faq") };

describe("buildMetadata", () => {
  it("uses the page SEO title over the defaults", () => {
    expect(buildMetadata(page, settings, SITE).title).toEqual({
      absolute: "Sell Your Car in Manchester, Paid in 24 Hours | Forecourt",
    });
  });

  it("falls back to the settings defaults when the page has none", () => {
    const bare = { ...page, seo: { ...page.seo, title: null, description: null, ogImage: null } };
    const metadata = buildMetadata(bare, settings, SITE);

    expect(metadata.title).toEqual({ absolute: settings.defaultSeo.title });
    expect(metadata.description).toBe(settings.defaultSeo.description);
    expect(metadata.openGraph?.images).toEqual([expect.objectContaining({ url: settings.defaultSeo.ogImage?.url })]);
  });

  it("sets the canonical URL and social cards from the site URL", () => {
    const metadata = buildMetadata(page, settings, SITE);

    expect(metadata.metadataBase).toEqual(new URL(SITE));
    expect(metadata.alternates?.canonical).toBe("/");
    expect(metadata.openGraph).toMatchObject({ type: "website", locale: "en_GB", siteName: "Forecourt", url: "/" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("asks search engines not to index when the page is set to noindex", () => {
    expect(buildMetadata(page, settings, SITE).robots).toBeUndefined();
    expect(buildMetadata({ ...page, seo: { ...page.seo, noindex: true } }, settings, SITE).robots).toEqual({
      index: false,
      follow: false,
    });
  });
});

describe("buildJsonLd", () => {
  it("describes the business with contact details, address and rating", () => {
    const dealer = ofType(buildJsonLd(page, settings, SITE), "AutoDealer");

    expect(dealer).toMatchObject({
      "@context": "https://schema.org",
      name: "Forecourt",
      url: `${SITE}/`,
      telephone: "0161 496 0000",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Unit 4, Trade Park Way",
        addressLocality: "Manchester",
        postalCode: "M17 1AA",
        addressCountry: "GB",
      },
      aggregateRating: { "@type": "AggregateRating", ratingValue: 4.8, reviewCount: 2316, bestRating: 5 },
    });
  });

  it("omits the rating and address when settings do not have them", () => {
    const dealer = ofType(buildJsonLd(page, { ...settings, rating: null, address: null }, SITE), "AutoDealer");

    expect(dealer).not.toHaveProperty("aggregateRating");
    expect(dealer).not.toHaveProperty("address");
  });

  it("emits FAQPage with plain text answers only when FAQ items exist", () => {
    const faq = ofType(buildJsonLd(page, settings, SITE), "FAQPage") as unknown as { mainEntity: Node[] };

    expect(faq.mainEntity).toHaveLength(5);
    expect(faq.mainEntity[0]).toMatchObject({
      "@type": "Question",
      name: "How do you work out my valuation?",
      acceptedAnswer: { "@type": "Answer", text: expect.stringMatching(/^We use live auction/) },
    });
    expect(JSON.stringify(faq)).not.toContain("<p>");
    expect(ofType(buildJsonLd(withoutFaq, settings, SITE), "FAQPage")).toBeUndefined();
  });
});

describe("stripHtml", () => {
  it("removes tags, decodes entities and collapses whitespace", () => {
    expect(stripHtml("<p>We&#8217;ll pay &amp; collect.</p>\n<p>Same&nbsp;day.</p>")).toBe("We’ll pay & collect. Same day.");
  });
});

describe("serializeJsonLd", () => {
  it("cannot close the surrounding script tag", () => {
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});
