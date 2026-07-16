import { IsString } from "class-validator";

export class FileUploadHeadersDTO {
    @IsString()
    "authorization"!: string
}
export class FileUploadQueryDTO {
    @IsString()
    fileName!: string
}

export class FileListHeaderDTO {
    @IsString()
    "authorization"!: string
}
export class FileListQueryDTO {
    @IsString()
    "accessToken"!: string
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
