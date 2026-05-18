import { useNavigate, useParams } from 'react-router-dom';
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
import { ArrowLeft, Play } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import api from '../lib/api';

interface BlueprintNode {
  id: string;
  position: { x: number; y: number };
  data: { label?: string; isFinal?: boolean; task?: Record<string, unknown> };
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
  availableTransitions: { edgeId: string; label: string; targetStateKey: string; targetLabel: string }[];
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
}

interface GarmentRef {
  id: string;
  code?: string;
  referenceType?: string;
  serie?: string;
  title?: string;
  brandId?: string;
  brand?: { id: string; name: string; consecutivo: number };
  silhouetteId?: string;
  fabricSupplyId?: string;
  garmentImageUrl1?: string;
  totalSizesCount?: number;
  programmedGarmentsQty?: number;
  cutGarmentsQty?: number;
}

const referenceTypeLabel = (t?: string) => {
  if (t === 'muestra') return 'Muestra';
  if (t === 'produccion') return 'Producción';
  return t ?? '—';
};

interface SizeCurveItem {
  id: string;
  sizeId: string;
  programmedQty: number;
  cutQty: number;
  sortOrder?: number;
}

interface WODetail {
  id: string;
  code: string;
  title?: string;
  status: string;
  productionType?: string;
  currentStateKey?: string;
  blueprintSnapshotJson?: { nodes: BlueprintNode[]; edges: BlueprintEdge[] };
  workOrderType?: { name: string };
  workSite?: { name: string };
  garmentReference?: GarmentRef;
  sizeCurve?: SizeCurveItem[];
  logs: { id: string; entryType: string; summary?: string; performedAt: string; changesJson?: Record<string, unknown> }[];
  taskAssignments: { id: string; description?: string; status: string }[];
}

