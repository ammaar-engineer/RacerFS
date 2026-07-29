import { IsNotEmpty, IsOptional, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

// --- list ---
export class SnippetListHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}

// --- create ---
export class SnippetCreateHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}
export class SnippetCreateBodyDTO {
    @ApiProperty({ example: 'gs', description: 'Short alias to trigger the snippet' })
    @IsString()
    @IsNotEmpty()
    "alias"!: string

    @ApiProperty({ example: 'Shows git status', description: 'Optional description of the snippet', required: false })
    @IsString()
    @IsOptional()
    "description"?: string | null

    @ApiProperty({ example: 'git status', description: 'Command to execute' })
    @IsString()
    @IsNotEmpty()
    "command"!: string
}

// --- delete ---
export class SnippetDeleteHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}
export class SnippetDeleteQueryDTO {
    @ApiProperty({ example: 'gs', description: 'Alias of the snippet to delete' })
    @IsString()
    @IsNotEmpty()
    "alias"!: string
}

// --- edit ---
export class SnippetEditHeaderDTO {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...', description: 'JWT account token' })
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}
export class SnippetEditQueryDTO {
    @ApiProperty({ example: 'gs', description: 'Alias of the snippet to edit' })
    @IsString()
    @IsNotEmpty()
    "alias"!: string
}
export class SnippetEditBodyDTO {
    @ApiProperty({ example: 'git status --short', description: 'New command to replace the existing one' })
    @IsString()
    @IsNotEmpty()
    "command"!: string
}