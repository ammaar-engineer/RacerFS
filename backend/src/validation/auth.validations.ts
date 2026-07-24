import { Inject, Injectable } from "@nestjs/common";
import { createClient } from "redis";
import { NotFoundException, UnauthorizedException } from "src/CustomExceptionHandle";
import { REDIS_CLIENT } from "src/global_modules/redis.module";

@Injectable()
export class AuthValidations {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redisService: ReturnType<typeof createClient>,
    ) {}

    private async findAuthSession(sessionId: string): Promise<{email: string, otp: string, action: 'login' | 'register'}> {
        const sessionData = await this.redisService.get(`${sessionId}:auth`) as string
        if (!sessionData) {
            throw new NotFoundException("Session not found")
        }
        return JSON.parse(sessionData)
    }

    private async deleteAuthSession(sessionId: string) {
        await this.redisService.del(`${sessionId}:auth`)
    }

    async verifyOtp(otp: string, sessionId: string) {
        const {otp: realOtp, email, action} = await this.findAuthSession(sessionId)
        if (otp !== realOtp) {
            throw new UnauthorizedException("Wrong OTP code")
        }
        await this.deleteAuthSession(sessionId)
        return {email, action}
    }
}