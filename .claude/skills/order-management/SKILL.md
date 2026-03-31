---
name: order-management
description: Manage RetailCRM orders and customers
argument-hint: <action> [details]
allowed-tools:
  - Bash
  - Read
---

# /order-management — RetailCRM Operations

## Algorithm

1. Use `get_orders` to list orders with filters by status, customer, date
2. Use `create_order` to create new orders with customer and items
3. Use `get_customers` to search customers by name, email, phone

## Response Format

```
## RetailCRM Orders

### Recent Orders
1. #1234 — New — John Doe — 15,000 RUB — 2 items
2. ...

### Customer Search: "Ivanov"
1. Ivan Ivanov — ivan@mail.ru — 5 orders — 75,000 RUB total
```

## Examples

```
/order-management list orders status new
/order-management create order "Ivan Petrov" +79001234567
/order-management search customers "Sidorov"
```
