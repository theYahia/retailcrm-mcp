# @theyahia/retailcrm-mcp

MCP server for **RetailCRM** e-commerce CRM. Provides 8 tools + 2 prompt skills for managing orders, customers, products, and statuses via API v5.

[![npm](https://img.shields.io/npm/v/@theyahia/retailcrm-mcp)](https://www.npmjs.com/package/@theyahia/retailcrm-mcp)
[![Smithery](https://smithery.ai/badge/@theyahia/retailcrm-mcp)](https://smithery.ai/server/@theyahia/retailcrm-mcp)

## Tools (8)

| Tool | Description |
|------|------------|
| `get_orders` | List orders with filters by status, customer, number, dates |
| `get_order` | Get a single order by ID |
| `create_order` | Create a new order with customer info, items, delivery |
| `get_customers` | Search customers by name, email, phone |
| `get_customer` | Get a single customer by ID |
| `get_products` | List products with filters by name, active status, price range |
| `get_statuses` | Get all order statuses |
| `get_status_groups` | Get all order status groups |

## Skills (Prompt Templates)

| Skill | Description |
|-------|------------|
| `new-orders` | "Новые заказы за сегодня" — shows all orders created today |
| `customer-search` | "Найди клиента" — search customer by name, email, or phone |

## Setup

1. In RetailCRM, go to **Settings > Integration > API keys**
2. Create a new API key with required permissions

## Usage with Claude Desktop

```json
{
  "mcpServers": {
    "retailcrm": {
      "command": "npx",
      "args": ["-y", "@theyahia/retailcrm-mcp"],
      "env": {
        "RETAILCRM_DOMAIN": "yourstore.retailcrm.ru",
        "RETAILCRM_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Streamable HTTP Mode

Run as an HTTP server instead of stdio:

```bash
RETAILCRM_DOMAIN=yourstore.retailcrm.ru \
RETAILCRM_API_KEY=your-key \
npx @theyahia/retailcrm-mcp --http
```

- `POST /mcp` — MCP Streamable HTTP endpoint
- `GET /health` — health check (returns JSON with version, tool count)
- Default port: 3000 (override with `PORT` env var)

## Smithery

Install via [Smithery](https://smithery.ai):

```bash
npx @smithery/cli install @theyahia/retailcrm-mcp
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RETAILCRM_DOMAIN` | Yes | Your RetailCRM domain (e.g. `yourstore.retailcrm.ru`) |
| `RETAILCRM_API_KEY` | Yes | API key for authentication |
| `PORT` | No | HTTP server port (default: 3000, only for `--http` mode) |

> `RETAILCRM_URL` is still supported as a fallback for backward compatibility.

## Development

```bash
npm install
npm test          # run Vitest tests
npm run dev       # start in dev mode (stdio)
npm run build     # compile TypeScript
```

## Referral Program

Earn **up to 50% recurring commission** by referring RetailCRM users who connect via this MCP server. Contact [@theYahia](https://github.com/theYahia) for details and your referral link.

## License

MIT
