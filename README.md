# @theyahia/retailcrm-mcp

Production-grade MCP server for **RetailCRM** e-commerce CRM. 15 tools + 2 prompt skills for managing orders, customers, products, references, and analytics via API v5.

[![npm](https://img.shields.io/npm/v/@theyahia/retailcrm-mcp)](https://www.npmjs.com/package/@theyahia/retailcrm-mcp)
[![Smithery](https://smithery.ai/badge/@theyahia/retailcrm-mcp)](https://smithery.ai/server/@theyahia/retailcrm-mcp)

## Tools (15)

### Orders
| Tool | Description |
|------|-------------|
| `list_orders` | List orders with filters by status, customer, number, date range |
| `get_order` | Get a single order by ID or externalId |
| `create_order` | Create an order with customer info, line items, delivery |
| `update_order` | Update order status, customer details, delivery, comments |

### Customers
| Tool | Description |
|------|-------------|
| `list_customers` | Search customers by name, email, phone, date |
| `get_customer` | Get a single customer by ID or externalId |
| `create_customer` | Create customer with contact info and address |
| `merge_customers` | Merge duplicate customer records |

### Products
| Tool | Description |
|------|-------------|
| `list_products` | List products with filters by name, group, active status, price range |

### References
| Tool | Description |
|------|-------------|
| `list_statuses` | All order statuses (codes, names, groups) |
| `list_delivery_types` | All delivery types with default costs |
| `list_payment_types` | All payment types |
| `list_stores` | All warehouses and stores |

### Analytics
| Tool | Description |
|------|-------------|
| `get_orders_summary` | Order statistics for a date range |
| `get_customers_summary` | Customer growth stats for a date range |

## Prompt Skills (2)

| Skill | Description |
|-------|-------------|
| `new-orders` | Quick daily overview of today's orders |
| `customer-search` | Find a customer by name, email, or phone |

## Setup

1. In RetailCRM, go to **Settings > Integration > API keys**
2. Create a new API key with the required permissions (orders, customers, stores, references)
3. Note your domain (the `yourstore` part of `yourstore.retailcrm.ru`)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RETAILCRM_DOMAIN` | Yes | Your RetailCRM domain (e.g. `yourstore.retailcrm.ru`) |
| `RETAILCRM_API_KEY` | Yes | API key from Settings > Integration > API keys |
| `PORT` | No | HTTP server port (default: 3000, only for `--http` mode) |

> `RETAILCRM_URL` is still supported as a fallback for backward compatibility.

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

- `POST /mcp` -- MCP Streamable HTTP endpoint
- `GET /health` -- health check (returns JSON with version, tool count)
- Default port: 3000 (override with `PORT` env var)

## Smithery

Install via [Smithery](https://smithery.ai):

```bash
npx @smithery/cli install @theyahia/retailcrm-mcp
```

## Demo Prompts

**1. Daily order overview:**
> "Show me all orders created today with status 'new'. Summarize the total count and revenue."

**2. Customer lookup and order history:**
> "Find the customer with email anna@example.com. Show their full profile and recent orders."

**3. Quick order creation:**
> "Create an order for Ivan Petrov, phone +79001234567, for 2x Widget at 500 RUB each, standard delivery to Moscow."

## Webhooks / Triggers

RetailCRM does not support API-created webhooks. Instead, use **Triggers** in the RetailCRM admin panel (Settings > Triggers) to configure automated actions on order/customer events. Triggers can send HTTP requests to external endpoints when conditions are met.

## Error Handling

- **Rate limits (429):** Automatic retry with exponential backoff (up to 3 attempts)
- **Server errors (5xx):** Automatic retry with exponential backoff
- **Validation errors:** RetailCRM error details are parsed and returned as readable messages
- **Timeouts:** 15-second timeout per request with automatic retry

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
