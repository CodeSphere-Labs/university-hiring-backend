import { Exclude, Expose, Type } from 'class-transformer';

class ResponseGroupDto {
  @Expose()
  readonly id: number;

  @Expose()
  readonly name: string;
}

@Exclude()
export class ResponseStudentProfileDto {
  @Expose()
  id: number;

  @Expose()
  resume?: string;

  @Expose()
  aboutMe?: string;

  @Expose()
  githubLink?: string;

  @Expose()
  @Type(() => ResponseGroupDto)
  group?: ResponseGroupDto;

  @Expose()
  @Type(() => PetProjectResponseDto)
  projects?: PetProjectResponseDto[];

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;
}

export class PetProjectResponseDto {
  @Expose()
  readonly name: string;

  @Expose()
  readonly githubUrl: string;

  @Expose()
  readonly description: string;

  @Expose()
  readonly websiteUrl?: string;

  @Expose()
  readonly technologies?: string[];
}
