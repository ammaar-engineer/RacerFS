import { Inject, Injectable } from "@nestjs/common"
import * as Minio from "minio"
import { MINIO_CLIENT } from "src/global_modules/minio.module"

@Injectable()
export class FileDbinioModules {
    constructor(
        @Inject(MINIO_CLIENT) private readonly minioService: Minio.Client
    ) {}
    async getPresignedDownloadUrl(objectName: string, expiry: number = 3600) {
        const url = await this.minioService.presignedGetObject("racerfs-bucket", objectName, expiry)
        return url
    }
    async getPresignedUploadUrl(file_key: string, expiry: number = 3600) {
        const url = await this.minioService.presignedPutObject("racerfs-bucket", file_key, expiry)
        return {
            url,
            file_key
        }
    }
    async statObject(objectName: string) {
        const stat = await this.minioService.statObject("racerfs-bucket", objectName)
        return { size: stat.size, etag: stat.etag }
    }
    async removeObject(objectName: string) {
        await this.minioService.removeObject("racerfs-bucket", objectName)
    }
}
