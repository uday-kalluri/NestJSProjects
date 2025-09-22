// auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';

import { FirebaseService } from './firebase.service';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private users: UsersService, private firebase: FirebaseService) { }

  @Post('register') async register(@Body() dto: RegisterDto) {
    const user = await this.users.register(dto);
    return this.auth.signToken(user);
  }

  @Post('login') async login(@Body() dto: LoginDto) {
    const user = await this.auth.validateUser(dto.identity, dto.password);
    return this.auth.signToken(user);
  }

  @Post('firebase-login')
  async firebaseLogin(@Body('idToken') idToken: string) {
    const decoded = await this.firebase.verifyToken(idToken);
    return this.auth.firebaseLogin(decoded);
  }
}
