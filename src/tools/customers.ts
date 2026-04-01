import { z } from "zod";
import { retailCrmGet, retailCrmPost } from "../client.js";

// ── list_customers ───────────────────────────────────────────
export const listCustomersSchema = z.object({
  filter_name: z.string().optional().describe("Filter by customer name (partial match)"),
  filter_email: z.string().optional().describe("Filter by email address"),
  filter_phone: z.string().optional().describe("Filter by phone number"),
  filter_date_from: z.string().optional().describe("Filter customers created after (YYYY-MM-DD)"),
  filter_date_to: z.string().optional().describe("Filter customers created before (YYYY-MM-DD)"),
  page: z.number().int().min(1).default(1).describe("Page number"),
  limit: z.number().int().min(1).max(100).default(20).describe("Results per page (max 100)"),
});

export async function handleListCustomers(params: z.infer<typeof listCustomersSchema>): Promise<string> {
  const query: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };
  if (params.filter_name) query["filter[name]"] = params.filter_name;
  if (params.filter_email) query["filter[email]"] = params.filter_email;
  if (params.filter_phone) query["filter[phone]"] = params.filter_phone;
  if (params.filter_date_from) query["filter[createdAtFrom]"] = params.filter_date_from;
  if (params.filter_date_to) query["filter[createdAtTo]"] = params.filter_date_to;

  const result = await retailCrmGet("/customers", query);
  return JSON.stringify(result, null, 2);
}

// ── get_customer ─────────────────────────────────────────────
export const getCustomerSchema = z.object({
  id: z.string().describe("Customer ID or externalId to retrieve"),
  by: z.enum(["id", "externalId"]).default("id").describe("Lookup field: 'id' (RetailCRM ID) or 'externalId'"),
});

export async function handleGetCustomer(params: z.infer<typeof getCustomerSchema>): Promise<string> {
  const query: Record<string, string> = {};
  if (params.by === "externalId") query["by"] = "externalId";
  const result = await retailCrmGet(`/customers/${params.id}`, query);
  return JSON.stringify(result, null, 2);
}

// ── create_customer ──────────────────────────────────────────
export const createCustomerSchema = z.object({
  first_name: z.string().describe("Customer first name"),
  last_name: z.string().optional().describe("Customer last name"),
  patronymic: z.string().optional().describe("Customer patronymic (middle name)"),
  email: z.string().optional().describe("Customer email"),
  phones: z.array(z.string()).optional().describe("Array of phone numbers"),
  address_text: z.string().optional().describe("Full address as free text"),
  address_city: z.string().optional().describe("City"),
  address_region: z.string().optional().describe("Region/state"),
  external_id: z.string().optional().describe("External system ID for linking"),
});

export async function handleCreateCustomer(params: z.infer<typeof createCustomerSchema>): Promise<string> {
  const customer: Record<string, unknown> = {
    firstName: params.first_name,
  };
  if (params.last_name) customer.lastName = params.last_name;
  if (params.patronymic) customer.patronymic = params.patronymic;
  if (params.email) customer.email = params.email;
  if (params.external_id) customer.externalId = params.external_id;
  if (params.phones?.length) {
    customer.phones = params.phones.map(n => ({ number: n }));
  }
  if (params.address_text || params.address_city || params.address_region) {
    const address: Record<string, string> = {};
    if (params.address_text) address.text = params.address_text;
    if (params.address_city) address.city = params.address_city;
    if (params.address_region) address.region = params.address_region;
    customer.address = address;
  }

  const result = await retailCrmPost("/customers/create", {
    customer: JSON.stringify(customer),
  });
  return JSON.stringify(result, null, 2);
}

// ── merge_customers ──────────────────────────────────────────
export const mergeCustomersSchema = z.object({
  result_customer_id: z.number().describe("ID of the customer to keep (the merge target)"),
  merged_customer_ids: z.array(z.number()).min(1).describe("IDs of customers to merge into the target (will be deleted)"),
});

export async function handleMergeCustomers(params: z.infer<typeof mergeCustomersSchema>): Promise<string> {
  const body: Record<string, string> = {
    resultCustomer: JSON.stringify({ id: params.result_customer_id }),
    mergedCustomers: JSON.stringify(params.merged_customer_ids.map(id => ({ id }))),
  };
  const result = await retailCrmPost("/customers/combine", body);
  return JSON.stringify(result, null, 2);
}
