import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { applyBaselineSeed } from '../src/database/baseline-seed';

const prisma = new PrismaClient();

async function main() {
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

  await applyBaselineSeed(prisma, admin.id);

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
