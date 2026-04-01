import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleListOrders, handleGetOrder, handleCreateOrder, handleUpdateOrder } from "./orders.js";

beforeEach(() => {
  process.env.RETAILCRM_DOMAIN = "testshop.retailcrm.ru";
  process.env.RETAILCRM_API_KEY = "test-key";
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(data: unknown, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(data), { status }),
  );
}

describe("handleListOrders", () => {
  it("sends correct filter params", async () => {
    const spy = mockFetch({ success: true, orders: [], pagination: { totalCount: 0 } });

    await handleListOrders({
      filter_status: "complete",
      filter_date_from: "2025-01-01",
      page: 1,
      limit: 10,
    });

    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("filter%5Bstatus%5D=complete");
    expect(url).toContain("filter%5BcreatedAtFrom%5D=2025-01-01");
    expect(url).toContain("limit=10");
  });

  it("returns JSON string result", async () => {
    mockFetch({ success: true, orders: [{ id: 1, number: "100" }] });
    const result = await handleListOrders({ page: 1, limit: 20 });
    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(true);
    expect(parsed.orders).toHaveLength(1);
  });
});

describe("handleGetOrder", () => {
  it("fetches order by id", async () => {
    const spy = mockFetch({ success: true, order: { id: 42 } });
    const result = await handleGetOrder({ id: "42", by: "id" });
    expect(spy.mock.calls[0][0]).toContain("/orders/42");
    expect(JSON.parse(result).order.id).toBe(42);
  });

  it("supports externalId lookup", async () => {
    const spy = mockFetch({ success: true, order: { id: 42 } });
    await handleGetOrder({ id: "EXT-001", by: "externalId" });
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("/orders/EXT-001");
    expect(url).toContain("by=externalId");
  });
});

describe("handleCreateOrder", () => {
  it("sends order with items and customer", async () => {
    const spy = mockFetch({ success: true, id: 100 });
    await handleCreateOrder({
      first_name: "Ivan",
      last_name: "Petrov",
      phone: "+79001234567",
      order_type: "eshop-individual",
      items: [{ product_name: "Widget", quantity: 2, initial_price: 500 }],
    });

    const body = (spy.mock.calls[0][1] as RequestInit).body as string;
    expect(body).toContain("order=");
    const orderParam = decodeURIComponent(body).match(/order=(.+?)(&|$)/)?.[1];
    const order = JSON.parse(orderParam!);
    expect(order.firstName).toBe("Ivan");
    expect(order.items).toHaveLength(1);
    expect(order.customer.phones[0].number).toBe("+79001234567");
  });
});

describe("handleUpdateOrder", () => {
  it("sends only changed fields", async () => {
    const spy = mockFetch({ success: true });
    await handleUpdateOrder({ id: "42", by: "id", status: "complete", manager_comment: "Shipped" });

    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("/orders/42/edit");
    const body = (spy.mock.calls[0][1] as RequestInit).body as string;
    const orderParam = decodeURIComponent(body).match(/order=(.+?)(&|$)/)?.[1];
    const order = JSON.parse(orderParam!);
    expect(order.status).toBe("complete");
    expect(order.managerComment).toBe("Shipped");
    expect(order.firstName).toBeUndefined();
  });
});
