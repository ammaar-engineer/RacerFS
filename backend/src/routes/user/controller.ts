import { Body, Controller, Delete, Get, Post } from "@nestjs/common";
import { SuccessResponse } from "src/utilities/Success.Response";
import { UserLoginDTO, UserRegisterDTO, VerifyOtpDTO } from "./raw.main";
import { UserBridgeModules } from "./bridge/bridge.main";
import { SessionBridgeModules } from "./bridge/bridge.session";
import { UserDbModules } from "./db.main";
import { JwtModule, JwtService } from "src/global_bridge/jwt.module";

@Controller("user")
export class UserController {
    constructor(
        private readonly bridgeUser: UserBridgeModules,
        private readonly sessionBridge: SessionBridgeModules,
        private readonly dbUser: UserDbModules,
        private readonly jwtService: JwtService
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

    @Delete("delete")
    async deleteAccount() {
        
    }

    @Get("create-test-account")
    async createTestAccount() {
        const createEmail = await this.dbUser.createNewEmail("ammaar@gmail.com")
        const token = this.jwtService.generateJwt({
            user_id: createEmail.id,
            type: "account_token"
        })
        return SuccessResponse("Account for test and token", {
            token
        })
    }

}
