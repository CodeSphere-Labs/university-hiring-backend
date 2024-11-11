import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateOrganizationDto } from './dto/CreateOrganization.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.organization.findMany();
  }

  async getById(id: number) {
    return await this.prisma.organization.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async registration(registrationDto: CreateOrganizationDto) {
    const organization = await this.prisma.organization.create({
      data: {
        email: registrationDto.email,
        name: registrationDto.name,
        type: 'COMPANY',
      },
    });

    return organization;
  }
}
