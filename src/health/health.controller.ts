// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator, HttpHealthIndicator } from '@nestjs/terminus';
import { FirebaseHealthIndicator } from './firebase.health';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('health')
@ApiTags('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongooseIndicator: MongooseHealthIndicator,
    private httpIndicator: HttpHealthIndicator,
    private firebaseIndicator: FirebaseHealthIndicator,
  ) {}

  // liveness — simple minimal checks (app up)
  @Get('/live')
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  liveness() {
    return this.health.check([
      // simplest check: application process alive
      async () => this.mongoPing('mongo'), // reuse same function below
    ]);
  }

  // readiness — more comprehensive: DB, external APIs, Firebase
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  readiness() {
    return this.health.check([
      // MongoDB (Mongoose)
      async () => this.mongooseIndicator.pingCheck('mongo', { timeout: 3000 }),


      // Firebase (custom)
      async () => this.firebaseIndicator.isHealthy('firebase'),
    ]);
  }

  // small helper to keep liveness code readable
  private async mongoPing(key: string) {
    return this.mongooseIndicator.pingCheck(key, { timeout: 1000 });
  }
}
