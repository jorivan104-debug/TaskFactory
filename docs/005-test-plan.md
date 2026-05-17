# Test Plan — Gate "Ready for Testing" (Fase 1)

**Date:** 2026-05-06  
**Last updated:** 2026-05-17  
**Aligned with:** Roadmap del proyecto.md (Fase 1 gate criteria), [007-work-order-blueprints.md](./007-work-order-blueprints.md)

## Criteria for Closing Fase 1

Per the roadmap, this gate is met when:

1. Stable build deployable to **testing** environment
2. Minimum master data loaded (sites, warehouses, products, test users)
3. Internal smoke test checklist covering all **10 modules** passed
4. Test plan for this stage **defined and passed**

## Smoke Test Checklist (10 Modules)

### 1. System Administration
- [ ] Login with admin credentials
- [ ] Create a new user with area_manager role
- [ ] Verify role-based menu visibility
- [ ] Create a new work site and warehouse (`/settings/work-sites`, `/settings/warehouses`)
- [ ] Update work site name
- [ ] Create/edit catalog: brands, silhouettes (with thumbnail + gender), pantone colors (hex sample)
- [ ] Create work order type and open blueprint editor from list column
- [ ] Verify audit log captures user creation

### 2. Lexi Catalog & Garment References
- [ ] Simulate Lexi webhook creating a catalog reference (`POST /webhooks/lexi/developments`)
- [ ] Verify reference created with `source=lexi_catalog` and `lexi_external_id`
- [ ] List catalog references (`GET /garment-references`)
- [ ] Update catalog reference status (`PATCH /garment-references/:id`)

### 3. Production Operations (Core — Work Orders)
- [ ] Create work order with plant, code, and type (`POST /work-orders`)
- [ ] Verify `workSiteId` is required
- [ ] Create work order with inline garment reference (brand, silhouette, fabric)
- [ ] Upsert garment reference on existing work order (`POST /work-orders/:id/garment-reference`)
- [ ] Upsert size curve (3+ sizes) (`POST /work-orders/:id/size-curve`)
- [ ] Publish blueprint for a work order type (states + transitions + actions)
- [ ] Create work order with `workOrderTypeId`; verify initial `current_state_key` and snapshot
- [ ] Execute blueprint transition from work order detail (`POST .../transitions/:id`)
- [ ] Verify `work_order_logs` entries after transition
- [ ] Update work order status through declarative `set_field` action on transition
- [ ] Close work order (`POST /work-orders/:id/close`)

### 4. Internal Orders
- [ ] Create internal order with items
- [ ] Approve internal order
- [ ] Convert approved order to production order
- [ ] Verify status flow (draft → pending_approval → approved → converted)

### 5. Inventory
- [ ] Create product (raw material, semi-finished, finished good)
- [ ] Register inventory receipt movement
- [ ] Register consumption movement
- [ ] Verify stock lot quantity updates
- [ ] Register inter-warehouse transfer
- [ ] Verify lot and serial code tracking

### 6. Human Resources
- [ ] Create employee record
- [ ] Register clock-in
- [ ] Register clock-out
- [ ] Assign task to employee on work order
- [ ] Mark task as completed
- [ ] Verify time entries appear in employee profile

### 7. Finance & Accounting Integration
- [ ] Create accounting sync request
- [ ] Verify pending status
- [ ] Simulate failed sync (verify retry_count increment)
- [ ] Manual retry from UI
- [ ] Verify production cost tracking data structure

### 8. Third Parties
- [ ] Create supplier record
- [ ] Register third-party service
- [ ] Track service obligations

### 9. Logistics & Transport
- [ ] Create shipment with items
- [ ] Update shipment status (pending → in_transit → delivered)
- [ ] Verify tracking information

### 10. Reports & Analytics
- [ ] View dashboard with KPI cards
- [ ] Verify 5 KPIs display:
  - Units produced (per period)
  - Average time per process
  - Cost per reference
  - Employee performance / task completion
  - Inventory levels
- [ ] Verify production summary report endpoint
- [ ] Verify cost analysis report endpoint

## Purchasing Subflow (part of Inventory/Supplies)
- [ ] Create supply purchase order
- [ ] Add items to purchase order
- [ ] Create receipt against purchase order
- [ ] Verify stock updates on receipt
- [ ] Create supplier invoice
- [ ] Register supplier payment with allocation

## Cross-Cutting Concerns
- [ ] Audit log captures all critical operations
- [ ] Work order bitacora (logs) records status changes and progress
- [ ] Blueprint validator rejects invalid graph on publish (no initial state, dangling edges)
- [ ] Work order without type still works (no blueprint snapshot)
- [ ] Catalog reference (`lexi_catalog`) cannot be linked to a work order via API
- [ ] API documentation (Swagger) accessible at /api/docs
- [ ] JWT authentication works on all protected endpoints
- [ ] RBAC correctly restricts access (seller sees only terminación phase orders)
- [ ] Mobile-responsive layout verified on 375px viewport

## Seed Data Required
- 1 admin user
- 8 roles (admin, area_manager, workshop, operator, laundry, seller, accountant, accounting_assistant)
- 1 work site with 2 warehouses
- 5 units of measure
- 6 supply types
- 5 silhouette categories
- 16 sizes
- At least 1 brand, 1 supplier, 1 supply for testing
- At least 1 `work_order_type` with a **published** blueprint (2+ states, 1+ transition)
- At least 1 Lexi catalog reference (`garment_references` with `source=lexi_catalog`)
