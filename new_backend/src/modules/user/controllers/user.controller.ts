import { Body, Controller, Delete, Get, Headers, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBody } from '@nestjs/swagger';

// DTOs
import { UserRegisterDto } from '../dto/user-register.dto';
import { UserLoginDto } from '../dto/user-login.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { UserDeleteDto } from '../dto/user-delete.dto';

// Services
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

// Utilities
import { SuccessResponse } from '../../../utilities/success.response';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Request OTP for registration' })
  @ApiBody({ type: UserRegisterDto })
  @ApiResponse({
    status: 201,
    description: 'OTP sent to email',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'OTP has been sent to your email',
        errorCode: '',
        data: { sessionId: 'uuid-session-id' },
      },
    },
  })
  @Post('register')
  async register(@Body() dto: UserRegisterDto) {
    const { sessionId } = await this.authService.createRegisterSession(dto.email);
    return SuccessResponse('OTP has been sent to your email', { sessionId });
  }

  @ApiOperation({ summary: 'Request OTP for login' })
  @ApiBody({ type: UserLoginDto })
  @ApiResponse({
    status: 201,
    description: 'OTP sent to email',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'OTP has been sent to your email',
        errorCode: '',
        data: { sessionId: 'uuid-session-id' },
      },
    },
  })
  @Post('login')
  async login(@Body() dto: UserLoginDto) {
    const { sessionId } = await this.authService.createLoginSession(dto.email);
    return SuccessResponse('OTP has been sent to your email', { sessionId });
  }

  @ApiOperation({ summary: 'Verify OTP and get authentication token' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 201,
    description: 'Authentication successful',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'login successfully',
        errorCode: '',
        data: { token: 'jwt-token-here' },
      },
    },
  })
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const { token, message } = await this.userService.verifyOtpAndAuthenticate(
      dto.sessionId,
      dto.otp,
    );
    return SuccessResponse(message, { token });
  }

  @ApiOperation({ summary: 'Delete user account' })
  @ApiHeader({
    name: 'authorization',
    description: 'JWT account token',
    required: true,
  })
  @ApiBody({ type: UserDeleteDto })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Account has been deleted',
        errorCode: '',
        data: null,
      },
    },
  })
  @Delete('delete')
  async deleteAccount(
    @Headers('authorization') token: string,
    @Body() dto: UserDeleteDto,
  ) {
    await this.userService.deleteUserAccount(token, dto.email);
    return SuccessResponse('Account has been deleted');
  }

  @ApiOperation({ summary: 'Create test account (for testing only)' })
  @ApiHeader({
    name: 'account-test',
    description: 'Email to use for the test account',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Test account created',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Test account created',
        errorCode: '',
        data: { token: 'jwt-token-here' },
      },
    },
  })
  @Get('create-test-account')
  async createTestAccount(@Headers('account-test') email: string) {
    const { token } = await this.userService.createTestAccount(email);
    return SuccessResponse('Test account created', { token });
  }
}
