import { PrismaClient, OrganizationType } from '@prisma/client';
import { skills } from './constants';
const prisma = new PrismaClient();

const PASSWORD_HASH =
  '$2b$10$pRMWOouBcx7YE2FqffF7KucxvTxxs9/iuITDPjlU5QiO1AVZg3YMa';

async function main() {
  // Создаем организации
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

  // Создаем скиллы
  for (const skill of skills) {
    await prisma.skill.create({
      data: skill,
    });
  }

  // Создаем группы
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

  // Создаем админа
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
    },
  });

  // Создаем сотрудника университета
  await prisma.user.upsert({
    where: { email: 'staff@university.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      patronymic: 'Smith',
      email: 'staff@university.com',
      passwordHash: PASSWORD_HASH,
      role: 'STAFF',
      organizationId: university.id,
    },
  });

  // Создаем сотрудника компании
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

  // Создаем студента с заполненным профилем
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

  // Создаем профиль для первого студента
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
          name: 'AI Chat Bot',
          description: 'Чат-бот на основе машинного обучения',
          githubUrl: 'https://github.com/alex-johnson/ai-chat-bot',
          websiteUrl: 'https://ai-chat-bot.example.com',
          technologies: ['Python', 'TensorFlow', 'React', 'Node.js'],
        },
        {
          name: 'Web Portfolio',
          description: 'Персональный сайт-портфолио',
          githubUrl: 'https://github.com/alex-johnson/portfolio',
          websiteUrl: 'https://portfolio.example.com',
          technologies: ['React', 'TypeScript', 'Tailwind CSS'],
        },
      ],
      skills: {
        connect: [
          { id: 1 }, // JavaScript
          { id: 2 }, // Python
          { id: 3 }, // React
          { id: 4 }, // Node.js
          { id: 5 }, // TypeScript
        ],
      },
    },
  });

  // Создаем студента без заполненного профиля
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

  // Создаем минимальный профиль для второго студента
  await prisma.studentProfile.upsert({
    where: { userId: studentWithoutProfile.id },
    update: {},
    create: {
      userId: studentWithoutProfile.id,
      groupId: group2.id,
    },
  });

  // Добавляем первого студента в избранное компании
  await prisma.organization.update({
    where: { id: company.id },
    data: {
      favoriteStudents: {
        connect: { id: studentWithProfile.id },
      },
    },
  });

  // Создаем тестовую вакансию
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
