import { IsEmail, IsString } from "class-validator"


export class UserRegisterDTO {
    @IsEmail()
    email!: string;
}

export class VerifyOtpDTO {
    @IsString()
    sessionId!: string;
    
    @IsString()
    otp!: string;
}