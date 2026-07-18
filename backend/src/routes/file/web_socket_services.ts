import { Inject, Injectable } from "@nestjs/common";
import { WebSocketValidation } from "./web_socket_validation";
import { MINIO_CLIENT, type MinIOModuleType } from "src/global_modules/minio.module";
import { REDIS_CLIENT } from "src/global_modules/redis.module";
import { createClient } from "redis";
import crypto from 'crypto';

@Injectable()
export class FileRouteWebSocketServices {
    constructor(
        private readonly wsValidation: WebSocketValidation,
        @Inject(MINIO_CLIENT) private readonly minioService: MinIOModuleType,
        @Inject(REDIS_CLIENT) private readonly redisService: ReturnType<typeof createClient>
    ) {}
    async WsEvent_UPLOADING(data: any) {
        const validatedData = await this.wsValidation.validateUploadingData(data);
        const sessionId = crypto.randomUUID()
        this.redisService.set(
            `${sessionId}:upload`,
            JSON.stringify({
                "file-name": validatedData["file-name"],
                "file-size": validatedData["file-size"]
            }),
            {EX: 900}
        )
        return this.minioService.presignedPutObject("racerfs_bucket", validatedData['file-name'], 5600)
    }
    async WsEvent_SUCCESS(data: any) {
        
    }
    async WsEvent_FAILED(data: any) {
        
    }
}