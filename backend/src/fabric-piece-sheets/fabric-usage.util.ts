/**
 * Heurística para diferenciar tela principal de tela bolsillo al copiar el BOM
 * o al agregar manualmente un insumo de tela en una OT.
 *
 * Solo aplica a insumos con `supplyType.code === 'fabric'`. Para los demás tipos
 * el valor `main` queda inerte porque la auto-creación de fichas filtra por tipo.
 */
export function inferFabricUsage(
  supply: { name?: string | null; supplyType?: { code?: string | null } | null } | null | undefined,
): 'main' | 'pocket' {
  if (!supply || supply.supplyType?.code !== 'fabric') return 'main';
  if (supply.name && /bolsillo/i.test(supply.name)) return 'pocket';
  return 'main';
}
