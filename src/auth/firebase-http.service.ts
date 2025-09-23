import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class FirebaseAuthHttpService {
  private axios: AxiosInstance;
  private readonly logger = new Logger(FirebaseAuthHttpService.name);

  constructor() {
    const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
    if (emulatorHost) {
      // emulator base (example host: localhost:9099)
      const baseURL = `http://${emulatorHost}/identitytoolkit.googleapis.com/v1`;
      this.axios = axios.create({ baseURL, timeout: 10000 });
    } else {
      // production identitytoolkit endpoint
      this.axios = axios.create({ baseURL: 'https://identitytoolkit.googleapis.com/v1', timeout: 10000 });
    }
  }

  // send verification code (get sessionInfo)
  async sendVerificationCode(phoneNumber: string, recaptchaToken = 'ignored', apiKey?: string) {
    const key = apiKey ?? process.env.FIREBASE_WEB_API_KEY ?? 'fake-api-key';
    const url = `/accounts:sendVerificationCode?key=${key}`;
    const body = { phoneNumber, recaptchaToken }; // recaptchaToken is required in prod
    this.logger.debug({ url, body });
    const res = await this.axios.post(url, body);
    return res.data; // contains sessionInfo
  }

  // sign in with phone using sessionInfo+code -> returns idToken, refreshToken, localId ...
  async signInWithPhoneNumber(sessionInfo: string, code: string, apiKey?: string) {
    const key = apiKey ?? process.env.FIREBASE_WEB_API_KEY ?? 'fake-api-key';
    const url = `/accounts:signInWithPhoneNumber?key=${key}`;
    const body = { sessionInfo, code };
    this.logger.debug({ url, body: { sessionInfo: sessionInfo?.slice(0,8) + '...' , code }});
    const res = await this.axios.post(url, body);
    return res.data; // idToken, refreshToken, localId, expiresIn
  }
}
