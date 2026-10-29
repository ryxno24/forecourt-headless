import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/env";
import { getPage } from "@/lib/wordpress";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const page = await getPage("home");

  if (!page || page.seo.noindex) {
    return [];
  }

  return [{ url: `${getEnv().SITE_URL}/`, lastModified: page.modified, changeFrequency: "weekly", priority: 1 }];
}
