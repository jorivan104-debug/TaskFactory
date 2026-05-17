/**
 * Validates a blueprint definition_json before publishing.
 * Returns an array of error strings; empty = valid.
 */

const ALLOWED_SET_FIELD_TARGETS = new Set([
  'work_order.status',
  'work_order.title',
]);

const ALLOWED_ACTION_TYPES = new Set([
  'set_field',
  'append_log',
  'create_task_assignment',
  'complete_open_tasks',
]);

const ALLOWED_CONDITION_TYPES = new Set([
  'field_equals',
  'role_has',
  'all_tasks_completed',
]);

export interface BlueprintNode {
  id: string;
  type?: string;
  position?: { x: number; y: number };
  data?: {
    label?: string;
    task?: { title?: string; description?: string; autoCreateAssignment?: boolean };
    isFinal?: boolean;
  };
}

export interface BlueprintEdge {
  id: string;
  source: string;
  target: string;
  data?: {
    label?: string;
    trigger?: string;
    conditions?: { type: string; [key: string]: unknown }[];
    actions?: { type: string; [key: string]: unknown }[];
  };
}

export interface BlueprintDefinition {
  schemaVersion?: number;
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
  initialStateKey: string;
}

export function validateBlueprintDefinition(def: unknown): string[] {
  const errors: string[] = [];

  if (!def || typeof def !== 'object') {
    return ['definition_json must be an object'];
  }

  const d = def as BlueprintDefinition;

  if (!Array.isArray(d.nodes) || d.nodes.length === 0) {
    errors.push('Blueprint must contain at least one node (state)');
  }

  if (!Array.isArray(d.edges)) {
    errors.push('Blueprint must contain an edges array');
  }

  if (!d.initialStateKey || typeof d.initialStateKey !== 'string') {
    errors.push('initialStateKey is required');
  }

  if (errors.length > 0) return errors;

  const nodeIds = new Set(d.nodes.map((n) => n.id));

  if (!nodeIds.has(d.initialStateKey)) {
    errors.push(`initialStateKey "${d.initialStateKey}" does not match any node id`);
  }

  for (const node of d.nodes) {
    if (!node.id || typeof node.id !== 'string') {
      errors.push('Every node must have a string id');
    }
  }

  for (const edge of d.edges) {
    if (!edge.id || typeof edge.id !== 'string') {
      errors.push('Every edge must have a string id');
    }
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge "${edge.id}" source "${edge.source}" does not reference a valid node`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge "${edge.id}" target "${edge.target}" does not reference a valid node`);
    }

    for (const action of edge.data?.actions ?? []) {
      if (!ALLOWED_ACTION_TYPES.has(action.type)) {
        errors.push(`Edge "${edge.id}" uses unknown action type "${action.type}"`);
      }
      if (action.type === 'set_field') {
        const key = `${action.target}.${action.field}`;
        if (!ALLOWED_SET_FIELD_TARGETS.has(key)) {
          errors.push(`Edge "${edge.id}" action set_field targets disallowed field "${key}"`);
        }
      }
    }

    for (const cond of edge.data?.conditions ?? []) {
      if (!ALLOWED_CONDITION_TYPES.has(cond.type)) {
        errors.push(`Edge "${edge.id}" uses unknown condition type "${cond.type}"`);
      }
    }
  }

  const nonFinalNodes = d.nodes.filter((n) => !n.data?.isFinal);
  for (const node of nonFinalNodes) {
    const hasOutgoing = d.edges.some((e) => e.source === node.id);
    if (!hasOutgoing && node.id !== d.initialStateKey) {
      errors.push(`Non-final node "${node.id}" has no outgoing transitions`);
    }
  }

  return errors;
}
