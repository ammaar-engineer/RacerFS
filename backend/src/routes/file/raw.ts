import { Injectable } from "@nestjs/common"
import { plainToInstance } from "class-transformer"
import { IsNotEmpty, IsString, validateOrReject } from "class-validator"
import { AnyARecord } from "dns"

export class FileListHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
    
    @IsString()
    @IsNotEmpty()
    "access-token"!: string
}

@Injectable()
export class FileRawModules {
    async validateSourceDTO<T>(dto: new () => T, source: any) {
        const dtoClass = plainToInstance(dto, source, {
            excludeExtraneousValues: false
        })
        await validateOrReject(dto)
        return dtoClass
    }
}