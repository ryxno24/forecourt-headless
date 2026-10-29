import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StickyCta } from "@/components/layout/StickyCta";
import { getEnv } from "@/lib/env";
import { buildNav } from "@/lib/navigation";
import { getPage, getSettings } from "@/lib/wordpress";
import "./globals.css";

const heading = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getSettings();

  return {
    metadataBase: new URL(getEnv().SITE_URL),
    title: { default: siteName, template: `%s | ${siteName}` },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, page] = await Promise.all([getSettings(), getPage("home")]);
  const sections = page?.sections ?? [];
  const contactAnchor = sections.find((section) => section.layout === "contact")?.anchor;

  return (
    <html lang="en-GB" className={`${heading.variable} ${body.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <Header settings={settings} nav={buildNav(sections, settings.siteName)} />
        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <Footer settings={settings} />
        {contactAnchor && (
          <StickyCta
            targetId={contactAnchor}
            link={{ label: settings.headerCta?.label ?? "Get my free valuation", url: `#${contactAnchor}`, newTab: false }}
          />
        )}
      </body>
    </html>
  );
}
