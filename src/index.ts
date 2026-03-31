#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getOrdersSchema, handleGetOrders, createOrderSchema, handleCreateOrder } from "./tools/orders.js";
import { getCustomersSchema, handleGetCustomers } from "./tools/customers.js";

const server = new McpServer({
  name: "retailcrm-mcp",
  version: "1.0.0",
});

server.tool(
  "get_orders",
  "List orders from RetailCRM with filters by status, customer, number, and date range.",
  getOrdersSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetOrders(params) }] }),
);

server.tool(
  "create_order",
  "Create a new order in RetailCRM with customer info, items, and delivery details.",
  createOrderSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleCreateOrder(params) }] }),
);

server.tool(
  "get_customers",
  "List customers from RetailCRM with filters by name, email, phone, and date.",
  getCustomersSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetCustomers(params) }] }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[retailcrm-mcp] Server started. 3 tools available.");
}

main().catch((error) => {
  console.error("[retailcrm-mcp] Error:", error);
  process.exit(1);
});
