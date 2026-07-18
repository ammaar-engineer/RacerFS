import { Controller, Get, Headers, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { FileRouteService } from "./service";
import type { Request, Response } from "express";
import { SuccessResponse } from "src/utilities/Success.Response";
import { HttpValidation } from "./http_validation";

@Controller("file")
export class FileRouteController {
    constructor(
        private readonly fileServices: FileRouteService,
        private readonly httpValidation: HttpValidation
    ) {}
    @Get("list")
    async getFileList(
        @Headers() headers: Record<string, string>,
    ) {
        // Validate request
        const { userId, accessTokenOwnerId } = await this.httpValidation.validateFileListRequest(headers);

        // Service
        const fileList = await this.fileServices.getUserFileList(userId, accessTokenOwnerId);
        
        // Return
        return SuccessResponse("File list retrieved successfully", fileList);
    }

    @Get("download")
    async downloadFile(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
        @Res() res: Response
    ) {

    }

    @Patch("rename")
    async editFile(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
    ) {
        // Validate request
        const { fileKey, newName } = await this.httpValidation.validateFileRenameRequest(headers, query);

        // Service
        const editFile = await this.fileServices.renameFile(fileKey, newName);

        // Return
        return SuccessResponse(`File ${editFile.oldName} has been renamed`);
    }

    // @Post("upload")
    // async uploadFile(
    //     @Headers() headers: Record<string, string>,
    //     @Req() req: Request
    // ) {
    //     // Validate headers
    //     const { accountTokenData, accessTokenData } = await this.fileRouteValidation.validateDualTokenHeaders(
    //         headers,
    //         FileUploadHeadersDTO
    //     )
    //     const fileName = (await this.fileRouteValidation.customDtoValidation(FileUploadHeadersDTO, headers))["x-file-name"]
        
    //     // Service
    //     await this.fileServices.uploadFile(req, fileName, 4)
        
    //     // Return
    //     return SuccessResponse(`File ${fileName} has been uploaded`)
    // }

    @Post("generate-access-token")
    async generatePermissionKey() {}
}
