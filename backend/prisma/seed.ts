import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { applyBaselineSeed } from '../src/database/baseline-seed';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('e7sacxtf', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'jorivan104@hotmail.com' },
    update: { passwordHash: adminHash, fullName: 'Administrador' },
    create: {
      email: 'jorivan104@hotmail.com',
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
