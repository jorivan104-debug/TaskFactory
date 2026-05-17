import clsx from 'clsx';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending: 'bg-yellow-50 text-yellow-700',
  pending_approval: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-blue-50 text-blue-700',
  in_review: 'bg-purple-50 text-purple-700',
  approved: 'bg-green-50 text-green-700',
  completed: 'bg-green-50 text-green-700',
  synced: 'bg-green-50 text-green-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
  rejected: 'bg-red-50 text-red-600',
  failed: 'bg-red-50 text-red-600',
  manual_review: 'bg-orange-50 text-orange-700',
};

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  pending: 'Pendiente',
  pending_approval: 'Pendiente aprobación',
  in_progress: 'En progreso',
  in_review: 'En revisión',
  approved: 'Aprobado',
  completed: 'Completado',
  synced: 'Sincronizado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  rejected: 'Rechazado',
  failed: 'Fallido',
  manual_review: 'Revisión manual',
  received: 'Recibido',
  sent: 'Enviado',
  partially_received: 'Recibido parcial',
  closed: 'Cerrado',
  planned: 'Planificado',
  in_transit: 'En tránsito',
  active: 'Activo',
  assigned: 'Asignado',
  converted: 'Convertido',
  processing: 'Procesando',
  retry_pending: 'Reintento pendiente',
  registered: 'Registrado',
  partially_paid: 'Pago parcial',
  paid: 'Pagado',
  posted: 'Publicado',
  in_production: 'En producción',
  sample_complete: 'Muestra completa',
  archived: 'Archivado',
  development: 'Desarrollo',
  batch_production: 'Lotes',
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusColors[status] ?? 'bg-gray-100 text-gray-600',
      )}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}
