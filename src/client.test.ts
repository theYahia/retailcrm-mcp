import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { retailCrmGet, retailCrmPost } from "./client.js";

const BASE_URL = "https://testshop.retailcrm.ru/api/v5";

beforeEach(() => {
  process.env.RETAILCRM_DOMAIN = "testshop.retailcrm.ru";
  process.env.RETAILCRM_API_KEY = "test-api-key-123";
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.RETAILCRM_DOMAIN;
  delete process.env.RETAILCRM_API_KEY;
});

describe("retailCrmGet", () => {
  it("sends GET request with apiKey and params", async () => {
    const mockResponse = { success: true, orders: [] };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const result = await retailCrmGet("/orders", { "filter[status]": "new", limit: "20" });

    expect(result).toEqual(mockResponse);
    const call = vi.mocked(fetch).mock.calls[0];
    const url = call[0] as string;
    expect(url).toContain(`${BASE_URL}/orders`);
    expect(url).toContain("apiKey=test-api-key-123");
    expect(url).toContain("filter%5Bstatus%5D=new");
  });

  it("throws descriptive error on 403 with RetailCRM error body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({
        success: false,
        errorMsg: "Access denied",
        errors: { "apiKey": "Invalid API key" },
      }), { status: 403 }),
    );

    await expect(retailCrmGet("/orders")).rejects.toThrow(/Access denied.*apiKey/);
  });

  it("retries on 429 rate limit", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("rate limited", { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const result = await retailCrmGet("/orders");
    expect(result).toEqual({ success: true });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("throws when env vars are missing", async () => {
    delete process.env.RETAILCRM_DOMAIN;
    await expect(retailCrmGet("/orders")).rejects.toThrow("RETAILCRM_DOMAIN is not set");
  });
});

describe("retailCrmPost", () => {
  it("sends POST with form-encoded body and apiKey", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, id: 42 }), { status: 200 }),
    );

    const result = await retailCrmPost("/orders/create", { order: '{"firstName":"Test"}' });

    expect(result).toEqual({ success: true, id: 42 });
    const call = vi.mocked(fetch).mock.calls[0];
    const opts = call[1] as RequestInit;
    expect(opts.method).toBe("POST");
    expect(opts.body).toContain("apiKey=test-api-key-123");
    expect(opts.body).toContain("order=");
  });

  it("retries on 500 server error then succeeds", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("Internal Server Error", { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const result = await retailCrmPost("/orders/create", { order: "{}" });
    expect(result).toEqual({ success: true });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("exhausts retries and throws on persistent 500", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("Server Error", { status: 500 }))
      .mockResolvedValueOnce(new Response("Server Error", { status: 500 }))
      .mockResolvedValueOnce(new Response("Server Error", { status: 500 }));

    await expect(retailCrmPost("/orders/create", { order: "{}" })).rejects.toThrow("HTTP 500");
  });
});
