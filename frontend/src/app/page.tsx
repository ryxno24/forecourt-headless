import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { getEnv } from "@/lib/env";
import { buildJsonLd, buildMetadata, serializeJsonLd } from "@/lib/seo";
import { getPage, getSettings } from "@/lib/wordpress";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage("home"), getSettings()]);

  return page ? buildMetadata(page, settings, getEnv().SITE_URL) : {};
}

export default async function HomePage() {
  const [page, settings] = await Promise.all([getPage("home"), getSettings()]);

  if (!page) {
    notFound();
  }

  return (
    <>
      {buildJsonLd(page, settings, getEnv().SITE_URL).map((node, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(node) }} />
      ))}
      <SectionRenderer sections={page.sections} settings={settings} />
    </>
  );
}
