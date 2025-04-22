/*
  Warnings:

  - Added the required column `supervisorId` to the `Practice` table without a default value. This is not possible if the table is not empty.

*/
-- Сначала создадим временную таблицу для хранения ID существующих практик
CREATE TEMPORARY TABLE temp_practices AS
SELECT id FROM "Practice";

-- Создадим временного пользователя для существующих практик
DO $$
DECLARE
    temp_supervisor_id INTEGER;
BEGIN
    INSERT INTO "User" (
        "firstName",
        "lastName",
        "patronymic",
        "email",
        "passwordHash",
        "role",
        "organizationId",
        "createdAt",
        "updatedAt"
    ) VALUES (
        'Default',
        'Supervisor',
        'Default',
        'default.supervisor@university.com',
        '$2b$10$pRMWOouBcx7YE2FqffF7KucxvTxxs9/iuITDPjlU5QiO1AVZg3YMa',
        'UNIVERSITY_STAFF',
        (SELECT id FROM "Organization" WHERE type = 'UNIVERSITY' LIMIT 1),
        NOW(),
        NOW()
    ) RETURNING id INTO temp_supervisor_id;

    -- Добавим колонку supervisorId с временным значением
    ALTER TABLE "Practice" ADD COLUMN "supervisorId" INTEGER;

    -- Обновим существующие записи
    UPDATE "Practice" SET "supervisorId" = temp_supervisor_id;

    -- Сделаем колонку обязательной
    ALTER TABLE "Practice" ALTER COLUMN "supervisorId" SET NOT NULL;
END $$;

-- CreateTable
CREATE TABLE "PracticeChat" (
    "id" SERIAL NOT NULL,
    "practiceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeChatMessage" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeChat_practiceId_key" ON "PracticeChat"("practiceId");

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeChat" ADD CONSTRAINT "PracticeChat_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeChatMessage" ADD CONSTRAINT "PracticeChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "PracticeChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeChatMessage" ADD CONSTRAINT "PracticeChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Удалим временную таблицу
DROP TABLE temp_practices;
