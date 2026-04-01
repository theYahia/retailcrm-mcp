import { z } from "zod";
import { retailCrmGet, retailCrmPost } from "../client.js";

// ── list_orders ──────────────────────────────────────────────
export const listOrdersSchema = z.object({
  filter_status: z.string().optional().describe("Filter by order status code (e.g. 'new', 'complete')"),
  filter_customer: z.string().optional().describe("Filter by customer name (partial match)"),
  filter_number: z.string().optional().describe("Filter by order number"),
  filter_date_from: z.string().optional().describe("Filter orders created after this date (YYYY-MM-DD)"),
  filter_date_to: z.string().optional().describe("Filter orders created before this date (YYYY-MM-DD)"),
  page: z.number().int().min(1).default(1).describe("Page number"),
  limit: z.number().int().min(1).max(100).default(20).describe("Results per page (max 100)"),
});

export async function handleListOrders(params: z.infer<typeof listOrdersSchema>): Promise<string> {
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

// ── get_order ────────────────────────────────────────────────
export const getOrderSchema = z.object({
  id: z.string().describe("Order ID or externalId to retrieve"),
  by: z.enum(["id", "externalId"]).default("id").describe("Lookup field: 'id' (RetailCRM ID) or 'externalId'"),
});

export async function handleGetOrder(params: z.infer<typeof getOrderSchema>): Promise<string> {
  const query: Record<string, string> = {};
  if (params.by === "externalId") query["by"] = "externalId";
  const result = await retailCrmGet(`/orders/${params.id}`, query);
  return JSON.stringify(result, null, 2);
}

// ── create_order ─────────────────────────────────────────────
export const createOrderSchema = z.object({
  first_name: z.string().describe("Customer first name"),
  last_name: z.string().optional().describe("Customer last name"),
  phone: z.string().optional().describe("Customer phone number"),
  email: z.string().optional().describe("Customer email"),
  order_type: z.string().default("eshop-individual").describe("Order type code"),
  status: z.string().optional().describe("Initial order status code (e.g. 'new')"),
  items: z.array(z.object({
    product_name: z.string().describe("Product display name"),
    quantity: z.number().min(1).describe("Quantity"),
    initial_price: z.number().describe("Price per unit"),
  })).min(1).describe("Order items (at least one required)"),
  delivery_code: z.string().optional().describe("Delivery type code"),
  delivery_cost: z.number().optional().describe("Delivery cost"),
  delivery_address: z.string().optional().describe("Delivery address as free text"),
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

  if (params.status) order.status = params.status;

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

// ── update_order ─────────────────────────────────────────────
export const updateOrderSchema = z.object({
  id: z.string().describe("Order ID to update"),
  by: z.enum(["id", "externalId"]).default("id").describe("Lookup field"),
  status: z.string().optional().describe("New status code"),
  first_name: z.string().optional().describe("Updated customer first name"),
  last_name: z.string().optional().describe("Updated customer last name"),
  phone: z.string().optional().describe("Updated customer phone"),
  email: z.string().optional().describe("Updated customer email"),
  delivery_code: z.string().optional().describe("Updated delivery type code"),
  delivery_cost: z.number().optional().describe("Updated delivery cost"),
  delivery_address: z.string().optional().describe("Updated delivery address"),
  manager_comment: z.string().optional().describe("Internal manager comment"),
  customer_comment: z.string().optional().describe("Customer-visible comment"),
});

export async function handleUpdateOrder(params: z.infer<typeof updateOrderSchema>): Promise<string> {
  const order: Record<string, unknown> = {};

  if (params.status) order.status = params.status;
  if (params.first_name) order.firstName = params.first_name;
  if (params.last_name) order.lastName = params.last_name;
  if (params.manager_comment) order.managerComment = params.manager_comment;
  if (params.customer_comment) order.customerComment = params.customer_comment;

  if (params.phone || params.email) {
    const customer: Record<string, unknown> = {};
    if (params.phone) customer.phones = [{ number: params.phone }];
    if (params.email) customer.email = params.email;
    order.customer = customer;
  }

  if (params.delivery_code || params.delivery_cost !== undefined || params.delivery_address) {
    const delivery: Record<string, unknown> = {};
    if (params.delivery_code) delivery.code = params.delivery_code;
    if (params.delivery_cost !== undefined) delivery.cost = params.delivery_cost;
    if (params.delivery_address) delivery.address = { text: params.delivery_address };
    order.delivery = delivery;
  }

  const formData: Record<string, string> = {
    order: JSON.stringify(order),
  };
  if (params.by === "externalId") formData.by = "externalId";

  const result = await retailCrmPost(`/orders/${params.id}/edit`, formData);
  return JSON.stringify(result, null, 2);
}
