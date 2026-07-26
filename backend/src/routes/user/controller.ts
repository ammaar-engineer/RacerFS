import { Body, Controller, Delete, Get, Headers, Post } from "@nestjs/common";
import { JwtService } from "src/global_services/jwt.services";
import { AuthServices } from "src/services/auth.services";
import { FileServices } from "src/services/file.services";
import { UserServices } from "src/services/user.services";
import { SuccessResponse } from "src/utilities/Success.Response";
import { AuthValidations } from "src/validation/auth.validations";
import { UserDeleteAccount, UserLoginDTO, UserRegisterDTO, VerifyOtpDTO } from "src/validation/user.route.dto";
import { UserValidations } from "src/validation/user.validations";

@Controller("user")
export class UserController {
    constructor(
        private readonly userServices: UserServices,
        private readonly authServices: AuthServices,
        private readonly fileService: FileServices,
        private readonly jwtService: JwtService,
        private readonly authValidations: AuthValidations,
        private readonly userValidations: UserValidations
    ) {}

    @Post('register')
    async UserRegister(@Body() body: UserRegisterDTO) {
        const {email} = body
        const {sessionId} = await this.authServices.createRegisterSession(email)
        console.log(sessionId)
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
        const {email, action} = await this.authValidations.verifyOtp(rawOtp, sessionId)
        const {token} = await this.userServices.OtpAction(action, email)
        return SuccessResponse(`${action} successfully`, {token})
    }

    @Delete("delete")
    async deleteAccount(
        @Body() body: UserDeleteAccount
    ) {
        const {email} = body
        const targetUser = await this.userValidations.isEmail('exist', email)
        await this.userServices.deleteUser(email)
        const fileList = targetUser?.files.map(data => data.file_key)
        await this.fileService.removeObject(fileList as string[])
        SuccessResponse("Account has been deleted")
    }

    @Get("create-test-account")
    async createTestAccount(
        @Headers() headers: Record<string, string>
    ) {
        const createEmail = await this.userServices.createNewEmail(headers['account-test'])
        const token = this.jwtService.generateJwt({
            user_id: createEmail.id,
            type: "account_token"
        })
        return SuccessResponse("Account for test and token", {
            token
        })
    }

}