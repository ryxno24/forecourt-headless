import { z } from "zod";

const text = z.string().min(1);
const optionalText = text.nullable();

export const ImageSchema = z.object({
  url: text,
  alt: z.string(),
  width: z.number().int().nonnegative(),
  height: z.number().int().nonnegative(),
});

export const LinkSchema = z.object({
  label: text,
  url: text,
  newTab: z.boolean(),
});

const base = { id: text, anchor: optionalText };

const HeroSchema = z.object({
  ...base,
  layout: z.literal("hero"),
  heading: text,
  eyebrow: optionalText,
  body: optionalText,
  primaryCta: LinkSchema.nullable(),
  secondaryCta: LinkSchema.nullable(),
  image: ImageSchema.nullable(),
  trustPoints: z.array(text),
});

const TextImageSchema = z.object({
  ...base,
  layout: z.literal("text_image"),
  heading: optionalText,
  body: optionalText,
  image: ImageSchema.nullable(),
  imagePosition: z.enum(["left", "right"]),
  cta: LinkSchema.nullable(),
});

const CardsSchema = z.object({
  ...base,
  layout: z.literal("cards"),
  heading: optionalText,
  intro: optionalText,
  numbered: z.boolean(),
  items: z.array(z.object({ title: text, body: optionalText, icon: ImageSchema.nullable() })),
});

const TestimonialsSchema = z.object({
  ...base,
  layout: z.literal("testimonials"),
  heading: optionalText,
  items: z.array(
    z.object({
      quote: text,
      name: text,
      location: optionalText,
      rating: z.number().int().min(1).max(5).nullable(),
    }),
  ),
});

const StatsSchema = z.object({
  ...base,
  layout: z.literal("stats"),
  heading: optionalText,
  items: z.array(z.object({ value: text, label: text })),
});

const CtaSchema = z.object({
  ...base,
  layout: z.literal("cta"),
  heading: text,
  body: optionalText,
  cta: LinkSchema.nullable(),
  variant: z.enum(["dark", "brand"]),
});

const FaqSchema = z.object({
  ...base,
  layout: z.literal("faq"),
  heading: optionalText,
  items: z.array(z.object({ question: text, answer: text })),
});

const ContactSchema = z.object({
  ...base,
  layout: z.literal("contact"),
  heading: optionalText,
  intro: optionalText,
  trustPoints: z.array(text).default([]),
  successMessage: optionalText,
});

export const SectionSchema = z.discriminatedUnion("layout", [
  HeroSchema,
  TextImageSchema,
  CardsSchema,
  TestimonialsSchema,
  StatsSchema,
  CtaSchema,
  FaqSchema,
  ContactSchema,
]);

export type Image = z.infer<typeof ImageSchema>;
export type Link = z.infer<typeof LinkSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Layout = Section["layout"];
export type SectionOf<L extends Layout> = Extract<Section, { layout: L }>;

export function parseSections(raw: unknown[]): Section[] {
  return raw.flatMap((entry) => {
    const result = SectionSchema.safeParse(entry);

    if (result.success) {
      return [result.data];
    }

    const layout = typeof entry === "object" && entry !== null ? (entry as { layout?: unknown }).layout : entry;
    console.warn("[sections] dropped", layout, z.flattenError(result.error).fieldErrors);

    return [];
  });
}

export const PageSchema = z.object({
  id: z.number().int(),
  slug: text,
  title: z.string(),
  modified: z.string(),
  seo: z.object({
    title: optionalText,
    description: optionalText,
    ogImage: ImageSchema.nullable(),
    noindex: z.boolean(),
  }),
  sections: z.array(z.unknown()).transform(parseSections),
});

export const SettingsSchema = z.object({
  siteName: text,
  phone: optionalText,
  email: optionalText,
  address: optionalText,
  footerText: optionalText,
  headerCta: LinkSchema.nullable(),
  rating: z.object({ score: z.number().min(0).max(5), count: z.number().int().positive() }).nullable(),
  defaultSeo: z.object({
    title: optionalText,
    description: optionalText,
    ogImage: ImageSchema.nullable(),
  }),
});

export type Page = z.infer<typeof PageSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
