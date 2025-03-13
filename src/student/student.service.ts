import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { AddProjectDto } from './dto/add-project.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async addProject(userId: number, project: AddProjectDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            skills: true,
            group: true,
          },
        },
      },
    });

    if (!user || !user.studentProfile) {
      throw new NotFoundException('Student profile not found');
    }

    const currentProjects = (user.studentProfile.projects as any[]) || [];
    const newProject = {
      ...project,
      createdAt: new Date().toISOString(),
    };

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        studentProfile: {
          update: {
            projects: [
              newProject,
              ...currentProjects,
            ] as unknown as Prisma.JsonArray,
          },
        },
      },
      include: {
        organization: true,
        studentProfile: {
          include: {
            group: true,
            skills: true,
          },
        },
      },
    });

    return {
      ...updatedUser,
      studentProfile: {
        ...updatedUser.studentProfile,
        skills:
          updatedUser.studentProfile?.skills?.map((skill) => skill.name) || [],
      },
    };
  }
}
