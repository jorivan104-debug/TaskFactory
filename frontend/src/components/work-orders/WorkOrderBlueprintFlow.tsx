import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import api from '../../lib/api';

interface BlueprintNode {
  id: string;
  position: { x: number; y: number };
  data?: { label?: string; isFinal?: boolean };
}

interface BlueprintEdge {
  id: string;
  source: string;
  target: string;
  data?: { label?: string };
}

interface FlowContext {
  workOrderId: string;
  currentStateKey: string;
  currentStateLabel: string;
  availableTransitions: {
    edgeId: string;
    label: string;
    targetStateKey: string;
    targetLabel: string;
  }[];
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
}

interface Props {
  workOrderId: string;
  currentStateKey?: string | null;
  blueprintSnapshotJson?: { nodes: BlueprintNode[]; edges: BlueprintEdge[] } | null;
}

export function WorkOrderBlueprintFlow({
  workOrderId,
  currentStateKey,
  blueprintSnapshotJson,
}: Props) {
  const queryClient = useQueryClient();
  const hasBlueprint = !!currentStateKey && !!blueprintSnapshotJson;

  const { data: flow } = useQuery({
    queryKey: ['work-order-flow', workOrderId],
    queryFn: async () => {
      const { data } = await api.get(`/work-orders/${workOrderId}/flow`);
      return data as FlowContext;
    },
    enabled: hasBlueprint,
    retry: false,
  });

  const transitionMutation = useMutation({
    mutationFn: async (transitionId: string) => {
      await api.post(`/work-orders/${workOrderId}/transitions/${transitionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['work-order-flow', workOrderId] });
    },
  });

  if (!hasBlueprint) return null;

  const graphNodes: Node[] = (blueprintSnapshotJson?.nodes ?? flow?.nodes ?? []).map((n) => ({
    id: n.id,
    position: n.position ?? { x: 0, y: 0 },
    data: { label: n.data?.label ?? n.id },
    style:
      n.id === currentStateKey
        ? { border: '2px solid var(--color-primary)', background: 'var(--color-accent-blue-pale)' }
        : undefined,
  }));

  const graphEdges: Edge[] = (blueprintSnapshotJson?.edges ?? flow?.edges ?? []).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.data?.label ?? '',
    markerEnd: { type: MarkerType.ArrowClosed },
    animated: flow?.availableTransitions?.some((t) => t.edgeId === e.id),
  }));

  const currentLabel = flow?.currentStateLabel ?? currentStateKey;
  const transitions = flow?.availableTransitions ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-semibold text-sm mb-3">
          Flujo de producción — Estado:{' '}
          <span className="text-[var(--color-primary)]">{currentLabel}</span>
        </h2>
        {transitions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {transitions.map((t) => (
              <Button
                key={t.edgeId}
                size="sm"
                onClick={() => transitionMutation.mutate(t.edgeId)}
                disabled={transitionMutation.isPending}
              >
                <Play size={14} className="mr-1" />
                {t.label} → {t.targetLabel}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--color-text-secondary)]">
            No hay transiciones disponibles desde este estado.
          </p>
        )}
        {transitionMutation.isError && (
          <p className="text-sm text-red-600 mt-2">
            {String(
              (transitionMutation.error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? 'Error al ejecutar la transición',
            )}
          </p>
        )}
      </Card>

      {graphNodes.length > 0 && (
        <Card className="p-0 overflow-hidden h-[280px]">
          <ReactFlow
            nodes={graphNodes}
            edges={graphEdges}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag
            zoomOnScroll
          >
            <Background />
            <Controls showInteractive={false} />
          </ReactFlow>
        </Card>
      )}
    </div>
  );
}
