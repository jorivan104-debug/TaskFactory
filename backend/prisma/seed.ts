import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ─── Admin user ───
  const adminHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskfactory.co' },
    update: {},
    create: {
      email: 'admin@taskfactory.co',
      passwordHash: adminHash,
      fullName: 'Administrador',
    },
  });

  // ─── Roles ───
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
      create: { ...r, createdByUserId: admin.id },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { key: 'admin' } });
  if (adminRole) {
    const existing = await prisma.userRole.findFirst({
      where: { userId: admin.id, roleId: adminRole.id, workSiteId: null },
    });
    if (!existing) {
      await prisma.userRole.create({
        data: { userId: admin.id, roleId: adminRole.id, createdByUserId: admin.id },
      });
    }
  }

  // ─── Work site & warehouse ───
  const site = await prisma.workSite.upsert({
    where: { code: 'PLANTA-01' },
    update: {},
    create: { code: 'PLANTA-01', name: 'Planta Principal', createdByUserId: admin.id },
  });

  await prisma.warehouse.upsert({
    where: { code: 'ALM-INSUMOS' },
    update: {},
    create: { code: 'ALM-INSUMOS', name: 'Almacén de Insumos', workSiteId: site.id, createdByUserId: admin.id },
  });

  await prisma.warehouse.upsert({
    where: { code: 'ALM-PT' },
    update: {},
    create: { code: 'ALM-PT', name: 'Almacén Producto Terminado', workSiteId: site.id, createdByUserId: admin.id },
  });

  // ─── Units of measure ───
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
      create: { ...u, createdByUserId: admin.id },
    });
  }

  // ─── Supply types ───
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
      create: { ...st, createdByUserId: admin.id },
    });
  }

  // ─── Silhouette categories ───
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
      create: { ...c, createdByUserId: admin.id },
    });
  }

  // ─── Sizes ───
  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '6', '8', '10', '12', '14', '28', '30', '32', '34', 'Única'];
  for (let i = 0; i < sizes.length; i++) {
    await prisma.size.upsert({
      where: { name: sizes[i] },
      update: {},
      create: { name: sizes[i], sortOrder: i + 1, createdByUserId: admin.id },
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
