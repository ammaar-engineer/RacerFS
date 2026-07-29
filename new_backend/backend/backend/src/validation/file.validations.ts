import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { createClient } from "redis";
import * as Minio from "minio";
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from "src/CustomExceptionHandle";
import { REDIS_CLIENT } from "src/global_modules/redis.module";
import { MINIO_CLIENT } from "src/global_modules/minio.module";
import { File, Token } from "src/entity";
import { Repository } from "typeorm";

@Injectable()
export class FileValidations {
    constructor(
        @Inject(MINIO_CLIENT) private readonly minioService: Minio.Client,
        @InjectRepository(File) private readonly fileRepo: Repository<File>,
        @InjectRepository(Token) private readonly tokenRepo: Repository<Token>,
        @Inject(REDIS_CLIENT) private readonly redisService: ReturnType<typeof createClient>
    ) {}

    async validateFileSize(file_key: string, expectedSize: number) {
        const stat = await this.minioService.statObject("racerfs-bucket", file_key)
        if (stat.size !== expectedSize) {
            await this.minioService.removeObject('racerfs-bucket', file_key)
            throw new BadRequestException("File size mismatch")
        }
        return stat.size
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
        return session // Return session data including file_type
    }

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
}