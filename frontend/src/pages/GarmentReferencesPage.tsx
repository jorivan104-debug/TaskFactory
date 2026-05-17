import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/DataTable';
import api from '../lib/api';

interface CatalogRef {
  id: string;
  lexiExternalId?: string;
  title?: string;
  status: string;
  imageUrl?: string;
  createdAt: string;
}

const columns = [
  { key: 'lexiExternalId', header: 'ID Lexi', render: (r: CatalogRef) => r.lexiExternalId ?? '—' },
  { key: 'title', header: 'Título', render: (r: CatalogRef) => r.title ?? '—' },
  {
    key: 'image',
    header: 'Imagen',
    render: (r: CatalogRef) =>
      r.imageUrl ? (
        <img src={r.imageUrl} alt="" className="h-8 w-8 rounded object-cover" />
      ) : (
        '—'
      ),
  },
  {
    key: 'status',
    header: 'Estado',
    render: (r: CatalogRef) => <StatusBadge status={r.status} />,
  },
  {
    key: 'createdAt',
    header: 'Fecha',
    render: (r: CatalogRef) => new Date(r.createdAt).toLocaleDateString(),
  },
];

export function GarmentReferencesPage() {
  const { data: rows = [] } = useQuery({
    queryKey: ['garment-references'],
    queryFn: async () => {
      const { data } = await api.get('/garment-references');
      return data as CatalogRef[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Referencias Lexi</h1>
      </div>
      <Card className="p-0 overflow-hidden">
        <DataTable columns={columns} data={rows} />
      </Card>
    </div>
  );
}
