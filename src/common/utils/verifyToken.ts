import { JwtService } from '@nestjs/jwt';

const jwtService = new JwtService();

export const verifyToken = (token: string, secret: string) => {
  try {
    return jwtService.verify(token, { secret });
  } catch (err) {
    console.error(err);
    return null;
  }
};
