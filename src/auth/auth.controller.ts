// auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';

import { FirebaseService } from './firebase.service';


import { FirebaseAuthHttpService } from './firebase-http.service';



@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private users: UsersService, private firebase: FirebaseService, private readonly authService: AuthService, private firebaseHttp: FirebaseAuthHttpService) { }

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

  // send OTP -> returns { sessionInfo }
  @Post('send-otp')
  async sendOtp(@Body('phoneNumber') phoneNumber: string, @Body('recaptchaToken') recaptchaToken?: string) {
    // recaptchaToken required in prod; for emulator pass any value or omit
    const data = await this.firebaseHttp.sendVerificationCode(phoneNumber, recaptchaToken);
    return data; // { sessionInfo: "..." }
  }

  // verify OTP -> returns your app JWT
  @Post('verify-otp')
  async verifyOtp(@Body('sessionInfo') sessionInfo: string, @Body('code') code: string) {
    // sign in with Firebase (returns idToken)
    const firebaseRes = await this.firebaseHttp.signInWithPhoneNumber(sessionInfo, code);
    const idToken = firebaseRes.idToken;
    // verify the idToken with Firebase Admin (decoded token has uid, phone_number)
    const decoded = await this.authService.verifyFirebaseIdToken(idToken);
    // sign in / create user in your DB and return your JWT
    return this.authService.firebaseLogin(decoded);
  }


}
