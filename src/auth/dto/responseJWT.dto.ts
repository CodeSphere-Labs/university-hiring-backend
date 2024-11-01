import { Expose } from '@nestjs/class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class responseJWTDto {
  @Expose()
  @ApiProperty()
  accessToken: string;

  @Expose()
  @ApiProperty()
  refreshToken: string;
}
