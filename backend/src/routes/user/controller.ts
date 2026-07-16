import { Body, Controller, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Token, User } from "src/entity";
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
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly validationService: UserValidationService,
        @InjectRepository(Token) private readonly tokenRepo: Repository<Token>
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
            const findEmail = await this.userRepo.findOne({
                where: {
                    email: email
                }
            })
            if (!findEmail) {
                throw new NotFoundException("Email not found")
            }
            return SuccessResponse("Login successful", { 
                email,
                userId: this.jwtService.generateJwt({user_id: findEmail?.id})
            });
        }
        // Register
        // Insert user
        const newUser = this.userRepo.create({ email });
        const {id} = await this.userRepo.save(newUser);
        // Insert private access token for first user
        const createPrivateToken = this.tokenRepo.create({
            token: this.jwtService.generateJwt({
                token_owner_id: id,
                type: "private_access_token"
            }),
            user_id: id,
            type: "private_access_token"
        })
        await this.tokenRepo.save(createPrivateToken)
        // Create auth token
        const jwtToken = this.jwtService.generateJwt({
            user_id: id,
            type: "user_token"
        })
        return SuccessResponse("OTP verified successfully and user created", { 
            token: jwtToken
        });
    }

}