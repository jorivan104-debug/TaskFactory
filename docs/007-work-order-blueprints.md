# Work Order Blueprints

## Overview

Each **Work Order Type** (`work_order_types`) can have a single **Blueprint** that defines a state-machine flow. A blueprint is a directed graph where:

- **Nodes** = states (each corresponds to a task/phase in production)
- **Edges** = transitions between states, optionally with conditions and declarative actions

When a work order is created with a type that has a published blueprint, the system copies the blueprint definition into the work order (snapshot) and sets the initial state. The work order then progresses through the graph via explicit transitions.

## Data Model

### `work_order_types`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `code` | VARCHAR(32) | Unique code, e.g. `CORTE` |
| `name` | VARCHAR(255) | Display name |
| `description` | TEXT | Optional |
| `is_active` | BOOLEAN | Soft delete flag |

### `work_order_blueprints`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `work_order_type_id` | UUID | FK unique → `work_order_types` |
| `version` | INT | Incremented on each publish |
| `status` | VARCHAR(16) | `draft` or `published` |
| `definition_json` | JSONB | Graph definition (see below) |
| `published_at` | TIMESTAMPTZ | When last published |

### Changes to `work_orders`

| Column | Type | Notes |
|--------|------|-------|
| `work_order_type_id` | UUID | FK → `work_order_types` (optional) |
| `current_state_key` | VARCHAR(128) | Current node ID in the graph |
| `blueprint_version` | INT | Copied from blueprint at creation time |
| `blueprint_snapshot_json` | JSONB | Frozen copy of `definition_json` |

## `definition_json` Schema (v1)

```json
{
  "schemaVersion": 1,
  "nodes": [
    {
      "id": "cutting",
      "type": "default",
      "position": { "x": 120, "y": 80 },
      "data": {
        "label": "Corte",
        "task": {
          "title": "Corte",
          "description": "...",
          "autoCreateAssignment": true
        },
        "isFinal": false
      }
    }
  ],
  "edges": [
    {
      "id": "cutting-to-sewing",
      "source": "cutting",
      "target": "sewing",
      "data": {
        "label": "Pasar a confección",
        "trigger": "manual",
        "conditions": [],
        "actions": [
          { "type": "set_field", "target": "work_order", "field": "status", "value": "in_progress" },
          { "type": "append_log", "entryType": "status_change", "summary": "Avance a confección" }
        ]
      }
    }
  ],
  "initialStateKey": "cutting"
}
```

## Declarative Actions (MVP)

| `type` | Description |
|--------|-------------|
| `set_field` | Update whitelisted field on work order (`status`, `title`) |
| `append_log` | Create a `work_order_logs` entry |
| `create_task_assignment` | Create a `TaskAssignment` for the new state |
| `complete_open_tasks` | Mark all open task assignments as completed |

## Declarative Conditions (MVP)

| `type` | Description |
|--------|-------------|
| `field_equals` | Check that a work order field equals a value |
| `role_has` | Check user has a specific role (placeholder) |
| `all_tasks_completed` | All task assignments must be completed |

## API Endpoints

### Work Order Types

- `GET /work-order-types` — list all types
- `POST /work-order-types` — create type
- `PATCH /work-order-types/:id` — update type
- `DELETE /work-order-types/:id` — delete type (no work orders must exist)
- `GET /work-order-types/:id/blueprint?draft=true` — get blueprint
- `PUT /work-order-types/:id/blueprint` — save draft
- `POST /work-order-types/:id/blueprint/publish` — validate and publish

### Work Orders (extended)

- `POST /work-orders` — now accepts `workOrderTypeId`; auto-initializes blueprint
- `GET /work-orders/:id/flow` — current state + available transitions
- `POST /work-orders/:id/transitions/:transitionId` — execute transition

## Blueprint Validation (on publish)

1. `initialStateKey` exists and matches a node ID
2. All edge `source`/`target` reference valid nodes
3. Non-final nodes (without `isFinal: true`) should have at least one outgoing edge
4. Actions reference only whitelisted field names
5. Conditions use only known condition types

## Immutability

When a work order is created, the blueprint definition is **copied** into `blueprint_snapshot_json`. This ensures that publishing a new version of the blueprint does not break work orders already in progress.
