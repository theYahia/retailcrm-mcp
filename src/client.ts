const TIMEOUT = 15_000;
const MAX_RETRIES = 3;

function getBaseUrl(): string {
  const url = process.env.RETAILCRM_URL;
  if (!url) throw new Error("RETAILCRM_URL is not set");
  const base = url.endsWith("/") ? url.slice(0, -1) : url;
  return `https://${base.replace(/^https?:\/\//, "")}/api/v5`;
}

function getApiKey(): string {
  const key = process.env.RETAILCRM_API_KEY;
  if (!key) throw new Error("RETAILCRM_API_KEY is not set");
  return key;
}

export async function retailCrmGet(path: string, params?: Record<string, string>): Promise<unknown> {
  const query = new URLSearchParams(params);
  query.set("apiKey", getApiKey());

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(`${getBaseUrl()}${path}?${query.toString()}`, {
        headers: { "Accept": "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) return response.json();

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[retailcrm-mcp] ${response.status}, retry in ${delay}ms (${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const text = await response.text();
      throw new Error(`RetailCRM HTTP ${response.status}: ${text}`);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
        console.error(`[retailcrm-mcp] Timeout, retry (${attempt}/${MAX_RETRIES})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("RetailCRM: all retries exhausted");
}

export async function retailCrmPost(path: string, formData: Record<string, string>): Promise<unknown> {
  const body = new URLSearchParams(formData);
  body.set("apiKey", getApiKey());

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(`${getBaseUrl()}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: body.toString(),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) return response.json();

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[retailcrm-mcp] ${response.status}, retry in ${delay}ms (${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const text = await response.text();
      throw new Error(`RetailCRM HTTP ${response.status}: ${text}`);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
        console.error(`[retailcrm-mcp] Timeout, retry (${attempt}/${MAX_RETRIES})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("RetailCRM: all retries exhausted");
}
