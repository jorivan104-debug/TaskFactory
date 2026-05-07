# Accounting Sync Contract (Zoho Books)

**Status:** Draft
**Date:** 2026-05-06

## Overview

TaskFactory generates accounting sync requests that are queued and pushed to Zoho Books (or a future replacement). The system never writes directly to the accounting ledger — it creates structured requests that a background worker processes.

## Queue Entry: `accounting_sync_requests`

### Payload Schema (`payload_json`)

```json
{
  "request_type": "journal_entry" | "bill" | "payment" | "vendor_credit",
  "idempotency_key": "tf-po-1234-labor-2026-05",
  "data": {
    "date": "2026-05-06",
    "reference_number": "TF-JE-00456",
    "currency_code": "COP",
    "line_items": [
      {
        "account_code": "5105",
        "description": "Mano de obra — OP 1234",
        "debit": 1500000,
        "credit": 0
      },
      {
        "account_code": "2305",
        "description": "Nómina por pagar — OP 1234",
        "debit": 0,
        "credit": 1500000
      }
    ],
    "notes": "Registro automático desde TaskFactory",
    "source_entity": "production_order",
    "source_id": "uuid-of-production-order"
  }
}
```

### Status Flow

```
pending → processing → synced
                     → failed → retry_pending → processing → ...
                     → manual_review
```

### Retry Policy

- **Automatic retries:** 3 attempts with exponential backoff (30s, 2min, 10min)
- **After 3 failures:** status moves to `manual_review`
- **Manual retry:** UI button in "Mesa de ayuda" screen for engineering/PM to trigger re-processing
- **`retry_count`** and **`last_error`** are updated on each attempt

### Zoho Books API Mapping

| Request Type | Zoho Books Endpoint |
|---|---|
| `journal_entry` | `POST /api/v3/journalentries` |
| `bill` | `POST /api/v3/bills` |
| `payment` | `POST /api/v3/vendorpayments` |

### UI: Help Desk View

Available to roles: `admin`, `accountant`, `engineering`.

Columns: ID, Request Type, Status, Created At, Retry Count, Last Error, Actions (Retry / View Payload).

Filter by: status, date range, source entity.
