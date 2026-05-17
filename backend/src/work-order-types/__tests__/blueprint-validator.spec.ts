import { validateBlueprintDefinition, type BlueprintDefinition } from '../blueprint-validator';

describe('validateBlueprintDefinition', () => {
  const validDef: BlueprintDefinition = {
    schemaVersion: 1,
    nodes: [
      { id: 'cutting', data: { label: 'Corte' } },
      { id: 'sewing', data: { label: 'Confección' } },
      { id: 'finishing', data: { label: 'Terminación', isFinal: true } },
    ],
    edges: [
      {
        id: 'cut-to-sew',
        source: 'cutting',
        target: 'sewing',
        data: {
          label: 'Avance',
          actions: [
            { type: 'set_field', target: 'work_order', field: 'status', value: 'in_progress' },
            { type: 'append_log', entryType: 'status_change', summary: 'Avance' },
          ],
        },
      },
      {
        id: 'sew-to-finish',
        source: 'sewing',
        target: 'finishing',
        data: { label: 'Terminar', actions: [{ type: 'complete_open_tasks' }] },
      },
    ],
    initialStateKey: 'cutting',
  };

  it('accepts a valid blueprint', () => {
    expect(validateBlueprintDefinition(validDef)).toEqual([]);
  });

  it('rejects null input', () => {
    const errors = validateBlueprintDefinition(null);
    expect(errors).toContain('definition_json must be an object');
  });

  it('rejects empty nodes', () => {
    const errors = validateBlueprintDefinition({ ...validDef, nodes: [] });
    expect(errors.some((e) => e.includes('at least one node'))).toBe(true);
  });

  it('rejects missing initialStateKey', () => {
    const errors = validateBlueprintDefinition({ ...validDef, initialStateKey: '' });
    expect(errors.some((e) => e.includes('initialStateKey'))).toBe(true);
  });

  it('rejects initialStateKey not matching any node', () => {
    const errors = validateBlueprintDefinition({ ...validDef, initialStateKey: 'nonexistent' });
    expect(errors.some((e) => e.includes('"nonexistent"'))).toBe(true);
  });

  it('rejects edge referencing nonexistent source', () => {
    const def = {
      ...validDef,
      edges: [{ id: 'bad', source: 'nonexistent', target: 'sewing', data: { label: 'bad' } }],
    };
    const errors = validateBlueprintDefinition(def);
    expect(errors.some((e) => e.includes('source "nonexistent"'))).toBe(true);
  });

  it('rejects disallowed set_field target', () => {
    const def: BlueprintDefinition = {
      ...validDef,
      edges: [
        {
          id: 'e1',
          source: 'cutting',
          target: 'sewing',
          data: {
            label: 'bad',
            actions: [{ type: 'set_field', target: 'work_order', field: 'createdByUserId', value: 'hacked' }],
          },
        },
        { id: 'e2', source: 'sewing', target: 'finishing', data: { label: 'ok' } },
      ],
    };
    const errors = validateBlueprintDefinition(def);
    expect(errors.some((e) => e.includes('disallowed field'))).toBe(true);
  });

  it('rejects unknown action type', () => {
    const def: BlueprintDefinition = {
      ...validDef,
      edges: [
        {
          id: 'e1',
          source: 'cutting',
          target: 'sewing',
          data: { label: 'x', actions: [{ type: 'run_script' }] },
        },
        { id: 'e2', source: 'sewing', target: 'finishing', data: { label: 'ok' } },
      ],
    };
    const errors = validateBlueprintDefinition(def);
    expect(errors.some((e) => e.includes('unknown action type "run_script"'))).toBe(true);
  });

  it('warns about non-final node without outgoing transitions', () => {
    const def: BlueprintDefinition = {
      ...validDef,
      nodes: [
        { id: 'cutting', data: { label: 'Corte' } },
        { id: 'orphan', data: { label: 'Huérfano' } },
      ],
      edges: [],
    };
    const errors = validateBlueprintDefinition(def);
    expect(errors.some((e) => e.includes('"orphan"') && e.includes('no outgoing'))).toBe(true);
  });
});
