# @theyahia/retailcrm-mcp

MCP server for **RetailCRM** e-commerce CRM. Provides tools for managing orders and customers via API v5.

## Tools

| Tool | Description |
|------|------------|
| `get_orders` | List orders with filters by status, customer, number, dates |
| `create_order` | Create a new order with customer info, items, delivery |
| `get_customers` | Search customers by name, email, phone |

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
        "RETAILCRM_URL": "yourstore.retailcrm.ru",
        "RETAILCRM_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RETAILCRM_URL` | Yes | Your RetailCRM domain (e.g. `yourstore.retailcrm.ru`) |
| `RETAILCRM_API_KEY` | Yes | API key for authentication |

## License

MIT
