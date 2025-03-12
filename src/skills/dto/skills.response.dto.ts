import { Expose } from 'class-transformer';

export class GroupedSkillsResponseDto {
  @Expose()
  group: string;

  @Expose()
  items: string[];
}

export class SkillResponseDto {
  @Expose()
  name: string;

  @Expose()
  category: string;

  @Expose()
  description: string;
}
