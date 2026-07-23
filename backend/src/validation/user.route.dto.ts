import { IsEmail, IsString } from "class-validator";

export class UserRegisterDTO {
    @IsString()
    // @IsEmail() for test
    email!: string;
}
export class VerifyOtpDTO {
    @IsString()
    sessionId!: string;
    
    @IsString()
    otp!: string;
}

export class UserLoginDTO {
    @IsEmail()
    email!: string;
}
export class UserDeleteAccount {
    @IsEmail()
    email!: string
}