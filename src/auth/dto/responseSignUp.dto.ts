import { Exclude, Expose } from '@nestjs/class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class ResponseSignUpDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  first_name: string;

  @Expose()
  @ApiProperty()
  last_name: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  password: string;

  @Expose()
  @ApiProperty()
  isStudent?: boolean;

  @Expose()
  @ApiProperty()
  isCompany?: boolean;
}
