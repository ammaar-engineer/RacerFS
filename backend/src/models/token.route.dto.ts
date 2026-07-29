import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class TokenGenerateAccessTokenHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}

export class TokenDeleteAccessTokenHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}

export class TokenDeleteAccessTokenBodyDTO {
    @ApiProperty({ example: 'at_abc123', description: 'Access token to delete' })
    @IsString()
    @IsNotEmpty()
    "token"!: string
}
