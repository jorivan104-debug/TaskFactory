import type { PrismaClient } from '@prisma/client';

/** Cliente de consulta dentro de `$transaction` o `PrismaClient` completo */
export type PrismaDb = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Catálogos y datos base que dependen del usuario administrador creado primero.
 * Idempotente: seguro llamar tras upsert del admin en `prisma/seed.ts`.
 */
export async function applyBaselineSeed(prisma: PrismaDb, adminUserId: string) {
  const roleData = [
    { key: 'admin', name: 'Administrador' },
    { key: 'area_manager', name: 'Encargado de área' },
    { key: 'workshop', name: 'Taller' },
    { key: 'operator', name: 'Operario' },
    { key: 'laundry', name: 'Lavandería' },
    { key: 'seller', name: 'Vendedor' },
    { key: 'accountant', name: 'Contador' },
    { key: 'accounting_assistant', name: 'Auxiliar contable' },
  ];

  for (const r of roleData) {
    await prisma.role.upsert({
      where: { key: r.key },
      update: { name: r.name },
      create: { ...r, createdByUserId: adminUserId },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { key: 'admin' } });
  if (adminRole) {
    const existing = await prisma.userRole.findFirst({
      where: { userId: adminUserId, roleId: adminRole.id, workSiteId: null },
    });
    if (!existing) {
      await prisma.userRole.create({
        data: { userId: adminUserId, roleId: adminRole.id, createdByUserId: adminUserId },
      });
    }
  }

  const site = await prisma.workSite.upsert({
    where: { code: 'PLANTA-01' },
    update: {},
    create: { code: 'PLANTA-01', name: 'Planta Principal', createdByUserId: adminUserId },
  });

  await prisma.warehouse.upsert({
    where: { code: 'ALM-INSUMOS' },
    update: {},
    create: {
      code: 'ALM-INSUMOS',
      name: 'Almacén de Insumos',
      workSiteId: site.id,
      createdByUserId: adminUserId,
    },
  });

  await prisma.warehouse.upsert({
    where: { code: 'ALM-PT' },
    update: {},
    create: {
      code: 'ALM-PT',
      name: 'Almacén Producto Terminado',
      workSiteId: site.id,
      createdByUserId: adminUserId,
    },
  });

  const uomData = [
    { code: 'unit', name: 'Unidad' },
    { code: 'kg', name: 'Kilogramo' },
    { code: 'm', name: 'Metro' },
    { code: 'yd', name: 'Yarda' },
    { code: 'roll', name: 'Rollo' },
  ];

  for (const u of uomData) {
    await prisma.unitOfMeasure.upsert({
      where: { code: u.code },
      update: {},
      create: { ...u, createdByUserId: adminUserId },
    });
  }

  const supplyTypeData = [
    { code: 'fabric', name: 'Tela', sortOrder: 1 },
    { code: 'thread', name: 'Hilo', sortOrder: 2 },
    { code: 'button', name: 'Botón', sortOrder: 3 },
    { code: 'tack', name: 'Tache', sortOrder: 4 },
    { code: 'zipper', name: 'Cierre', sortOrder: 5 },
    { code: 'label', name: 'Etiqueta', sortOrder: 6 },
  ];

  for (const st of supplyTypeData) {
    await prisma.supplyType.upsert({
      where: { code: st.code },
      update: {},
      create: { ...st, createdByUserId: adminUserId },
    });
  }

  const silCats = [
    { name: 'Superior', sortOrder: 1 },
    { name: 'Inferior', sortOrder: 2 },
    { name: 'Vestido', sortOrder: 3 },
    { name: 'Enterizo', sortOrder: 4 },
    { name: 'Accesorios', sortOrder: 5 },
  ];

  for (const c of silCats) {
    await prisma.silhouetteCategory.upsert({
      where: { name: c.name },
      update: {},
      create: { ...c, createdByUserId: adminUserId },
    });
  }

  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '6', '8', '10', '12', '14', '28', '30', '32', '34', 'Única'];
  for (let i = 0; i < sizes.length; i++) {
    await prisma.size.upsert({
      where: { name: sizes[i] },
      update: {},
      create: { name: sizes[i], sortOrder: i + 1, createdByUserId: adminUserId },
    });
  }

  // Puntos de medida (filas de la tabla de medidas)
  const measurementPoints: Array<{
    category: string;
    name: string;
    description: string;
    isOptional?: boolean;
  }> = [
    { category: 'General', name: 'Estatura', description: 'Altura total de la persona.' },
    { category: 'Superior', name: 'Contorno de busto/pecho', description: 'Circunferencia en la parte más prominente del busto o pecho.' },
    { category: 'Superior', name: 'Contorno bajo busto', description: 'Importante para prendas ajustadas femeninas.', isOptional: true },
    { category: 'Superior', name: 'Ancho de espalda', description: 'Distancia entre hombros por la espalda.' },
    { category: 'Superior', name: 'Largo de talle delantero', description: 'Desde hombro hasta cintura por el frente.' },
    { category: 'Superior', name: 'Largo de talle posterior', description: 'Desde la base del cuello hasta cintura por la espalda.' },
    { category: 'Superior', name: 'Ancho de hombros', description: 'Distancia de hombro a hombro.' },
    { category: 'Superior', name: 'Contorno de brazo', description: 'Parte más ancha del brazo.' },
    { category: 'Superior', name: 'Largo de manga', description: 'Desde el hombro hasta la muñeca.' },
    { category: 'Superior', name: 'Contorno de muñeca', description: 'Para definir puños.' },
    { category: 'Centro del cuerpo', name: 'Contorno de cintura', description: 'Circunferencia de la cintura natural.' },
    { category: 'Centro del cuerpo', name: 'Contorno de cadera', description: 'Parte más prominente de la cadera.' },
    { category: 'Centro del cuerpo', name: 'Tiro delantero', description: 'Desde cintura delantera hasta la unión de las piernas.' },
    { category: 'Centro del cuerpo', name: 'Tiro posterior', description: 'Desde cintura posterior hasta la unión de las piernas.' },
    { category: 'Centro del cuerpo', name: 'Largo de tiro total', description: 'Fundamental en enterizos y overoles.' },
    { category: 'Centro del cuerpo', name: 'Largo de talle completo', description: 'Desde hombro pasando por la entrepierna hasta el mismo hombro por la espalda.' },
    { category: 'Inferior', name: 'Contorno de muslo', description: 'Parte más ancha del muslo.' },
    { category: 'Inferior', name: 'Contorno de rodilla', description: 'Opcional según diseño.', isOptional: true },
    { category: 'Inferior', name: 'Contorno de pantorrilla', description: 'Para prendas ajustadas.' },
    { category: 'Inferior', name: 'Contorno de tobillo', description: 'Apertura de bota.' },
    { category: 'Inferior', name: 'Largo de pierna exterior', description: 'Desde cintura hasta tobillo o largo deseado.' },
    { category: 'Inferior', name: 'Largo de entrepierna', description: 'Desde entrepierna hasta tobillo.' },
  ];

  for (let i = 0; i < measurementPoints.length; i++) {
    const point = measurementPoints[i];
    await prisma.garmentMeasurementPoint.upsert({
      where: { category_name: { category: point.category, name: point.name } },
      update: {
        description: point.description,
        isOptional: point.isOptional ?? false,
        sortOrder: i + 1,
      },
      create: {
        category: point.category,
        name: point.name,
        description: point.description,
        isOptional: point.isOptional ?? false,
        sortOrder: i + 1,
      },
    });
  }
}
