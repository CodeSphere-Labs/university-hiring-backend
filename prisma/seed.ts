import { PrismaClient, OrganizationType } from '@prisma/client';
import { skills } from './constants';
const prisma = new PrismaClient();

const PASSWORD_HASH =
  '$2b$10$pRMWOouBcx7YE2FqffF7KucxvTxxs9/iuITDPjlU5QiO1AVZg3YMa';

async function main() {
  // Проверяем, есть ли уже данные в базе
  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    console.log('Данные уже существуют в базе. Пропускаем seed.');
    return;
  }

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

  const groups = await Promise.all([
    prisma.group.upsert({
      where: { name: 'ПИ-101' },
      update: {},
      create: { name: 'ПИ-101' },
    }),
    prisma.group.upsert({
      where: { name: 'ИВТ-201' },
      update: {},
      create: { name: 'ИВТ-201' },
    }),
    prisma.group.upsert({
      where: { name: 'ПИ-102' },
      update: {},
      create: { name: 'ПИ-102' },
    }),
    prisma.group.upsert({
      where: { name: 'ИВТ-202' },
      update: {},
      create: { name: 'ИВТ-202' },
    }),
    prisma.group.upsert({
      where: { name: 'ПИ-103' },
      update: {},
      create: { name: 'ПИ-103' },
    }),
  ]);

  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: 'student1@example.com' },
      update: {},
      create: {
        firstName: 'Алексей',
        lastName: 'Петров',
        patronymic: 'Иванович',
        email: 'student1@example.com',
        passwordHash: PASSWORD_HASH,
        role: 'STUDENT',
        organizationId: university.id,
        telegramLink: '@alex_petrov',
        vkLink: 'vk.com/alex_petrov',
        aboutMe: 'Увлекаюсь веб-разработкой и машинным обучением',
      },
    }),
    prisma.user.upsert({
      where: { email: 'student2@example.com' },
      update: {},
      create: {
        firstName: 'Мария',
        lastName: 'Сидорова',
        patronymic: 'Александровна',
        email: 'student2@example.com',
        passwordHash: PASSWORD_HASH,
        role: 'STUDENT',
        organizationId: university.id,
        telegramLink: '@maria_sidorova',
        vkLink: 'vk.com/maria_sidorova',
        aboutMe: 'Интересуюсь мобильной разработкой',
      },
    }),
    prisma.user.upsert({
      where: { email: 'student3@example.com' },
      update: {},
      create: {
        firstName: 'Дмитрий',
        lastName: 'Иванов',
        patronymic: 'Петрович',
        email: 'student3@example.com',
        passwordHash: PASSWORD_HASH,
        role: 'STUDENT',
        organizationId: university.id,
        telegramLink: '@dmitry_ivanov',
        vkLink: 'vk.com/dmitry_ivanov',
        aboutMe: 'Разработка игр и графических приложений',
      },
    }),
    prisma.user.upsert({
      where: { email: 'student4@example.com' },
      update: {},
      create: {
        firstName: 'Елена',
        lastName: 'Козлова',
        patronymic: 'Сергеевна',
        email: 'student4@example.com',
        passwordHash: PASSWORD_HASH,
        role: 'STUDENT',
        organizationId: university.id,
        telegramLink: '@elena_kozlova',
        vkLink: 'vk.com/elena_kozlova',
        aboutMe: 'Backend разработка и базы данных',
      },
    }),
    prisma.user.upsert({
      where: { email: 'student5@example.com' },
      update: {},
      create: {
        firstName: 'Андрей',
        lastName: 'Смирнов',
        patronymic: 'Дмитриевич',
        email: 'student5@example.com',
        passwordHash: PASSWORD_HASH,
        role: 'STUDENT',
        organizationId: university.id,
        telegramLink: '@andrey_smirnov',
        vkLink: 'vk.com/andrey_smirnov',
        aboutMe: 'Full-stack разработка и DevOps',
      },
    }),
  ]);

  // Создаем 50 студентов для группы ПИ-101
  const pi101Students = await Promise.all(
    Array.from({ length: 50 }, (_, i) => {
      const firstName = `Студент${i + 1}`;
      const lastName = `Фамилия${i + 1}`;
      const patronymic = `Отчество${i + 1}`;
      return prisma.user.upsert({
        where: { email: `student${i + 1}@example.com` },
        update: {},
        create: {
          firstName,
          lastName,
          patronymic,
          email: `student${i + 1}@example.com`,
          passwordHash: PASSWORD_HASH,
          role: 'STUDENT',
          organizationId: university.id,
          telegramLink: `@student${i + 1}`,
          vkLink: `vk.com/student${i + 1}`,
          aboutMe: `Описание студента ${i + 1}`,
        },
      });
    }),
  );

  // Создаем профили для всех студентов ПИ-101
  for (const student of pi101Students) {
    const skillsCount = Math.floor(Math.random() * 5) + 3; // 3-7 навыков
    const projectsCount = Math.floor(Math.random() * 3) + 1; // 1-3 проекта

    const projects = [];
    for (let i = 0; i < projectsCount; i++) {
      const technologies = [
        ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        ['Python', 'Django', 'PostgreSQL', 'Docker'],
        ['Java', 'Spring Boot', 'MySQL', 'Maven'],
        ['C++', 'Qt', 'SQLite', 'CMake'],
        ['JavaScript', 'Vue.js', 'Express', 'MongoDB'],
        ['Python', 'Flask', 'Redis', 'Celery'],
        ['TypeScript', 'Angular', 'NestJS', 'MongoDB'],
        ['Go', 'Gin', 'PostgreSQL', 'Docker'],
        ['Rust', 'Actix', 'PostgreSQL', 'Diesel'],
        ['PHP', 'Laravel', 'MySQL', 'Composer'],
      ][i % 10];

      projects.push({
        id: `project_${student.id}_${i}`,
        name: `Проект ${i + 1} студента ${student.firstName}`,
        description: `Описание проекта ${i + 1}`,
        githubUrl: `https://github.com/${student.firstName.toLowerCase()}/project-${i + 1}`,
        websiteUrl: `https://project-${i + 1}.example.com`,
        technologies,
      });
    }

    await prisma.studentProfile.upsert({
      where: { userId: student.id },
      update: {},
      create: {
        userId: student.id,
        groupId: groups[0].id, // ПИ-101
        resume: `https://example.com/resume-${student.id}.pdf`,
        githubLink: `https://github.com/${student.firstName.toLowerCase()}`,
        projects,
        skills: {
          connect: Array.from({ length: skillsCount }, (_, i) => ({
            id: ((student.id + i) % 25) + 1, // Используем 25 уникальных навыков
          })),
        },
      },
    });
  }

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

  const staffUser = await prisma.user.upsert({
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

  await prisma.organization.update({
    where: { id: company.id },
    data: {
      favoriteStudents: {
        connect: { id: students[0].id },
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

  // Создаем 50 тестовых стажировок
  const opportunityTitles = [
    'Frontend Developer Intern',
    'Backend Developer Intern',
    'Full Stack Developer Intern',
    'DevOps Engineer Intern',
    'QA Engineer Intern',
    'Mobile Developer Intern',
    'Data Science Intern',
    'Machine Learning Engineer Intern',
    'UI/UX Designer Intern',
    'Product Manager Intern',
    'Business Analyst Intern',
    'Security Engineer Intern',
    'Cloud Engineer Intern',
    'Blockchain Developer Intern',
    'Game Developer Intern',
    'AR/VR Developer Intern',
    'Embedded Systems Engineer Intern',
    'System Administrator Intern',
    'Network Engineer Intern',
    'Database Administrator Intern',
  ];

  const opportunityDescriptions = [
    'Присоединяйтесь к нашей команде разработчиков и получите ценный опыт работы над реальными проектами.',
    'Мы ищем талантливых студентов для участия в разработке инновационных решений.',
    'Стажировка в одной из ведущих технологических компаний с возможностью дальнейшего трудоустройства.',
    'Работа над интересными проектами под руководством опытных наставников.',
    'Возможность применить свои знания на практике и развить профессиональные навыки.',
    'Участие в разработке продуктов, которыми пользуются миллионы людей.',
    'Работа в современном офисе с дружной командой единомышленников.',
    'Гибкий график и возможность совмещать с учебой.',
    'Конкурентная оплата и социальный пакет для стажеров.',
    'Возможность проявить себя и реализовать свои идеи.',
  ];

  const companies = [company, companyForAdmin];

  for (let i = 0; i < 50; i++) {
    const title =
      opportunityTitles[Math.floor(Math.random() * opportunityTitles.length)];
    const description =
      opportunityDescriptions[
        Math.floor(Math.random() * opportunityDescriptions.length)
      ];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const skillsCount = Math.floor(Math.random() * 3) + 2; // 2-4 навыка

    await prisma.opportunity.create({
      data: {
        title: `${title} ${i + 1}`,
        description: `${description} ${i + 1}`,
        organizationId: company.id,
        requiredSkills: {
          connect: Array.from({ length: skillsCount }, (_, j) => ({
            id: ((i + j) % 25) + 1, // Используем 25 уникальных навыков
          })),
        },
      },
    });
  }

  // Создаем сотрудников организаций для руководства практиками
  const practiceSupervisors = await Promise.all([
    prisma.user.create({
      data: {
        firstName: 'Иван',
        lastName: 'Петров',
        patronymic: 'Сергеевич',
        email: 'supervisor1@company.com',
        passwordHash: PASSWORD_HASH,
        role: 'STAFF',
        organizationId: company.id,
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Анна',
        lastName: 'Сидорова',
        patronymic: 'Ивановна',
        email: 'supervisor2@company.com',
        passwordHash: PASSWORD_HASH,
        role: 'STAFF',
        organizationId: company.id,
      },
    }),
  ]);

  // Получаем студентов с данными пользователей
  const studentsWithUsers = await Promise.all(
    students.map((student) =>
      prisma.studentProfile.findUnique({
        where: { id: student.id },
        include: { user: true },
      }),
    ),
  );

  // Обновляем создание практик
  await Promise.all([
    prisma.practice.create({
      data: {
        name: 'Летняя практика в IT-компании',
        groupId: groups[0].id,
        address: 'ул. Ленина, 1',
        notes: 'Требуется знание JavaScript и React',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        universityId: university.id,
        organizationId: company.id,
        createdById: staffUser.id,
        supervisorId: practiceSupervisors[0].id,
        students: {
          connect: [
            { id: studentsWithUsers[0].id },
            { id: studentsWithUsers[1].id },
          ],
        },
        chat: {
          create: {
            messages: {
              create: [
                {
                  userId: practiceSupervisors[0].id,
                  content:
                    'Добро пожаловать на практику! Завтра в 10:00 состоится вводное собрание.',
                },
                {
                  userId: studentsWithUsers[0].user.id,
                  content: 'Спасибо! Буду на собрании.',
                },
              ],
            },
          },
        },
      },
    }),
    prisma.practice.create({
      data: {
        name: 'Зимняя практика в банке',
        groupId: groups[1].id,
        address: 'ул. Пушкина, 10',
        notes: 'Требуется знание SQL и Python',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2025-02-28'),
        universityId: university.id,
        organizationId: company.id,
        createdById: staffUser.id,
        supervisorId: practiceSupervisors[1].id,
        students: {
          connect: [
            { id: studentsWithUsers[2].id },
            { id: studentsWithUsers[3].id },
          ],
        },
        chat: {
          create: {
            messages: {
              create: [
                {
                  userId: practiceSupervisors[1].id,
                  content:
                    'Приветствуем вас на зимней практике! Пожалуйста, ознакомьтесь с программой.',
                },
                {
                  userId: studentsWithUsers[2].user.id,
                  content:
                    'Спасибо, уже изучил программу. Есть несколько вопросов.',
                },
              ],
            },
          },
        },
      },
    }),
    prisma.practice.create({
      data: {
        name: 'Весенняя практика в стартапе',
        groupId: groups[2].id,
        address: 'ул. Гагарина, 5',
        notes: 'Требуется знание TypeScript и Node.js',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-05-31'),
        universityId: university.id,
        organizationId: company.id,
        createdById: staffUser.id,
        supervisorId: practiceSupervisors[0].id,
        students: {
          connect: [
            { id: studentsWithUsers[4].id },
            { id: studentsWithUsers[0].id },
          ],
        },
        chat: {
          create: {
            messages: {
              create: [
                {
                  userId: practiceSupervisors[0].id,
                  content:
                    'Добро пожаловать на весеннюю практику! На этой неделе мы начнем с изучения основ.',
                },
                {
                  userId: studentsWithUsers[4].user.id,
                  content: 'Отлично! Буду готовиться к началу.',
                },
              ],
            },
          },
        },
      },
    }),
  ]);

  const uniStaff = await prisma.user.findUnique({
    where: { email: 'staff@university.com' },
  });

  const companyStaff = await prisma.user.findUnique({
    where: { email: 'hr@company.com' },
  });

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

  // Создаем отклики на первую вакансию
  const firstOpportunity = await prisma.opportunity.findFirst();
  const studentsForResponses = await prisma.studentProfile.findMany({
    where: {
      groupId: groups[0].id, // ПИ-101
    },
    take: 50,
    include: {
      user: true,
    },
  });

  const responseData = studentsForResponses.map((student, index) => ({
    opportunityId: firstOpportunity.id,
    studentId: student.id,
    coverLetter: `Здравствуйте! Я ${student.user.firstName} ${student.user.lastName}, студент группы ПИ-101. 
    Я очень заинтересован в стажировке в вашей компании. У меня есть опыт работы с ${
      ['React', 'Node.js', 'TypeScript', 'Python', 'Java', 'C++'][index % 6]
    } и я активно изучаю новые технологии.
    
    Мой GitHub: ${student.githubLink}
    Моё портфолио: ${
      typeof student.projects === 'string'
        ? JSON.parse(student.projects as string)
            .map((p: { name: string }) => p.name)
            .join(', ')
        : (student.projects as any[]).map((p) => p.name).join(', ')
    }
    
    Буду рад стать частью вашей команды!`,
  }));

  await prisma.opportunityResponse.createMany({
    data: responseData,
    skipDuplicates: true,
  });

  console.log(`Создано ${responseData.length} откликов на первую вакансию`);
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
