import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { FileBridgeModules } from "../bridge.main";
import { InjectRepository } from "@nestjs/typeorm";
import { File, Token, TokenType } from "src/entity";
import { Repository } from "typeorm";
import { ConflictException, NotFoundException, UnauthorizedException } from "src/CustomExceptionHandle";

@Injectable()
export class FileDbModules {
    constructor(
        @Inject(forwardRef(() => FileBridgeModules)) private bridgeModule: FileBridgeModules,
        @InjectRepository(Token) private readonly tokenRepo: Repository<Token>,
        @InjectRepository(File) private readonly fileRepo: Repository<File>
    ) {}
    async fileShouldBe(type: 'exist' | 'notexist', file_name: string, user_id: number, {throwErr = false}: {throwErr: boolean}) {
        const fileDb = await this.fileRepo.findOne({
            where: {
                name: file_name,
                user_id
            },
            loadEagerRelations: false
        })
        if (type == 'exist' && !fileDb && throwErr) {
            throw new NotFoundException("File not found")
        }
        if (type == 'notexist' && fileDb && throwErr) {
            throw new ConflictException("File already exist")
        }
    }
    async AccessTokenShouldBe(action: 'exist' | 'notexist', token: string) {
        const tokenDb = await this.tokenRepo.findOne({
            where: {
                token
            },
            loadEagerRelations: false
        })
        if (action == 'exist' && !tokenDb) {
            throw new NotFoundException("Token not found")
        }
        if (action == 'notexist' && tokenDb) {
            throw new ConflictException("Token already exist")
        }
        return tokenDb
    }
    async getFileList({user_id, isOwner}:{user_id: number, isOwner: boolean}) {
        const whereClause: any = { user_id }
        
        if (!isOwner) {
            whereClause.is_public = true
        }
        
        const fileList = await this.fileRepo.find({
            where: whereClause,
            order: {
                uploaded_at: 'DESC'
            }
        })
        return fileList.map(data => ({
            id: data.id,
            name: data.name,
            size: data.size,
            uploaded_at: data.uploaded_at
        }))
    }
    async renameFile({file_name, new_name, user_id}:{user_id: number, file_name: string, new_name: string}) {
        const file = await this.fileRepo.findOne({
            where: { name: file_name, user_id },
            loadEagerRelations: false
        })
        await this.fileShouldBe("exist", file_name, user_id, {throwErr: true})
        const oldName = file?.name
        await this.fileRepo.update({name: file_name, user_id}, {name: new_name})
        return { oldName }
    }
    async getFileByName({file_name, user_id}:{file_name: string, user_id: number}) {
        const file = await this.fileRepo.findOne({
            where: { name: file_name, user_id },
            loadEagerRelations: false
        })
        await this.fileShouldBe('exist', file_name, user_id, {throwErr: true})
        return { name: file?.name, file_key: file?.file_key }
    }
    async removeFile(file_name: string, user_id: number) {
        await this.fileShouldBe("exist", file_name, user_id, {throwErr: false})
        await this.fileRepo.delete({name: file_name, user_id})
    }
    async createFile({name, size, user_id, file_key}:{name: string, size: number, user_id: number, file_key: string}) {
        const newFile = new File()
        newFile.name = name
        newFile.size = size
        newFile.user_id = user_id
        newFile.file_key = file_key
        newFile.is_public = false
        await this.fileRepo.save(newFile)
        return newFile
    }
    async createAccessToken(user_id: number, token: string) {
        const newToken = new Token()
        newToken.token = token
        newToken.user_id = user_id
        newToken.type = "file_access_token"
        await this.tokenRepo.save(newToken)
        return newToken
    }
    async deleteAccessToken(token_to_delete: string, requesting_user_id: number) {
        const tokenDb = await this.tokenRepo.findOne({
            where: { 
                token: token_to_delete,
                type: TokenType.file_access_token
            },
            loadEagerRelations: false
        })
        
        if (!tokenDb) {
            throw new NotFoundException("Access token not found")
        }
        
        if (tokenDb.user_id !== requesting_user_id) {
            throw new UnauthorizedException("You don't own this access token")
        }
        
        await this.tokenRepo.delete({ token: token_to_delete })
    }
    async setFileVisibility(file_name: string, user_id: number, is_public: boolean) {
        await this.fileShouldBe("exist", file_name, user_id, {throwErr: true})
        
        const result = await this.fileRepo.update(
            { name: file_name, user_id },
            { is_public }
        )
        
        if (result.affected === 0) {
            throw new NotFoundException("File not found")
        }
        
        return { file_name, is_public }
    }
}