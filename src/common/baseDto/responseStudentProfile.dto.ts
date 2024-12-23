import { Exclude, Expose, Type } from 'class-transformer';

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
  groupId?: number;

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
