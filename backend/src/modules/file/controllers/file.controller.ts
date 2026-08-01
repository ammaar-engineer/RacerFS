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
import { AccessTokenAuthGuard } from '../../../middleware/access-token-auth.guard';
import { AccountTokenAuthGuard } from '../../../middleware/account-token-auth.guard';
import { SuccessResponse } from '../../../utilities/success.response';
import {
  ConfirmUploadDto,
  CreateAccessTokenDto,
  DeleteAccessTokenDto,
  DeleteFileDto,
  DownloadFileDto,
  GetPresignedUploadDto,
  RenameFileDto,
  SetVisibilityDto,
} from '../dto';
import { FileOwnerGuard } from '../guards/file-owner.guard';
import { FileService } from '../services/file.service';
import {
  confirmUploadDocs,
  createAccessTokenDocs,
  deleteAccessTokenDocs,
  deleteFileDocs,
  downloadFileDocs,
  listAccessTokensDocs,
  listFilesDocs,
  publicDownloadDocs,
  publicListFilesDocs,
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
  ) {}

  @UseGuards(AccountTokenAuthGuard)
  @ApiDocs(listFilesDocs)
  @Get('list')
  async getFileList(@CurrentToken('user_id') userId: number) {
    const files = await this.fileService.getUserFiles(userId);
    return SuccessResponse('File list retrieved successfully', { files });
  }

  @UseGuards(AccountTokenAuthGuard, FileOwnerGuard)
  @ApiDocs({ ...downloadFileDocs, bodyType: DownloadFileDto })
  @Get('download')
  async downloadFile(
    @CurrentToken('user_id') userId: number,
    @Query() query: DownloadFileDto,
  ) {
    // Get file
    console.log("Sampe masuk endpoint")
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

  @UseGuards(AccountTokenAuthGuard)
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

  @UseGuards(AccountTokenAuthGuard)
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

  @UseGuards(AccountTokenAuthGuard, FileOwnerGuard)
  @ApiDocs({ ...renameFileDocs, bodyType: RenameFileDto })
  @Patch('rename')
  async renameFile(
    @CurrentToken('user_id') userId: number,
    @Body() body: RenameFileDto,
  ) {
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

  @UseGuards(AccountTokenAuthGuard, FileOwnerGuard)
  @ApiDocs({ ...deleteFileDocs, bodyType: DeleteFileDto })
  @Delete('delete')
  async deleteFile(
    @CurrentToken('user_id') userId: number,
    @Body() body: DeleteFileDto,
  ) {
    await this.fileService.deleteFile(userId, body.fileName);

    return SuccessResponse('File deleted successfully');
  }

  @UseGuards(AccountTokenAuthGuard, FileOwnerGuard)
  @ApiDocs({ ...setVisibilityDocs, bodyType: SetVisibilityDto })
  @Patch('set-visibility')
  async setVisibility(
    @CurrentToken('user_id') userId: number,
    @Body() body: SetVisibilityDto,
  ) {
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

  @UseGuards(AccountTokenAuthGuard)
  @ApiDocs(storageInfoDocs)
  @Get('storage-info')
  async getStorageInfo(@CurrentToken('user_id') userId: number) {
    const storageInfo = await this.fileService.getStorageInfo(userId);
    return SuccessResponse('Storage info retrieved successfully', storageInfo);
  }

  // ─── Access Token Endpoints ───────────────────────────────────────────────

  @UseGuards(AccountTokenAuthGuard)
  @ApiDocs({ ...createAccessTokenDocs, bodyType: CreateAccessTokenDto })
  @Post('access-token')
  async createAccessToken(
    @CurrentToken('user_id') userId: number,
    @Body() body: CreateAccessTokenDto,
  ) {
    const {token} = await this.fileService.createAccessToken(userId);

    return SuccessResponse('Access token created successfully', {
      token
    });
  }

  @UseGuards(AccountTokenAuthGuard)
  @ApiDocs({ ...deleteAccessTokenDocs, bodyType: DeleteAccessTokenDto })
  @Delete('access-token')
  async deleteAccessToken(
    @CurrentToken('user_id') userId: number,
    @Body() body: DeleteAccessTokenDto,
  ) {
    await this.fileService.deleteAccessToken(userId, body.token);

    return SuccessResponse('Access token deleted successfully');
  }

  @UseGuards(AccountTokenAuthGuard)
  @ApiDocs(listAccessTokensDocs)
  @Get('access-tokens')
  async listAccessTokens(@CurrentToken('user_id') userId: number) {
    const tokens = await this.fileService.getUserAccessTokens(userId);

    return SuccessResponse('Access tokens retrieved successfully', {
      tokens: tokens.map((t) => t.token),
    });
  }

  @UseGuards(AccessTokenAuthGuard)
  @ApiDocs({ ...publicDownloadDocs, bodyType: DownloadFileDto })
  @Get('public-download')
  async publicDownloadFile(
    @CurrentToken('user_id') userId: number,
    @Query() query: DownloadFileDto,
  ) {
    // Get public file only
    const file = await this.fileService.getPublicFile(query.fileName, userId);

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

  @UseGuards(AccessTokenAuthGuard)
  @ApiDocs(publicListFilesDocs)
  @Get('public-list')
  async getPublicFileList(@CurrentToken('user_id') userId: number) {
    const files = await this.fileService.getPublicFiles(userId);
    return SuccessResponse('Public files retrieved successfully', { files });
  }
}
