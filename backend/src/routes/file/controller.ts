import { Controller, Get, Headers, Patch, Post } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { FileUploadHeadersDTO } from "./dto";
import { validateOrReject } from "class-validator";

@Controller("file")
export class FileRouteController {
    @Get("list")
    async getFileList() {}

    @Get("download")
    async downloadFile() {}

    @Patch("edit")
    async editFile() {}

    @Post("upload")
    async uploadFile(
        @Headers() headers: Record<string, string>
    ) {
        // Headers validation
        const headerDto = plainToInstance(FileUploadHeadersDTO, headers, {
            excludeExtraneousValues: false
        })
        await validateOrReject(headerDto)
        // Headers data
        const fileName = headerDto['x-file-name']
        
    }
}