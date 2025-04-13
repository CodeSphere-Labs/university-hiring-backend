import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const accessToken = request.cookies?.accessToken;

    if (!accessToken) {
      throw new UnauthorizedException('No access token');
    }

    try {
      const result = await super.canActivate(context);
      if (result) {
        return true;
      }
    } catch {
      const refreshToken = request.cookies['refreshToken'];

      if (!refreshToken) {
        throw new UnauthorizedException('No refresh token');
      }

      try {
        const tokens = await this.authService.refreshToken(refreshToken);

        this.authService.setRefreshTokenCookie(
          response,
          tokens.refreshToken,
          tokens.accessToken,
        );

        request.cookies.accessToken = tokens.accessToken;
        request.cookies.refreshToken = tokens.refreshToken;

        return true;
      } catch {
        throw new UnauthorizedException('Invalid refresh token');
      }
    }

    return false;
  }
}
