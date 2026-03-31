import { z } from "zod";
import { retailCrmGet } from "../client.js";

export const getProductsSchema = z.object({
  filter_name: z.string().optional().describe("Filter by product name (partial match)"),
  filter_active: z.enum(["1", "0"]).optional().describe("Filter by active status: 1=active, 0=inactive"),
  filter_min_price: z.number().optional().describe("Minimum price filter"),
  filter_max_price: z.number().optional().describe("Maximum price filter"),
  page: z.number().int().min(1).default(1).describe("Page number"),
  limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
});

export async function handleGetProducts(params: z.infer<typeof getProductsSchema>): Promise<string> {
  const query: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };
  if (params.filter_name) query["filter[name]"] = params.filter_name;
  if (params.filter_active) query["filter[active]"] = params.filter_active;
  if (params.filter_min_price !== undefined) query["filter[minPrice]"] = String(params.filter_min_price);
  if (params.filter_max_price !== undefined) query["filter[maxPrice]"] = String(params.filter_max_price);

  const result = await retailCrmGet("/store/products", query);
  return JSON.stringify(result, null, 2);
}
