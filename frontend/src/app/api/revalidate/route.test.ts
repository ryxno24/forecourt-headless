// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const revalidateTag = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidateTag }));

function request(body: unknown, secret: string | null = "s3cret") {
  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(secret === null ? {} : { "X-Forecourt-Secret": secret }) },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  revalidateTag.mockReset();
  vi.stubEnv("CONTENT_SOURCE", "wordpress");
  vi.stubEnv("WORDPRESS_URL", "http://wp.test");
  vi.stubEnv("FORECOURT_SHARED_SECRET", "s3cret");
});

describe("POST /api/revalidate", () => {
  it.each([
    ["a missing secret", null],
    ["an incorrect secret", "wrong"],
    ["a secret of a different length", "s3cret-but-longer"],
  ])("rejects %s with 401", async (_label, secret) => {
    const response = await POST(request({ tags: ["settings"] }, secret));

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects everything when no secret is configured", async () => {
    vi.stubEnv("FORECOURT_SHARED_SECRET", "");

    expect((await POST(request({ tags: ["settings"] }, ""))).status).toBe(401);
  });

  it.each([
    ["non array tags", { tags: "settings" }],
    ["an empty list", { tags: [] }],
    ["invalid JSON", "{not json"],
  ])("rejects %s with 400", async (_label, body) => {
    const response = await POST(request(body));

    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("revalidates only allowed tags, once each", async () => {
    const response = await POST(request({ tags: ["page:home", "settings", "page:home", "everything", "page:../x"] }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ revalidated: ["page:home", "settings"] });
    expect(revalidateTag.mock.calls.map(([tag]) => tag)).toEqual(["page:home", "settings"]);
  });
});
