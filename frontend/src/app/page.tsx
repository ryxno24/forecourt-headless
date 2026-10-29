import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { getPage, getSettings } from "@/lib/wordpress";

export default async function HomePage() {
  const [page, settings] = await Promise.all([getPage("home"), getSettings()]);

  if (!page) {
    notFound();
  }

  return <SectionRenderer sections={page.sections} settings={settings} />;
}
