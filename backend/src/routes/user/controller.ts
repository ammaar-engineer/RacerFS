import { Body, Controller, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity";
import { SuccessResponse } from "src/utilities/Success.Response";
import { UserRegisterDTO, VerifyOtpDTO, UserLoginDTO } from "./dto";
import { Repository } from "typeorm";
import { UserService } from "./service";
import { JwtService } from "src/global_services/jwt.module";
import { UserValidationService } from "./validation";
import { NotFoundException } from "src/CustomExceptionHandle";

@Controller("user")
export class UserController {
    constructor(
        @InjectRepository(User) private readonly mainDb: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly validationService: UserValidationService
    ) {}

    @Post('register')
    async UserRegister(@Body() body: UserRegisterDTO) {
        const {email} = body
        // Validasi email belum terdaftar
        await this.validationService.validateEmailNotExists(email);
        // Generate OTP dan simpan ke Redis
        const { sessionId, otp } = await this.userService.generateOtp(email, 'register')
        // Debug
        console.log("ISI EMAIL= ", email, otp, sessionId) 
        // Kirim OTP ke email
        await this.userService.sendOtpCodeToEmail(email, otp, 'register')
        return SuccessResponse("OTP Has been sent to your email", { sessionId })
    }

    @Post('login')
    async UserLogin(@Body() body: UserLoginDTO) {
        const {email} = body
        await this.validationService.validateEmailExists(email);
        // Generate OTP dan simpan ke Redis
        const { sessionId, otp } = await this.userService.generateOtp(email, 'login')
        // Buat debug
        console.log("ISI EMAIL= ", email, otp, sessionId) 
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
            const findEmail = await this.mainDb.findOne({
                where: {
                    email: email
                }
            })
            if (!findEmail) {
                throw new NotFoundException("Email not found")
            }
            return SuccessResponse("Login successful", { 
                email,
                userId: this.jwtService.generateJwt({userId: findEmail?.id})
            });
        }
        const newUser = this.mainDb.create({ email });
        const {id} = await this.mainDb.save(newUser);
        return SuccessResponse("OTP verified successfully and user created", { 
            token: this.jwtService.generateJwt({userId: id})
        });
    }

}