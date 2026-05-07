import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { Plus } from 'lucide-react';

const columns = [
  { key: 'product', header: 'Producto' },
  { key: 'warehouse', header: 'Almacén' },
  { key: 'lot', header: 'Lote' },
  { key: 'quantity', header: 'Cantidad' },
];

const data: any[] = [];

export function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <Button>
          <Plus size={16} className="mr-2" />
          Nuevo movimiento
        </Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <DataTable columns={columns} data={data} />
      </Card>
    </div>
  );
}
