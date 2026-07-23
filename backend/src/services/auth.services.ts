import { Inject, Injectable } from "@nestjs/common";
import { createClient } from "redis";
import { NotFoundException, UnauthorizedException } from "src/CustomExceptionHandle";
import { REDIS_CLIENT } from "src/global_modules/redis.module";
import crypto from 'crypto'
import { otpGen } from "otp-gen-agent";
import { UserServices } from "./user.services";

@Injectable()
export class AuthServices {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redisService: ReturnType<typeof createClient>,
        private readonly userServices: UserServices
    ) {}

    // Session management methods
    async setAuthSession(email: string, action: 'login' | 'register') {
        const sessionId = crypto.randomUUID()
        const otp = await otpGen()
        await this.redisService.set(
            `${sessionId}:auth`, 
            JSON.stringify({ email, otp, action }), 
            { EX: 500 }
        );
        return {sessionId}
    }

    async findAuthSession(sessionId: string): Promise<{email: string, otp: string, action: 'login' | 'register'}> {
        const sessionData = await this.redisService.get(`${sessionId}:auth`) as string
        if (!sessionData) {
            throw new NotFoundException("Session not found")
        }
        return JSON.parse(sessionData)
    }

    async deleteAuthSession(sessionId: string) {
        await this.redisService.del(`${sessionId}:auth`)
        return {sessionId}
    }

    async verifyOtp(otp: string, sessionId: string) {
        const {otp: realOtp, email, action} = await this.findAuthSession(sessionId)
        if (otp !== realOtp) {
            throw new UnauthorizedException("Wrong OTP code")
        }
        await this.deleteAuthSession(sessionId)
        return {email, action}
    }

    async createRegisterSession(email: string) {
        await this.userServices.isEmail('notexist' ,email)
        const {sessionId} = await this.setAuthSession(email, 'register')
        return {sessionId}
    }

    async createLoginSession(email: string) {
        await this.userServices.isEmail('exist', email)
        const {sessionId} = await this.setAuthSession(email, 'login')
        return {sessionId}
    }
}
