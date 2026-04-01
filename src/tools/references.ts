import { z } from "zod";
import { retailCrmGet } from "../client.js";

// ── list_statuses ────────────────────────────────────────────
export const listStatusesSchema = z.object({});

export async function handleListStatuses(): Promise<string> {
  const result = await retailCrmGet("/reference/statuses");
  return JSON.stringify(result, null, 2);
}

// ── list_delivery_types ──────────────────────────────────────
export const listDeliveryTypesSchema = z.object({});

export async function handleListDeliveryTypes(): Promise<string> {
  const result = await retailCrmGet("/reference/delivery-types");
  return JSON.stringify(result, null, 2);
}

// ── list_payment_types ───────────────────────────────────────
export const listPaymentTypesSchema = z.object({});

export async function handleListPaymentTypes(): Promise<string> {
  const result = await retailCrmGet("/reference/payment-types");
  return JSON.stringify(result, null, 2);
}

// ── list_stores ──────────────────────────────────────────────
export const listStoresSchema = z.object({});

export async function handleListStores(): Promise<string> {
  const result = await retailCrmGet("/reference/stores");
  return JSON.stringify(result, null, 2);
}
