import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import crypto from 'crypto';
import type { RedisClientType } from '../../../connections/redis.module';
import { REDIS_CLIENT } from '../../../connections/redis.module';
import { Repository } from 'typeorm';
import { File } from '../../../entities/file.entity';
import { User } from '../../../entities/user.entity';
import { BadRequestException, NotFoundException } from '../../../middleware/exceptions';
import { FileValidation } from '../validations/file.validation';
import { ObjectService } from './object.service';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File) private readonly fileRepo: Repository<File>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
    private readonly fileValidation: FileValidation,
    private readonly objectService: ObjectService,
  ) {}

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
      await this.objectService.removeObject(fileKey);
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

    // Generate presigned POST policy via ObjectService
    const { url, formData } = await this.objectService.getPresignedUploadUrl(fileKey, fileSize);

    return { url, formData, fileKey };
  }

  /**
   * Get presigned download URL
   */
  async getPresignedDownloadUrl(fileKey: string): Promise<string> {
    return await this.objectService.getPresignedDownloadUrl(fileKey);
  }

  /**
   * Get user's file list
   */
  async getUserFiles(userId: number): Promise<File[]> {
    return await this.fileRepo.find({
      where: { user_id: userId },
      order: { uploaded_at: 'DESC' },
    });
  }

  /**
   * Get file by name and user
   */
  async getFile(fileName: string, userId: number): Promise<File> {
    const file = await this.fileRepo.findOne({
      where: { name: fileName, user_id: userId },
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
    await this.objectService.removeObject(file.file_key);

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
    const user = await this.userRepo.findOne({ where: { id: userId } });

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
    await this.objectService.removeObjects(fileKeys);
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
    await this.fileRepo.save(file);
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
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.used_storage = Number(user.used_storage) + sizeChange;
    await this.userRepo.save(user);
  }

  private async checkStorageAvailability(userId: number, fileSize: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const available = Number(user.storage_size) - Number(user.used_storage);

    if (fileSize > available) {
      throw new BadRequestException('Insufficient storage space');
    }
  }
}
