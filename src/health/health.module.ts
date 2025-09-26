// src/health/health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller'
import { FirebaseHealthIndicator } from './firebase.health';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [FirebaseHealthIndicator],
  exports: [FirebaseHealthIndicator],
})
export class HealthModule {}
