import { z } from "zod";
import { retailCrmGet } from "../client.js";

export const getCustomersSchema = z.object({
  filter_name: z.string().optional().describe("Filter by customer name (partial match)"),
  filter_email: z.string().optional().describe("Filter by email"),
  filter_phone: z.string().optional().describe("Filter by phone number"),
  filter_date_from: z.string().optional().describe("Filter customers created after (YYYY-MM-DD)"),
  page: z.number().int().min(1).default(1).describe("Page number"),
  limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
});

export async function handleGetCustomers(params: z.infer<typeof getCustomersSchema>): Promise<string> {
  const query: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };
  if (params.filter_name) query["filter[name]"] = params.filter_name;
  if (params.filter_email) query["filter[email]"] = params.filter_email;
  if (params.filter_phone) query["filter[phone]"] = params.filter_phone;
  if (params.filter_date_from) query["filter[createdAtFrom]"] = params.filter_date_from;

  const result = await retailCrmGet("/customers", query);
  return JSON.stringify(result, null, 2);
}
