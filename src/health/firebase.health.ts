// src/health/firebase.health.ts
import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(FirebaseHealthIndicator.name);

  // optionally pass a test UID via env to verify auth service works
  private readonly testUid = process.env.HEALTH_CHECK_FIREBASE_UID;

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // ensures admin initialized; throws if not configured correctly
      const app = admin.apps.length ? admin.app() : null;
      if (!app) {
        throw new Error('firebase-admin not initialized');
      }

      // If a test UID is configured, try a light API call
      if (this.testUid) {
        // listUsers is another option, but getUser is lighter
        await admin.auth().getUser(this.testUid);
      }

      return this.getStatus(key, true);
    } catch (err) {
      this.logger.warn('Firebase health check failed', err?.message || err);
      return this.getStatus(key, false, { message: err?.message || err });
    }
  }
}
