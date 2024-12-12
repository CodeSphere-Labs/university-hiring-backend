import { PrismaClient } from '@prisma/client';
import { skills } from './constants';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: {
      email: 'R7PbZ@example.com',
    },
    update: {},
    create: {
      email: 'R7PbZ@example.com',
      passwordHash:
        '$2b$10$pRMWOouBcx7YE2FqffF7KucxvTxxs9/iuITDPjlU5QiO1AVZg3YMa',
      role: 'ADMIN',
    },
  });

  for (const skill of skills) {
    await prisma.skill.create({
      data: skill,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
