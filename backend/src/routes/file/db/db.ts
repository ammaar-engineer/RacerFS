import { Injectable } from "@nestjs/common";
import { FileBridgeModules } from "../main.bridge";
import { InjectRepository } from "@nestjs/typeorm";
import { File, Token } from "src/entity";
import { Repository } from "typeorm";
import { ConflictException, NotFoundException } from "src/CustomExceptionHandle";

@Injectable()
export class FileDbModules {
    constructor(
        private bridgeModule: FileBridgeModules,
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
    async getFileList({user_id, is_public}:{user_id: number, is_public: boolean}) {
        const fileList = await this.fileRepo.find({
            where: {
                user_id,
                is_public: !is_public
            },
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
        if (!file) {
            throw new NotFoundException("File not found")
        }
        const oldName = file.name
        await this.fileRepo.update({name: file_name, user_id}, {name: new_name})
        return { oldName }
    }
    async getFileByKey({file_key, user_id}:{file_key: string, user_id: number}) {
        const file = await this.fileRepo.findOne({
            where: { file_key, user_id },
            loadEagerRelations: false
        })
        if (!file) {
            throw new NotFoundException("File not found")
        }
        return { name: file.name, file_key: file.file_key }
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
}