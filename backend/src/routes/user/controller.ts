import { Body, Controller, Delete, Get, Post } from "@nestjs/common";
import { SuccessResponse } from "src/utilities/Success.Response";
import { UserDeleteAccount, UserLoginDTO, UserRegisterDTO, VerifyOtpDTO } from "src/validation/user.route.dto";
import { UserServices } from "src/services/user.services";
import { AuthServices } from "src/services/auth.services";
import { JwtService } from "src/global_modules/jwt.module";

@Controller("user")
export class UserController {
    constructor(
        private readonly userServices: UserServices,
        private readonly authServices: AuthServices,
        private readonly jwtService: JwtService
    ) {}

    @Post('register')
    async UserRegister(@Body() body: UserRegisterDTO) {
        const {email} = body
        const {sessionId} = await this.authServices.createRegisterSession(email)
        return SuccessResponse("OTP Has been sent to your email", { sessionId })
    }

    @Post('login')
    async UserLogin(@Body() body: UserLoginDTO) {
        const {email} = body
        const {sessionId} = await this.authServices.createLoginSession(email)
        return SuccessResponse("OTP Has been sent to your email", { sessionId })
    }

    @Post("verify-otp")
    async VerifyOtp(@Body() body: VerifyOtpDTO) {
        const { sessionId, otp: rawOtp } = body;
        const {email, action} = await this.authServices.verifyOtp(rawOtp, sessionId)
        const {token} = await this.userServices.OtpAction(action, email)
        return SuccessResponse(`${action} successfully`, {token})
    }

    @Delete("delete")
    async deleteAccount(
        @Body() body: UserDeleteAccount
    ) {
        const {email} = body
        await this.userServices.isEmail('exist', email)
        await this.userServices.deleteUser(email)
        SuccessResponse("Account has been deleted")
    }

    @Get("create-test-account")
    async createTestAccount() {
        const createEmail = await this.userServices.createNewEmail("ammaar@gmail.com")
        const token = this.jwtService.generateJwt({
            user_id: createEmail.id,
            type: "account_token"
        })
        return SuccessResponse("Account for test and token", {
            token
        })
    }

}
