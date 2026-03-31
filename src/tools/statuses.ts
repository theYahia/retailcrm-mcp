import { z } from "zod";
import { retailCrmGet } from "../client.js";

export const getStatusesSchema = z.object({});

export async function handleGetStatuses(): Promise<string> {
  const result = await retailCrmGet("/reference/statuses");
  return JSON.stringify(result, null, 2);
}

export const getStatusGroupsSchema = z.object({});

export async function handleGetStatusGroups(): Promise<string> {
  const result = await retailCrmGet("/reference/status-groups");
  return JSON.stringify(result, null, 2);
}
