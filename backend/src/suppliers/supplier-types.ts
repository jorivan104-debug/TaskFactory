export const SUPPLIER_TYPES = [
  'patronista',
  'taller_corte',
  'taller_confeccion',
  'insumos',
  'otro',
] as const;

export type SupplierType = (typeof SUPPLIER_TYPES)[number];

export const SUPPLIER_TYPE_LABELS: Record<string, string> = {
  patronista: 'Patronista',
  taller_corte: 'Taller de corte',
  taller_confeccion: 'Taller de confección',
  insumos: 'Insumos',
  otro: 'Otro',
};
