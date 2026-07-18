import { Body, Controller, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Token, User } from "src/entity";
import { SuccessResponse } from "src/utilities/Success.Response";
import { Repository } from "typeorm";
import { UserLoginDTO, UserRegisterDTO, VerifyOtpDTO } from "./raw";
import { UserBridgeModules } from "./bridge/main.bridge";
import { SessionBridgeModules } from "./bridge/session.bridge";
import { UserDbModules } from "./db";

@Controller("user")
export class UserController {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly bridgeUser: UserBridgeModules,
        private readonly sessionBridge: SessionBridgeModules,
        @InjectRepository(Token) private readonly tokenRepo: Repository<Token>
    ) {}

    @Post('register')
    async UserRegister(@Body() body: UserRegisterDTO) {
        const {email} = body
        const {sessionId} = await this.sessionBridge.createRegisterSession(email)
        return SuccessResponse("OTP Has been sent to your email", { sessionId })
    }

    @Post('login')
    async UserLogin(@Body() body: UserLoginDTO) {
        const {email} = body
        const {sessionId} = await this.sessionBridge.createLoginSession(email)
        return SuccessResponse("OTP Has been sent to your email", { sessionId })
    }

    @Post("verify-otp")
    async VerifyOtp(@Body() body: VerifyOtpDTO) {
        const { sessionId, otp: rawOtp } = body;
        const {email, action} = await this.sessionBridge.verifyOtp(rawOtp, sessionId)
        const {token} = await this.bridgeUser.OtpAction(action, email)
        return SuccessResponse(`${action} successfully`, {token})
    }

}
