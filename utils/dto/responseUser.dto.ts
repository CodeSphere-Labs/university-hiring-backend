import { Exclude, Expose } from '@nestjs/class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class ResponseUserDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  role: string;
}
