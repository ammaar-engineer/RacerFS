import { IsString } from "class-validator";

export class FileUploadHeadersDTO {
    @IsString()
    "x-file-name"!: string
}