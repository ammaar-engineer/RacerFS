import { Inject, Injectable } from "@nestjs/common";
import { createClient } from "redis";
import { REDIS_CLIENT } from "src/global_modules/redis.module";
import crypto from 'crypto'
import { otpGen } from "otp-gen-agent";
import { UserValidations } from "src/validation/user.validations";

@Injectable()
export class AuthServices {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redisService: ReturnType<typeof createClient>,
        private readonly userValidations: UserValidations
    ) {}

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

    async createRegisterSession(email: string) {
        await this.userValidations.isEmail('notexist', email)
        const {sessionId} = await this.setAuthSession(email, 'register')
        return {sessionId}
    }

    async createLoginSession(email: string) {
        await this.userValidations.isEmail('exist', email)
        const {sessionId} = await this.setAuthSession(email, 'login')
        return {sessionId}
    }
}