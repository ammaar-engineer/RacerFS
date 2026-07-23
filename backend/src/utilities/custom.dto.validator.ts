import { Injectable } from "@nestjs/common"
import { plainToInstance } from "class-transformer"
import { validateOrReject } from "class-validator"

@Injectable()
export class DtoUtilites {
    async validateSourceDTO<T extends object>(dto: new () => T, source: any) {
        const dtoClass = plainToInstance(dto, source, {
            excludeExtraneousValues: false
        })
        await validateOrReject(dtoClass)
        return dtoClass
    }
}