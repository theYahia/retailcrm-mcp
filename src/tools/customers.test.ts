import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleListCustomers, handleGetCustomer, handleCreateCustomer, handleMergeCustomers } from "./customers.js";

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

describe("handleListCustomers", () => {
  it("sends correct filter params", async () => {
    const spy = mockFetch({ success: true, customers: [] });
    await handleListCustomers({ filter_email: "test@mail.ru", page: 1, limit: 10 });
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("filter%5Bemail%5D=test%40mail.ru");
  });
});

describe("handleGetCustomer", () => {
  it("fetches customer by id", async () => {
    const spy = mockFetch({ success: true, customer: { id: 5, firstName: "Ivan" } });
    const result = await handleGetCustomer({ id: "5", by: "id" });
    expect(spy.mock.calls[0][0]).toContain("/customers/5");
    expect(JSON.parse(result).customer.firstName).toBe("Ivan");
  });
});

describe("handleCreateCustomer", () => {
  it("sends customer with phones and address", async () => {
    const spy = mockFetch({ success: true, id: 10 });
    await handleCreateCustomer({
      first_name: "Anna",
      last_name: "Ivanova",
      email: "anna@mail.ru",
      phones: ["+79001111111", "+79002222222"],
      address_city: "Moscow",
    });

    const body = (spy.mock.calls[0][1] as RequestInit).body as string;
    const customerParam = decodeURIComponent(body).match(/customer=(.+?)(&|$)/)?.[1];
    const customer = JSON.parse(customerParam!);
    expect(customer.firstName).toBe("Anna");
    expect(customer.phones).toHaveLength(2);
    expect(customer.address.city).toBe("Moscow");
  });
});

describe("handleMergeCustomers", () => {
  it("sends merge request with correct body", async () => {
    const spy = mockFetch({ success: true });
    await handleMergeCustomers({ result_customer_id: 1, merged_customer_ids: [2, 3] });

    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("/customers/combine");
    const body = (spy.mock.calls[0][1] as RequestInit).body as string;
    expect(body).toContain("resultCustomer=");
    expect(body).toContain("mergedCustomers=");
  });
});
