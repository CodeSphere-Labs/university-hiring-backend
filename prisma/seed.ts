import { PrismaClient, OrganizationType } from '@prisma/client';
import { skills } from './constants';
const prisma = new PrismaClient();

const PASSWORD_HASH =
  '$2b$10$pRMWOouBcx7YE2FqffF7KucxvTxxs9/iuITDPjlU5QiO1AVZg3YMa';

async function main() {
  const university = await prisma.organization.upsert({
    where: { email: 'university@example.com' },
    update: {},
    create: {
      name: 'Sample University',
      type: OrganizationType.UNIVERSITY,
      email: 'university@example.com',
      websiteUrl: 'https://university.example.com',
      about: 'A sample university for testing',
    },
  });

  const company = await prisma.organization.upsert({
    where: { email: 'company@example.com' },
    update: {},
    create: {
      name: 'Tech Company',
      type: OrganizationType.COMPANY,
      email: 'company@example.com',
      websiteUrl: 'https://company.example.com',
      about: 'A sample tech company for testing',
    },
  });

  const companyForAdmin = await prisma.organization.upsert({
    where: { email: 'companyforadmin@example.com' },
    update: {},
    create: {
      name: 'Admin Tech Company',
      type: OrganizationType.COMPANY,
      email: 'companyforadmin@example.com',
      websiteUrl: 'https://companyforadmin.example.com',
      about: 'A sample admin tech company for testing',
    },
  });

  for (const skill of skills) {
    await prisma.skill.create({
      data: skill,
    });
  }

  const group1 = await prisma.group.upsert({
    where: { name: 'ПИ-101' },
    update: {},
    create: {
      name: 'ПИ-101',
    },
  });

  const group2 = await prisma.group.upsert({
    where: { name: 'ИВТ-201' },
    update: {},
    create: {
      name: 'ИВТ-201',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'Admin',
      patronymic: 'Admin',
      email: 'admin@example.com',
      passwordHash: PASSWORD_HASH,
      role: 'ADMIN',
      organizationId: companyForAdmin.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@university.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      patronymic: 'Smith',
      email: 'staff@university.com',
      passwordHash: PASSWORD_HASH,
      role: 'UNIVERSITY_STAFF',
      organizationId: university.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'hr@company.com' },
    update: {},
    create: {
      firstName: 'Jane',
      lastName: 'Smith',
      patronymic: 'Brown',
      email: 'hr@company.com',
      passwordHash: PASSWORD_HASH,
      role: 'STAFF',
      organizationId: company.id,
    },
  });

  const studentWithProfile = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {},
    create: {
      firstName: 'Alex',
      lastName: 'Johnson',
      patronymic: 'William',
      email: 'student1@example.com',
      passwordHash: PASSWORD_HASH,
      role: 'STUDENT',
      organizationId: university.id,
      telegramLink: '@alex_johnson',
      vkLink: 'vk.com/alex_johnson',
      aboutMe: 'Активный студент, интересуюсь ML и веб-разработкой',
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: studentWithProfile.id },
    update: {},
    create: {
      userId: studentWithProfile.id,
      groupId: group1.id,
      resume: 'https://example.com/resume.pdf',
      githubLink: 'https://github.com/alex-johnson',
      projects: [
        {
          id: 'ai',
          name: 'AI Chat Bot',
          description: 'Чат-бот на основе машинного обучения',
          githubUrl: 'https://github.com/alex-johnson/ai-chat-bot',
          websiteUrl: 'https://ai-chat-bot.example.com',
          technologies: ['Python', 'TensorFlow', 'React', 'Node.js'],
        },
        {
          id: 'web',
          name: 'Web Portfolio',
          description: 'Персональный сайт-портфолио',
          githubUrl: 'https://github.com/alex-johnson/portfolio',
          websiteUrl: 'https://portfolio.example.com',
          technologies: ['React', 'TypeScript', 'Tailwind CSS'],
        },
      ],
      skills: {
        connect: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      },
    },
  });

  const studentWithoutProfile = await prisma.user.upsert({
    where: { email: 'student2@example.com' },
    update: {},
    create: {
      firstName: 'Maria',
      lastName: 'Garcia',
      patronymic: 'Elena',
      email: 'student2@example.com',
      passwordHash: PASSWORD_HASH,
      role: 'STUDENT',
      organizationId: university.id,
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: studentWithoutProfile.id },
    update: {},
    create: {
      userId: studentWithoutProfile.id,
      groupId: group2.id,
    },
  });

  await prisma.organization.update({
    where: { id: company.id },
    data: {
      favoriteStudents: {
        connect: { id: studentWithProfile.id },
      },
    },
  });

  const createdSkills = await prisma.skill.findMany({
    take: 3,
  });

  await prisma.opportunity.create({
    data: {
      title: 'Junior Developer',
      description: 'Ищем начинающего разработчика для стажировки',
      organizationId: company.id,
      requiredSkills: {
        connect: createdSkills.map((skill) => ({ id: skill.id })),
      },
    },
  });

  const uniStaff = await prisma.user.findUnique({
    where: { email: 'staff@university.com' },
  });

  const companyStaff = await prisma.user.findUnique({
    where: { email: 'hr@company.com' },
  });

  console.log('Создание тестовых приглашений...');

  const now = new Date();

  const invitationData = [];

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 180);
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + 7);

    const role =
      i % 3 === 0 ? 'STUDENT' : i % 3 === 1 ? 'STAFF' : 'UNIVERSITY_STAFF';
    const creatorId = i % 2 === 0 ? uniStaff.id : companyStaff.id;
    const organizationId = i % 2 === 0 ? 1 : 2;

    const email = `invite_accepted_${i}@example.com`;

    invitationData.push({
      email,
      token: `token_accepted_${i}`,
      role,
      organizationId,
      used: true,
      expiresAt,
      createdAt,
      createdById: creatorId,
      groupId: role === 'STUDENT' ? (i % 2 === 0 ? 1 : 2) : null,
    });
  }

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 3);
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const daysValid = 4 + Math.floor(Math.random() * 4);
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + daysValid);

    const role =
      i % 3 === 0 ? 'STUDENT' : i % 3 === 1 ? 'STAFF' : 'UNIVERSITY_STAFF';
    const creatorId = i % 2 === 0 ? uniStaff.id : companyStaff.id;
    const organizationId = i % 2 === 0 ? 1 : 2;

    const email = `invite_waiting_${i}@example.com`;

    invitationData.push({
      email,
      token: `token_waiting_${i}`,
      role,
      organizationId,
      used: false,
      expiresAt,
      createdAt,
      createdById: creatorId,
      groupId: role === 'STUDENT' ? (i % 2 === 0 ? 1 : 2) : null,
    });
  }

  for (let i = 0; i < 100; i++) {
    const daysAgo = 10 + Math.floor(Math.random() * 170);
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const validDays = 2 + Math.floor(Math.random() * 8);
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + validDays);

    const role =
      i % 3 === 0 ? 'STUDENT' : i % 3 === 1 ? 'STAFF' : 'UNIVERSITY_STAFF';
    const creatorId = i % 2 === 0 ? uniStaff.id : companyStaff.id;
    const organizationId = i % 2 === 0 ? 1 : 2;

    const email = `invite_expired_${i}@example.com`;

    invitationData.push({
      email,
      token: `token_expired_${i}`,
      role,
      organizationId,
      used: false,
      expiresAt,
      createdAt,
      createdById: creatorId,
      groupId: role === 'STUDENT' ? (i % 2 === 0 ? 1 : 2) : null,
    });
  }

  await prisma.invitation.createMany({
    data: invitationData,
    skipDuplicates: true,
  });

  console.log(`Создано ${invitationData.length} тестовых приглашений`);
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
