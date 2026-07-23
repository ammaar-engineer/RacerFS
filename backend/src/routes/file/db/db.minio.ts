import { Injectable } from "@nestjs/common"
import { FileServices } from "src/services/file.services"

@Injectable()
export class FileDbinioModules {
    constructor(
        private readonly fileServices: FileServices
    ) {}
    
    async getPresignedDownloadUrl(objectName: string, expiry: number = 3600) {
        return this.fileServices.getPresignedDownloadUrl(objectName, expiry)
    }
    
    async getPresignedUploadUrl(file_key: string, user_id: number, file_size: number, expiry: number = 3600) {
        return this.fileServices.getPresignedUploadUrl(file_key, user_id, file_size, expiry)
    }
    
    async statObject(objectName: string) {
        return this.fileServices.statObject(objectName)
    }
    
    async removeObject(objectName: string) {
        return this.fileServices.removeObject(objectName)
    }
}
