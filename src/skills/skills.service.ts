import { Injectable } from '@nestjs/common';
import {
  GroupedSkillsResponseDto,
  SkillResponseDto,
} from './dto/skills.response.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGroupedSkills(): Promise<GroupedSkillsResponseDto[]> {
    const skills = await this.prisma.skill.findMany({
      select: {
        name: true,
        category: true,
      },
    });

    const groupedSkills = skills.reduce((acc, skill) => {
      const existingGroup = acc.find((group) => group.group === skill.category);
      if (existingGroup) {
        existingGroup.items.push(skill.name);
      } else {
        acc.push({
          group: skill.category,
          items: [skill.name],
        });
      }
      return acc;
    }, [] as GroupedSkillsResponseDto[]);

    return groupedSkills;
  }

  async getAllSkills(): Promise<SkillResponseDto[]> {
    return this.prisma.skill.findMany();
  }
}
