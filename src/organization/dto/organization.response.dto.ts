import { Exclude, Expose, Type } from 'class-transformer';
import { ResponseUserDto } from 'src/common/baseDto/responseUser.dto';

@Exclude()
export class OrganizationResponseDto extends ResponseUserDto {
  @Expose()
  name: string;

  @Expose()
  logoUrl: string;

  @Expose()
  @Type(() => ResponseUserDto)
  favoriteStudents: ResponseUserDto[];
}
