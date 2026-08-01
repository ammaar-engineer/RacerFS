import { Body, Controller, Delete, Get, Headers, Post } from "@nestjs/common";
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtService } from "src/global_services/jwt.services";
import { UserDeleteAccount, UserLoginDTO, UserRegisterDTO, VerifyOtpDTO } from "src/models/user.route.dto";
import { AuthServices } from "src/services/auth.services";
import { FileServices } from "src/services/file.services";
import { UserServices } from "src/services/user.services";
import { SuccessResponse } from "src/utilities/Success.Response";
import { AuthValidations } from "src/validation/auth.validations";
import { UserValidations } from "src/validation/user.validations";

@ApiTags('user')
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

    @ApiOperation({ summary: 'Request OTP for registration' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email'],
            properties: {
                email: { type: 'string', example: 'test@example.com', description: 'User email address' }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'OTP sent to email',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'OTP Has been sent to your email',
                errorCode: '',
                data: { sessionId: 'sess_abc123' }
            }
        }
    })
    @Post('register')
    async UserRegister(@Body() body: UserRegisterDTO) {
        const {email} = body
        const {sessionId} = await this.authServices.createRegisterSession(email)
        console.log(sessionId)
        return SuccessResponse("OTP Has been sent to your email", { sessionId })
    }

    @ApiOperation({ summary: 'Request OTP for login' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email'],
            properties: {
                email: { type: 'string', example: 'user@example.com', description: 'User email address' }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'OTP sent to email',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'OTP Has been sent to your email',
                errorCode: '',
                data: { sessionId: 'sess_abc123' }
            }
        }
    })
    @Post('login')
    async UserLogin(@Body() body: UserLoginDTO) {
        const {email} = body
        const {sessionId} = await this.authServices.createLoginSession(email)
        return SuccessResponse("OTP Has been sent to your email", { sessionId })
    }

    @ApiOperation({ summary: 'Verify OTP and get auth token' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['sessionId', 'otp'],
            properties: {
                sessionId: { type: 'string', example: 'sess_abc123', description: 'Session ID returned from register or login' },
                otp: { type: 'string', example: '123456', description: '6-digit OTP sent to email' }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'OTP verified, returns JWT auth token',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'login successfully',
                errorCode: '',
                data: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
            }
        }
    })
    @Post("verify-otp")
    async VerifyOtp(@Body() body: VerifyOtpDTO) {
        const { sessionId, otp: rawOtp } = body;
        const {email, action} = await this.authValidations.verifyOtp(rawOtp, sessionId)
        const {token} = await this.userServices.OtpAction(action, email)
        return SuccessResponse(`${action} successfully`, {token})
    }

    @ApiOperation({ summary: 'Delete user account' })
    @ApiHeader({ name: 'Authorization', description: 'Bearer token for authentication', required: true })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email'],
            properties: {
                email: { type: 'string', example: 'user@example.com', description: 'Email of the account to delete' }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Account and associated files deleted',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'Account has been deleted',
                errorCode: '',
                data: null
            }
        }
    })
    @Delete("delete")
    async deleteAccount(
        @Headers() headers: Record<string, string>,
        @Body() body: UserDeleteAccount
    ) {
        const {email} = body
        const authorization = headers['authorization']

        // Verify token exists
        const payload = await this.authValidations.verifyToken(authorization)

        // Verify the token belongs to the account being deleted
        const targetUser = await this.userValidations.isEmail('exist', email)

        if (payload.user_id !== targetUser?.id) {
            throw new Error('Unauthorized: You can only delete your own account')
        }

        await this.userServices.deleteUser(email)
        const fileList = targetUser?.files.map(data => data.file_key)
        await this.fileService.removeObject(fileList as string[])
        return SuccessResponse("Account has been deleted")
    }

    @ApiOperation({ summary: 'Create a test account' })
    @ApiHeader({ name: 'account-test', description: 'Email to use for the test account', required: true })
    @ApiResponse({
        status: 200,
        description: 'Test account created, returns JWT auth token',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'Account for test and token',
                errorCode: '',
                data: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
            }
        }
    })
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