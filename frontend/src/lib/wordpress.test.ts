import { cacheTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import pageFixture from "./__fixtures__/page-home.json";
import settingsFixture from "./__fixtures__/settings.json";
import { WordPressError, getPage, getSettings } from "./wordpress";

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

function mockFetch(response: Response | Error) {
  const fetchMock = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  vi.stubEnv("CONTENT_SOURCE", "wordpress");
  vi.stubEnv("WORDPRESS_URL", "http://wp.test/");
});

describe("getPage", () => {
  it("requests the page by slug and tags it for revalidation", async () => {
    const fetchMock = mockFetch(json(pageFixture));

    const page = await getPage("home");

    expect(page?.sections).toHaveLength(8);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://wp.test/wp-json/forecourt/v1/page/home",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(cacheTag).toHaveBeenCalledWith("page:home");
  });

  it("returns null on 404", async () => {
    mockFetch(json({ code: "forecourt_not_found" }, 404));

    await expect(getPage("missing")).resolves.toBeNull();
  });

  it("throws WordPressError on 500", async () => {
    mockFetch(json({}, 500));

    await expect(getPage("home")).rejects.toMatchObject({ name: "WordPressError", status: 500 });
  });

  it("throws WordPressError on network failure", async () => {
    mockFetch(new TypeError("fetch failed"));

    await expect(getPage("home")).rejects.toBeInstanceOf(WordPressError);
  });

  it("throws WordPressError when the response is not a valid page", async () => {
    mockFetch(json({ hello: "world" }));

    await expect(getPage("home")).rejects.toBeInstanceOf(WordPressError);
  });

  it("returns the fixture without calling fetch when CONTENT_SOURCE=fixtures", async () => {
    vi.stubEnv("CONTENT_SOURCE", "fixtures");
    const fetchMock = mockFetch(new Error("should not be called"));

    const page = await getPage("home");

    expect(page?.slug).toBe("home");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("getSettings", () => {
  it("returns parsed settings tagged for revalidation", async () => {
    mockFetch(json(settingsFixture));

    const settings = await getSettings();

    expect(settings.phone).toBe("0161 496 0000");
    expect(cacheTag).toHaveBeenCalledWith("settings");
  });

  it("throws WordPressError when settings are missing", async () => {
    mockFetch(json({}, 404));

    await expect(getSettings()).rejects.toBeInstanceOf(WordPressError);
  });
});
