-- DropForeignKey
ALTER TABLE "_UserSkills" DROP CONSTRAINT "_UserSkills_B_fkey";

-- AddForeignKey
ALTER TABLE "_UserSkills" ADD CONSTRAINT "_UserSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
