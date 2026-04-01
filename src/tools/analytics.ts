import { z } from "zod";
import { retailCrmGet } from "../client.js";

// ── get_orders_summary ───────────────────────────────────────
export const getOrdersSummarySchema = z.object({
  date_from: z.string().describe("Start date for the summary period (YYYY-MM-DD)"),
  date_to: z.string().describe("End date for the summary period (YYYY-MM-DD)"),
});

export async function handleGetOrdersSummary(params: z.infer<typeof getOrdersSummarySchema>): Promise<string> {
  // Use the orders endpoint with date filters and aggregate the results
  // RetailCRM v5 provides /orders/statuses/statistic for counts
  const [statisticResult, ordersResult] = await Promise.all([
    retailCrmGet("/orders/statuses/statistic"),
    retailCrmGet("/orders", {
      "filter[createdAtFrom]": params.date_from,
      "filter[createdAtTo]": params.date_to,
      limit: "1",
    }),
  ]);

  const summary = {
    period: { from: params.date_from, to: params.date_to },
    statusStatistic: statisticResult,
    ordersInPeriod: ordersResult,
  };
  return JSON.stringify(summary, null, 2);
}

// ── get_customers_summary ────────────────────────────────────
export const getCustomersSummarySchema = z.object({
  date_from: z.string().describe("Start date (YYYY-MM-DD)"),
  date_to: z.string().describe("End date (YYYY-MM-DD)"),
});

export async function handleGetCustomersSummary(params: z.infer<typeof getCustomersSummarySchema>): Promise<string> {
  const result = await retailCrmGet("/customers", {
    "filter[createdAtFrom]": params.date_from,
    "filter[createdAtTo]": params.date_to,
    limit: "1",
  });
  const summary = {
    period: { from: params.date_from, to: params.date_to },
    customers: result,
  };
  return JSON.stringify(summary, null, 2);
}
