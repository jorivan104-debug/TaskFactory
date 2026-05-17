---
tags:
  - roadmap
Tipo: Roadmap ejecutable
Fecha de Creación: 2026-05-06
Última actualización: 2026-05-18
Version: 1.4
Autor: Jorge Ivan Caicedo Gutierrez
Relacionado con: "Acta de constitución del proyecto.md"
---

# Roadmap del proyecto

Documento vivo para marcar avance. Marca los ítems completados cambiando `[ ]` por `[x]` en Obsidian, VS Code o cualquier editor Markdown.

## Decisiones de alcance (referencia rápida)

- **MVP (cierre de desarrollo):** producto **casi finalizado**, listo para **entrar en fases de pruebas** (no es un “subconjunto mínimo” de funciones; es el entregable previo a validación formal). **Cierre:** desplegado en ambientes acordados y con **plan de pruebas** de esa etapa superado (ver acta y `Pregutas de la AI.md`, pregunta 29).
- **Fase siguiente a ese cierre:** **pruebas** (funcionales, con usuarios, ajustes).
- **Módulos deseables no bloqueantes:** **ninguno** para el primer despliegue; todo lo planificado en el acta es **requerido**.
- **Multi-sitio:** el sistema debe permitir un **número no acotado** de **plantas de trabajo** y **almacenes** desde el inicio (modelo multi-ubicación).
- **Lexi:** integración por **API y webhooks**; persistencia en **servidor interno** con **respaldo**.
- **Contabilidad:** **solicitudes de movimientos contables** sincronizables; fallos → **reintento** + **mesa de ayuda** de ingeniería.
- **Canales:** **correo** y **WhatsApp**; **bitácora** sustituye firma en procesos internos; **básculas** y **lectores QR**; más integraciones **configurables después**.
- **NFR:** ~**40** usuarios concurrentes en pico; **móvil + PC**; **siempre online**; **UI español** / **código inglés**.
- **Inventario:** **lotes y series** desde el MVP; **perfiles de usuario personalizables**.
- **PM:** **Jorge Ivan Caicedo Gutierrez**; revisión de cronograma **semanal** (ver **`Pregutas de la AI.md`** para detalle).

> Detalle de propósito, stakeholders y cronograma calendario: ver **Acta de constitución del proyecto**.

---

## Fase 0 — Fundamentos y modelo multi-ubicación

- [x] Definir y documentar arquitectura (frontend, backend, base de datos, integraciones) — ver `docs/001-architecture-decision.md`, `README.md`
- [x] Modelo de datos relacional: producción, inventario, personal, finanzas **y** plantas/almacenes — `Estructura de base de datos.md` v0.8 + Prisma
- [ ] Reglas de negocio multi-planta: stock por almacén, transferencias, consumo en producción por ubicación
- [ ] Definición de flujos end-to-end (Lexi → producción → inventario → contabilidad, etc.)
- [x] Listado de **entidades de dominio** mínimas y relación PT / semielaborado / insumo — borrador en `docs/002-domain-gaps-resolution.md` y `Estructura de base de datos.md` (validación negocio pendiente)

---

## Fase 1 — Desarrollo hasta “listo para pruebas”

### 1. Administración del sistema y seguridad

- [x] Gestión de usuarios y roles — API + login JWT; WorkOS AuthKit opcional
- [ ] Control de accesos coherente con roles del negocio (guards por permiso fino)
- [x] Configuración general — CRUD en `/settings`: plantas, almacenes, roles, marcas, siluetas, tallas, colores, unidades/tipos de insumo, **tipos de OT** y **blueprints** (canvas)

### 2. Lexi y referencias de prenda

- [x] Integración con Lexi — webhook `POST /webhooks/lexi/developments` → `garment_references` (`source=lexi_catalog`)
- [x] Catálogo de referencias Lexi — API `GET /garment-references` + UI `/garment-references`
- [ ] Enriquecimiento automático de referencias Lexi (mapear silueta, color, marca a IDs de catálogo)

### 3. Gestión operativa de producción (OT como entidad principal)

- [x] Creación y seguimiento de OT — API + UI `/work-orders` con planta, tipo, referencia de prenda 1:1, curva de tallas
- [x] Control de fases y estados — **blueprints por tipo de OT** (editor + motor de transiciones); ver `docs/007-work-order-blueprints.md`
- [ ] Registro de tiempos por proceso
- [x] Trazabilidad en tiempo real — bitácora `work_order_logs` + estado `current_state_key` + cierre de OT

### 4. Pedidos internos

- [ ] Interfaz de solicitudes de producción
- [ ] Validación y aprobación de pedidos
- [ ] Conversión de pedidos en **órdenes de trabajo** (antes OP)

### 5. Inventarios

