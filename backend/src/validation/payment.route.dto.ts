import { IsNotEmpty, IsString } from "class-validator";


export class BuyStorageHeadersDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}