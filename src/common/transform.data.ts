import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ClassConstructor, plainToInstance } from 'class-transformer';

@Injectable()
export class TransformDataInterceptor<T> implements NestInterceptor {
  constructor(private readonly classToUse: ClassConstructor<T>) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<T | T[]> {
    return next.handle().pipe(
      map((data) => {
        try {
          if (Array.isArray(data)) {
            return data.map((item) =>
              plainToInstance(this.classToUse, item, {
                excludeExtraneousValues: true,
              }),
            );
          }

          return plainToInstance(this.classToUse, data, {
            excludeExtraneousValues: true,
          });
        } catch (error) {
          console.error('Error transforming data:', error);
          throw error;
        }
      }),
    );
  }
}
