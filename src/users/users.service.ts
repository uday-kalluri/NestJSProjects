// users/users.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(private repo: UsersRepository) {}
  async register(dto: RegisterDto) {
    const existing = await this.repo.findByEmailOrUsername(dto.email) 
                  ?? await this.repo.findByEmailOrUsername(dto.username);
    if (existing) throw new ConflictException('User exists');
    const password = await this.repo.hashPassword(dto.password);
    return this.repo.create({ ...dto, password });
  }
}
