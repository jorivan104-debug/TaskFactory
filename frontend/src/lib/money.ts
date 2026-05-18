export function formatMoney(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function lineCost(qty: string | number, unitCost: string | number): number {
  return Number(qty || 0) * Number(unitCost || 0);
}
