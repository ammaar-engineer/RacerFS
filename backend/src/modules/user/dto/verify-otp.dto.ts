import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    example: 'sess_abc123',
    description: 'Session ID returned from register or login',
  })
  @IsString()
  @IsNotEmpty({ message: 'Session ID is required' })
  sessionId: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP sent to email',
  })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @IsNotEmpty({ message: 'OTP is required' })
  otp: string;
}
