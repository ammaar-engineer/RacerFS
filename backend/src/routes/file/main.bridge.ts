import { Inject, Injectable } from "@nestjs/common";
import { createClient } from "redis";
import { BadRequestException, NotFoundException, UnauthorizedException } from "src/CustomExceptionHandle";
import { JwtService } from "src/global_services/jwt.module";
import { REDIS_CLIENT } from "src/global_modules/redis.module";
import { FileDbModules } from "./db/db";
import { FileDbinioModules } from "./db/db.minio";
import crypto from 'crypto'

@Injectable()
export class FileBridgeModules {
    constructor(
        private readonly dbModule: FileDbModules,
        private readonly minioModule: FileDbinioModules,
        private readonly jwtService: JwtService,
        @Inject(REDIS_CLIENT) private readonly redisService: ReturnType<typeof createClient>,
    ) {}
    isValidAccountToken(token: string): {user_id: number, type: 'account_token'} {
        const accountTokenValue = this.jwtService.verifyJwt(token)
        if (!accountTokenValue.user_id || accountTokenValue.type !== 'account_token') {
            throw new UnauthorizedException("Invalid account token")
        }
        return accountTokenValue
    }
    isValidAccessToken(token: string) {
        const accessTokenValue = this.jwtService.verifyJwt(token)
        if (accessTokenValue.type !== 'file_access_token') {
            throw new UnauthorizedException("Invalid access token")
        }
    }
    async isOwnerAction(account_token: string, access_token: string, {throwError = false}: {throwError: boolean}) {
        const {user_id} = this.isValidAccountToken(account_token)
        this.isValidAccessToken(access_token)
        const tokenOwnerId = await this.dbModule.AccessTokenShouldBe("exist", access_token)
        if (user_id !== tokenOwnerId?.user_id && throwError) {
            throw new UnauthorizedException("Unauthorized action")
        }
        return {
            tokenOwner: tokenOwnerId?.user_id,
            user_id,
            isOwner: user_id == tokenOwnerId?.user_id
        }
    }
    async validateFileSize(file_key: string, expectedSize: number) {
        const { size } = await this.minioModule.statObject(file_key)
        if (size !== expectedSize) {
            throw new BadRequestException("File size mismatch")
        }
        return size
    }
    async createUploadSession(user_id: number, file_name: string) {
        const file_key = crypto.randomUUID()
        await this.redisService.set(
            `upload:${file_key}`,
            JSON.stringify({ user_id, file_name }),
            { EX: 7200 }
        )
        return {file_key}
    }
    async consumeUploadSession(file_key: string, user_id: number, file_name: string) {
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
        await this.redisService.del(`upload:${file_key}`)
    }
    async confirmOption(status: "SUCCESS" | "FAILED", file_name: string, file_key: string, user_id: number, expectedSize: number) {
        await this.consumeUploadSession(file_key, user_id, file_name)
        if (status === "SUCCESS") {
            const size = await this.validateFileSize(file_key, expectedSize)
            await this.dbModule.createFile({
                name: file_name,
                size,
                user_id,
                file_key
            })
            return `File ${file_name} has been uploaded successfully`
        }
        await this.minioModule.removeObject(file_key)
        return `File ${file_name} upload failed and has been removed`
    }
}