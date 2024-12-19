import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/CreateOrganization.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(withFavorites: boolean = false) {
    return await this.prisma.organization.findMany({
      ...(withFavorites && {
        include: {
          favoriteStudents: {
            include: {
              studentProfile: true,
              organization: true,
            },
          },
        },
      }),
    });
  }

  async getById(id: number, withFavorites: boolean = false) {
    return await this.prisma.organization.findUniqueOrThrow({
      where: {
        id,
      },
      ...(withFavorites && {
        include: {
          favoriteStudents: {
            include: {
              studentProfile: true,
              organization: true,
            },
          },
        },
      }),
    });
  }

  async change(id: number, body: CreateOrganizationDto) {
    return await this.prisma.organization.update({
      where: { id },
      data: body,
    });
  }

  async registration(registrationDto: CreateOrganizationDto) {
    const organization = await this.prisma.organization.create({
      data: {
        email: registrationDto.email,
        name: registrationDto.name,
        about: registrationDto.about,
        websiteUrl: registrationDto.websiteUrl,
        type: 'COMPANY',
      },
    });

    return organization;
  }

  async addFavoriteStudent(organizationId: number, studentId: number) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true },
    });

    if (!student || student.role !== 'STUDENT') {
      throw new BadRequestException('User is not a student');
    }

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        favoriteStudents: {
          connect: {
            id: studentId,
          },
        },
      },
      include: {
        favoriteStudents: true,
      },
    });

    return await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        favoriteStudents: {
          include: {
            studentProfile: true,
            organization: true,
          },
        },
      },
    });
  }

  async removeFavoriteStudent(organizationId: number, studentId: number) {
    return await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        favoriteStudents: {
          disconnect: { id: studentId },
        },
      },
      include: {
        favoriteStudents: true,
      },
    });
  }

  async deleteOrganization(id: number) {
    await this.prisma.opportunityResponse.deleteMany({
      where: {
        opportunity: {
          organizationId: id,
        },
      },
    });

    await this.prisma.opportunity.deleteMany({
      where: { organizationId: id },
    });

    await this.prisma.invitation.deleteMany({
      where: { organizationId: id },
    });

    await this.prisma.user.updateMany({
      where: { organizationId: id },
      data: { organizationId: null },
    });

    return await this.prisma.organization.delete({
      where: { id },
    });
  }
}
