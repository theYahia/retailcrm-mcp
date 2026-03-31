#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { createServer } from "http";
import { getOrdersSchema, handleGetOrders, createOrderSchema, handleCreateOrder } from "./tools/orders.js";
import { getOrderByIdSchema, handleGetOrderById } from "./tools/order-detail.js";
import { getCustomersSchema, handleGetCustomers } from "./tools/customers.js";
import { getCustomerByIdSchema, handleGetCustomerById } from "./tools/customer-detail.js";
import { getProductsSchema, handleGetProducts } from "./tools/products.js";
import { getStatusesSchema, handleGetStatuses, getStatusGroupsSchema, handleGetStatusGroups } from "./tools/statuses.js";

const VERSION = "1.1.0";

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "retailcrm-mcp",
    version: VERSION,
  });

  // --- Tools (8) ---

  server.tool(
    "get_orders",
    "List orders from RetailCRM with filters by status, customer, number, and date range.",
    getOrdersSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetOrders(params) }] }),
  );

  server.tool(
    "get_order",
    "Get a single order by its RetailCRM ID.",
    getOrderByIdSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetOrderById(params) }] }),
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

  server.tool(
    "get_customer",
    "Get a single customer by their RetailCRM ID.",
    getCustomerByIdSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetCustomerById(params) }] }),
  );

  server.tool(
    "get_products",
    "List products from RetailCRM store with filters by name, active status, and price range.",
    getProductsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetProducts(params) }] }),
  );

  server.tool(
    "get_statuses",
    "Get all order statuses configured in RetailCRM.",
    getStatusesSchema.shape,
    async () => ({ content: [{ type: "text", text: await handleGetStatuses() }] }),
  );

  server.tool(
    "get_status_groups",
    "Get all order status groups configured in RetailCRM.",
    getStatusGroupsSchema.shape,
    async () => ({ content: [{ type: "text", text: await handleGetStatusGroups() }] }),
  );

  // --- Skills (prompt templates) ---

  server.prompt(
    "new-orders",
    "Новые заказы за сегодня — показывает все заказы, созданные сегодня.",
    async () => {
      const today = new Date().toISOString().slice(0, 10);
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Используй инструмент get_orders с filter_date_from="${today}" и filter_date_to="${today}". Покажи результат в виде таблицы: номер заказа, статус, сумма, клиент. Если заказов нет — скажи "Новых заказов за сегодня нет."`,
            },
          },
        ],
      };
    },
  );

  server.prompt(
    "customer-search",
    "Найди клиента по имени, email или телефону.",
    { query: z.string().describe("Имя, email или телефон клиента") },
    async ({ query }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Найди клиента в RetailCRM по запросу: "${query}". Используй get_customers — попробуй искать по имени, email и телефону. Покажи результат: имя, контакты, количество заказов, общая сумма.`,
            },
          },
        ],
      };
    },
  );

  return server;
}

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
        res.end(JSON.stringify({ status: "ok", version: VERSION, tools: 8, prompts: 2 }));
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
    console.error(`[retailcrm-mcp] Server started (stdio). ${VERSION} — 8 tools, 2 prompts.`);
  }
}

main().catch((error) => {
  console.error("[retailcrm-mcp] Error:", error);
  process.exit(1);
});
