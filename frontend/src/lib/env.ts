import { z } from "zod";

const EnvSchema = z
  .object({
    CONTENT_SOURCE: z.enum(["wordpress", "fixtures"]).default("wordpress"),
    WORDPRESS_URL: z.url().optional(),
    SITE_URL: z.url().default("http://localhost:3000"),
    FORECOURT_SHARED_SECRET: z.string().default(""),
  })
  .refine((env) => env.CONTENT_SOURCE === "fixtures" || env.WORDPRESS_URL, {
    message: "WORDPRESS_URL is required unless CONTENT_SOURCE=fixtures",
    path: ["WORDPRESS_URL"],
  })
  .transform((env) => ({
    CONTENT_SOURCE: env.CONTENT_SOURCE,
    WORDPRESS_URL: (env.WORDPRESS_URL ?? "").replace(/\/+$/, ""),
    SITE_URL: env.SITE_URL.replace(/\/+$/, ""),
    SHARED_SECRET: env.FORECOURT_SHARED_SECRET,
  }));

export type Env = z.output<typeof EnvSchema>;

export function getEnv(): Env {
  const read = (name: string) => process.env[name] || undefined;

  return EnvSchema.parse({
    CONTENT_SOURCE: read("CONTENT_SOURCE"),
    WORDPRESS_URL: read("WORDPRESS_URL"),
    SITE_URL: read("SITE_URL"),
    FORECOURT_SHARED_SECRET: read("FORECOURT_SHARED_SECRET"),
  });
}