export function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: wo, isLoading } = useQuery({
    queryKey: ['work-order', id],
    queryFn: async () => {
      const { data } = await api.get(`/work-orders/${id}`);
      return data as WODetail;
    },
    enabled: !!id,
  });

  const { data: flow } = useQuery({
    queryKey: ['work-order-flow', id],
    queryFn: async () => {
      const { data } = await api.get(`/work-orders/${id}/flow`);
      return data as FlowContext;
    },
    enabled: !!id && !!wo?.currentStateKey,
  });

  const transitionMutation = useMutation({
    mutationFn: async (transitionId: string) => {
      await api.post(`/work-orders/${id}/transitions/${transitionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order', id] });
      queryClient.invalidateQueries({ queryKey: ['work-order-flow', id] });
    },
  });

  if (isLoading || !wo) {
    return <div className="p-8 text-center text-[var(--color-text-secondary)]">Cargando...</div>;
  }

  const graphNodes: Node[] = (wo.blueprintSnapshotJson?.nodes ?? flow?.nodes ?? []).map((n) => ({
    id: n.id,
    position: n.position ?? { x: 0, y: 0 },
    data: { label: n.data?.label ?? n.id },
    style: n.id === wo.currentStateKey
      ? { border: '2px solid var(--color-primary)', background: 'var(--color-accent-blue-pale)' }
      : undefined,
  }));

  const graphEdges: Edge[] = (wo.blueprintSnapshotJson?.edges ?? flow?.edges ?? []).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.data?.label ?? '',
    markerEnd: { type: MarkerType.ArrowClosed },
    animated: flow?.availableTransitions?.some((t) => t.edgeId === e.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/work-orders')} className="p-1 rounded hover:bg-[var(--color-accent-blue-pale)]">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{wo.code}</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {wo.title ?? ''} {wo.workOrderType ? `— ${wo.workOrderType.name}` : ''}
            {wo.workSite ? ` · ${wo.workSite.name}` : ''}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {wo.productionType && <StatusBadge status={wo.productionType} />}
          <StatusBadge status={wo.status} />
        </div>
      </div>

      {graphNodes.length > 0 && (
        <Card className="p-0 overflow-hidden h-[320px]">
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

      {flow && flow.availableTransitions.length > 0 && (
        <Card>
          <h2 className="font-semibold text-sm mb-3">
            Estado actual: <span className="text-[var(--color-primary)]">{flow.currentStateLabel}</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {flow.availableTransitions.map((t) => (
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
          {transitionMutation.isError && (
            <p className="text-sm text-red-600 mt-2">
              {String((transitionMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error')}
            </p>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-sm mb-3">Referencia de prenda</h2>
          {wo.garmentReference ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {wo.garmentReference.code && (
                <>
                  <dt className="text-[var(--color-text-secondary)]">ID referencia</dt>
                  <dd className="font-mono">{wo.garmentReference.code}</dd>
                </>
              )}
              {wo.garmentReference.referenceType && (
                <>
                  <dt className="text-[var(--color-text-secondary)]">Tipo</dt>
                  <dd>{referenceTypeLabel(wo.garmentReference.referenceType)}</dd>
                </>
              )}
              {wo.garmentReference.serie && (
                <>
                  <dt className="text-[var(--color-text-secondary)]">Serie</dt>
                  <dd>{wo.garmentReference.serie}</dd>
                </>
              )}
              {(wo.garmentReference.brand?.name || wo.garmentReference.brandId) && (
                <>
                  <dt className="text-[var(--color-text-secondary)]">Marca</dt>
                  <dd>{wo.garmentReference.brand?.name ?? wo.garmentReference.brandId}</dd>
                </>
              )}
              {wo.garmentReference.title && (
                <>
                  <dt className="text-[var(--color-text-secondary)]">Título</dt>
                  <dd>{wo.garmentReference.title}</dd>
                </>
              )}
              {wo.garmentReference.silhouetteId && (
                <>
                  <dt className="text-[var(--color-text-secondary)]">Silueta</dt>
                  <dd>{wo.garmentReference.silhouetteId}</dd>
                </>
              )}
              {wo.garmentReference.garmentImageUrl1 && (
                <div className="col-span-2 mt-1">
                  <img
                    src={wo.garmentReference.garmentImageUrl1}
                    alt="Prenda"
                    className="h-20 rounded object-cover"
                  />
                </div>
              )}
            </dl>
          ) : (
            <p className="text-xs text-[var(--color-text-secondary)]">Sin referencia</p>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-sm mb-3">Curva de tallas</h2>
          {wo.sizeCurve && wo.sizeCurve.length > 0 ? (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--color-text-secondary)]">
                    <th className="pb-1">Talla</th>
                    <th className="pb-1 text-right">Programadas</th>
                    <th className="pb-1 text-right">Cortadas</th>
                  </tr>
                </thead>
                <tbody>
                  {wo.sizeCurve.map((item) => (
                    <tr key={item.id}>
                      <td>{item.sizeId}</td>
                      <td className="text-right">{item.programmedQty}</td>
                      <td className="text-right">{item.cutQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {wo.garmentReference && (
                <div className="mt-2 pt-2 border-t text-xs text-[var(--color-text-secondary)] flex gap-4">
                  <span>Tallas: <strong>{wo.garmentReference.totalSizesCount ?? wo.sizeCurve.length}</strong></span>
                  <span>Programadas: <strong>{wo.garmentReference.programmedGarmentsQty ?? 0}</strong></span>
                  <span>Cortadas: <strong>{wo.garmentReference.cutGarmentsQty ?? 0}</strong></span>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-[var(--color-text-secondary)]">Sin curva de tallas</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-sm mb-3">Tareas asignadas</h2>
          {wo.taskAssignments.length === 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)]">Sin tareas</p>
          ) : (
            <ul className="space-y-2">
              {wo.taskAssignments.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span>{t.description ?? '—'}</span>
                  <StatusBadge status={t.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-sm mb-3">Bitácora</h2>
          {wo.logs.length === 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)]">Sin registros</p>
          ) : (
            <ul className="space-y-3">
              {wo.logs.map((log) => (
                <li key={log.id} className="border-l-2 border-[var(--color-border)] pl-3">
                  <p className="text-sm font-medium">{log.summary ?? log.entryType}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {new Date(log.performedAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
