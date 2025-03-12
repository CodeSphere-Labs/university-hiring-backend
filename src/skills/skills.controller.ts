import { Controller, Get } from '@nestjs/common';
import { SkillsService } from './skills.service';
import {
  GroupedSkillsResponseDto,
  SkillResponseDto,
} from './dto/skills.response.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get('grouped')
  async getGroupedSkills(): Promise<GroupedSkillsResponseDto[]> {
    return this.skillsService.getGroupedSkills();
  }

  @Get()
  async getAllSkills(): Promise<SkillResponseDto[]> {
    return this.skillsService.getAllSkills();
  }
}
