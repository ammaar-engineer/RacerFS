import { Injectable } from "@nestjs/common"
import { plainToInstance } from "class-transformer"
import { IsIn, IsNotEmpty, IsNumberString, IsString, validateOrReject } from "class-validator"

export class FileListHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string   
    @IsString()
    @IsNotEmpty()
    "access-token"!: string
}

export class FileRenameHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string   

    @IsString()
    @IsNotEmpty()
    "access-token"!: string
}
export class FileRenameQueryDTO {
    @IsString()
    @IsNotEmpty()
    "file-name"!: string

    @IsString()
    @IsNotEmpty()
    "new-name"!: string
}

export class FileDownloadHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string

    @IsString()
    @IsNotEmpty()
    "access-token"!: string
}
export class FileDownloadQueryDTO {
    @IsString()
    @IsNotEmpty()
    "file-key"!: string
}

export class FileGetPresignedUploadQueryDTO {
    @IsString()
    @IsNotEmpty()
    "file-name"!: string
}
export class FileGetPresignedUploadHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string

    @IsNumberString()
    @IsNotEmpty()
    "file-size"!: string
}

export class FileConfirmUploadHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string

    @IsNumberString()
    @IsNotEmpty()
    "file-size"!: string

    @IsString()
    @IsNotEmpty()
    "file-key"!: string
}
export class FileConfirmUploadQueryDTO {
    @IsString()
    @IsNotEmpty()
    @IsIn(["SUCCESS", "FAILED"])
    "status"!: string

    @IsString()
    @IsNotEmpty()
    "file-name"!: string
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