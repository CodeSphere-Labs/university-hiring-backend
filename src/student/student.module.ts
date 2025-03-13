import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { PrismaService } from 'src/database/prisma.service';
import { UuidService } from 'nestjs-uuid';

@Module({
  controllers: [StudentController],
  providers: [StudentService, PrismaService, UuidService],
  exports: [StudentService],
})
export class StudentModule {}
