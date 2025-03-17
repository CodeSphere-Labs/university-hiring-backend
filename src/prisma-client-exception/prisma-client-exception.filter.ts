import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { ErrorCodes } from 'src/common/enums/error-codes';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error(exception.message);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    switch (exception.code) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT;

        response.status(status).json({
          statusCode: status,
          message: ErrorCodes.code[status],
        });
        break;
      }
      case 'P2003': {
        console.error(message);

        const status = HttpStatus.BAD_REQUEST;
        response.status(status).json({
          statusCode: status,
          code: ErrorCodes.code[status],
        });
        break;
      }
      case 'P2025': {
        console.error(message);

        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          statusCode: status,
          code: ErrorCodes.code[status],
        });
        break;
      }
      default:
        super.catch(exception, host);
        break;
    }
  }
}
