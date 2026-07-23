import { Body, Controller, Delete, Get, Headers, Patch, Post, Query, Res } from "@nestjs/common";
import { SuccessResponse } from "src/utilities/Success.Response";
import { FileServices } from "src/services/file.services";
import { DtoUtilites } from "src/utilities/custom.dto.validator";
import { FileListHeaderDTO, FileRenameHeaderDTO, FileRenameQueryDTO, FileDownloadHeaderDTO, FileDownloadQueryDTO, FileGetPresignedUploadQueryDTO, FileGetPresignedUploadHeaderDTO, FileConfirmUploadHeaderDTO, FileConfirmUploadQueryDTO, FileDeleteHeadersDTO, FileDeleteQueryDTO, FileGenerateAccessTokenHeaderDTO, FileDeleteAccessTokenHeaderDTO, FileDeleteAccessTokenQueryDTO, FileSetVisibilityHeaderDTO, FileSetVisibilityQueryDTO, FileSetVisibilityBodyDTO } from "src/validation/file.route.dto";
import { TokenServices } from "src/services/token.services";

@Controller("file")
export class FileRouteController {
    constructor(
        private readonly tokenServices: TokenServices,
        private readonly fileServices: FileServices,
        private readonly dtoUtilites: DtoUtilites,
    ) {}
    @Get("list")
    async getFileList(
        @Headers() headers: Record<string, string>,
    ) {
        console.log("[GET /file/list] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileListHeaderDTO, headers)
        await this.fileServices.AccessTokenShouldBe("exist", headerData['access-token'])
        const {isOwner, accountToken_user_id} = await this.tokenServices.isOwnerAction(
            headerData['authorization'], 
            headerData['access-token'],
            {throwError: false}
        )
        const data = await this.fileServices.getFileList({
            user_id: accountToken_user_id,
            isOwner: isOwner
        })
        // Return
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
        const { accountToken_user_id } = await this.tokenServices.isOwnerAction(
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
    async editFile(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
    ) {
        console.log("[PATCH /file/rename] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileRenameHeaderDTO, headers)
        const queryData = await this.dtoUtilites.validateSourceDTO(FileRenameQueryDTO, query)
        const { accountToken_user_id } = await this.tokenServices.isOwnerAction(
            headerData['authorization'],
            headerData['access-token'],
            { throwError: true }
        )
        const { oldName } = await this.fileServices.renameFile({
            file_name: queryData['file-name'],
            new_name: queryData['new-name'],
            user_id: accountToken_user_id
        })
        return SuccessResponse(`File ${oldName} has been renamed`);
    }

    @Get("upload-url")
    async getUploadUrl(
        @Query() query: Record<string, string>,
        @Headers() headers: Record<string, string>
    ) {
        console.log("[GET /file/upload-url] hit")
        const queryData = await this.dtoUtilites.validateSourceDTO(FileGetPresignedUploadQueryDTO, query)
        const headerData = await this.dtoUtilites.validateSourceDTO(FileGetPresignedUploadHeaderDTO, headers)
        const {user_id} = this.tokenServices.isValidAccountToken(headerData['authorization'])
        await this.fileServices.fileShouldBe(
            "notexist", 
            queryData['file-name'], 
            user_id, 
            {throwErr: true}
        )
        
        const {file_key} = await this.fileServices.createUploadSession(
            user_id, 
            queryData['file-name'],
            Number(headerData['file-size'])
        )
        const presignedData = await this.fileServices.getPresignedUploadUrl(
            file_key, 
            user_id, 
            Number(headerData['file-size'])
        )
        return SuccessResponse("Upload URL generated successfully", presignedData)
    }

    @Post("confirm-upload")
    async confirmUpload(
        @Query() query: Record<string, string>,
        @Headers() headers: Record<string, string>
    ) {
        console.log("[POST /file/confirm-upload] hit")
        const queryData = await this.dtoUtilites.validateSourceDTO(FileConfirmUploadQueryDTO, query)
        const headerData = await this.dtoUtilites.validateSourceDTO(FileConfirmUploadHeaderDTO, headers)
        const {user_id} = this.tokenServices.isValidAccountToken(headerData['authorization'])
        const message = await this.fileServices.confirmOption(
            queryData['status'] as "SUCCESS" | "FAILED",
            queryData['file-name'],
            headerData['file-key'],
            user_id,
            Number(headerData['file-size'])
        )
        return SuccessResponse(message)
    }

    @Post("generate-access-token")
    async generatePermissionKey(
        @Headers() headers: Record<string, string>
    ) {
        console.log("[POST /file/generate-access-token] hit")
        console.log(headers['authorization'])
        const headerData = await this.dtoUtilites.validateSourceDTO(FileGenerateAccessTokenHeaderDTO, headers)
        console.log("ISI HEADER", headerData['authorization'])
        const {user_id} = this.tokenServices.isValidAccountToken(headerData['authorization'])
        const token = await this.fileServices.generateAccessToken(user_id)
        await this.fileServices.createAccessToken(user_id, token)
        return SuccessResponse("Access token generated successfully", { access_token: token })
    }
    
    @Delete("delete-file")
    async deleteFile(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>
    ) {
        console.log("[DELETE /file/delete-file] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileDeleteHeadersDTO, headers)   
        const queryData = await this.dtoUtilites.validateSourceDTO(FileDeleteQueryDTO, query)
        const {user_id} = this.tokenServices.isValidAccountToken(headerData['authorization'])
        await this.fileServices.fileShouldBe("exist", queryData['file-name'], user_id, {throwErr: true})
        const {file_key} = await this.fileServices.getFileByName({
            file_name: queryData['file-name'],
            user_id
        })
        await this.fileServices.removeObject(file_key as string)
        await this.fileServices.removeFile(queryData['file-name'], user_id)
        return SuccessResponse(`File ${queryData['file-name']} deleted successfully`)
    }

    @Delete("delete-access-token")
    async deleteAccessToken(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>
    ) {
        console.log("[DELETE /file/delete-access-token] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileDeleteAccessTokenHeaderDTO, headers)
        const queryData = await this.dtoUtilites.validateSourceDTO(FileDeleteAccessTokenQueryDTO, query)
        const {user_id} = this.tokenServices.isValidAccountToken(headerData['authorization'])
        await this.fileServices.deleteAccessToken(queryData['token'], user_id)
        return SuccessResponse("Access token deleted successfully")
    }

    @Patch("set-visibility")
    async setFileVisibility(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
        @Body() body: Record<string, any>
    ) {
        console.log("[PATCH /file/set-visibility] hit")
        const headerData = await this.dtoUtilites.validateSourceDTO(FileSetVisibilityHeaderDTO, headers)
        const queryData = await this.dtoUtilites.validateSourceDTO(FileSetVisibilityQueryDTO, query)
        const bodyData = await this.dtoUtilites.validateSourceDTO(FileSetVisibilityBodyDTO, body)
        const {user_id} = this.tokenServices.isValidAccountToken(headerData['authorization'])
        const result = await this.fileServices.setFileVisibility(
            queryData['file-name'],
            user_id,
            bodyData['is_public']
        )
        return SuccessResponse(
            `File is now ${result.is_public ? 'public' : 'private'}`,
            result
        )
    }
}
