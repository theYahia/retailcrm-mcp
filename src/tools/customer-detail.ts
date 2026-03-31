import { z } from "zod";
import { retailCrmGet } from "../client.js";

export const getCustomerByIdSchema = z.object({
  id: z.number().int().min(1).describe("Customer ID in RetailCRM"),
});

export async function handleGetCustomerById(params: z.infer<typeof getCustomerByIdSchema>): Promise<string> {
  const result = await retailCrmGet(`/customers/${params.id}`);
  return JSON.stringify(result, null, 2);
}
