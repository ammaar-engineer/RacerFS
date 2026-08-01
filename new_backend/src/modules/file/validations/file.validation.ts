import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { RedisClientType } from '../../../connections/redis.module';
import { REDIS_CLIENT } from '../../../connections/redis.module';
import { File } from '../../../entities/file.entity';
import { Token } from '../../../entities/token.entity';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '../../../middleware/exceptions';
import { ObjectGlobalService } from '../../../services/object.service';

@Injectable()
export class FileValidation {
  constructor(
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
    @InjectRepository(Token)
    private readonly tokenRepo: Repository<Token>,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClientType,
    private readonly objectGlobalService: ObjectGlobalService,
  ) {}

  async validateFileSize(fileKey: string, expectedSize: number): Promise<number> {
    try {
      const stat = await this.objectGlobalService.statObject(fileKey);

      if (stat.size !== expectedSize) {
        // Remove the file if size doesn't match
        await this.objectGlobalService.removeObject(fileKey);
        throw new BadRequestException('File size mismatch');
      }

      return stat.size;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new NotFoundException('File not found in storage');
    }
  }

  async consumeUploadSession(
    fileKey: string,
    userId: number,
    fileName: string,
    fileSize: number,
  ): Promise<{ user_id: number; file_name: string; file_size: number; file_type: string | null }> {
    const sessionData = await this.redisClient.get(`upload:${fileKey}`);

    if (!sessionData) {
      throw new NotFoundException('Upload session not found or expired');
    }

    const session = JSON.parse(sessionData);

    // Validate session ownership
    if (session.user_id !== userId) {
      throw new UnauthorizedException('Unauthorized action');
    }

    // Validate file name matches
    if (session.file_name !== fileName) {
      throw new BadRequestException('File name mismatch');
    }

    // Validate file size matches
    if (session.file_size != fileSize) {
      throw new BadRequestException('File size mismatch');
    }

    // Delete session after consumption
    await this.redisClient.del(`upload:${fileKey}`);

    return session;
  }

  async validateFileExists(
    fileName: string,
    userId: number,
    throwError = true,
  ): Promise<File | null> {
    const file = await this.fileRepo.findOne({
      where: {
        name: fileName,
        user_id: userId,
      },
    });

    if (!file && throwError) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async validateFileNotExists(
    fileName: string,
    userId: number,
    throwError = true,
  ): Promise<void> {
    const file = await this.fileRepo.findOne({
      where: {
        name: fileName,
        user_id: userId,
      },
    });

    if (file && throwError) {
      throw new ConflictException('File already exists');
    }
  }

  async validateAccessToken(token: string): Promise<Token> {
    const tokenData = await this.tokenRepo.findOne({
      where: { token },
    });

    if (!tokenData) {
      throw new NotFoundException('Access token not found');
    }

    return tokenData;
  }

  async validateAccessTokenNotExists(token: string): Promise<void> {
    const tokenData = await this.tokenRepo.findOne({
      where: { token },
    });

    if (tokenData) {
      throw new ConflictException('Access token already exists');
    }
  }
}
