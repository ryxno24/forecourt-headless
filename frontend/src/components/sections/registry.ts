import type { ComponentType } from "react";
import type { Layout } from "@/lib/schemas";
import { Cards } from "./Cards";
import { Contact } from "./Contact";
import { Cta } from "./Cta";
import { Faq } from "./Faq";
import { Hero } from "./Hero";
import { Stats } from "./Stats";
import { Testimonials } from "./Testimonials";
import { TextImage } from "./TextImage";
import type { SectionProps } from "./types";

export const registry: { [L in Layout]: ComponentType<SectionProps<L>> } = {
  hero: Hero,
  text_image: TextImage,
  cards: Cards,
  testimonials: Testimonials,
  stats: Stats,
  cta: Cta,
  faq: Faq,
  contact: Contact,
};
