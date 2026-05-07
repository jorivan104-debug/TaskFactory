# Lexi Integration Contract

**Status:** Draft
**Date:** 2026-05-06

## Overview

Lexi is an internal application that sends garment development requests to TaskFactory via webhooks. Each development represents a garment idea that evolves through sampling until it becomes a production order.

## Webhook Endpoint

```
POST /api/webhooks/lexi/developments
```

### Headers
- `X-Lexi-Signature`: HMAC-SHA256 of request body (shared secret)
- `Content-Type: application/json`

### Payload Schema

```json
{
  "event": "development.created" | "development.updated",
  "external_id": "lexi-dev-00123",
  "timestamp": "2026-05-06T14:30:00Z",
  "data": {
    "title": "Chaqueta Denim Oversize",
    "image_url": "https://lexi.internal/images/dev-00123.jpg",
    "silhouette": "Chaqueta",
    "color_reference": "19-4052 TCX",
    "attributes": {
      "season": "2026-Q3",
      "target_brand": "MainBrand",
      "notes": "Inspiración streetwear, botones metálicos"
    }
  }
}
```

### Idempotency

- `external_id` maps to `developments.lexi_external_id` (UNIQUE constraint)
- On duplicate `external_id` with `development.created`, return `200 OK` (no duplicate creation)
- On `development.updated`, upsert matching record

### Response

- `200 OK` — processed or already exists
- `400 Bad Request` — validation error (missing required fields)
- `401 Unauthorized` — invalid signature
- `500 Internal Server Error` — retry later

### Development Status Flow

```
received → in_review → approved → in_production → sample_complete → archived
                     → rejected
```

### Conversion to Production Order

When a development moves to `approved` status (manual action by patronista/gerente in TaskFactory UI), the system:
1. Creates a `ProductionOrder` linked via `development_id`
2. Creates the 1:1 `GarmentReference` with available data (brand, silhouette, fabric if known)
3. Notifies area managers via in-app notification

## Retry Policy

TaskFactory acknowledges receipt immediately. If internal processing fails, the development is stored with `status: received` and a background job retries enrichment.
