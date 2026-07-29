import { Inject, Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { otpGen } from 'otp-gen-agent';
import { Resend } from 'resend';
import { RESEND_CLIENT } from '../../../connections/email.module';
import type { RedisClientType } from '../../../connections/redis.module';
import { REDIS_CLIENT } from '../../../connections/redis.module';
import { UserValidation } from '../validations/user.validation';

@Injectable()
export class AuthService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClientType,
    @Inject(RESEND_CLIENT)
    private readonly emailClient: Resend,
    private readonly userValidation: UserValidation,
  ) {}

  private async setAuthSession(
    email: string,
    action: 'login' | 'register',
  ): Promise<{ sessionId: string }> {
    const sessionId = crypto.randomUUID();
    const otp = await otpGen();

    // Store session in Redis (expires in 500 seconds)
    await this.redisClient.set(
      `auth:${sessionId}`,
      JSON.stringify({ email, otp, action }),
      { EX: 500 },
    );

    // Send OTP email
    await this.emailClient.emails.send({
      from: 'RacerFS <onboarding@resend.dev>',
      to: [email],
      subject: `RacerFS ${action === 'login' ? 'Login' : 'Registration'} - OTP Code`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your OTP Code</h2>
          <p>Your verification code is:</p>
          <h1 style="background: #f4f4f4; padding: 20px; text-align: center; letter-spacing: 5px;">
            ${otp}
          </h1>
          <p>This code will expire in 8 minutes.</p>
          <p style="color: #666; font-size: 12px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    });

    return { sessionId };
  }

  async createRegisterSession(email: string): Promise<{ sessionId: string }> {
    // Validate email doesn't exist
    await this.userValidation.validateEmailNotExists(email);

    // Create auth session
    return await this.setAuthSession(email, 'register');
  }

  async createLoginSession(email: string): Promise<{ sessionId: string }> {
    // Validate email exists
    await this.userValidation.validateEmailExists(email);

    // Create auth session
    return await this.setAuthSession(email, 'login');
  }
}
