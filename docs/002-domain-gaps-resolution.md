# Domain Gaps Resolution

**Date:** 2026-05-06  
**Last updated:** 2026-05-17  
**Related:** Pregutas de la AI.md (questions 19–20, S1–S4), [007-work-order-blueprints.md](./007-work-order-blueprints.md)

## Question 19 — Minimum entity list

Based on the existing ER document and business flows described in the charter, the working entity list is:

### Core catalogs
`Brand`, `SilhouetteCategory`, `Silhouette`, `PantoneColor`, `Size`, `UnitOfMeasure`, `SupplyType`

### Users & access
`User`, `Role`, `UserRole`

### Multi-site
`WorkSite`, `Warehouse`

### Supply chain
`Supplier`, `Supply` (raw material), `SupplyPurchaseOrder`, `SupplyPurchaseOrderItem`, `SupplyPurchaseReceipt`, `SupplyPurchaseReceiptItem`, `SupplierInvoice`, `SupplierInvoiceLine`, `SupplierPayment`, `SupplierPaymentAllocation`

### Production
`WorkOrderType`, `WorkOrderBlueprint`, `WorkOrder` (main production entity), `GarmentReference` (catalog or 1:1 with OT), `WorkOrderSizeCurveItem`, `WorkOrderPantoneColor`, `WorkOrderLog`

**Simplified model (v1.0):** `Development` and `ProductionOrder` were removed. OT is the main production entity. Garment references are managed manually: catalog rows (`work_order_id` null) with auto `code`, `reference_type`, `serie`; operational references created with the work order share the same coding rules. Lexi integration is not active.

### Products & inventory
`Product` (finished goods + semi-finished), `InventoryStockLot`, `InventoryMovement`

### Internal orders
`InternalOrder`, `InternalOrderItem`

### Human resources
`Employee`, `TimeEntry`, `TaskAssignment`

### Third parties & logistics
`ThirdPartyService`, `Shipment`, `ShipmentItem`

### Finance & accounting
`AccountingSyncRequest`

### Audit
`AuditLog`

## Question 20 — Product / semi-finished / supply relationship

Working model (to validate with business):

```
Supply (raw material: fabric, thread, buttons...)
  ↓ consumed by production phases
Semi-finished product (WIP in a phase: cut pieces, assembled but unwashed, etc.)
  ↓ advances through work orders
Finished product (completed garment exiting last phase — terminación)
```

**Implementation:** A single `products` table with a `product_type` discriminator:
- `raw_material` → links to `supplies` for purchasing; inventory via `inventory_stock_lots`
- `semi_finished` → created during production phases; tracked per `work_order`
- `finished_good` → final output of a production order; inventoried in warehouse

This avoids separate tables while keeping clear classification. The `supply` table remains for purchasing-specific fields; `products` is the unified inventory entity.

## Question S4 — Stock by plant/warehouse vs central

**Decision:** Stock is tracked **per warehouse** in `inventory_stock_lots` (each lot belongs to one `warehouse_id`). Corporate totals in `supplies.stock_on_hand` / `stock_on_way` are **materialized aggregates** updated by application logic on receipt/movement events. This supports both plant-level visibility and company-wide purchasing decisions.

## Questions S1–S3 (migration from Creator)

**Working assumption:** The new system replaces only Zoho Creator. Zoho Books remains as the accounting system. On go-live, master data (products, suppliers, employees) will be seeded fresh or imported via a one-time migration script. No historical production orders will be migrated; Creator remains accessible read-only for historical queries during a transition period.
