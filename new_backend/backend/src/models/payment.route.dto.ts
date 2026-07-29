import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class BuyStorageHeadersDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}