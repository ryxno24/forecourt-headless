import { beforeEach, describe, expect, it, vi } from "vitest";
import { initialEnquiryState } from "@/lib/enquiry-schema";
import { submitEnquiry } from "./enquiry";

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }),
}));

vi.mock("@/lib/wordpress", () => ({
  getSettings: async () => ({ phone: "0161 496 0000" }),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

const valid = {
  registration: "ab12 cde",
  mileage: "45,000",
  name: "Priya Shah",
  email: "priya@example.com",
  phone: "07700 900123",
  enhanced: "1",
};

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.append(key, value));
  return data;
}

function mockFetch(response: Response | Error) {
  const fetchMock = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.stubEnv("CONTENT_SOURCE", "wordpress");
  vi.stubEnv("WORDPRESS_URL", "http://wp.test");
  vi.stubEnv("FORECOURT_SHARED_SECRET", "s3cret");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("submitEnquiry", () => {
  it("returns field errors without calling WordPress when invalid", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 201 }));

    const state = await submitEnquiry(initialEnquiryState, form({ ...valid, email: "nope" }));

    expect(state.status).toBe("error");
    expect(state.fieldErrors).toEqual({ email: "Enter a valid email address." });
    expect(state.values?.email).toBe("nope");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the normalised enquiry with secret and client IP headers", async () => {
    const fetchMock = mockFetch(new Response(JSON.stringify({ ok: true }), { status: 201 }));

    const state = await submitEnquiry(initialEnquiryState, form(valid));

    expect(state).toEqual({ status: "success" });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(url).toBe("http://wp.test/wp-json/forecourt/v1/enquiries");
    expect(init.method).toBe("POST");
    expect(headers.get("X-Forecourt-Secret")).toBe("s3cret");
    expect(headers.get("X-Forecourt-Client-IP")).toBe("203.0.113.9");
    expect(JSON.parse(init.body as string)).toMatchObject({ registration: "AB12CDE", mileage: 45000, phone: "07700900123" });
  });

  it("passes WordPress validation errors back to the form", async () => {
    mockFetch(new Response(JSON.stringify({ errors: { phone: "Enter a valid UK phone number." } }), { status: 422 }));

    const state = await submitEnquiry(initialEnquiryState, form(valid));

    expect(state.status).toBe("error");
    expect(state.fieldErrors).toEqual({ phone: "Enter a valid UK phone number." });
  });

  it("maps a WordPress 429 to a friendly rate limit message", async () => {
    mockFetch(new Response(null, { status: 429 }));

    const state = await submitEnquiry(initialEnquiryState, form(valid));

    expect(state.status).toBe("error");
    expect(state.message).toMatch(/a few minutes/);
    expect(state.message).toContain("0161 496 0000");
  });

  it.each([
    ["a WordPress 500", new Response(null, { status: 500 })],
    ["a network failure", new TypeError("fetch failed")],
  ])("maps %s to a generic message including the phone number", async (_label, response) => {
    mockFetch(response);

    const state = await submitEnquiry(initialEnquiryState, form(valid));

    expect(state.status).toBe("error");
    expect(state.message).toContain("0161 496 0000");
    expect(state.values?.name).toBe("Priya Shah");
  });

  it("does not echo the honeypot back to the form", async () => {
    mockFetch(new Response(null, { status: 500 }));

    const state = await submitEnquiry(initialEnquiryState, form({ ...valid, website: "spam" }));

    expect(state.values).not.toHaveProperty("website");
  });

  it("succeeds without calling WordPress in fixtures mode", async () => {
    vi.stubEnv("CONTENT_SOURCE", "fixtures");
    const fetchMock = mockFetch(new Response(null, { status: 500 }));

    expect(await submitEnquiry(initialEnquiryState, form(valid))).toEqual({ status: "success" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe("without JavaScript", () => {
    const plain = { ...valid, enhanced: "" };

    it("redirects to the sent page on success", async () => {
      mockFetch(new Response(null, { status: 201 }));

      await expect(submitEnquiry(initialEnquiryState, form(plain))).rejects.toThrow("REDIRECT /enquiry/sent");
    });

    it("redirects to the failed page when WordPress fails", async () => {
      mockFetch(new Response(null, { status: 500 }));

      await expect(submitEnquiry(initialEnquiryState, form(plain))).rejects.toThrow("REDIRECT /enquiry/failed");
    });

    it("redirects to the failed page when validation fails", async () => {
      const fetchMock = mockFetch(new Response(null, { status: 201 }));

      await expect(submitEnquiry(initialEnquiryState, form({ ...plain, email: "nope" }))).rejects.toThrow(
        "REDIRECT /enquiry/failed",
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
