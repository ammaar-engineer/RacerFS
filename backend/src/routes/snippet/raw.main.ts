import { Injectable } from "@nestjs/common"
import { plainToInstance } from "class-transformer"
import { IsNotEmpty, IsOptional, IsString, validateOrReject } from "class-validator"

// --- list ---
export class SnippetListHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}

// --- create ---
export class SnippetCreateHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}
export class SnippetCreateBodyDTO {
    @IsString()
    @IsNotEmpty()
    "alias"!: string

    @IsString()
    @IsOptional()
    "description"?: string | null

    @IsString()
    @IsNotEmpty()
    "command"!: string
}

// --- delete ---
export class SnippetDeleteHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}
export class SnippetDeleteQueryDTO {
    @IsString()
    @IsNotEmpty()
    "alias"!: string
}

// --- edit ---
export class SnippetEditHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}
export class SnippetEditQueryDTO {
    @IsString()
    @IsNotEmpty()
    "alias"!: string
}
export class SnippetEditBodyDTO {
    @IsString()
    @IsNotEmpty()
    "command"!: string
}

@Injectable()
export class SnippetRawModules {
    async validateSourceDTO<T extends object>(dto: new () => T, source: any) {
        const dtoClass = plainToInstance(dto, source, {
            excludeExtraneousValues: false
        })
        await validateOrReject(dtoClass)
        return dtoClass
    }
}
