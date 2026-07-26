import { IsBoolean, IsIn, IsNotEmpty, IsNumberString, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class FileListHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string   

    @ApiProperty({ example: 'at_abc123', description: 'Access token for shared file access' })
    @IsString()
    @IsNotEmpty()
    "access-token"!: string
}

export class FileRenameHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string   

    @ApiProperty({ example: 'at_abc123', description: 'Access token' })
    @IsString()
    @IsNotEmpty()
    "access-token"!: string
}
export class FileRenameBodyDTO {
    @ApiProperty({ example: 'old-filename.txt', description: 'Current file name' })
    @IsString()
    @IsNotEmpty()
    "file-name"!: string

    @ApiProperty({ example: 'new-filename.txt', description: 'New file name' })
    @IsString()
    @IsNotEmpty()
    "new-name"!: string
}

export class FileDownloadHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string

    @ApiProperty({ example: 'at_abc123', description: 'Access token' })
    @IsString()
    @IsNotEmpty()
    "access-token"!: string
}
export class FileDownloadQueryDTO {
    @ApiProperty({ example: 'photo.png', description: 'Name of the file to download' })
    @IsString()
    @IsNotEmpty()
    "file-name"!: string
}

export class FileGetPresignedUploadQueryDTO {
    @ApiProperty({ example: 'photo.png', description: 'Name of the file to upload' })
    @IsString()
    @IsNotEmpty()
    "file-name"!: string

    @ApiProperty({ example: '204800', description: 'File size in bytes' })
    @IsNumberString()
    @IsNotEmpty()
    "file-size"!: string
}
export class FileGetPresignedUploadHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}

export class FileConfirmUploadHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}
export class FileConfirmUploadBodyDTO {
    @ApiProperty({ example: '204800', description: 'File size in bytes' })
    @IsNumberString()
    @IsNotEmpty()
    "file-size"!: string

    @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'File key returned from upload-url endpoint' })
    @IsString()
    @IsNotEmpty()
    "file-key"!: string

    @ApiProperty({ example: 'SUCCESS', description: 'Upload result status', enum: ['SUCCESS', 'FAILED'] })
    @IsString()
    @IsNotEmpty()
    @IsIn(["SUCCESS", "FAILED"])
    "status"!: string

    @ApiProperty({ example: 'photo.png', description: 'Name of the uploaded file' })
    @IsString()
    @IsNotEmpty()
    "file-name"!: string
}

export class FileDeleteHeadersDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string   
}
export class FileDeleteBodyDTO {
    @ApiProperty({ example: 'photo.png', description: 'Name of the file to delete' })
    @IsString()
    @IsNotEmpty()
    "file-name"!: string
}

export class FileGenerateAccessTokenHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}

export class FileDeleteAccessTokenHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}
export class FileDeleteAccessTokenBodyDTO {
    @ApiProperty({ example: 'at_abc123', description: 'Access token to delete' })
    @IsString()
    @IsNotEmpty()
    "token"!: string
}

export class FileSetVisibilityHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}
export class FileSetVisibilityBodyDTO {
    @ApiProperty({ example: 'photo.png', description: 'Name of the file' })
    @IsString()
    @IsNotEmpty()
    "file-name"!: string

    @ApiProperty({ example: true, description: 'Set file visibility to public (true) or private (false)' })
    @IsBoolean()
    @IsNotEmpty()
    "is_public"!: boolean
}

export class FileStorageInfoHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}