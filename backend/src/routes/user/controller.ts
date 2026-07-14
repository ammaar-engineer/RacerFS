import { Body, Controller, Inject, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity";
import { createClient } from "redis";
import { REDIS_CLIENT } from "src/global_modules/redis.module";
import { RESEND_CLIENT } from "src/global_modules/resend.module";
import { Resend } from "resend";
import { SuccessResponse } from "src/utilities/Success.Response";
import { UserRegisterDTO, VerifyOtpDTO, UserLoginDTO } from "./dto";
import { Repository } from "typeorm";
import { ConflictException, NotFoundException, UnauthorizedException } from "src/CustomExceptionHandle";
import { UserService } from "./service";
import { JwtService } from "src/global_services/jwt.module";

@Controller("user")
export class UserController {
    constructor(
        @InjectRepository(User) private readonly mainDb: Repository<User>,
        private readonly jwtService: JwtService,
        // @Inject(REDIS_CLIENT) private readonly redisService: ReturnType<typeof createClient>,
        // @Inject(RESEND_CLIENT) private readonly emailService: Resend,
        private readonly userService: UserService
    ) {}

    @Post('register')
    async UserRegister(@Body() body: UserRegisterDTO) {
        const {email} = body
        console.log(email)
        const emailExist = await this.mainDb.findOne({
            where: {
                email: email
            }
        })
        if (emailExist) {
            throw new ConflictException("Account already exists")
        }
        
        // Generate OTP dan simpan ke Redis
        const { sessionId, otp } = await this.userService.generateOtp('delivered@resend.dev', 'register')
        
        // Kirim OTP ke email
        await this.userService.sendOtpCodeToEmail('delivered@resend.dev', otp, 'register')
        
        return SuccessResponse("OTP Has been sent to your email", { sessionId })
    }

    @Post('login')
    async UserLogin(@Body() body: UserLoginDTO) {
        const {email} = body
        // Cek apakah user ada di database
        const user = await this.mainDb.findOne({
            where: {
                email
            }
        })
        if (!user) {
            throw new NotFoundException("Account not found. Please register first")
        }

        // Generate OTP dan simpan ke Redis
        const { sessionId, otp } = await this.userService.generateOtp(email, 'login')
        
        // Kirim OTP ke email
        await this.userService.sendOtpCodeToEmail(email, otp, 'login')
        
        return SuccessResponse("OTP Has been sent to your email", { sessionId })
    }

    @Post("verify-otp")
    async VerifyOtp(@Body() body: VerifyOtpDTO) {
        const { sessionId, otp } = body;
        
        // Validasi OTP menggunakan service
        const { email, action } = await this.userService.findClientOtp(sessionId, otp);
        
        // If login
        if (action === 'login') {
            const user = await this.mainDb.findOne({
                where: { email }
            });
            
            return SuccessResponse("Login successful", { 
                email,
                userId: user!.id 
            });
        }
        
        // If register
        const newUser = this.mainDb.create({ email });
        const {id} = await this.mainDb.save(newUser);
        
        return SuccessResponse("OTP verified successfully and user created", { 
            token: this.jwtService.generateJwt({userId: id}, '9d')
        });
    }

}