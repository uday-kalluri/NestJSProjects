// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import { Role } from '../common/interfaces/role.enum';
import { FirebaseService } from './firebase.service'; // service that wraps firebase-admin

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly jwt: JwtService,
    private readonly usersRepo: UsersRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async validateUser(identity: string, pass: string) {
    const user = await this.usersRepo.findByEmailOrUsername(identity);
    if (!user) throw new UnauthorizedException();
    const ok = await bcrypt.compare(pass, user.password!);
    if (!ok) throw new UnauthorizedException();
    return user;
  }

  signToken(user: any) {
    const payload = { sub: user._id.toString(), username: user.username, role: user.role };
    return { access_token: this.jwt.sign(payload) };
  }

  /**
   * Verify a Firebase ID token (calls Firebase Admin via FirebaseService).
   * Returns decoded token (contains uid, email, phone_number, etc).
   */
  async verifyFirebaseIdToken(idToken: string) {
    if (!idToken) throw new UnauthorizedException('Missing Firebase ID token');
    try {
      const decoded = await this.firebaseService.verifyToken(idToken);
      return decoded;
    } catch (err) {
      throw new UnauthorizedException('Invalid Firebase ID token');
    }
  }

  /**
   * Core logic to find/create a local user from decoded Firebase token.
   * Accepts decoded token (firebase-admin verifyIdToken result).
   */
  async firebaseLogin(decoded: any) {
    const { uid, email, phone_number } = decoded || {};

    if (!uid) {
      throw new UnauthorizedException('Invalid Firebase token: missing uid');
    }

    // 1) Try finding user by firebase uid
    let user = await this.usersRepo.findByFirebaseUid(uid);

    // 2) fallback: try find by email if firebaseUid not present
    if (!user && email) {
      user = await this.usersRepo.findByEmailOrUsername(email);
    }

    // 3) If no user, create one
    if (!user) {
      const usernameBase = email ? email.split('@')[0] : (phone_number ? phone_number.replace(/\D/g, '') : uid.slice(0, 8));
      const username = await this.usersRepo.makeUniqueUsername(usernameBase); // optional helper to avoid collisions

      // create a random password (not used for Firebase users but kept for compatibility)
      const randomPassword = Math.random().toString(36).slice(-12);
      const hashed = await bcrypt.hash(randomPassword, this.SALT_ROUNDS);

      user = await this.usersRepo.create({
        username,
        email: email || '',
        password: hashed,
        role: Role.USER,
        isVerified: true,
        firebaseUid: uid,           // store firebase uid for future lookups
        phone: phone_number || '',  // optional
      });

      // optionally create loyalty record for the user:
      try {
        await this.usersRepo.createLoyaltyForUser(user!._id);
      } catch (err) {
        // ignore or log - don't break login
        console.warn('Failed to create loyalty for user', err);
      }
    } else {
      // ensure the firebaseUid is saved if missing (e.g., previously created user)
      if (!user.firebaseUid) {
        await this.usersRepo.attachFirebaseUid(user._id, uid);
      }
    }

    return this.signToken(user);
  }

  /**
   * Convenience: accept an idToken string, verify it, then login/create user and return app JWT
   */
  async firebaseLoginWithIdToken(idToken: string) {
    const decoded = await this.verifyFirebaseIdToken(idToken);
    return this.firebaseLogin(decoded);
  }
}
