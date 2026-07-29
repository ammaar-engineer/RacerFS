import { Inject, Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { MINIO_CLIENT } from '../../../connections/minio.module';
import { NotFoundException } from '../../../middleware/exceptions';

@Injectable()
export class ObjectService {
  private readonly bucket: string;

  constructor(
    @Inject(MINIO_CLIENT) private readonly minioClient: Minio.Client,
  ) {
    this.bucket = process.env.MINIO_BUCKET || 'racerfs-bucket';
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
   * Get presigned upload POST policy (2 hour expiry)
   */
  async getPresignedUploadUrl(
    fileKey: string,
    fileSize: number,
  ): Promise<{ url: string; formData: Record<string, string> }> {
    const policy = this.minioClient.newPostPolicy();
    policy.setBucket(this.bucket);
    policy.setKey(fileKey);
    policy.setExpires(new Date(Date.now() + 7200 * 1000));
    policy.setContentLengthRange(0, fileSize);

    const { postURL, formData } = await this.minioClient.presignedPostPolicy(policy);

    return { url: postURL, formData };
  }

  /**
   * Get object metadata (size, etag)
   */
  async statObject(fileKey: string): Promise<{ size: number; etag: string }> {
    try {
      const stat = await this.minioClient.statObject(this.bucket, fileKey);
      return { size: stat.size, etag: stat.etag };
    } catch (error) {
      throw new NotFoundException('File not found in storage');
    }
  }

  /**
   * Remove a single object from storage
   */
  async removeObject(fileKey: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucket, fileKey);
    } catch (error) {
      console.error('Error removing object from MinIO:', error);
      throw new Error('Failed to delete file from storage');
    }
  }

  /**
   * Remove multiple objects from storage
   */
  async removeObjects(fileKeys: string[]): Promise<void> {
    if (!fileKeys || fileKeys.length === 0) {
      return;
    }

    try {
      await this.minioClient.removeObjects(this.bucket, fileKeys);
    } catch (error) {
      console.error('Error removing objects from MinIO:', error);
      throw new Error('Failed to delete files from storage');
    }
  }
}
