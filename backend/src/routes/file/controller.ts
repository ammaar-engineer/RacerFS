import { Body, Controller, Delete, Get, Headers, Patch, Post, Query } from "@nestjs/common";
import { ApiBody, ApiHeader, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TokenServices } from "src/global_services/token.services";
import { FileServices } from "src/services/file.services";
import { DtoUtilites } from "src/utilities/custom.dto.validator";
import { SuccessResponse } from "src/utilities/Success.Response";
import { FileConfirmUploadBodyDTO, FileConfirmUploadHeaderDTO, FileDeleteAccessTokenBodyDTO, FileDeleteAccessTokenHeaderDTO, FileDeleteBodyDTO, FileDeleteHeadersDTO, FileDownloadHeaderDTO, FileDownloadQueryDTO, FileGenerateAccessTokenHeaderDTO, FileGetPresignedUploadHeaderDTO, FileGetPresignedUploadQueryDTO, FileListHeaderDTO, FileRenameBodyDTO, FileRenameHeaderDTO, FileSetVisibilityBodyDTO, FileSetVisibilityHeaderDTO, FileStorageInfoHeaderDTO } from "src/validation/file.route.dto";
import { FileValidations } from "src/validation/file.validations";
import { TokenValidations } from "src/validation/token.validations";

@ApiTags('file')
@Controller("file")
export class FileRouteController {
    constructor(
        private readonly tokenValidations: TokenValidations,
        private readonly fileValidations: FileValidations,
        private readonly fileServices: FileServices,
        private readonly tokenServices: TokenServices,
        private readonly dtoUtilites: DtoUtilites,
    ) {}

