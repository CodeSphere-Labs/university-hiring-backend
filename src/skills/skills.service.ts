import { Injectable } from '@nestjs/common';
import { skills } from 'prisma/constants';
import {
  GroupedSkillsResponseDto,
  SkillResponseDto,
} from './dto/skills.response.dto';

@Injectable()
export class SkillsService {
  async getGroupedSkills(): Promise<GroupedSkillsResponseDto[]> {
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
    return skills;
  }
}
