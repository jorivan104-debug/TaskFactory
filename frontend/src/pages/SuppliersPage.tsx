import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/DataTable';
import { Plus } from 'lucide-react';

const columns = [
  { key: 'businessName', header: 'Razón social' },
  { key: 'taxId', header: 'NIT' },
  { key: 'city', header: 'Ciudad' },
  {
    key: 'status',
    header: 'Estado',
    render: (row: any) => <StatusBadge status={row.status} />,
  },
];

const data: any[] = [];

export function SuppliersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <Button>
          <Plus size={16} className="mr-2" />
          Nuevo proveedor
        </Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <DataTable columns={columns} data={data} />
      </Card>
    </div>
  );
}