    @ApiOperation({ summary: 'Get file list' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiHeader({ name: 'access-token', description: 'Access token for shared file access', required: true })
    @ApiResponse({
        status: 200,
        description: 'File list retrieved successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'File list retrieved successfully',
                errorCode: '',
                data: {
                    files: [
                        {
                            id: 1,
                            name: 'photo.png',
                            size: 204800,
                            is_public: false,
                            file_key: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                            uploaded_at: '2026-01-01T00:00:00.000Z',
                            user_id: 1
                        }
                    ]
                }
            }
        }
    })
    @Get("list")
    async getFileList(
        @Headers() headers: Record<string, string>,
    ) {
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

    @ApiOperation({ summary: 'Get presigned download URL for a file' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiHeader({ name: 'access-token', description: 'Access token', required: true })
    @ApiQuery({ name: 'file-name', description: 'Name of the file to download', example: 'photo.png' })
    @ApiResponse({
        status: 200,
        description: 'Download URL generated successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'Download URL generated successfully',
                errorCode: '',
                data: { url: 'https://s3.amazonaws.com/bucket/file-key?X-Amz-Signature=...' }
            }
        }
    })
    @Get("download-url")
    async downloadFile(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
    ) {
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

    @ApiOperation({ summary: 'Rename a file' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiHeader({ name: 'access-token', description: 'Access token', required: true })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file-name', 'new-name'],
            properties: {
                'file-name': { type: 'string', example: 'old-filename.txt', description: 'Current file name' },
                'new-name': { type: 'string', example: 'new-filename.txt', description: 'New file name' }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'File renamed successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'File old-filename.txt has been renamed',
                errorCode: '',
                data: null
            }
        }
    })
    @Patch("rename")
    async renameFile(
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, string>,
    ) {
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

    @ApiOperation({ summary: 'Get presigned upload URL for a file' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiQuery({ name: 'file-name', description: 'Name of the file to upload', example: 'photo.png' })
    @ApiQuery({ name: 'file-size', description: 'File size in bytes', example: '204800' })
    @ApiResponse({
        status: 200,
        description: 'Upload URL generated successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'Upload URL generated successfully',
                errorCode: '',
                data: {
                    url: 'https://minio.example.com/racerfs-bucket',
                    formData: {
                        key: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        policy: 'eyJleHBpcmF0aW9uIjoiMjAyNi0wMS0wMVQwMTowMDowMC4wMDBaIiwiY29uZGl0aW9ucyI6W1siZXEiLCIka2V5IiwiYTFiMmMzZDQtZTVmNi03ODkwLWFiY2QtZWYxMjM0NTY3ODkwIl1dfQ==',
                        'x-amz-algorithm': 'AWS4-HMAC-SHA256',
                        'x-amz-credential': 'minioadmin/20260101/us-east-1/s3/aws4_request',
                        'x-amz-date': '20260101T000000Z',
                        'x-amz-signature': '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
                    },
                    file_key: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
                }
            }
        }
    })
    @Get("upload-url")
    async getPresignedUploadUrl(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
    ) {
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

    @ApiOperation({ summary: 'Confirm file upload status' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file-name', 'file-key', 'file-size', 'status'],
            properties: {
                'file-name': { type: 'string', example: 'photo.png', description: 'Name of the uploaded file' },
                'file-key': { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'File key returned from upload-url endpoint' },
                'file-size': { type: 'string', example: '204800', description: 'File size in bytes' },
                'status': { type: 'string', example: 'SUCCESS', enum: ['SUCCESS', 'FAILED'], description: 'Upload result status' }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Upload confirmed successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'File uploaded successfully',
                errorCode: '',
                data: null
            }
        }
    })
    @Post("confirm-upload")
    async confirmUpload(
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, string>,
    ) {
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

    @ApiOperation({ summary: 'Generate a new access token' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiResponse({
        status: 200,
        description: 'Access token generated successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'Access token generated successfully',
                errorCode: '',
                data: { access_token: 'at_abc123xyz...' }
            }
        }
    })
    @Post("generate-access-token")
    async generateAccessToken(
        @Headers() headers: Record<string, string>,
    ) {
        const headerData = await this.dtoUtilites.validateSourceDTO(FileGenerateAccessTokenHeaderDTO, headers)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        const token = await this.tokenServices.generateAccessToken(user_id)
        await this.tokenServices.createAccessToken(user_id, token)
        return SuccessResponse("Access token generated successfully", { access_token: token })
    }

    @ApiOperation({ summary: 'Delete an access token' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['token'],
            properties: {
                'token': { type: 'string', example: 'at_abc123xyz...', description: 'Access token to delete' }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Access token deleted successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'Access token deleted successfully',
                errorCode: '',
                data: null
            }
        }
    })
    @Delete("delete-access-token")
    async deleteAccessToken(
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, string>,
    ) {
        const headerData = await this.dtoUtilites.validateSourceDTO(FileDeleteAccessTokenHeaderDTO, headers)
        const bodyData = await this.dtoUtilites.validateSourceDTO(FileDeleteAccessTokenBodyDTO, body)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        await this.tokenServices.deleteAccessToken(bodyData['token'], user_id)
        return SuccessResponse("Access token deleted successfully")
    }

    @ApiOperation({ summary: 'Delete a file' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiResponse({
        status: 200,
        description: 'File deleted successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'File photo.png deleted successfully',
                errorCode: '',
                data: null
            }
        }
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file-name'],
            properties: {
                'file-name': {
                    type: 'string',
                    example: 'photo.png',
                    description: 'Name of the file to delete'
                }
            }
        }
    })
    @Delete("delete")
    async deleteFile(
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, string>,
    ) {
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

    @ApiOperation({ summary: 'Set file visibility' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file-name', 'is_public'],
            properties: {
                'file-name': { type: 'string', example: 'photo.png', description: 'Name of the file' },
                'is_public': { type: 'boolean', example: true, description: 'Set to true for public, false for private' }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'File visibility updated',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'File is now public',
                errorCode: '',
                data: {
                    id: 1,
                    name: 'photo.png',
                    size: 204800,
                    is_public: true,
                    file_key: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    uploaded_at: '2026-01-01T00:00:00.000Z',
                    user_id: 1
                }
            }
        }
    })
    @Patch("set-visibility")
    async setFileVisibility(
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, any>
    ) {
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

    @ApiOperation({ summary: 'Get storage usage info' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiResponse({
        status: 200,
        description: 'Storage info retrieved successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'Storage info retrieved successfully',
                errorCode: '',
                data: {
                    used: 1048576,
                    total: 5368709120,
                    file_count: 10
                }
            }
        }
    })
    @Get("storage-info")
    async getStorageInfo(
        @Headers() headers: Record<string, string>,
    ) {
        const headerData = await this.dtoUtilites.validateSourceDTO(FileStorageInfoHeaderDTO, headers)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        const data = await this.fileServices.getStorageInfo(user_id)
        return SuccessResponse("Storage info retrieved successfully", data)
    }
}