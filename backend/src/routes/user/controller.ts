import { Body, Controller, Inject, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AppTypeOrmModule } from "src/global_modules/typeorm.module";
import { User } from "src/entity";
import { createClient } from "redis";
import { REDIS_CLIENT } from "src/global_modules/redis.module";
import { RESEND_CLIENT } from "src/global_modules/resend.module";
import { Resend } from "resend";
import crypto from 'crypto'
import { Test } from "@nestjs/testing";
import { otpGen } from "otp-gen-agent";
import { SuccessResponse } from "src/utilities/Success.Response";
import { UserRegisterDTO, VerifyOtpDTO } from "./dto";
import { Repository } from "typeorm";
import { ConflictException, NotFoundException, UnauthorizedException } from "src/CustomExceptionHandle";

@Controller("user")
export class UserController {
    constructor(
        @InjectRepository(User) private readonly mainDb: Repository<User>,
        @Inject(REDIS_CLIENT) private readonly redisService: ReturnType<typeof createClient>,
        @Inject(RESEND_CLIENT) private readonly emailService: Resend
    ) {}

    @Post('register')
    async UserRegister(@Body() body: UserRegisterDTO) {
        const {email} = body
        const emailExist = await this.mainDb.findOne({
            where: {
                email
            }
        })
        if (emailExist) {
            throw new ConflictException("Account already exists")
        }
        const sessionId = crypto.randomUUID()
        const otp = await otpGen()
        // Set dengan expire 5 menit (300 detik)
        await this.redisService.set(sessionId, JSON.stringify({email, otp}), { EX: 300 })
        return SuccessResponse("OTP Has been sended to your email", { sessionId })
    }
    @Post("verify-otp")
    async VerifyOtp(@Body() body: VerifyOtpDTO) {
        const { sessionId, otp } = body;
        
        // Ambil data dari Redis berdasarkan sessionId
        const redisData = await this.redisService.get(sessionId);
        
        if (!redisData) {
            throw new NotFoundException("Session not found or expired");
        }
        
        // Parse data dari Redis
        const { email, otp: storedOtp } = JSON.parse(redisData);
        
        // Verifikasi OTP
        if (otp !== storedOtp) {
            throw new UnauthorizedException("Invalid OTP");
        }
        
        // Hapus session dari Redis setelah verifikasi berhasil
        await this.redisService.del(sessionId);
        
        // Simpan user baru ke database
        const newUser = this.mainDb.create({ email });
        await this.mainDb.save(newUser);
        
        return SuccessResponse("OTP verified successfully and user created", { 
            email,
            userId: newUser.id 
        });
    }

}