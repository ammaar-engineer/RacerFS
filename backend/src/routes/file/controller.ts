import { Controller, Get, Headers, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { FileDownloadHeaderDTO, FileListHeaderDTO, FileUploadHeadersDTO, FileUploadQueryDTO } from "./dto";
import { validateOrReject } from "class-validator";
import { FileRouteService } from "./service";
import type { Request, Response } from "express";
import { SuccessResponse } from "src/utilities/Success.Response";
import { JwtService } from "src/global_services/jwt.module";

@Controller("file")
export class FileRouteController {
    constructor(
        private readonly fileServices: FileRouteService,
        private readonly jwtService: JwtService
    ) {}
    @Get("list")
    async getFileList(
        @Headers() headers: Record<string, string>
    ) {
        // Validate headers and data
        const headerPto = plainToInstance(FileListHeaderDTO, headers, {
            excludeExtraneousValues: false
        })
        await validateOrReject(headerPto)
        const token = headerPto['authorization']
        // Jwt
        const {userId} = this.jwtService.verifyJwt<{userId: number}>(token)
        // Service
        const fileList = await this.fileServices.getUserFileList(userId)
        // Return
        return SuccessResponse("File list retrieved successfully", fileList)
    }

    @Get("download")
    async downloadFile(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
        @Res() res: Response
    ) {
    }

    @Patch("edit")
    async editFile() {}

    @Post("upload")
    async uploadFile(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
        @Req() req: Request
    ) {
        // Headers validation and data
        const headerDto = plainToInstance(FileUploadHeadersDTO, headers, {
            excludeExtraneousValues: false
        })
        await validateOrReject(headerDto)
        const token = headerDto['authorization']
        // Query validation and data
        const queryDto = plainToInstance(FileUploadQueryDTO, query, {
            excludeExtraneousValues: false
        })
        await validateOrReject(queryDto)
        const fileName = queryDto.fileName
        // Jwt
        const jwtValue = this.jwtService.verifyJwt<{userId: number}>(token)
        // service
        await this.fileServices.uploadFile(req, fileName, jwtValue.userId)
        // end
        return SuccessResponse(`File ${fileName} has been uploaded`)
    }

    @Post("generate-permission")
    async generatePermissionKey() {}
}
