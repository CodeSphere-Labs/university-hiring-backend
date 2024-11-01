import { Injectable } from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  async signin(signinDto: SignInDto) {
    const signin =  await this.
  }
}
