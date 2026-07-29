import { Body, Controller, Delete, Get, Headers, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

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
import { ApiDocs } from '../../../decorators/api-docs.decorator';

// Docs
import {
  registerDocs,
  loginDocs,
  verifyOtpDocs,
  deleteAccountDocs,
  createTestAccountDocs,
} from './docs';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiDocs({ ...registerDocs, bodyType: UserRegisterDto })
  @Post('register')
  async register(@Body() dto: UserRegisterDto) {
    const { sessionId } = await this.authService.createRegisterSession(dto.email);
    return SuccessResponse('OTP has been sent to your email', { sessionId });
  }

  @ApiDocs({ ...loginDocs, bodyType: UserLoginDto })
  @Post('login')
  async login(@Body() dto: UserLoginDto) {
    const { sessionId } = await this.authService.createLoginSession(dto.email);
    return SuccessResponse('OTP has been sent to your email', { sessionId });
  }

  @ApiDocs({ ...verifyOtpDocs, bodyType: VerifyOtpDto })
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const { token, message } = await this.userService.verifyOtpAndAuthenticate(
      dto.sessionId,
      dto.otp,
    );
    return SuccessResponse(message, { token });
  }

  @ApiDocs({ ...deleteAccountDocs, bodyType: UserDeleteDto })
  @Delete('delete')
  async deleteAccount(
    @Headers('authorization') token: string,
    @Body() dto: UserDeleteDto,
  ) {
    await this.userService.deleteUserAccount(token, dto.email);
    return SuccessResponse('Account has been deleted');
  }

  @ApiDocs(createTestAccountDocs)
  @Get('create-test-account')
  async createTestAccount(@Headers('account-test') email: string) {
    const { token } = await this.userService.createTestAccount(email);
    return SuccessResponse('Test account created', { token });
  }
}
