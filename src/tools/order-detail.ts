import { z } from "zod";
import { retailCrmGet } from "../client.js";

export const getOrderByIdSchema = z.object({
  id: z.number().int().min(1).describe("Order ID in RetailCRM"),
});

export async function handleGetOrderById(params: z.infer<typeof getOrderByIdSchema>): Promise<string> {
  const result = await retailCrmGet(`/orders/${params.id}`);
  return JSON.stringify(result, null, 2);
}
