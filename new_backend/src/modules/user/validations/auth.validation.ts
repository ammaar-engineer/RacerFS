import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from '../../../connections/redis.module';
import { REDIS_CLIENT } from '../../../connections/redis.module';
import {
  NotFoundException,
  UnauthorizedException,
} from '../../../middleware/exceptions';

interface AuthSession {
  email: string;
  otp: string;
  action: 'login' | 'register';
}

@Injectable()
export class AuthValidation {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClientType,
  ) {}

  async findAuthSession(sessionId: string): Promise<AuthSession> {
    const sessionData = await this.redisClient.get(`auth:${sessionId}`);
    if (!sessionData) {
      throw new NotFoundException('Session not found or expired');
    }
    return JSON.parse(sessionData);
  }

  async deleteAuthSession(sessionId: string): Promise<void> {
    await this.redisClient.del(`auth:${sessionId}`);
  }

  async verifyOtp(
    otp: string,
    sessionId: string,
  ): Promise<{ email: string; action: 'login' | 'register' }> {
    const session = await this.findAuthSession(sessionId);

    if (otp !== session.otp) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // Delete session after successful verification
    await this.deleteAuthSession(sessionId);

    return {
      email: session.email,
      action: session.action,
    };
  }
}
