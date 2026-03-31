import { z } from "zod";
import { retailCrmGet, retailCrmPost } from "../client.js";

export const getOrdersSchema = z.object({
  filter_status: z.string().optional().describe("Filter by order status code"),
  filter_customer: z.string().optional().describe("Filter by customer name (partial match)"),
  filter_number: z.string().optional().describe("Filter by order number"),
  filter_date_from: z.string().optional().describe("Filter orders created after this date (YYYY-MM-DD)"),
  filter_date_to: z.string().optional().describe("Filter orders created before this date (YYYY-MM-DD)"),
  page: z.number().int().min(1).default(1).describe("Page number"),
  limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
});

export async function handleGetOrders(params: z.infer<typeof getOrdersSchema>): Promise<string> {
  const query: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };
  if (params.filter_status) query["filter[status]"] = params.filter_status;
  if (params.filter_customer) query["filter[customer]"] = params.filter_customer;
  if (params.filter_number) query["filter[number]"] = params.filter_number;
  if (params.filter_date_from) query["filter[createdAtFrom]"] = params.filter_date_from;
  if (params.filter_date_to) query["filter[createdAtTo]"] = params.filter_date_to;

  const result = await retailCrmGet("/orders", query);
  return JSON.stringify(result, null, 2);
}

export const createOrderSchema = z.object({
  first_name: z.string().describe("Customer first name"),
  last_name: z.string().optional().describe("Customer last name"),
  phone: z.string().optional().describe("Customer phone"),
  email: z.string().optional().describe("Customer email"),
  order_type: z.string().default("eshop-individual").describe("Order type code"),
  items: z.array(z.object({
    product_name: z.string().describe("Product display name"),
    quantity: z.number().min(1).describe("Quantity"),
    initial_price: z.number().describe("Price per unit"),
  })).min(1).describe("Order items"),
  delivery_code: z.string().optional().describe("Delivery type code"),
  delivery_cost: z.number().optional().describe("Delivery cost"),
  delivery_address: z.string().optional().describe("Delivery address text"),
});

export async function handleCreateOrder(params: z.infer<typeof createOrderSchema>): Promise<string> {
  const order: Record<string, unknown> = {
    orderType: params.order_type,
    firstName: params.first_name,
    lastName: params.last_name,
    items: params.items.map(item => ({
      offer: { displayName: item.product_name },
      quantity: item.quantity,
      initialPrice: item.initial_price,
    })),
  };

  if (params.phone || params.email) {
    const customer: Record<string, unknown> = { firstName: params.first_name };
    if (params.last_name) customer.lastName = params.last_name;
    if (params.phone) customer.phones = [{ number: params.phone }];
    if (params.email) customer.email = params.email;
    order.customer = customer;
  }

  if (params.delivery_code) {
    const delivery: Record<string, unknown> = { code: params.delivery_code };
    if (params.delivery_cost !== undefined) delivery.cost = params.delivery_cost;
    if (params.delivery_address) delivery.address = { text: params.delivery_address };
    order.delivery = delivery;
  }

  const result = await retailCrmPost("/orders/create", {
    order: JSON.stringify(order),
  });
  return JSON.stringify(result, null, 2);
}
