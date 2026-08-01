import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import crypto from 'crypto';
import * as Minio from 'minio';
import { Repository } from 'typeorm';
import { MINIO_CLIENT } from '../../../connections/minio.module';
import type { RedisClientType } from '../../../connections/redis.module';
import { REDIS_CLIENT } from '../../../connections/redis.module';
import { File } from '../../../entities/file.entity';
import { TokenType } from '../../../entities/token-type.enum';
import { Token } from '../../../entities/token.entity';
import { User } from '../../../entities/user.entity';
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '../../../middleware/exceptions';
import { JwtService } from '../../../services/jwt.service';
import { ObjectGlobalService } from '../../../services/object.service';
import { FileValidation } from '../validations/file.validation';

@Injectable()
export class FileService {
  private readonly bucket: string;

  constructor(
    @InjectRepository(File) private readonly fileRepo: Repository<File>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Token) private readonly tokenRepo: Repository<Token>,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
    @Inject(MINIO_CLIENT) private readonly minioClient: Minio.Client,
    private readonly fileValidation: FileValidation,
    private readonly objectGlobalService: ObjectGlobalService,
    private readonly jwtService: JwtService,
  ) {
    this.bucket = process.env.MINIO_BUCKET || 'racerfs-bucket';
  }

  /**
   * Create upload session in Redis
   */
  async createUploadSession(
    userId: number,
    fileName: string,
    fileSize: number,
  ): Promise<{ fileKey: string }> {
    const fileKey = crypto.randomUUID();
    const fileType = this.extractFileType(fileName);

    await this.redisClient.set(
      `upload:${fileKey}`,
      JSON.stringify({ user_id: userId, file_name: fileName, file_size: fileSize, file_type: fileType }),
      { EX: 7200 },
    );

    return { fileKey };
  }

  /**
   * Confirm upload and save file record in database
   */
  async confirmUpload(
    status: 'SUCCESS' | 'FAILED',
    fileName: string,
    fileKey: string,
    userId: number,
    expectedSize: number,
  ): Promise<File | null> {
    const session = await this.fileValidation.consumeUploadSession(
      fileKey,
      userId,
      fileName,
      expectedSize,
    );

    if (status === 'SUCCESS') {
      const size = await this.fileValidation.validateFileSize(fileKey, expectedSize);
      return await this.createFile({
        name: fileName,
        size,
        file_key: fileKey,
        file_type: session.file_type,
        user_id: userId,
      });
    } else {
      // Remove failed upload from object storage
      await this.objectGlobalService.removeObject(fileKey);
      return null;
    }
  }

  /**
   * Get presigned upload URL with storage check
   */
  async getPresignedUploadUrl(
    userId: number,
    fileName: string,
    fileSize: number,
  ): Promise<{ url: string; formData: Record<string, string>; fileKey: string }> {
    // Check storage availability
    await this.checkStorageAvailability(userId, fileSize);

    // Check if file already exists
    await this.fileValidation.validateFileNotExists(fileName, userId, true);

    // Create upload session
    const { fileKey } = await this.createUploadSession(userId, fileName, fileSize);

    // Generate presigned POST policy
    const policy = this.minioClient.newPostPolicy();
    policy.setBucket(this.bucket);
    policy.setKey(fileKey);
    policy.setExpires(new Date(Date.now() + 7200 * 1000));
    policy.setContentLengthRange(0, fileSize);

    const { postURL, formData } = await this.minioClient.presignedPostPolicy(policy);

    return { url: postURL, formData, fileKey };
  }

  /**
   * Get presigned download URL (1 hour expiry)
   */
  async getPresignedDownloadUrl(fileKey: string): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(this.bucket, fileKey, 3600);
    } catch (error) {
      throw new NotFoundException('File not found in storage');
    }
  }

  /**
   * Get user's file list
   */
  async getUserFiles(userId: number) {
    const files = await this.fileRepo.find({
      where: { user_id: userId },
      order: { uploaded_at: 'DESC' },
      loadEagerRelations: false
    });
    return files.map(data => ({
      id: data.id,
      name: data.name,
      size: data.size,
      type: data.file_type,
      uploaded_at: data.uploaded_at
    }))
  }

  /**
   * Get public files only for a specific user
   * Used by /file/public-list endpoint with access token
   */
  async getPublicFiles(userId: number) {
    const files = await this.fileRepo.find({
      where: { user_id: userId, is_public: true },
      order: { uploaded_at: 'DESC' },
      loadEagerRelations: false
    });

    return files.map(data => ({
      id: data.id,
      name: data.name,
      size: data.size,
      type: data.file_type,
      uploaded_at: data.uploaded_at
    }));
  }

  /**
   * Get file by name and user
   */
  async getFile(fileName: string, userId: number): Promise<File> {
    const file = await this.fileRepo.findOne({
      where: { name: fileName, user_id: userId },
      loadEagerRelations: false,
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  /**
   * Get file by key
   */
  async getFileByKey(fileKey: string): Promise<File> {
    const file = await this.fileRepo.findOne({
      where: { file_key: fileKey },
      loadEagerRelations: false,
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  /**
   * Rename file
   */
  async renameFile(userId: number, oldName: string, newName: string): Promise<File> {
    await this.fileValidation.validateFileNotExists(newName, userId, true);

    const file = await this.fileValidation.validateFileExists(oldName, userId, true);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    file.name = newName;
    await this.fileRepo.save(file);

    return file;
  }

  /**
   * Delete file from storage and database
   */
  async deleteFile(userId: number, fileName: string): Promise<void> {
    const file = await this.fileValidation.validateFileExists(fileName, userId, true);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Remove from object storage
    await this.objectGlobalService.removeObject(file.file_key);

    // Update user storage quota
    await this.updateUserStorage(userId, -file.size);

    // Delete from database
    await this.fileRepo.delete({ id: file.id });
  }

  /**
   * Set file visibility (public/private)
   */
  async setFileVisibility(userId: number, fileName: string, isPublic: boolean): Promise<File> {
    const file = await this.fileValidation.validateFileExists(fileName, userId, true);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    file.is_public = isPublic;
    await this.fileRepo.save(file);

    return file;
  }

  /**
   * Get storage info for user
   */
  async getStorageInfo(userId: number): Promise<{
    total_storage: number;
    used_storage: number;
    available_storage: number;
  }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      loadEagerRelations: false,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      total_storage: Number(user.storage_size),
      used_storage: Number(user.used_storage),
      available_storage: Number(user.storage_size) - Number(user.used_storage),
    };
  }

  /**
   * Remove multiple files from object storage (used by UserService on account deletion)
   */
  async removeObjects(fileKeys: string[]): Promise<void> {
    await this.objectGlobalService.removeObjects(fileKeys);
  }

  // ─── Access Token ─────────────────────────────────────────────────────────

  /**
   * Create a file access token for the user
   * Token is a JWT containing { user_id, type: 'file_access_token' }
   * Also saved to DB as whitelist for revocation capability
   */
  async createAccessToken(userId: number): Promise<Token> {
    // Generate JWT token
    const tokenString = this.jwtService.generateJwt(
      {
        user_id: userId,
        type: TokenType.file_access_token,
      },
      99999, // No expiry (permanent until deleted)
    );

    // Save to DB as whitelist
    const token = this.tokenRepo.create({
      token: tokenString,
      user_id: userId,
      type: TokenType.file_access_token,
    });
    return await this.tokenRepo.save(token);
  }

  /**
   * Delete a file access token — only the owner can delete their own token
   */
  async deleteAccessToken(userId: number, tokenString: string): Promise<void> {
    const tokenData = await this.tokenRepo.findOne({
      where: { token: tokenString, type: TokenType.file_access_token },
    });

    if (!tokenData) {
      throw new NotFoundException('Access token not found');
    }

    if (tokenData.user_id !== userId) {
      throw new UnauthorizedException('Unauthorized action');
    }

    await this.tokenRepo.delete({ id: tokenData.id });
  }

  /**
   * Get all file access tokens belonging to a user
   */
  async getUserAccessTokens(userId: number): Promise<Token[]> {
    return await this.tokenRepo.find({
      where: { user_id: userId, type: TokenType.file_access_token },
    });
  }

  /**
   * Get a public file — throws ForbiddenException if file is not public
   */
  async getPublicFile(fileName: string, userId: number): Promise<File> {
    const file = await this.getFile(fileName, userId);

    if (!file.is_public) {
      throw new ForbiddenException('File is not public');
    }

    return file;
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private async createFile(data: {
    name: string;
    size: number;
    file_key: string;
    file_type: string | null;
    user_id: number;
  }): Promise<File> {
    const file = this.fileRepo.create(data);
    await this.fileRepo.save(file, { reload: false });
    await this.updateUserStorage(data.user_id, data.size);
    return file;
  }

  private extractFileType(fileName: string): string | null {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
      return null;
    }
    return fileName.substring(lastDotIndex).toLowerCase();
  }

  private async updateUserStorage(userId: number, sizeChange: number): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      loadEagerRelations: false,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.used_storage = Number(user.used_storage) + sizeChange;
    await this.userRepo.save(user);
  }

  private async checkStorageAvailability(userId: number, fileSize: number): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      loadEagerRelations: false,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const available = Number(user.storage_size) - Number(user.used_storage);

    if (fileSize > available) {
      throw new BadRequestException('Insufficient storage space');
    }
  }
}
