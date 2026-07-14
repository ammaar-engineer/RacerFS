import { Injectable, Inject } from "@nestjs/common";
import { createClient } from "redis";
import { Resend } from "resend";
import { REDIS_CLIENT } from "src/global_modules/redis.module";
import { RESEND_CLIENT } from "src/global_modules/resend.module";
import { otpGen } from "otp-gen-agent";
import crypto from 'crypto';
import { NotFoundException, UnauthorizedException } from "src/CustomExceptionHandle";

@Injectable()
export class UserService {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redisService: ReturnType<typeof createClient>,
        @Inject(RESEND_CLIENT) private readonly emailService: Resend
    ) {}

    async generateOtp(email: string, action: 'register' | 'login'): Promise<{ sessionId: string; otp: string }> {
        const sessionId = crypto.randomUUID();
        const otp = await otpGen();
        
        // Simpan ke Redis dengan expire 5 menit (300 detik)
        await this.redisService.set(
            sessionId, 
            JSON.stringify({ email, otp, action }), 
            { EX: 300 }
        );
        
        return { sessionId, otp };
    }
    
    async sendOtpCodeToEmail(email: string, otp: string, action: 'register' | 'login'): Promise<void> {
        const subject = action === 'login' ? 'Your Login OTP' : 'Your Registration OTP';
        const actionText = action === 'login' ? 'login' : 'complete your registration';
        
        await this.emailService.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: [email],
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Your OTP Code</h2>
                    <p>Your OTP code to ${actionText} is:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #666;">This code will expire in 5 minutes.</p>
                    <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
                </div>
            `
        });
    }

    /**
     * Cari dan validasi OTP dari Redis
     * @param sessionId Session ID dari user
     * @param otp OTP yang diinput user
     * @returns Object berisi email dan action
     */
    async findClientOtp(sessionId: string, otp: string): Promise<{ email: string; action: 'register' | 'login' }> {
        // Ambil data dari Redis berdasarkan sessionId
        const redisData = await this.redisService.get(sessionId);
        
        if (!redisData) {
            console.log("redis data", redisData)
            throw new NotFoundException("Session not found or expired");
        }
        
        // Parse data dari Redis
        const { email, otp: storedOtp, action } = JSON.parse(redisData);
        
        // Verifikasi OTP
        if (otp !== storedOtp) {
            throw new UnauthorizedException("Invalid OTP");
        }
        
        // Hapus session dari Redis setelah verifikasi berhasil
        await this.redisService.del(sessionId);
        
        return { email, action };
    }
}
