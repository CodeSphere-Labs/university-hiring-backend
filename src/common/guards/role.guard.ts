import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  UseGuards,
  applyDecorators,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const cookies = request.headers.cookie;

    if (!cookies) {
      return false;
    }

    const accessToken = request.cookies['accessToken'];

    if (!accessToken) {
      return false;
    }

    try {
      const decodedAccessToken = jwt.verify(
        accessToken,
        this.configService.get<string>('jwt.access'),
      );

      const userRole = decodedAccessToken['role'];

      return matchRoles(roles, userRole);
    } catch (error) {
      console.error('Ошибка при декодировании токена', error);
      return false;
    }
  }
}

function matchRoles(roles: string[], userRole: string): boolean {
  return roles.includes(userRole);
}

export function Roles(roles: string[]) {
  return applyDecorators(SetMetadata('roles', roles), UseGuards(RolesGuard));
}
