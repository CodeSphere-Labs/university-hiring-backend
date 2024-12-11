-- CreateTable
CREATE TABLE "_FavoriteStudents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FavoriteStudents_AB_unique" ON "_FavoriteStudents"("A", "B");

-- CreateIndex
CREATE INDEX "_FavoriteStudents_B_index" ON "_FavoriteStudents"("B");

-- AddForeignKey
ALTER TABLE "_FavoriteStudents" ADD CONSTRAINT "_FavoriteStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavoriteStudents" ADD CONSTRAINT "_FavoriteStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
