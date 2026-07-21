import { Body, Controller, Delete, Get, Headers, Patch, Post, Query, Res } from "@nestjs/common";
import { SuccessResponse } from "src/utilities/Success.Response";
import { FileBridgeModules } from "./bridge.main";
import { FileDbModules } from "./db/db.main";
import { FileRawModules, FileListHeaderDTO, FileRenameHeaderDTO, FileRenameQueryDTO, FileDownloadHeaderDTO, FileDownloadQueryDTO, FileGetPresignedUploadQueryDTO, FileGetPresignedUploadHeaderDTO, FileConfirmUploadHeaderDTO, FileConfirmUploadQueryDTO, FileDeleteHeadersDTO, FileDeleteQueryDTO, FileGenerateAccessTokenHeaderDTO, FileDeleteAccessTokenHeaderDTO, FileDeleteAccessTokenQueryDTO, FileSetVisibilityHeaderDTO, FileSetVisibilityQueryDTO, FileSetVisibilityBodyDTO } from "./raw.main";
import { FileDbinioModules } from "./db/db.minio";
import { PermissionGlobalBridge } from "src/global_bridge/permission.bridge";

@Controller("file")
export class FileRouteController {
    constructor(
        private readonly permissionBridge: PermissionGlobalBridge,
        private readonly bridgeFile: FileBridgeModules,
        private readonly dbFile: FileDbModules,
        private readonly rawFile: FileRawModules,
        private readonly minioFile: FileDbinioModules
    ) {}
    @Get("list")
    async getFileList(
        @Headers() headers: Record<string, string>,
    ) {
        console.log("[GET /file/list] hit")
        const headerData = await this.rawFile.validateSourceDTO(FileListHeaderDTO, headers)
        await this.dbFile.AccessTokenShouldBe("exist", headerData['access-token'])
        const {isOwner, accountToken_user_id} = await this.permissionBridge.isOwnerAction(
            headerData['authorization'], 
            headerData['access-token'],
            {throwError: false}
        )
        const data = await this.dbFile.getFileList({
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
        const headerData = await this.rawFile.validateSourceDTO(FileDownloadHeaderDTO, headers)
        const queryData = await this.rawFile.validateSourceDTO(FileDownloadQueryDTO, query)
        const { accountToken_user_id } = await this.permissionBridge.isOwnerAction(
            headerData['authorization'],
            headerData['access-token'],
            { throwError: true }
        )
        const { file_key } = await this.dbFile.getFileByName({
            file_name: queryData['file-name'],
            user_id: accountToken_user_id
        })
        const url = await this.minioFile.getPresignedDownloadUrl(file_key as string)
        return SuccessResponse("Download URL generated successfully", { url });
    }

    @Patch("rename")
    async editFile(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
    ) {
        console.log("[PATCH /file/rename] hit")
        const headerData = await this.rawFile.validateSourceDTO(FileRenameHeaderDTO, headers)
        const queryData = await this.rawFile.validateSourceDTO(FileRenameQueryDTO, query)
        const { accountToken_user_id } = await this.permissionBridge.isOwnerAction(
            headerData['authorization'],
            headerData['access-token'],
            { throwError: true }
        )
        const { oldName } = await this.dbFile.renameFile({
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
        const queryData = await this.rawFile.validateSourceDTO(FileGetPresignedUploadQueryDTO, query)
        const headerData = await this.rawFile.validateSourceDTO(FileGetPresignedUploadHeaderDTO, headers)
        const {user_id} = this.permissionBridge.isValidAccountToken(headerData['authorization'])
        await this.dbFile.fileShouldBe(
            "notexist", 
            queryData['file-name'], 
            user_id, 
            {throwErr: true}
        )
        const {file_key} = await this.bridgeFile.createUploadSession(
            user_id, 
            queryData['file-name'],
            Number(headerData['file-size'])
        )
        const {url} = await this.minioFile.getPresignedUploadUrl(file_key)
        return SuccessResponse("Upload URL generated successfully", { url, file_key })
    }

    @Post("confirm-upload")
    async confirmUpload(
        @Query() query: Record<string, string>,
        @Headers() headers: Record<string, string>
    ) {
        console.log("[POST /file/confirm-upload] hit")
        const queryData = await this.rawFile.validateSourceDTO(FileConfirmUploadQueryDTO, query)
        const headerData = await this.rawFile.validateSourceDTO(FileConfirmUploadHeaderDTO, headers)
        const {user_id} = this.permissionBridge.isValidAccountToken(headerData['authorization'])
        const message = await this.bridgeFile.confirmOption(
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
        const headerData = await this.rawFile.validateSourceDTO(FileGenerateAccessTokenHeaderDTO, headers)
        console.log("ISI HEADER", headerData['authorization'])
        const {user_id} = this.permissionBridge.isValidAccountToken(headerData['authorization'])
        const token = await this.bridgeFile.generateAccessToken(user_id)
        await this.dbFile.createAccessToken(user_id, token)
        return SuccessResponse("Access token generated successfully", { access_token: token })
    }
    
    @Delete("delete-file")
    async deleteFile(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>
    ) {
        console.log("[DELETE /file/delete-file] hit")
        const headerData = await this.rawFile.validateSourceDTO(FileDeleteHeadersDTO, headers)   
        const queryData = await this.rawFile.validateSourceDTO(FileDeleteQueryDTO, query)
        const {user_id} = this.permissionBridge.isValidAccountToken(headerData['authorization'])
        await this.dbFile.fileShouldBe("exist", queryData['file-name'], user_id, {throwErr: true})
        const {file_key} = await this.dbFile.getFileByName({
            file_name: queryData['file-name'],
            user_id
        })
        await this.minioFile.removeObject(file_key as string)
        await this.dbFile.removeFile(queryData['file-name'], user_id)
        return SuccessResponse(`File ${queryData['file-name']} deleted successfully`)
    }

    @Delete("delete-access-token")
    async deleteAccessToken(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>
    ) {
        console.log("[DELETE /file/delete-access-token] hit")
        const headerData = await this.rawFile.validateSourceDTO(FileDeleteAccessTokenHeaderDTO, headers)
        const queryData = await this.rawFile.validateSourceDTO(FileDeleteAccessTokenQueryDTO, query)
        const {user_id} = this.permissionBridge.isValidAccountToken(headerData['authorization'])
        await this.dbFile.deleteAccessToken(queryData['token'], user_id)
        return SuccessResponse("Access token deleted successfully")
    }

    @Patch("set-visibility")
    async setFileVisibility(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
        @Body() body: Record<string, any>
    ) {
        console.log("[PATCH /file/set-visibility] hit")
        const headerData = await this.rawFile.validateSourceDTO(FileSetVisibilityHeaderDTO, headers)
        const queryData = await this.rawFile.validateSourceDTO(FileSetVisibilityQueryDTO, query)
        const bodyData = await this.rawFile.validateSourceDTO(FileSetVisibilityBodyDTO, body)
        const {user_id} = this.permissionBridge.isValidAccountToken(headerData['authorization'])
        const result = await this.dbFile.setFileVisibility(
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
