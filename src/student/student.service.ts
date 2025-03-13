import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { AddProjectDto } from './dto/add-project.dto';
import { Prisma } from '@prisma/client';
import { UuidService } from 'nestjs-uuid';

@Injectable()
export class StudentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uuidService: UuidService,
  ) {}

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
      id: this.uuidService.generate(),
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

  async deleteProject(userId: number, projectId: string) {
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

    console.log(currentProjects);
    const projectIndex = currentProjects.findIndex((p) => p.id === projectId);

    if (projectIndex === -1) {
      throw new NotFoundException('Project not found');
    }

    const updatedProjects = [...currentProjects];
    updatedProjects.splice(projectIndex, 1);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        studentProfile: {
          update: {
            projects: updatedProjects as unknown as Prisma.JsonArray,
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
