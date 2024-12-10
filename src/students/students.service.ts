import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async studentList() {
    return await this.prisma.user.findMany({
      where: {
        role: 'STUDENT',
      },
      include: {
        organization: true,
        studentProfile: true,
      },
    });
  }
}
