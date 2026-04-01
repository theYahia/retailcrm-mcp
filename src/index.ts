#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { createServer } from "http";

import {
  listOrdersSchema, handleListOrders,
  getOrderSchema, handleGetOrder,
  createOrderSchema, handleCreateOrder,
  updateOrderSchema, handleUpdateOrder,
} from "./tools/orders.js";

import {
  listCustomersSchema, handleListCustomers,
  getCustomerSchema, handleGetCustomer,
  createCustomerSchema, handleCreateCustomer,
  mergeCustomersSchema, handleMergeCustomers,
} from "./tools/customers.js";

import { listProductsSchema, handleListProducts } from "./tools/products.js";

import {
  listStatusesSchema, handleListStatuses,
  listDeliveryTypesSchema, handleListDeliveryTypes,
  listPaymentTypesSchema, handleListPaymentTypes,
  listStoresSchema, handleListStores,
} from "./tools/references.js";

import {
  getOrdersSummarySchema, handleGetOrdersSummary,
  getCustomersSummarySchema, handleGetCustomersSummary,
} from "./tools/analytics.js";

const VERSION = "2.0.0";
const TOOL_COUNT = 15;

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "retailcrm-mcp",
    version: VERSION,
  });

  // ── Orders ───────────────────────────────────────────────────

  server.tool(
    "list_orders",
    "List orders from RetailCRM with filters by status, customer, number, and date range. Returns paginated results with order details, items, and delivery info.",
    listOrdersSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleListOrders(params) }] }),
  );

  server.tool(
    "get_order",
    "Get a single order by its RetailCRM ID or externalId. Returns full order details including items, customer, delivery, and payment info.",
    getOrderSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetOrder(params) }] }),
  );

  server.tool(
    "create_order",
    "Create a new order in RetailCRM with customer info, line items, and delivery details. Automatically creates or links the customer.",
    createOrderSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleCreateOrder(params) }] }),
  );

  server.tool(
    "update_order",
    "Update an existing order in RetailCRM. Can change status, customer details, delivery info, and add comments. Only sends fields you specify.",
    updateOrderSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleUpdateOrder(params) }] }),
  );

  // ── Customers ────────────────────────────────────────────────

  server.tool(
    "list_customers",
    "List customers from RetailCRM with filters by name, email, phone, and creation date. Returns paginated results with contact info and order stats.",
    listCustomersSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleListCustomers(params) }] }),
  );

  server.tool(
    "get_customer",
    "Get a single customer by their RetailCRM ID or externalId. Returns full profile with contact info, address, and order history stats.",
    getCustomerSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetCustomer(params) }] }),
  );

  server.tool(
    "create_customer",
    "Create a new customer in RetailCRM with name, contact info, and address. Optionally set an externalId for linking to external systems.",
    createCustomerSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleCreateCustomer(params) }] }),
  );

  server.tool(
    "merge_customers",
    "Merge duplicate customer records. Keeps the target customer and moves all orders/history from merged customers into it. Merged records are deleted.",
    mergeCustomersSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleMergeCustomers(params) }] }),
  );

  // ── Products ─────────────────────────────────────────────────

  server.tool(
    "list_products",
    "List products from the RetailCRM catalog with filters by name, active status, price range, and product group. Returns product details with offers and prices.",
    listProductsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleListProducts(params) }] }),
  );

  // ── References ───────────────────────────────────────────────

  server.tool(
    "list_statuses",
    "List all order statuses configured in RetailCRM. Returns status codes, names, groups, and ordering. Use this to discover valid status codes for filtering or updating orders.",
    listStatusesSchema.shape,
    async () => ({ content: [{ type: "text", text: await handleListStatuses() }] }),
  );

  server.tool(
    "list_delivery_types",
    "List all delivery types configured in RetailCRM. Returns delivery codes, names, default costs, and active status.",
    listDeliveryTypesSchema.shape,
    async () => ({ content: [{ type: "text", text: await handleListDeliveryTypes() }] }),
  );

  server.tool(
    "list_payment_types",
    "List all payment types configured in RetailCRM. Returns payment codes, names, and active status.",
    listPaymentTypesSchema.shape,
    async () => ({ content: [{ type: "text", text: await handleListPaymentTypes() }] }),
  );

  server.tool(
    "list_stores",
    "List all warehouses and stores configured in RetailCRM. Returns store codes, names, types, and addresses.",
    listStoresSchema.shape,
    async () => ({ content: [{ type: "text", text: await handleListStores() }] }),
  );

  // ── Analytics ────────────────────────────────────────────────

  server.tool(
    "get_orders_summary",
    "Get order statistics for a date range. Returns order status distribution and totals. Useful for dashboards and periodic reporting.",
    getOrdersSummarySchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetOrdersSummary(params) }] }),
  );

  server.tool(
    "get_customers_summary",
    "Get customer statistics for a date range. Returns total new customers count for the period. Useful for growth tracking and reporting.",
    getCustomersSummarySchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetCustomersSummary(params) }] }),
  );

  // ── Prompt templates ─────────────────────────────────────────

  server.prompt(
    "new-orders",
    "Show all orders created today — quick daily overview.",
    async () => {
      const today = new Date().toISOString().slice(0, 10);
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Use list_orders with filter_date_from="${today}" and filter_date_to="${today}". Show results as a table: order number, status, total, customer name. If no orders, say "No new orders today."`,
            },
          },
        ],
      };
    },
  );

  server.prompt(
    "customer-search",
    "Find a customer by name, email, or phone.",
    { query: z.string().describe("Customer name, email, or phone number") },
    async ({ query }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Find a customer in RetailCRM matching: "${query}". Try list_customers with name, email, and phone filters. Show: name, contacts, order count, total spent.`,
            },
          },
        ],
      };
    },
  );

  return server;
}

// ── Start ────────────────────────────────────────────────────

async function main() {
  const mode = process.argv.includes("--http") ? "http" : "stdio";
  const server = createMcpServer();

  if (mode === "http") {
    const port = parseInt(process.env.PORT || "3000", 10);

    const httpServer = createServer(async (req, res) => {
      if (req.method === "POST" && req.url === "/mcp") {
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        await server.connect(transport);
        await transport.handleRequest(req, res);
      } else if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", version: VERSION, tools: TOOL_COUNT, prompts: 2 }));
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    httpServer.listen(port, () => {
      console.error(`[retailcrm-mcp] HTTP server on port ${port}. POST /mcp, GET /health`);
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[retailcrm-mcp] Server started (stdio). ${VERSION} — ${TOOL_COUNT} tools, 2 prompts.`);
  }
}

main().catch((error) => {
  console.error("[retailcrm-mcp] Fatal error:", error);
  process.exit(1);
});
