import { Inject, Injectable } from "@nestjs/common";
import { WebSocketValidation } from "./web_socket_validation";
import { MINIO_CLIENT, type MinIOModuleType } from "src/global_modules/minio.module";

@Injectable()
export class FileRouteWebSocketServices {
    constructor(
        private readonly wsValidation: WebSocketValidation,
        @Inject(MINIO_CLIENT) private readonly minioService: MinIOModuleType,
    ) {}
    async WsEvent_UPLOADING(data: any) {
        const validatedData = await this.wsValidation.validateUploadingData(data);
        return this.minioService.presignedPutObject("racerfs_bucket", validatedData.fileName, 5600)
    }
    async WsEvent_SUCCESS(data: any) {
        
    }
    async WsEvent_FAILED(data: any) {
        
    }
}