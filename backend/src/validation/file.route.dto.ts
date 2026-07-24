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
export class FileRenameBodyDTO {
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

    @IsNumberString()
    @IsNotEmpty()
    "file-size"!: string
}
export class FileGetPresignedUploadHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}

export class FileConfirmUploadHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}
export class FileConfirmUploadBodyDTO {
    @IsNumberString()
    @IsNotEmpty()
    "file-size"!: string

    @IsString()
    @IsNotEmpty()
    "file-key"!: string

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
export class FileDeleteBodyDTO {
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
export class FileDeleteAccessTokenBodyDTO {
    @IsString()
    @IsNotEmpty()
    "token"!: string
}

export class FileSetVisibilityHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}
export class FileSetVisibilityBodyDTO {
    @IsString()
    @IsNotEmpty()
    "file-name"!: string

    @IsBoolean()
    @IsNotEmpty()
    "is_public"!: boolean
}

export class FileStorageInfoHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}