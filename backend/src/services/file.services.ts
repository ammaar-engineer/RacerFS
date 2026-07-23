import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { createClient } from "redis";
import * as Minio from "minio";
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from "src/CustomExceptionHandle";
import { JwtService } from "src/global_modules/jwt.module";
import { REDIS_CLIENT } from "src/global_modules/redis.module";
import { MINIO_CLIENT } from "src/global_modules/minio.module";
import { File, Token, TokenType, User } from "src/entity";
import { Repository } from "typeorm";
import crypto from 'crypto';

@Injectable()
export class FileServices {
    constructor(
        @Inject(MINIO_CLIENT) private readonly minioService: Minio.Client,
        @InjectRepository(File) private readonly fileRepo: Repository<File>,
        @InjectRepository(Token) private readonly tokenRepo: Repository<Token>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
        @Inject(REDIS_CLIENT) private readonly redisService: ReturnType<typeof createClient>
    ) {}

    // Business logic methods (from FileBridgeModules)
    async validateFileSize(file_key: string, expectedSize: number) {
        const { size } = await this.statObject(file_key)
        if (size !== expectedSize) {
            await this.removeObject(file_key)
            throw new BadRequestException("File size mismatch")
        }
        return size
    }

    async createUploadSession(user_id: number, file_name: string, file_size: number) {
        const file_key = crypto.randomUUID()
        await this.redisService.set(
            `upload:${file_key}`,
            JSON.stringify({ user_id, file_name, file_size }),
            { EX: 7200 }
        )
        return {file_key}
    }

    async consumeUploadSession(file_key: string, user_id: number, file_name: string, file_size: number) {
        const raw = await this.redisService.get(`upload:${file_key}`)
        if (!raw) {
            throw new NotFoundException("Upload session not found or expired")
        }
        const session = JSON.parse(raw)
        if (session.user_id !== user_id) {
            throw new UnauthorizedException("Unauthorized action")
        }
        if (session.file_name !== file_name) {
            throw new BadRequestException("File name mismatch")
        }
        if (session.file_size !== file_size) {
            throw new BadRequestException("File size mismatch")
        }
        await this.redisService.del(`upload:${file_key}`)
    }

    async confirmOption(
        status: "SUCCESS" | "FAILED", 
        file_name: string, 
        file_key: string, 
        user_id: number, 
        expectedSize: number
    ) {
        await this.consumeUploadSession(file_key, user_id, file_name, expectedSize)
        if (status === "SUCCESS") {
            const size = await this.validateFileSize(file_key, expectedSize)
            await this.createFile({
                name: file_name,
                size,
                user_id,
                file_key
            })
            return `File ${file_name} has been uploaded successfully`
        }
        await this.removeObject(file_key)
        return `File ${file_name} upload failed and has been removed`
    }

    async generateAccessToken(user_id: number): Promise<string> {
        const token = this.jwtService.generateJwt({
            user_id,
            type: "file_access_token"
        })
        return token
    }

    // Database methods (from FileDbModules)
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

    // MinIO methods (from FileDbinioModules)
    async getPresignedDownloadUrl(objectName: string, expiry: number = 3600) {
        const url = await this.minioService.presignedGetObject("racerfs-bucket", objectName, expiry)
        return url
    }

    async getPresignedUploadUrl(file_key: string, user_id: number, file_size: number, expiry: number = 3600) {
        // Query user untuk cek storage quota
        const user = await this.userRepo.findOne({ where: { id: user_id } })
        if (!user) {
            throw new Error('User not found')
        }

        // Hitung sisa storage yang tersedia
        const availableStorage = Number(user.storage_size) - Number(user.used_storage)
        
        // Validasi apakah file size melebihi storage yang tersedia
        if (file_size > availableStorage) {
            throw new Error(
                `Insufficient storage. Available: ${availableStorage} bytes, Required: ${file_size} bytes`
            )
        }

        // Buat policy dengan batasan size menggunakan presignedPostPolicy
        const policy = this.minioService.newPostPolicy()
        policy.setBucket("racerfs-bucket")
        policy.setKey(file_key)
        policy.setExpires(new Date(Date.now() + expiry * 1000))
        
        // Set size limit: min 1 byte, max sesuai available storage atau file_size (pilih yang lebih kecil)
        const maxAllowedSize = Math.min(file_size, availableStorage)
        policy.setContentLengthRange(1, maxAllowedSize)

        const presignedPostData = await this.minioService.presignedPostPolicy(policy)
        
        return {
            url: presignedPostData.postURL,
            formData: presignedPostData.formData,
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
