# AI Routes — Test Payloads

Base URL (local): `http://localhost:5000/api/ai`

Real `categoryId` values pulled from the current DB (swap for whatever exists
in yours if these get deleted):

| Category | id |
|---|---|
| Fashion | `4e8bac88-04c4-4d5d-8d0c-d1fa5dca2d30` |
| Toys, Kids & Babies | `5a9c1ab8-fbf7-4f7b-a406-30f21bce4fe1` |
| Groceries & Food | `792c731b-f87c-4c58-81d4-32f94b4f7400` |

---

## 1. Generate product description

```
POST /api/ai/generate-description
Authorization: Bearer <vendor_access_token>
Content-Type: application/json
```

Vendor-only (`validateUser(UserRole.VENDOR)`) — log in as a vendor first
(e.g. `vendor2@gmail.com` in the current DB) and grab the `accessToken`.

```json
{
  "name": "Running Shoes",
  "categoryId": "4e8bac88-04c4-4d5d-8d0c-d1fa5dca2d30",
  "keywords": "lightweight, waterproof, breathable, men's size 7-11",
  "price": 45
}
```

Minimal version (only the required fields):

```json
{
  "name": "Wireless Earbuds",
  "categoryId": "4e8bac88-04c4-4d5d-8d0c-d1fa5dca2d30"
}
```

**Expected response shape:**
```json
{
  "success": true,
  "message": "Description generated successfully!!!",
  "data": {
    "title": "string",
    "description": "string"
  }
}
```

---

## 2. Shopping assistant chat

```
POST /api/ai/chat
Content-Type: application/json
```

Public — no auth header needed. Rate-limited to 10 req/min per IP.

First message (no history yet):

```json
{
  "message": "Can you suggest a waterproof shoe under $50?"
}
```

Follow-up message (client resends the running conversation):

```json
{
  "message": "Does it come in black?",
  "history": [
    { "role": "user", "content": "Can you suggest a waterproof shoe under $50?" },
    { "role": "assistant", "content": "Sure! I found a couple of options for you..." }
  ]
}
```

**Expected response shape:**
```json
{
  "success": true,
  "message": "Chat response generated successfully!!!",
  "data": {
    "reply": "string",
    "productIds": ["uuid1", "uuid2"]
  }
}
```

---

## 3. Smart search

```
POST /api/ai/smart-search
Content-Type: application/json
```

Public — no auth header needed. Rate-limited to 10 req/min per IP. Optional
query params for pagination/sorting still work the same as `/product/all-products`
(e.g. `?page=1&limit=10&sortBy=price&sortOrder=asc`).

```json
{
  "query": "cheap waterproof shoes under $50"
}
```

More examples to try:

```json
{ "query": "groceries under 20 dollars" }
```

```json
{ "query": "toys for a 3 year old" }
```

**Expected response shape (identical to `/product/all-products`):**
```json
{
  "success": true,
  "message": "Products retrived successfully!!!",
  "data": {
    "data": [ /* array of products */ ],
    "meta": { "totalItems": 0, "page": 1, "limit": 10 }
  }
}
```

---

## curl quick-fire

```bash
curl -X POST http://localhost:5000/api/ai/generate-description \
  -H "Authorization: Bearer <vendor_token>" -H "Content-Type: application/json" \
  -d '{"name":"Running Shoes","categoryId":"4e8bac88-04c4-4d5d-8d0c-d1fa5dca2d30","keywords":"lightweight, waterproof"}'

curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Suggest a waterproof shoe under $50"}'

curl -X POST http://localhost:5000/api/ai/smart-search \
  -H "Content-Type: application/json" \
  -d '{"query":"cheap waterproof shoes under $50"}'
```
