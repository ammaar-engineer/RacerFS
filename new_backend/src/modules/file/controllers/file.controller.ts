import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiDocs } from '../../../decorators/api-docs.decorator';
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
import { FileValidation } from '../validations/file.validation';
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
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly tokenValidation: TokenValidation,
    private readonly fileValidation: FileValidation,
  ) {}

  @ApiDocs(listFilesDocs)
  @Get('list')
  async getFileList(@Headers('authorization') authToken: string) {
    const { user_id } = this.tokenValidation.isValidAccountToken(authToken);
    const files = await this.fileService.getUserFiles(user_id);
    return SuccessResponse('File list retrieved successfully', { files });
  }

  @ApiDocs({ ...downloadFileDocs, bodyType: DownloadFileDto })
  @Get('download')
  async downloadFile(
    @Headers('authorization') authToken: string,
    @Query() query: DownloadFileDto,
  ) {
    const { user_id } = this.tokenValidation.isValidAccountToken(authToken);

    // Verify ownership
    await this.tokenValidation.isOwnerAction(user_id, query.fileName);

    // Get file
    const file = await this.fileService.getFile(query.fileName, user_id);

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
    @Headers('authorization') authToken: string,
    @Query() query: GetPresignedUploadDto,
  ) {
    const { user_id } = this.tokenValidation.isValidAccountToken(authToken);

    const uploadData = await this.fileService.getPresignedUploadUrl(
      user_id,
      query.fileName,
      query.fileSize,
    );

    return SuccessResponse('Upload URL generated', uploadData);
  }

  @ApiDocs({ ...confirmUploadDocs, bodyType: ConfirmUploadDto })
  @Post('confirm-upload')
  async confirmUpload(
    @Headers('authorization') authToken: string,
    @Body() body: ConfirmUploadDto,
  ) {
    const { user_id } = this.tokenValidation.isValidAccountToken(authToken);

    const file = await this.fileService.confirmUpload(
      body.status,
      body.fileName,
      body.fileKey,
      user_id,
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
    @Headers('authorization') authToken: string,
    @Body() body: RenameFileDto,
  ) {
    const { user_id } = this.tokenValidation.isValidAccountToken(authToken);

    // Verify ownership
    await this.tokenValidation.isOwnerAction(user_id, body.fileName);

    const file = await this.fileService.renameFile(
      user_id,
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
    @Headers('authorization') authToken: string,
    @Body() body: DeleteFileDto,
  ) {
    const { user_id } = this.tokenValidation.isValidAccountToken(authToken);

    // Verify ownership
    await this.tokenValidation.isOwnerAction(user_id, body.fileName);

    await this.fileService.deleteFile(user_id, body.fileName);

    return SuccessResponse('File deleted successfully');
  }

  @ApiDocs({ ...setVisibilityDocs, bodyType: SetVisibilityDto })
  @Patch('set-visibility')
  async setVisibility(
    @Headers('authorization') authToken: string,
    @Body() body: SetVisibilityDto,
  ) {
    const { user_id } = this.tokenValidation.isValidAccountToken(authToken);

    // Verify ownership
    await this.tokenValidation.isOwnerAction(user_id, body.fileName);

    const file = await this.fileService.setFileVisibility(
      user_id,
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
  async getStorageInfo(@Headers('authorization') authToken: string) {
    const { user_id } = this.tokenValidation.isValidAccountToken(authToken);
    const storageInfo = await this.fileService.getStorageInfo(user_id);
    return SuccessResponse('Storage info retrieved successfully', storageInfo);
  }
}
