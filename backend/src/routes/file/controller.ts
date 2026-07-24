import { Body, Controller, Delete, Get, Headers, Patch, Post, Query } from "@nestjs/common";
import { TokenServices } from "src/global_services/token.services";
import { FileServices } from "src/services/file.services";
import { DtoUtilites } from "src/utilities/custom.dto.validator";
import { SuccessResponse } from "src/utilities/Success.Response";
import { FileConfirmUploadBodyDTO, FileConfirmUploadHeaderDTO, FileDeleteAccessTokenBodyDTO, FileDeleteAccessTokenHeaderDTO, FileDeleteBodyDTO, FileDeleteHeadersDTO, FileDownloadHeaderDTO, FileDownloadQueryDTO, FileGenerateAccessTokenHeaderDTO, FileGetPresignedUploadHeaderDTO, FileGetPresignedUploadQueryDTO, FileListHeaderDTO, FileRenameBodyDTO, FileRenameHeaderDTO, FileSetVisibilityBodyDTO, FileSetVisibilityHeaderDTO, FileStorageInfoHeaderDTO } from "src/validation/file.route.dto";
import { FileValidations } from "src/validation/file.validations";
import { TokenValidations } from "src/validation/token.validations";

@Controller("file")
export class FileRouteController {
    constructor(
        private readonly tokenValidations: TokenValidations,
        private readonly fileValidations: FileValidations,
        private readonly fileServices: FileServices,
        private readonly tokenServices: TokenServices,
        private readonly dtoUtilites: DtoUtilites,
    ) {}
    @Get("list")
    async getFileList(
        @Headers() headers: Record<string, string>,
    ) {
        console.log("[GET /file/list] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileListHeaderDTO, headers)
        await this.fileValidations.AccessTokenShouldBe("exist", headerData['access-token'])
        const {isOwner, accountToken_user_id} = await this.tokenValidations.isOwnerAction(
            headerData['authorization'], 
            headerData['access-token'],
            {throwError: false}
        )
        const data = await this.fileServices.getFileList({
            user_id: accountToken_user_id,
            isOwner: isOwner
        })
        return SuccessResponse("File list retrieved successfully", {files: data});
    }

    @Get("download-url")
    async downloadFile(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
    ) {
        console.log("[GET /file/download-url] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileDownloadHeaderDTO, headers)
        const queryData = await this.dtoUtilites.validateSourceDTO(FileDownloadQueryDTO, query)
        const { accountToken_user_id } = await this.tokenValidations.isOwnerAction(
            headerData['authorization'],
            headerData['access-token'],
            { throwError: true }
        )
        const { file_key } = await this.fileServices.getFileByName({
            file_name: queryData['file-name'],
            user_id: accountToken_user_id
        })
        const url = await this.fileServices.getPresignedDownloadUrl(file_key as string)
        return SuccessResponse("Download URL generated successfully", { url });
    }

    @Patch("rename")
    async renameFile(
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, string>,
    ) {
        console.log("[PATCH /file/rename] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileRenameHeaderDTO, headers)
        const bodyData = await this.dtoUtilites.validateSourceDTO(FileRenameBodyDTO, body)
        const { accountToken_user_id } = await this.tokenValidations.isOwnerAction(
            headerData['authorization'],
            headerData['access-token'],
            { throwError: true }
        )
        const { oldName } = await this.fileServices.renameFile({
            file_name: bodyData['file-name'],
            new_name: bodyData['new-name'],
            user_id: accountToken_user_id
        })
        return SuccessResponse(`File ${oldName} has been renamed`);
    }

    @Get("upload-url")
    async getPresignedUploadUrl(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
    ) {
        console.log("[GET /file/get-presigned-upload-url] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileGetPresignedUploadHeaderDTO, headers)
        const queryData = await this.dtoUtilites.validateSourceDTO(FileGetPresignedUploadQueryDTO, query)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        const file_key = crypto.randomUUID()
        const presignedData = await this.fileServices.getPresignedUploadUrl(
            file_key,
            user_id,
            Number(queryData['file-size'])
        )
        await this.fileServices.createUploadSession(user_id, queryData['file-name'], Number(queryData['file-size']), file_key)
        return SuccessResponse("Upload URL generated successfully", presignedData)
    }

    @Post("confirm-upload")
    async confirmUpload(
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, string>,
    ) {
        console.log("[POST /file/confirm-upload] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileConfirmUploadHeaderDTO, headers)
        const bodyData = await this.dtoUtilites.validateSourceDTO(FileConfirmUploadBodyDTO, body)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        const message = await this.fileServices.confirmOption(
            bodyData['status'] as "SUCCESS" | "FAILED",
            bodyData['file-name'],
            bodyData['file-key'] as string,
            user_id,
            Number(bodyData['file-size'])
        )
        return SuccessResponse(message)
    }

    @Post("generate-access-token")
    async generateAccessToken(
        @Headers() headers: Record<string, string>,
    ) {
        console.log("[POST /file/generate-access-token] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileGenerateAccessTokenHeaderDTO, headers)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        const token = await this.tokenServices.generateAccessToken(user_id)
        await this.tokenServices.createAccessToken(user_id, token)
        return SuccessResponse("Access token generated successfully", { access_token: token })
    }

    @Delete("delete-access-token")
    async deleteAccessToken(
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, string>,
    ) {
        console.log("[DELETE /file/delete-access-token] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileDeleteAccessTokenHeaderDTO, headers)
        const bodyData = await this.dtoUtilites.validateSourceDTO(FileDeleteAccessTokenBodyDTO, body)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        await this.tokenServices.deleteAccessToken(bodyData['token'], user_id)
        return SuccessResponse("Access token deleted successfully")
    }

    @Delete("delete")
    async deleteFile(
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, string>,
    ) {
        console.log("[DELETE /file/delete] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileDeleteHeadersDTO, headers)
        const bodyData = await this.dtoUtilites.validateSourceDTO(FileDeleteBodyDTO, body)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        const { file_key } = await this.fileServices.getFileByName({
            file_name: bodyData['file-name'],
            user_id
        })
        await this.fileServices.removeFile(bodyData['file-name'], user_id)
        await this.fileServices.removeObject(file_key as string)
        return SuccessResponse(`File ${bodyData['file-name']} deleted successfully`)
    }

    @Patch("set-visibility")
    async setFileVisibility(
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, any>
    ) {
        console.log("[PATCH /file/set-visibility] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileSetVisibilityHeaderDTO, headers)
        const bodyData = await this.dtoUtilites.validateSourceDTO(FileSetVisibilityBodyDTO, body)
        const {user_id} = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        const result = await this.fileServices.setFileVisibility(
            bodyData['file-name'],
            user_id,
            bodyData['is_public']
        )
        return SuccessResponse(
            `File is now ${result.is_public ? 'public' : 'private'}`,
            result
        )
    }

    @Get("storage-info")
    async getStorageInfo(
        @Headers() headers: Record<string, string>,
    ) {
        console.log("[GET /file/storage-info] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileStorageInfoHeaderDTO, headers)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        const data = await this.fileServices.getStorageInfo(user_id)
        return SuccessResponse("Storage info retrieved successfully", data)
    }
}