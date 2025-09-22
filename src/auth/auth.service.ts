// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import { Role } from '../common/interfaces/role.enum';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService, private usersRepo: UsersRepository) {}

  async validateUser(identity: string, pass: string) {
    const user = await this.usersRepo.findByEmailOrUsername(identity);
    if (!user) throw new UnauthorizedException();
    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) throw new UnauthorizedException();
    return user;
  }

  signToken(user: any) {
    const payload = { sub: user._id.toString(), username: user.username, role: user.role };
    return { access_token: this.jwt.sign(payload) };
  }

  async firebaseLogin(decoded: any) {
    const { uid, email } = decoded;

    if (!email && !uid) {
      throw new UnauthorizedException('Invalid Firebase token: missing email and uid');
    }

    // Check if user exists in Mongo
    let user = await this.usersRepo.findByEmailOrUsername(email || uid);
    if (!user) {
      // Generate username from email or uid
      const username = email ? email.split('@')[0] : uid.substring(0, 20);

      user = await this.usersRepo.create({
        username,
        email: email || '',
        password: await this.usersRepo.hashPassword(uid), // Hash the uid as password
        role: Role.USER,
        isVerified: true,
      });
    }

    return this.signToken(user);
  }

}
