import { cacheLife, cacheTag } from "next/cache";
import type { z } from "zod";
import { getEnv } from "./env";
import pageHomeFixture from "./__fixtures__/page-home.json";
import settingsFixture from "./__fixtures__/settings.json";
import { PageSchema, SettingsSchema, type Page, type Settings } from "./schemas";

const TIMEOUT_MS = 8000;

const fixturePages: Record<string, unknown> = { home: pageHomeFixture };

export class WordPressError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "WordPressError";
  }
}

async function request(path: string): Promise<unknown | null> {
  const url = `${getEnv().WORDPRESS_URL}/wp-json/forecourt/v1${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new WordPressError(`Could not reach WordPress at ${url}`, undefined, { cause: error });
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new WordPressError(`WordPress returned ${response.status} for ${path}`, response.status);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new WordPressError(`WordPress returned invalid JSON for ${path}`, response.status, { cause: error });
  }
}

function parse<T extends z.ZodType>(schema: T, data: unknown, label: string): z.output<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new WordPressError(`Unexpected ${label} response from WordPress`, undefined, { cause: result.error });
  }

  return result.data;
}

export async function getPage(slug: string): Promise<Page | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`page:${slug}`);

  const data =
    getEnv().CONTENT_SOURCE === "fixtures"
      ? (fixturePages[slug] ?? null)
      : await request(`/page/${encodeURIComponent(slug)}`);

  return data === null ? null : parse(PageSchema, data, "page");
}

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");

  const data = getEnv().CONTENT_SOURCE === "fixtures" ? settingsFixture : await request("/settings");

  if (data === null) {
    throw new WordPressError("WordPress settings endpoint not found", 404);
  }

  return parse(SettingsSchema, data, "settings");
}
