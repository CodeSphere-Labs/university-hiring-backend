-- CreateTable
CREATE TABLE "Practice" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "universityId" INTEGER NOT NULL,

    CONSTRAINT "Practice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PracticeToStudentProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PracticeToStudentProfile_AB_unique" ON "_PracticeToStudentProfile"("A", "B");

-- CreateIndex
CREATE INDEX "_PracticeToStudentProfile_B_index" ON "_PracticeToStudentProfile"("B");

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PracticeToStudentProfile" ADD CONSTRAINT "_PracticeToStudentProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PracticeToStudentProfile" ADD CONSTRAINT "_PracticeToStudentProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
