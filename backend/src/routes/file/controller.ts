import { Controller, Get, Headers, Patch, Post, Query, Res } from "@nestjs/common";
import { SuccessResponse } from "src/utilities/Success.Response";
import { FileBridgeModules } from "./main.bridge";
import { FileDbModules } from "./db/db";
import { FileRawModules, FileListHeaderDTO, FileRenameHeaderDTO, FileRenameQueryDTO, FileDownloadHeaderDTO, FileDownloadQueryDTO, FileGetPresignedUploadQueryDTO, FileGetPresignedUploadHeaderDTO, FileConfirmUploadHeaderDTO, FileConfirmUploadQueryDTO } from "./raw";
import { FileDbinioModules } from "./db/db.minio";

@Controller("file")
export class FileRouteController {
    constructor(
        private readonly bridgeFile: FileBridgeModules,
        private readonly dbFile: FileDbModules,
        private readonly rawFile: FileRawModules,
        private readonly minioFile: FileDbinioModules
    ) {}
    @Get("list")
    async getFileList(
        @Headers() headers: Record<string, string>,
    ) {
        const headerData = await this.rawFile.validateSourceDTO(FileListHeaderDTO, headers)

        const {isOwner, user_id} = await this.bridgeFile.isOwnerAction(
            headerData['authorization'], 
            headerData['access-token'],
            {throwError: false}
        )
        const data = await this.dbFile.getFileList({
            user_id: user_id,
            is_public: isOwner
        })
        // Return
        return SuccessResponse("File list retrieved successfully", {files: data});
    }

    @Get("download-url")
    async downloadFile(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
    ) {
        const headerData = await this.rawFile.validateSourceDTO(FileDownloadHeaderDTO, headers)
        const queryData = await this.rawFile.validateSourceDTO(FileDownloadQueryDTO, query)
        const { user_id } = await this.bridgeFile.isOwnerAction(
            headerData['authorization'],
            headerData['access-token'],
            { throwError: true }
        )
        const { file_key } = await this.dbFile.getFileByKey({
            file_key: queryData['file-key'],
            user_id
        })
        const url = await this.minioFile.getPresignedDownloadUrl(file_key)
        return SuccessResponse("Download URL generated successfully", { url });
    }

    @Patch("rename")
    async editFile(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
    ) {
        const headerData = await this.rawFile.validateSourceDTO(FileRenameHeaderDTO, headers)
        const queryData = await this.rawFile.validateSourceDTO(FileRenameQueryDTO, query)
        const { user_id } = await this.bridgeFile.isOwnerAction(
            headerData['authorization'],
            headerData['access-token'],
            { throwError: true }
        )
        const { oldName } = await this.dbFile.renameFile({
            file_name: queryData['file-name'],
            new_name: queryData['new-name'],
            user_id
        })
        return SuccessResponse(`File ${oldName} has been renamed`);
    }

    @Get("upload-url")
    async getUploadUrl(
        @Query() query: Record<string, string>,
        @Headers() headers: Record<string, string>
    ) {
        const queryData = await this.rawFile.validateSourceDTO(FileGetPresignedUploadQueryDTO, query)
        const headerData = await this.rawFile.validateSourceDTO(FileGetPresignedUploadHeaderDTO, headers)
        const {user_id} = this.bridgeFile.isValidAccountToken(headerData['authorization'])
        await this.dbFile.fileShouldBe("notexist", queryData['file-name'], user_id, {throwErr: true})
        const {file_key} = await this.bridgeFile.createUploadSession(user_id, queryData['file-name'])
        const url = await this.minioFile.getPresignedUploadUrl(file_key)
        return SuccessResponse("Upload URL generated successfully", { url, file_key })
    }

    @Post("confirm-upload")
    async confirmUpload(
        @Query() query: Record<string, string>,
        @Headers() headers: Record<string, string>
    ) {
        const queryData = await this.rawFile.validateSourceDTO(FileConfirmUploadQueryDTO, query)
        const headerData = await this.rawFile.validateSourceDTO(FileConfirmUploadHeaderDTO, headers)
        const {user_id} = this.bridgeFile.isValidAccountToken(headerData['authorization'])
        const message = await this.bridgeFile.confirmOption(
            queryData['status'] as "SUCCESS" | "FAILED",
            queryData['file-name'],
            headerData['file-key'],
            user_id,
            Number(headerData['file-size'])
        )
        return SuccessResponse(message)
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
