const TIMEOUT = 15_000;
const MAX_RETRIES = 3;

function getBaseUrl(): string {
  const domain = process.env.RETAILCRM_DOMAIN || process.env.RETAILCRM_URL;
  if (!domain) throw new Error("RETAILCRM_DOMAIN is not set. Set it to your RetailCRM domain (e.g. yourstore.retailcrm.ru)");
  const base = domain.endsWith("/") ? domain.slice(0, -1) : domain;
  return `https://${base.replace(/^https?:\/\//, "")}/api/v5`;
}

function getApiKey(): string {
  const key = process.env.RETAILCRM_API_KEY;
  if (!key) throw new Error("RETAILCRM_API_KEY is not set. Create one in RetailCRM > Settings > Integration > API keys");
  return key;
}

interface RetailCrmErrorResponse {
  success: boolean;
  errorMsg?: string;
  errors?: Record<string, string> | string[];
}

function formatApiError(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body) as RetailCrmErrorResponse;
    const parts: string[] = [`RetailCRM HTTP ${status}`];
    if (parsed.errorMsg) parts.push(parsed.errorMsg);
    if (parsed.errors) {
      if (Array.isArray(parsed.errors)) {
        parts.push(parsed.errors.join("; "));
      } else {
        parts.push(Object.entries(parsed.errors).map(([k, v]) => `${k}: ${v}`).join("; "));
      }
    }
    return parts.join(" — ");
  } catch {
    return `RetailCRM HTTP ${status}: ${body.slice(0, 500)}`;
  }
}

async function withRetry<T>(fn: (attempt: number) => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt >= MAX_RETRIES) throw error;
      const isRetryable =
        (error instanceof Error && error.message.includes("429")) ||
        (error instanceof Error && /HTTP 5\d\d/.test(error.message)) ||
        (error instanceof DOMException && error.name === "AbortError");
      if (!isRetryable) throw error;
      const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
      console.error(`[retailcrm-mcp] Retrying in ${delay}ms (${attempt}/${MAX_RETRIES})`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("RetailCRM: all retries exhausted");
}

export async function retailCrmGet(path: string, params?: Record<string, string>): Promise<unknown> {
  return withRetry(async () => {
    const query = new URLSearchParams(params);
    query.set("apiKey", getApiKey());
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    try {
      const response = await fetch(`${getBaseUrl()}${path}?${query.toString()}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (response.ok) return response.json();
      const text = await response.text();
      throw new Error(formatApiError(response.status, text));
    } catch (error) {
      clearTimeout(timer);
      throw error;
    }
  });
}

export async function retailCrmPost(path: string, formData: Record<string, string>): Promise<unknown> {
  return withRetry(async () => {
    const body = new URLSearchParams(formData);
    body.set("apiKey", getApiKey());
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    try {
      const response = await fetch(`${getBaseUrl()}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: body.toString(),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (response.ok) return response.json();
      const text = await response.text();
      throw new Error(formatApiError(response.status, text));
    } catch (error) {
      clearTimeout(timer);
      throw error;
    }
  });
}
