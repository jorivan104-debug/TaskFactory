/** Acepta #RGB, #RRGGBB o RRGGBB y devuelve un color válido para CSS. */
export function normalizeHexColor(hex: string | null | undefined): string | null {
  if (hex == null || String(hex).trim() === '') return null;
  const raw = String(hex).trim();
  const bare = raw.startsWith('#') ? raw.slice(1) : raw;
  if (/^[0-9A-Fa-f]{3}$/.test(bare)) {
    const expanded = bare
      .split('')
      .map((c) => c + c)
      .join('');
    return `#${expanded.toUpperCase()}`;
  }
  if (/^[0-9A-Fa-f]{6}$/.test(bare)) {
    return `#${bare.toUpperCase()}`;
  }
  return null;
}
