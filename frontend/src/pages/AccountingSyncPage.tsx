import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/DataTable';
import { RefreshCw } from 'lucide-react';

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'type', header: 'Tipo' },
  {
    key: 'status',
    header: 'Estado',
    render: (row: any) => <StatusBadge status={row.status} />,
  },
  { key: 'retries', header: 'Reintentos' },
  { key: 'error', header: 'Error' },
];

const data: any[] = [];

export function AccountingSyncPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Finanzas — Sincronización contable</h1>
        <Button>
          <RefreshCw size={16} className="mr-2" />
          Sincronizar
        </Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <DataTable columns={columns} data={data} />
      </Card>
    </div>
  );
}
