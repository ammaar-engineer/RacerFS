import { IsBoolean, IsIn, IsNotEmpty, IsNumberString, IsString } from "class-validator"

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
    "file-name"!: string
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

export class FileDeleteHeadersDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string   
}
export class FileDeleteQueryDTO {
    @IsString()
    @IsNotEmpty()
    "file-name"!: string
}

export class FileGenerateAccessTokenHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}

export class FileDeleteAccessTokenHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}
export class FileDeleteAccessTokenQueryDTO {
    @IsString()
    @IsNotEmpty()
    "token"!: string
}

export class FileSetVisibilityHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}
export class FileSetVisibilityQueryDTO {
    @IsString()
    @IsNotEmpty()
    "file-name"!: string
}
export class FileSetVisibilityBodyDTO {
    @IsBoolean()
    @IsNotEmpty()
    "is_public"!: boolean
}