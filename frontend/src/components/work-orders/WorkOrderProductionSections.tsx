import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2, Paperclip } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import api from '../../lib/api';
import { supplierDisplayName } from '../../lib/supplier-types';

export interface DesignAttachment {
  id: string;
  fileName: string;
  dataUrl?: string;
}

interface SupplierOption {
  id: string;
  legalName: string;
  tradeName?: string | null;
  supplierType: string;
}

interface ClosingActivity {
  id: string;
  activityName: string;
  performedBy?: string | null;
  sortOrder: number;
}

interface WoProductionData {
  id: string;
  designInstructions?: string | null;
  designAttachmentsJson?: DesignAttachment[] | null;
  patternSupplierId?: string | null;
  patternSupplier?: SupplierOption | null;
  cuttingSupplierId?: string | null;
  cuttingSupplier?: SupplierOption | null;
  confectionSupplierId?: string | null;
  confectionSupplier?: SupplierOption | null;
  closingActivities?: ClosingActivity[];
}

function readAttachments(json: unknown): DesignAttachment[] {
  if (!json) return [];
  if (Array.isArray(json)) return json as DesignAttachment[];
  return [];
}

export function WorkOrderProductionSections({ wo }: { wo: WoProductionData }) {
  const queryClient = useQueryClient();
  const [designText, setDesignText] = useState(wo.designInstructions ?? '');
  const [attachments, setAttachments] = useState<DesignAttachment[]>(
    readAttachments(wo.designAttachmentsJson),
  );
  const [patternSupplierId, setPatternSupplierId] = useState(wo.patternSupplierId ?? '');
  const [cuttingSupplierId, setCuttingSupplierId] = useState(wo.cuttingSupplierId ?? '');
  const [confectionSupplierId, setConfectionSupplierId] = useState(wo.confectionSupplierId ?? '');

  const [newActivity, setNewActivity] = useState({ activityName: '', performedBy: '' });

  useEffect(() => {
    setDesignText(wo.designInstructions ?? '');
    setAttachments(readAttachments(wo.designAttachmentsJson));
    setPatternSupplierId(wo.patternSupplierId ?? '');
    setCuttingSupplierId(wo.cuttingSupplierId ?? '');
    setConfectionSupplierId(wo.confectionSupplierId ?? '');
  }, [
    wo.id,
    wo.designInstructions,
    wo.designAttachmentsJson,
    wo.patternSupplierId,
    wo.cuttingSupplierId,
    wo.confectionSupplierId,
  ]);

  const { data: patronistas = [] } = useQuery({
    queryKey: ['suppliers', 'patronista'],
    queryFn: async () => {
      const { data } = await api.get('/suppliers', { params: { supplierType: 'patronista' } });
      return data as SupplierOption[];
    },
  });

  const { data: talleresCorte = [] } = useQuery({
    queryKey: ['suppliers', 'taller_corte'],
    queryFn: async () => {
      const { data } = await api.get('/suppliers', { params: { supplierType: 'taller_corte' } });
      return data as SupplierOption[];
    },
  });

  const { data: talleresConfeccion = [] } = useQuery({
    queryKey: ['suppliers', 'taller_confeccion'],
    queryFn: async () => {
      const { data } = await api.get('/suppliers', { params: { supplierType: 'taller_confeccion' } });
      return data as SupplierOption[];
    },
  });

  const invalidateWo = () => queryClient.invalidateQueries({ queryKey: ['work-order', wo.id] });

  const saveDesignMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/work-orders/${wo.id}`, {
        designInstructions: designText || undefined,
        designAttachmentsJson: attachments,
        patternSupplierId: patternSupplierId || null,
        cuttingSupplierId: cuttingSupplierId || null,
        confectionSupplierId: confectionSupplierId || null,
      });
    },
    onSuccess: invalidateWo,
  });

  const addActivityMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/work-orders/${wo.id}/closing-activities`, {
        activityName: newActivity.activityName,
        performedBy: newActivity.performedBy || undefined,
      });
    },
    onSuccess: () => {
      invalidateWo();
      setNewActivity({ activityName: '', performedBy: '' });
    },
  });

  const removeActivityMutation = useMutation({
    mutationFn: (activityId: string) =>
      api.delete(`/work-orders/${wo.id}/closing-activities/${activityId}`),
    onSuccess: invalidateWo,
  });

  const addAttachment = async (file: File) => {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setAttachments((prev) => [
      ...prev,
      { id: crypto.randomUUID(), fileName: file.name, dataUrl },
    ]);
  };

  const activities = wo.closingActivities ?? [];

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Instrucciones de diseño</h2>
          <Button size="sm" onClick={() => saveDesignMutation.mutate()} disabled={saveDesignMutation.isPending}>
            <Save size={14} className="mr-1" />
            Guardar
          </Button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Patronista</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={patternSupplierId}
              onChange={(e) => setPatternSupplierId(e.target.value)}
            >
              <option value="">Seleccionar patronista</option>
              {patronistas.map((s) => (
                <option key={s.id} value={s.id}>
                  {supplierDisplayName(s)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instrucciones</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm min-h-[100px]"
              value={designText}
              onChange={(e) => setDesignText(e.target.value)}
              placeholder="Detalle de diseño, acabados, observaciones..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Documentos anexos</label>
            {attachments.length > 0 && (
              <ul className="space-y-2 mb-3">
                {attachments.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between text-sm border rounded px-3 py-2"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Paperclip size={14} />
                      {a.dataUrl ? (
                        <a
                          href={a.dataUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--color-primary)] hover:underline truncate"
                        >
                          {a.fileName}
                        </a>
                      ) : (
                        a.fileName
                      )}
                    </span>
                    <button
                      type="button"
                      className="text-red-600 p-1"
                      onClick={() => setAttachments((prev) => prev.filter((x) => x.id !== a.id))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <input
              type="file"
              className="text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void addAttachment(file);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Corte</h2>
          <Button size="sm" variant="secondary" onClick={() => saveDesignMutation.mutate()}>
            Guardar taller
          </Button>
        </div>
        <label className="block text-sm font-medium mb-1">Taller de corte</label>
        <select
          className="w-full border rounded px-3 py-2 text-sm"
          value={cuttingSupplierId}
          onChange={(e) => setCuttingSupplierId(e.target.value)}
        >
          <option value="">Seleccionar taller</option>
          {talleresCorte.map((s) => (
            <option key={s.id} value={s.id}>
              {supplierDisplayName(s)}
            </option>
          ))}
        </select>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Confección</h2>
          <Button size="sm" variant="secondary" onClick={() => saveDesignMutation.mutate()}>
            Guardar taller
          </Button>
        </div>
        <label className="block text-sm font-medium mb-1">Taller de confección</label>
        <select
          className="w-full border rounded px-3 py-2 text-sm"
          value={confectionSupplierId}
          onChange={(e) => setConfectionSupplierId(e.target.value)}
        >
          <option value="">Seleccionar taller</option>
          {talleresConfeccion.map((s) => (
            <option key={s.id} value={s.id}>
              {supplierDisplayName(s)}
            </option>
          ))}
        </select>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold text-sm mb-3">Cerrado</h2>
        <div>
            <h3 className="text-sm font-medium mb-2">Actividades de cerrado</h3>
            {activities.length > 0 ? (
              <table className="w-full text-sm mb-3">
                <thead>
                  <tr className="border-b text-left text-[var(--color-text-secondary)]">
                    <th className="py-2">Actividad</th>
                    <th className="py-2">Realizado por</th>
                    <th className="py-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {activities.map((row) => (
                    <tr key={row.id} className="border-b">
                      <td className="py-2">{row.activityName}</td>
                      <td className="py-2">{row.performedBy ?? '—'}</td>
                      <td className="py-2">
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={() => removeActivityMutation.mutate(row.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-[var(--color-text-secondary)] mb-3">Sin actividades registradas.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                className="border rounded px-3 py-2 text-sm"
                placeholder="Actividad"
                value={newActivity.activityName}
                onChange={(e) => setNewActivity((f) => ({ ...f, activityName: e.target.value }))}
              />
              <input
                className="border rounded px-3 py-2 text-sm"
                placeholder="Realizado por"
                value={newActivity.performedBy}
                onChange={(e) => setNewActivity((f) => ({ ...f, performedBy: e.target.value }))}
              />
            </div>
            <Button
              size="sm"
              className="mt-2"
              onClick={() => addActivityMutation.mutate()}
              disabled={!newActivity.activityName || addActivityMutation.isPending}
            >
              <Plus size={14} className="mr-1" />
              Agregar actividad
            </Button>
        </div>
      </Card>
    </div>
  );
}
