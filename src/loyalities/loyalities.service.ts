// loyalties/loyalties.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { LoyaltiesRepository } from './loyalties.repository';

@Injectable()
export class LoyaltiesService {
  constructor(private repo: LoyaltiesRepository) { }
  getMine(userId: string) { return this.repo.upsertForUser(userId); }
  listAll(skip = 0, limit = 50) { return this.repo.listWithUsers(skip, limit); }
  async adjust(userId: string, delta: number, reason: string) {
    const updated = await this.repo.applyDelta(userId, delta, reason);
    if (!updated) throw new NotFoundException('User loyalty not found');
    return updated;
  }
}
