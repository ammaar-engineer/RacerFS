import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserRegisterDTO {
    @ApiProperty({ example: 'test@example.com', description: 'User email address' })
    @IsString()
    // @IsEmail() for test
    email!: string;
}
export class VerifyOtpDTO {
    @ApiProperty({ example: 'sess_abc123', description: 'Session ID returned from register or login' })
    @IsString()
    sessionId!: string;

    @ApiProperty({ example: '123456', description: '6-digit OTP sent to email' })
    @IsString()
    otp!: string;
}

export class UserLoginDTO {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail()
    email!: string;
}
export class UserDeleteAccount {
    @ApiProperty({ example: 'user@example.com', description: 'Email of the account to delete' })
    @IsEmail()
    email!: string
}