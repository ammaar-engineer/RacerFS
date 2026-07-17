import { Controller, Get, Headers, Param, Patch, Post, Query, Req, Res } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { FileListHeaderDTO, FileUploadHeadersDTO, FileUploadQueryDTO, FileEditHeaderDTO, FileEditQueryDTO } from "./dto";
import { validateOrReject } from "class-validator";
import { FileRouteService } from "./service";
import type { Request, Response } from "express";
import { SuccessResponse } from "src/utilities/Success.Response";
import { JwtService } from "src/global_services/jwt.module";
import { FileRouteValidations } from "./validation";
import { InjectRepository } from "@nestjs/typeorm";
import { Token } from "src/entity";
import { Repository } from "typeorm";

@Controller("file")
export class FileRouteController {
    constructor(
        private readonly fileServices: FileRouteService,
        private readonly jwtService: JwtService,
        private readonly fileRouteValidation: FileRouteValidations,
        @InjectRepository(Token) private readonly tokenRepo: Repository<Token>,
    ) {}
    @Get("list")
    async getFileList(
        @Headers() headers: Record<string, string>,
    ) {
        // Validate headers
        const { accountTokenData, accessTokenData, accessTokenOwner } = await this.fileRouteValidation.validateDualTokenHeaders(
            headers,
            FileListHeaderDTO,
            {validateOwner: true}
        )

        // Service
        const fileList = await this.fileServices.getUserFileList(accountTokenData.value.user_id, accessTokenOwner.user_id)
        
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
    async editFile(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
    ) {
        // Validate headers and validate token
        const { accessTokenData, accountTokenData } = await this.fileRouteValidation.validateDualTokenHeaders(
            headers,
            FileEditHeaderDTO,
            { validateOwner: true }
        )
        // Query validation
        const queryDto = (await this.fileRouteValidation.customDtoValidation(FileEditQueryDTO, query))
        // Service

        // Return
        return SuccessResponse(`File with ID ${queryDto.fileId} has been updated`)
    }

    @Post("upload")
    async uploadFile(
        @Headers() headers: Record<string, string>,
        @Req() req: Request
    ) {
        // Validate headers
        const { accountTokenData, accessTokenData } = await this.fileRouteValidation.validateDualTokenHeaders(
            headers,
            FileUploadHeadersDTO
        )
        const fileName = (await this.fileRouteValidation.customDtoValidation(FileUploadHeadersDTO, headers))["x-file-name"]
        
        // Service
        await this.fileServices.uploadFile(req, fileName, 4)
        
        // Return
        return SuccessResponse(`File ${fileName} has been uploaded`)
    }

    @Post("generate-access-token")
    async generatePermissionKey() {}
}
