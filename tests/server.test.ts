import { describe, it, expect, afterEach } from "vitest";
import { createMcpServer } from "../src/index.js";

describe("MCP Server creation", () => {
  it("creates server instance without throwing", () => {
    const server = createMcpServer();
    expect(server).toBeDefined();
  });
});

describe("Tool schemas", () => {
  it("getOrdersSchema validates correct input", async () => {
    const { getOrdersSchema } = await import("../src/tools/orders.js");
    const result = getOrdersSchema.safeParse({ page: 1, limit: 10, filter_status: "new" });
    expect(result.success).toBe(true);
  });

  it("getOrdersSchema rejects invalid page", async () => {
    const { getOrdersSchema } = await import("../src/tools/orders.js");
    const result = getOrdersSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("getOrdersSchema applies defaults", async () => {
    const { getOrdersSchema } = await import("../src/tools/orders.js");
    const result = getOrdersSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it("createOrderSchema requires items", async () => {
    const { createOrderSchema } = await import("../src/tools/orders.js");
    const result = createOrderSchema.safeParse({ first_name: "Test" });
    expect(result.success).toBe(false);
  });

  it("createOrderSchema validates correct order", async () => {
    const { createOrderSchema } = await import("../src/tools/orders.js");
    const result = createOrderSchema.safeParse({
      first_name: "Ivan",
      items: [{ product_name: "Widget", quantity: 2, initial_price: 100 }],
    });
    expect(result.success).toBe(true);
  });

  it("getCustomersSchema validates correct input", async () => {
    const { getCustomersSchema } = await import("../src/tools/customers.js");
    const result = getCustomersSchema.safeParse({ filter_email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("getCustomersSchema rejects limit > 100", async () => {
    const { getCustomersSchema } = await import("../src/tools/customers.js");
    const result = getCustomersSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("getProductsSchema validates correct input", async () => {
    const { getProductsSchema } = await import("../src/tools/products.js");
    const result = getProductsSchema.safeParse({ filter_name: "Laptop", filter_active: "1" });
    expect(result.success).toBe(true);
  });

  it("getProductsSchema rejects invalid active value", async () => {
    const { getProductsSchema } = await import("../src/tools/products.js");
    const result = getProductsSchema.safeParse({ filter_active: "yes" });
    expect(result.success).toBe(false);
  });

  it("getOrderByIdSchema requires positive id", async () => {
    const { getOrderByIdSchema } = await import("../src/tools/order-detail.js");
    const ok = getOrderByIdSchema.safeParse({ id: 42 });
    expect(ok.success).toBe(true);
    const fail = getOrderByIdSchema.safeParse({ id: 0 });
    expect(fail.success).toBe(false);
  });

  it("getCustomerByIdSchema requires positive id", async () => {
    const { getCustomerByIdSchema } = await import("../src/tools/customer-detail.js");
    const ok = getCustomerByIdSchema.safeParse({ id: 1 });
    expect(ok.success).toBe(true);
    const fail = getCustomerByIdSchema.safeParse({ id: -1 });
    expect(fail.success).toBe(false);
  });

  it("getStatusesSchema accepts empty object", async () => {
    const { getStatusesSchema } = await import("../src/tools/statuses.js");
    const result = getStatusesSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("Client env validation", () => {
  const savedDomain = process.env.RETAILCRM_DOMAIN;
  const savedUrl = process.env.RETAILCRM_URL;
  const savedKey = process.env.RETAILCRM_API_KEY;

  afterEach(() => {
    if (savedDomain) process.env.RETAILCRM_DOMAIN = savedDomain;
    else delete process.env.RETAILCRM_DOMAIN;
    if (savedUrl) process.env.RETAILCRM_URL = savedUrl;
    else delete process.env.RETAILCRM_URL;
    if (savedKey) process.env.RETAILCRM_API_KEY = savedKey;
    else delete process.env.RETAILCRM_API_KEY;
  });

  it("throws when RETAILCRM_API_KEY is not set", async () => {
    process.env.RETAILCRM_DOMAIN = "test.retailcrm.ru";
    delete process.env.RETAILCRM_API_KEY;

    const { retailCrmGet } = await import("../src/client.js");
    await expect(retailCrmGet("/orders")).rejects.toThrow("RETAILCRM_API_KEY");
  });

  it("throws when RETAILCRM_DOMAIN is not set", async () => {
    delete process.env.RETAILCRM_DOMAIN;
    delete process.env.RETAILCRM_URL;
    process.env.RETAILCRM_API_KEY = "test-key";

    const { retailCrmGet } = await import("../src/client.js");
    await expect(retailCrmGet("/orders")).rejects.toThrow("RETAILCRM_DOMAIN");
  });
});