- [ ] Gestión de insumos (por almacén / movimientos entre almacenes)
- [ ] Control de productos en proceso
- [ ] Control de productos terminados
- [ ] Movimientos de inventario en tiempo real vinculados a producción

### 6. Talento humano

- [x] Registro de personal — API `employees`
- [x] Control de horarios (entrada / salida) — API `time_entries`
- [x] Asignación de tareas por operario en el flujo productivo — `task_assignments`; auto-creación al entrar en estado del blueprint (MVP)
- [ ] Seguimiento de desempeño (alcance acordado en acta)

### 7. Finanzas e integración contable

- [ ] Generación de solicitudes de pago hacia sistema contable (ej. Zoho Books)
- [ ] Integración técnica y validación de flujo con contabilidad
- [ ] Control de costos de producción
- [ ] Gestión de pagos al personal (en alcance del acta)

### 8. Gestión de terceros

- [ ] Registro de proveedores y aliados
- [ ] Seguimiento de servicios externos
- [ ] Control de obligaciones con terceros

### 9. Logística y transporte

- [ ] Gestión de envíos de mercancía
- [ ] Control de rutas o movimientos
- [ ] Seguimiento de entregas

### 10. Reportes y analítica

- [ ] Reportes operativos en tiempo real (producción, inventario, personal)
- [ ] Al menos **5 KPIs** técnicos/operativos implementados en el sistema
- [ ] Análisis de eficiencia y proyecciones operativas/financieras según acta

### Cierre de Fase 1 (gate antes de pruebas)

- [ ] Build estable desplegable en entorno de **pruebas** (no necesariamente producción aún)
- [ ] Datos maestros mínimos cargados (plantas, almacenes, productos, usuarios de prueba)
- [ ] Checklist interno de “smoke test” cruzando los 10 módulos
- [ ] **Plan de pruebas** de esta etapa definido y **superado** (criterio de cierre alineado al acta v1.2 y pregunta 29 del cuestionario)

---

## Fase 2 — Pruebas y calidad

- [ ] Pruebas funcionales sobre el **100%** de los módulos desarrollados
- [ ] Pruebas con usuarios reales (UAT) y registro de hallazgos
- [ ] Corrección del **≥95%** de errores **críticos** identificados
- [ ] Validación de inventario: precisión **≥95%** en escenarios de prueba (meta del acta)
- [ ] Validación de integración contable: **≥90%** de transacciones de prueba sincronizadas correctamente (meta del acta)
- [ ] Validación flujo Lexi → órdenes de producción en entorno de pruebas
- [ ] Ajustes operativos y refinamiento de UX según feedback

---

## Fase 3 — Despliegue en producción y operación

- [x] Configuración en servidor (referencia acta: **Dokploy**) — stack Compose en staging (`taskfactory.app-sprint.com`); ver `docs/006-dokploy-deployment.md`
- [ ] Despliegue en **producción** y activación controlada (go-live definitivo / dominio producción)
- [ ] Monitoreo inicial: apuntar a **≥95%** disponibilidad el **primer mes** (meta del acta)
- [ ] Capacitación de usuarios
- [ ] Acompañamiento operativo post go-live
- [ ] Documentación de usuario / operación básica
- [ ] Ajustes finales tras go-live

---

## Hitos del cronograma (30 abr – 30 jul 2026) — seguimiento opcional

Marcar cuando el hito quede **cerrado** a satisfacción del equipo y del negocio.

| # | Hito | Inicio | Fin | Listo |
|---|------|--------|-----|-------|
| 1 | Arquitectura del sistema | 30/04/2026 | 13/05/2026 | [ ] |
| 2 | Módulo de Producción | 14/05/2026 | 03/06/2026 | [ ] |
| 3 | Módulo de Usuarios y Roles | 14/05/2026 | 27/05/2026 | [ ] |
| 4 | Módulo de Inventario | 28/05/2026 | 17/06/2026 | [ ] |
| 5 | Módulo de Pedidos Internos | 04/06/2026 | 24/06/2026 | [ ] |
| 6 | Integración Contable | 25/06/2026 | 08/07/2026 | [ ] |
| 7 | Módulo de Reportes Básicos | 02/07/2026 | 15/07/2026 | [ ] |
| 8 | Pruebas funcionales y ajustes | 09/07/2026 | 22/07/2026 | [ ] |
| 9 | Despliegue en producción | 20/07/2026 | 24/07/2026 | [ ] |
| 10 | Capacitación y sincronización | 23/07/2026 | 30/07/2026 | [ ] |

---

## Cómo usar este roadmap

1. Avanza en orden lógico (Fase 0 → 1 → 2 → 3); el orden de módulos en Fase 1 puede solaparse según el equipo.
2. Marca `[x]` solo cuando el ítem esté **verificado** (no solo “código escrito”).
3. Si el cronograma calendario cambia, actualiza la tabla de hitos o añade una nota al final con fecha y motivo.
