import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';
import { ClassConstructor, plainToInstance } from 'class-transformer';

@Injectable()
export class TransformDataInterceptor implements NestInterceptor {
  constructor(private readonly classToUse: ClassConstructor<unknown>) {}

  intercept(_: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        try {
          const transformed = plainToInstance(this.classToUse, data, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
          });
          return transformed;
        } catch {
          console.error('Error transforming data', this.classToUse, data);
          return data;
        }
      }),
    );
  }
}
