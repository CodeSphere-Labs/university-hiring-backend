import { Exclude, Expose } from '@nestjs/class-transformer';

@Exclude()
export class ApiSuccessResponseDto {
  @Expose()
  readonly message: string;

  @Expose()
  readonly statusCode: number;
}
