import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Check, Plus, Save, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface BlueprintNodeData {
  label: string;
  task?: { title?: string; description?: string; autoCreateAssignment?: boolean };
  isFinal?: boolean;
  [key: string]: unknown;
}

interface BlueprintEdgeData {
  label?: string;
  trigger?: string;
  conditions?: { type: string; [k: string]: unknown }[];
  actions?: { type: string; [k: string]: unknown }[];
  [key: string]: unknown;
}

interface BlueprintDef {
  schemaVersion: number;
  nodes: Node<BlueprintNodeData>[];
  edges: Edge<BlueprintEdgeData>[];
  initialStateKey: string;
}

const DEFAULT_DEF: BlueprintDef = {
  schemaVersion: 1,
  nodes: [],
  edges: [],
  initialStateKey: '',
};

let nodeIdCounter = 0;
function nextNodeId() {
  nodeIdCounter += 1;
  return `state_${nodeIdCounter}`;
}

export function WorkOrderBlueprintEditorPage() {
  const { typeId } = useParams<{ typeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: type } = useQuery({
    queryKey: ['work-order-type', typeId],
    queryFn: async () => {
      const { data } = await api.get(`/work-order-types/${typeId}`);
      return data as { id: string; name: string; code: string; blueprint?: { definitionJson: BlueprintDef; status: string; version: number } };
    },
    enabled: !!typeId,
  });

  const initialDef = useMemo(() => {
    if (!type?.blueprint?.definitionJson) return DEFAULT_DEF;
    return type.blueprint.definitionJson;
  }, [type]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialDef.nodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialDef.edges ?? []);
  const [initialStateKey, setInitialStateKey] = useState(initialDef.initialStateKey ?? '');
  const [selectedNode, setSelectedNode] = useState<Node<BlueprintNodeData> | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge<BlueprintEdgeData> | null>(null);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (initialDef.nodes?.length) {
      setNodes(initialDef.nodes);
      setEdges(initialDef.edges ?? []);
      setInitialStateKey(initialDef.initialStateKey ?? '');
      const maxId = initialDef.nodes.reduce((max, n) => {
        const m = n.id.match(/state_(\d+)/);
        return m ? Math.max(max, parseInt(m[1])) : max;
      }, 0);
      nodeIdCounter = maxId;
    }
  }, [initialDef, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: `${params.source}-to-${params.target}`,
            markerEnd: { type: MarkerType.ArrowClosed },
            data: { label: 'Transición', trigger: 'manual', conditions: [], actions: [] },
            label: 'Transición',
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const addNode = useCallback(() => {
    const id = nextNodeId();
    const newNode: Node<BlueprintNodeData> = {
      id,
      type: 'default',
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { label: 'Nuevo estado' },
    };
    setNodes((nds) => [...nds, newNode]);
    if (!initialStateKey) setInitialStateKey(id);
  }, [setNodes, initialStateKey]);

  const deleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      if (initialStateKey === selectedNode.id) setInitialStateKey('');
      setSelectedNode(null);
    }
    if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges, initialStateKey]);

  const buildDefinition = useCallback((): BlueprintDef => ({
    schemaVersion: 1,
    nodes,
    edges,
    initialStateKey,
  }), [nodes, edges, initialStateKey]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/work-order-types/${typeId}/blueprint`, {
        definitionJson: buildDefinition(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-type', typeId] });
      setSaveMsg('Borrador guardado');
      setTimeout(() => setSaveMsg(''), 2000);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      await saveMutation.mutateAsync();
      await api.post(`/work-order-types/${typeId}/blueprint/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-type', typeId] });
      setSaveMsg('Blueprint publicado');
      setTimeout(() => setSaveMsg(''), 3000);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const errStr = Array.isArray(msg) ? msg.join(', ') : (typeof msg === 'object' ? JSON.stringify(msg) : String(msg ?? 'Error al publicar'));
      setSaveMsg(errStr);
    },
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/settings/work-order-types')} className="p-1 rounded hover:bg-[var(--color-accent-blue-pale)]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold">Editor de Blueprint</h1>
            <p className="text-xs text-[var(--color-text-secondary)]">{type?.name ?? '...'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveMsg && <span className="text-sm text-green-600">{saveMsg}</span>}
          <Button size="sm" variant="secondary" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save size={14} className="mr-1" /> Guardar borrador
          </Button>
          <Button size="sm" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
            <Check size={14} className="mr-1" /> Publicar
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => { setSelectedNode(node as Node<BlueprintNodeData>); setSelectedEdge(null); }}
            onEdgeClick={(_, edge) => { setSelectedEdge(edge as Edge<BlueprintEdgeData>); setSelectedNode(null); }}
            onPaneClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
            fitView
            deleteKeyCode="Delete"
          >
            <Background />
            <Controls />
            <MiniMap />
            <Panel position="top-left">
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={addNode}>
                  <Plus size={14} className="mr-1" /> Estado
                </Button>
                {(selectedNode || selectedEdge) && (
                  <Button size="sm" variant="secondary" onClick={deleteSelected}>
                    <Trash2 size={14} className="mr-1" /> Eliminar
                  </Button>
                )}
              </div>
            </Panel>
          </ReactFlow>
        </div>

        <div className="w-80 border-l border-[var(--color-border)] overflow-y-auto p-4 space-y-4">
          {selectedNode ? (
            <NodePanel
              node={selectedNode}
              isInitial={initialStateKey === selectedNode.id}
              onUpdate={(data) => {
                setNodes((nds) => nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, ...data } } : n)));
                setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...data } } : null);
              }}
              onSetInitial={() => setInitialStateKey(selectedNode.id)}
            />
          ) : selectedEdge ? (
            <EdgePanel
              edge={selectedEdge}
              onUpdate={(data) => {
                setEdges((eds) => eds.map((e) => (e.id === selectedEdge.id ? { ...e, data: { ...e.data, ...data }, label: data.label ?? e.label } : e)));
                setSelectedEdge((prev) => prev ? { ...prev, data: { ...prev.data, ...data } } : null);
              }}
            />
          ) : (
            <div className="text-sm text-[var(--color-text-secondary)]">
              <p className="font-medium mb-2">Instrucciones</p>
              <ul className="space-y-1 list-disc pl-4">
                <li>Pulsa <strong>+ Estado</strong> para agregar nodos</li>
                <li>Arrastra desde un handle a otro para crear transiciones</li>
                <li>Haz clic en un nodo o arista para editarla</li>
                <li>Marca un nodo como estado inicial</li>
                <li>Guarda el borrador y luego publica</li>
              </ul>
              {initialStateKey && (
                <p className="mt-3 text-xs">Estado inicial: <strong>{initialStateKey}</strong></p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NodePanel({
  node,
  isInitial,
  onUpdate,
  onSetInitial,
}: {
  node: Node<BlueprintNodeData>;
  isInitial: boolean;
  onUpdate: (data: Partial<BlueprintNodeData>) => void;
  onSetInitial: () => void;
}) {
  return (
    <Card className="space-y-3">
      <h3 className="font-semibold text-sm">Estado: {node.id}</h3>
      <label className="block text-xs font-medium">
        Etiqueta
        <input
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-sm"
          value={node.data.label ?? ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
        />
      </label>
      <label className="block text-xs font-medium">
        Título de tarea
        <input
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-sm"
          value={node.data.task?.title ?? ''}
          onChange={(e) => onUpdate({ task: { ...node.data.task, title: e.target.value } })}
        />
      </label>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={node.data.task?.autoCreateAssignment ?? false}
          onChange={(e) => onUpdate({ task: { ...node.data.task, autoCreateAssignment: e.target.checked } })}
        />
        Auto-crear asignación de tarea
      </label>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={node.data.isFinal ?? false}
          onChange={(e) => onUpdate({ isFinal: e.target.checked })}
        />
        Estado final
      </label>
      {!isInitial && (
        <Button size="sm" variant="secondary" onClick={onSetInitial}>
          Marcar como estado inicial
        </Button>
      )}
      {isInitial && (
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          Estado inicial
        </span>
      )}
    </Card>
  );
}

function EdgePanel({
  edge,
  onUpdate,
}: {
  edge: Edge<BlueprintEdgeData>;
  onUpdate: (data: Partial<BlueprintEdgeData>) => void;
}) {
  const [actionType, setActionType] = useState('set_field');

  const addAction = () => {
    const actions = [...(edge.data?.actions ?? [])];
    if (actionType === 'set_field') {
      actions.push({ type: 'set_field', target: 'work_order', field: 'status', value: '' });
    } else if (actionType === 'append_log') {
      actions.push({ type: 'append_log', entryType: 'status_change', summary: '' });
    } else if (actionType === 'complete_open_tasks') {
      actions.push({ type: 'complete_open_tasks' });
    }
    onUpdate({ actions });
  };

  const removeAction = (idx: number) => {
    const actions = [...(edge.data?.actions ?? [])];
    actions.splice(idx, 1);
    onUpdate({ actions });
  };

  return (
    <Card className="space-y-3">
      <h3 className="font-semibold text-sm">
        Transición: {edge.source} → {edge.target}
      </h3>
      <label className="block text-xs font-medium">
        Etiqueta
        <input
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-sm"
          value={String(edge.data?.label ?? '')}
          onChange={(e) => onUpdate({ label: e.target.value })}
        />
      </label>

      <div>
        <p className="text-xs font-medium mb-1">Acciones ({edge.data?.actions?.length ?? 0})</p>
        {(edge.data?.actions ?? []).map((action, idx) => (
          <div key={idx} className="flex items-center gap-1 text-xs bg-[var(--color-bg-secondary)] rounded px-2 py-1 mb-1">
            <span className="font-mono">{action.type}</span>
            {action.type === 'set_field' && <span>: {String(action.field)}={String(action.value)}</span>}
            {action.type === 'append_log' && <span>: {String(action.summary)}</span>}
            <button onClick={() => removeAction(idx)} className="ml-auto text-red-500 hover:text-red-700">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <div className="flex gap-1 mt-1">
          <select
            className="text-xs rounded border border-[var(--color-border)] px-1 py-0.5"
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
          >
            <option value="set_field">set_field</option>
            <option value="append_log">append_log</option>
            <option value="complete_open_tasks">complete_open_tasks</option>
          </select>
          <Button size="sm" variant="secondary" onClick={addAction}>
            <Plus size={12} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
