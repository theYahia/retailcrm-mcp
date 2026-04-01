import { z } from "zod";
import { retailCrmGet } from "../client.js";

// ── list_products ────────────────────────────────────────────
export const listProductsSchema = z.object({
  filter_name: z.string().optional().describe("Filter by product name (partial match)"),
  filter_active: z.boolean().optional().describe("Filter by active status (true = active only)"),
  filter_groups: z.string().optional().describe("Filter by product group ID"),
  filter_min_price: z.number().optional().describe("Minimum price filter"),
  filter_max_price: z.number().optional().describe("Maximum price filter"),
  page: z.number().int().min(1).default(1).describe("Page number"),
  limit: z.number().int().min(1).max(100).default(20).describe("Results per page (max 100)"),
});

export async function handleListProducts(params: z.infer<typeof listProductsSchema>): Promise<string> {
  const query: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };
  if (params.filter_name) query["filter[name]"] = params.filter_name;
  if (params.filter_active !== undefined) query["filter[active]"] = params.filter_active ? "1" : "0";
  if (params.filter_groups) query["filter[groups][]"] = params.filter_groups;
  if (params.filter_min_price !== undefined) query["filter[minPrice]"] = String(params.filter_min_price);
  if (params.filter_max_price !== undefined) query["filter[maxPrice]"] = String(params.filter_max_price);

  const result = await retailCrmGet("/store/products", query);
  return JSON.stringify(result, null, 2);
}
