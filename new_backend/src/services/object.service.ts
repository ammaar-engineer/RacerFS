import { Global, Module, Inject, Injectable } from "@nestjs/common";
import * as minio from 'minio';
import { MINIO_CLIENT, MinioModule } from "src/connections/minio.module";
import { NotFoundException } from "src/middleware/exceptions";

@Injectable()
export class ObjectGlobalService {
    private readonly bucket: string;

    constructor(
        @Inject(MINIO_CLIENT) private readonly minioClient: minio.Client
    ) {
        this.bucket = process.env.MINIO_BUCKET || 'racerfs-bucket';
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
    async removeObject(objectName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(this.bucket, objectName);
        } catch (error) {
            console.error('Error removing object from MinIO:', error);
            throw new Error('Failed to delete file from storage');
        }
    }

    /**
     * Remove multiple objects from storage
     */
    async removeObjects(objectArr: string[]): Promise<void> {
        if (!objectArr || objectArr.length === 0) {
            return;
        }

        try {
            await this.minioClient.removeObjects(this.bucket, objectArr);
        } catch (error) {
            console.error('Error removing objects from MinIO:', error);
            throw new Error('Failed to delete files from storage');
        }
    }
}

@Global()
@Module({
    imports: [MinioModule],
    providers: [ObjectGlobalService],
    exports: [ObjectGlobalService],
})
export class ObjectGlobalModule {}