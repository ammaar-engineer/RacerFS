import { IsString } from "class-validator";

export class FileUploadHeadersDTO {
    @IsString()
    "authorization"!: string
    @IsString()
    "access-token"!: string
    @IsString()
    "x-file-name"!: string
}

export class FileUploadQueryDTO {
    @IsString()
    fileName!: string
}

export class FileListHeaderDTO {
    @IsString()
    "authorization"!: string
    @IsString()
    "access-token"!: string
    @IsString()
    "file-name"!: string
}

export class FileEditHeaderDTO {
    @IsString()
    "authorization"!: string
    @IsString()
    "access-token"!: string
}
export class FileEditQueryDTO {
    @IsString()
    fileKey!: string

    @IsString()
    "new-name"!: string
}

export class FileDownloadHeaderDTO {
    @IsString()
    "authorization"!: string
}

export class FileDownloadQueryDTO {
    @IsString()
    fileName!: string

    @IsString()
    userId!: string
}
