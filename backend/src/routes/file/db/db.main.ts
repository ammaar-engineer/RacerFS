import { Injectable } from "@nestjs/common";
import { FileServices } from "src/services/file.services";

@Injectable()
export class FileDbModules {
    constructor(
        private readonly fileServices: FileServices
    ) {}
    
    async fileShouldBe(type: 'exist' | 'notexist', file_name: string, user_id: number, {throwErr = false}: {throwErr: boolean}) {
        return this.fileServices.fileShouldBe(type, file_name, user_id, {throwErr})
    }
    
    async AccessTokenShouldBe(action: 'exist' | 'notexist', token: string) {
        return this.fileServices.AccessTokenShouldBe(action, token)
    }
    
    async getFileList({user_id, isOwner}:{user_id: number, isOwner: boolean}) {
        return this.fileServices.getFileList({user_id, isOwner})
    }
    
    async renameFile({file_name, new_name, user_id}:{user_id: number, file_name: string, new_name: string}) {
        return this.fileServices.renameFile({file_name, new_name, user_id})
    }
    
    async getFileByName({file_name, user_id}:{file_name: string, user_id: number}) {
        return this.fileServices.getFileByName({file_name, user_id})
    }
    
    async removeFile(file_name: string, user_id: number) {
        return this.fileServices.removeFile(file_name, user_id)
    }
    
    async createFile({name, size, user_id, file_key}:{name: string, size: number, user_id: number, file_key: string}) {
        return this.fileServices.createFile({name, size, user_id, file_key})
    }
    
    async createAccessToken(user_id: number, token: string) {
        return this.fileServices.createAccessToken(user_id, token)
    }
    
    async deleteAccessToken(token_to_delete: string, requesting_user_id: number) {
        return this.fileServices.deleteAccessToken(token_to_delete, requesting_user_id)
    }
    
    async setFileVisibility(file_name: string, user_id: number, is_public: boolean) {
        return this.fileServices.setFileVisibility(file_name, user_id, is_public)
    }
}