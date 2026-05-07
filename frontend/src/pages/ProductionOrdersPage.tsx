import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/DataTable';
import { Plus } from 'lucide-react';

const columns = [
  { key: 'code', header: 'Código' },
  { key: 'type', header: 'Tipo' },
  { key: 'plant', header: 'Planta' },
  {
    key: 'status',
    header: 'Estado',
    render: (row: any) => <StatusBadge status={row.status} />,
  },
  { key: 'createdAt', header: 'Creado' },
];

const data: any[] = [];

export function ProductionOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Órdenes de producción</h1>
        <Button>
          <Plus size={16} className="mr-2" />
          Nueva orden
        </Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <DataTable columns={columns} data={data} />
      </Card>
    </div>
  );
}
