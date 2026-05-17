# Lexi Integration Contract

**Status:** Draft  
**Date:** 2026-05-06  
**Last updated:** 2026-05-18

## Overview

Lexi is an internal application that sends garment development requests to TaskFactory via webhooks. Each request is stored as a **catalog garment reference** (`garment_references` with `source = lexi_catalog`). These references serve as a read-only catalog that operators can consult when creating work orders; they are **not automatically linked** to any work order.

## Webhook Endpoint

```
POST /api/webhooks/lexi/developments
```

> The endpoint path is kept for backward compatibility with existing Lexi configuration. Internally the handler upserts `garment_references` (not the removed `developments` table).

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

- `external_id` maps to `garment_references.lexi_external_id` (UNIQUE constraint)
- On duplicate `external_id` with `development.created`, return `200 OK` (no duplicate creation)
- On `development.updated`, upsert matching record

### Response

- `200 OK` — processed or already exists
- `400 Bad Request` — validation error (missing required fields)
- `401 Unauthorized` — invalid signature
- `500 Internal Server Error` — retry later

### Catalog Reference Status Flow

```
received → in_review → approved → archived
                     → rejected
```

### Usage in Work Orders

Catalog references from Lexi are **not** automatically converted into work orders. When a user creates a work order, they can view the Lexi catalog (`GET /garment-references?source=lexi_catalog`) and manually enter the relevant data into the work order's operational garment reference.

## Retry Policy

TaskFactory acknowledges receipt immediately. If internal processing fails, the reference is stored with `status: received` and a background job retries enrichment.
