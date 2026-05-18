import { inferFabricUsage } from '../fabric-usage.util';

describe('inferFabricUsage', () => {
  const fabricType = { supplyType: { code: 'fabric' } };

  it('marks fabric supplies whose name contains "bolsillo" as pocket', () => {
    expect(inferFabricUsage({ ...fabricType, name: 'TELA BOLSILLO' })).toBe('pocket');
    expect(inferFabricUsage({ ...fabricType, name: 'tela de bolsillo claro' })).toBe('pocket');
  });

  it('keeps regular fabric supplies as main', () => {
    expect(inferFabricUsage({ ...fabricType, name: 'TELA 14 PALAZZO' })).toBe('main');
    expect(inferFabricUsage({ ...fabricType, name: '' })).toBe('main');
  });

  it('returns main for non-fabric supply types regardless of name', () => {
    expect(
      inferFabricUsage({ supplyType: { code: 'thread' }, name: 'Hilo bolsillo' }),
    ).toBe('main');
    expect(inferFabricUsage({ supplyType: { code: 'button' }, name: 'Botón' })).toBe('main');
  });

  it('handles missing supply or supplyType safely', () => {
    expect(inferFabricUsage(null)).toBe('main');
    expect(inferFabricUsage(undefined)).toBe('main');
    expect(inferFabricUsage({ name: 'TELA 14' })).toBe('main');
    expect(inferFabricUsage({ supplyType: null, name: 'TELA 14' })).toBe('main');
  });
});
