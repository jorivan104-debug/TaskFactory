# Lexi Integration Contract

> **Estado (2026-05):** La integración con Lexi **no está activa** en TaskFactory. Las referencias de prenda se gestionan como **catálogo manual** (`garment_references` sin webhook). Este documento se conserva solo como referencia histórica del contrato previsto.

## Resumen del catálogo actual

- **API:** `GET/POST/PATCH /garment-references`, `POST /garment-references/:id/deactivate`, `GET /garment-references/preview`
- **ID (`code`):** 9 caracteres = consecutivo marca (3) + secuencia referencia por marca (3, 100–999) + serie (3, p. ej. `M00`–`M99` o `P00`–`P99`)
- **Tipo:** `muestra` | `produccion` (define prefijo de serie `M` o `P`)
- **Marca:** obligatoria (`brands.consecutivo` 100–999)
- Las referencias de catálogo (`work_order_id` nulo) no se vinculan automáticamente a OT; la referencia operativa de una OT se crea al dar de alta la orden.

## Contrato Lexi (no implementado)

Lexi era un sistema interno que enviaría desarrollos por webhook. Ese flujo **no está conectado** al backend actual (módulo `webhooks` eliminado de `AppModule`).

Si se reactivara en el futuro, habría que definir un contrato nuevo alineado con el modelo de `code` / `reference_type` / `serie` descrito arriba, en lugar del esquema `lexi_catalog` + `lexi_external_id` del diseño v0.9.
