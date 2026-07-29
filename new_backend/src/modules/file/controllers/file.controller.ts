import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiDocs } from '../../../decorators/api-docs.decorator';
import { CurrentToken } from '../../../decorators/current-token.decorator';
import { AccountTokenAuthGuard } from '../../../middleware/account-token-auth.guard';
import { SuccessResponse } from '../../../utilities/success.response';
import {
  ConfirmUploadDto,
  DeleteFileDto,
  DownloadFileDto,
  GetPresignedUploadDto,
  RenameFileDto,
  SetVisibilityDto,
} from '../dto';
import { FileService } from '../services/file.service';
import { TokenValidation } from '../validations/token.validation';
import {
  confirmUploadDocs,
  deleteFileDocs,
  downloadFileDocs,
  listFilesDocs,
  renameFileDocs,
  setVisibilityDocs,
  storageInfoDocs,
  uploadUrlDocs,
} from './docs';

@ApiTags('file')
@Controller('file')
@UseGuards(AccountTokenAuthGuard) // ✅ Apply account token authentication to all endpoints
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly tokenValidation: TokenValidation,
  ) {}

  @ApiDocs(listFilesDocs)
  @Get('list')
  async getFileList(@CurrentToken('user_id') userId: number) {
    const files = await this.fileService.getUserFiles(userId);
    return SuccessResponse('File list retrieved successfully', { files });
  }

  @ApiDocs({ ...downloadFileDocs, bodyType: DownloadFileDto })
  @Get('download')
  async downloadFile(
    @CurrentToken('user_id') userId: number,
    @Query() query: DownloadFileDto,
  ) {
    // Verify ownership
    await this.tokenValidation.isOwnerAction(userId, query.fileName);

    // Get file
    const file = await this.fileService.getFile(query.fileName, userId);

    // Get presigned download URL
    const downloadUrl = await this.fileService.getPresignedDownloadUrl(
      file.file_key,
    );

    return SuccessResponse('Download URL generated', {
      url: downloadUrl,
      file: {
        name: file.name,
        size: file.size,
        type: file.file_type,
      },
    });
  }

  @ApiDocs({ ...uploadUrlDocs, bodyType: GetPresignedUploadDto })
  @Get('upload-url')
  async getPresignedUploadUrl(
    @CurrentToken('user_id') userId: number,
    @Query() query: GetPresignedUploadDto,
  ) {
    const uploadData = await this.fileService.getPresignedUploadUrl(
      userId,
      query.fileName,
      query.fileSize,
    );

    return SuccessResponse('Upload URL generated', uploadData);
  }

  @ApiDocs({ ...confirmUploadDocs, bodyType: ConfirmUploadDto })
  @Post('confirm-upload')
  async confirmUpload(
    @CurrentToken('user_id') userId: number,
    @Body() body: ConfirmUploadDto,
  ) {
    const file = await this.fileService.confirmUpload(
      body.status,
      body.fileName,
      body.fileKey,
      userId,
      body.fileSize,
    );

    if (body.status === 'SUCCESS' && file) {
      return SuccessResponse('File uploaded successfully', {
        file: {
          id: file.id,
          name: file.name,
          size: file.size,
          file_type: file.file_type,
          file_key: file.file_key,
        },
      });
    } else {
      return SuccessResponse('Upload cancelled');
    }
  }

  @ApiDocs({ ...renameFileDocs, bodyType: RenameFileDto })
  @Patch('rename')
  async renameFile(
    @CurrentToken('user_id') userId: number,
    @Body() body: RenameFileDto,
  ) {
    // Verify ownership
    await this.tokenValidation.isOwnerAction(userId, body.fileName);

    const file = await this.fileService.renameFile(
      userId,
      body.fileName,
      body.newName,
    );

    return SuccessResponse('File renamed successfully', {
      file: {
        id: file.id,
        name: file.name,
        size: file.size,
      },
    });
  }

  @ApiDocs({ ...deleteFileDocs, bodyType: DeleteFileDto })
  @Delete('delete')
  async deleteFile(
    @CurrentToken('user_id') userId: number,
    @Body() body: DeleteFileDto,
  ) {
    // Verify ownership
    await this.tokenValidation.isOwnerAction(userId, body.fileName);

    await this.fileService.deleteFile(userId, body.fileName);

    return SuccessResponse('File deleted successfully');
  }

  @ApiDocs({ ...setVisibilityDocs, bodyType: SetVisibilityDto })
  @Patch('set-visibility')
  async setVisibility(
    @CurrentToken('user_id') userId: number,
    @Body() body: SetVisibilityDto,
  ) {
    // Verify ownership
    await this.tokenValidation.isOwnerAction(userId, body.fileName);

    const file = await this.fileService.setFileVisibility(
      userId,
      body.fileName,
      body.isPublic,
    );

    return SuccessResponse('File visibility updated', {
      file: {
        id: file.id,
        name: file.name,
        is_public: file.is_public,
      },
    });
  }

  @ApiDocs(storageInfoDocs)
  @Get('storage-info')
  async getStorageInfo(@CurrentToken('user_id') userId: number) {
    const storageInfo = await this.fileService.getStorageInfo(userId);
    return SuccessResponse('Storage info retrieved successfully', storageInfo);
  }
}
