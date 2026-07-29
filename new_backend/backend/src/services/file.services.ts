import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as Minio from "minio";
import { createClient } from "redis";
import { BadRequestException, NotFoundException } from "src/CustomExceptionHandle";
import { File, User } from "src/entity";
import { MINIO_CLIENT } from "src/global_modules/minio.module";
import { REDIS_CLIENT } from "src/global_modules/redis.module";
import { FileValidations } from "src/validation/file.validations";
import { Repository } from "typeorm";

@Injectable()
export class FileServices {
    constructor(
        @Inject(MINIO_CLIENT) private readonly minioService: Minio.Client,
        @InjectRepository(File) private readonly fileRepo: Repository<File>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @Inject(REDIS_CLIENT) private readonly redisService: ReturnType<typeof createClient>,
        private readonly fileValidations: FileValidations
    ) {}

    async createUploadSession(user_id: number, file_name: string, file_size: number, file_key: string) {
        // Extract file extension
        const file_type = this.extractFileType(file_name)

        await this.redisService.set(
            `upload:${file_key}`,
            JSON.stringify({ user_id, file_name, file_size, file_type }),
            { EX: 7200 }
        )
        return {file_key}
    }

    private extractFileType(file_name: string): string | null {
        const lastDotIndex = file_name.lastIndexOf('.')
        if (lastDotIndex === -1 || lastDotIndex === file_name.length - 1) {
            return null // No extension or dot at the end
        }
        return file_name.substring(lastDotIndex).toLowerCase() // Include the dot, e.g., ".pdf"
    }

    async confirmOption(
        status: "SUCCESS" | "FAILED",
        file_name: string,
        file_key: string,
        user_id: number,
        expectedSize: number
    ) {
        const session = await this.fileValidations.consumeUploadSession(file_key, user_id, file_name, expectedSize)
        if (status === "SUCCESS") {
            const size = await this.fileValidations.validateFileSize(file_key, expectedSize)
            await this.createFile({
                name: file_name,
                size,
                user_id,
                file_key,
                file_type: session.file_type
            })

            // Update user's used_storage after successful upload
            await this.userRepo.increment(
                { id: user_id },
                'used_storage',
                size
            )

            return `File ${file_name} has been uploaded successfully`
        }
        await this.removeObject(file_key)
        return `File ${file_name} upload failed and has been removed`
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
            file_type: data.file_type,
            uploaded_at: data.uploaded_at
        }))
    }

    async renameFile({file_name, new_name, user_id}:{user_id: number, file_name: string, new_name: string}) {
        const file = await this.fileRepo.findOne({
            where: { name: file_name, user_id },
            loadEagerRelations: false
        })
        await this.fileValidations.fileShouldBe("exist", file_name, user_id, {throwErr: true})
        const oldName = file?.name
        await this.fileRepo.update({name: file_name, user_id}, {name: new_name})
        return { oldName }
    }

    async getFileKeyByName({file_name, user_id}:{file_name: string, user_id: number}) {
        const file = await this.fileRepo.findOne({
            where: { name: file_name, user_id },
            loadEagerRelations: false
        })
        await this.fileValidations.fileShouldBe('exist', file_name, user_id, {throwErr: true})
        return { name: file?.name, file_key: file?.file_key }
    }

    async removeFile(file_name: string, user_id: number) {
        // Validate file exists and get file data (including size)
        await this.fileValidations.fileShouldBe("exist", file_name, user_id, {throwErr: true})

        const fileToDelete = await this.fileRepo.findOne({
            where: { name: file_name, user_id },
            loadEagerRelations: false
        })

        if (!fileToDelete) {
            throw new NotFoundException("File not found")
        }

        const fileSize = Number(fileToDelete.size)

        // Delete file record
        await this.fileRepo.delete({ name: file_name, user_id })

        // Decrement user's used_storage
        await this.userRepo.decrement(
            { id: user_id },
            'used_storage',
            fileSize
        )
    }

    async createFile({name, size, user_id, file_key, file_type}:{name: string, size: number, user_id: number, file_key: string, file_type?: string | null}) {
        const newFile = new File()
        newFile.name = name
        newFile.size = size
        newFile.user_id = user_id
        newFile.file_key = file_key
        newFile.file_type = file_type || null
        newFile.is_public = false
        await this.fileRepo.save(newFile)
        return newFile
    }

    async setFileVisibility(file_name: string, user_id: number, is_public: boolean) {
        await this.fileValidations.fileShouldBe("exist", file_name, user_id, {throwErr: true})
        
        const result = await this.fileRepo.update(
            { name: file_name, user_id },
            { is_public }
        )
        
        if (result.affected === 0) {
            throw new NotFoundException("File not found")
        }
        
        return { file_name, is_public }
    }

    async getPresignedDownloadUrl(objectName: string, fileName: string, expiry: number = 3600) {
        const url = await this.minioService.presignedGetObject(
            "racerfs-bucket",
            objectName,
            expiry,
            {
                'response-content-disposition': `attachment; filename="${fileName}"`
            }
        )
        return url
    }

    async getPresignedUploadUrl(file_key: string, user_id: number, file_size: number, expiry: number = 3600) {
        // Tugas beresin
        const user = await this.userRepo.findOne({ where: { id: user_id } })
        if (!user) {
            throw new NotFoundException("User not found")
        }
        const availableStorage = Number(user.storage_size) - Number(user.used_storage)
        if (file_size > availableStorage) {
            throw new BadRequestException("Your storage are full")
        }
        const policy = this.minioService.newPostPolicy()
        policy.setBucket("racerfs-bucket")
        policy.setKey(file_key)
        policy.setExpires(new Date(Date.now() + expiry * 1000))
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

    async removeObject(objectName: string | string[]) {
        if (Array.isArray(objectName)) {
            await this.minioService.removeObjects("racerfs-bucket", objectName)
        } else {
            await this.minioService.removeObject('racerfs-bucket', objectName)
        }
    }

    async getStorageInfo(user_id: number) {
        const user = await this.userRepo.findOne({ where: { id: user_id } })
        if (!user) {
            throw new NotFoundException("User not found")
        }
        const availableStorage = Number(user.storage_size) - Number(user.used_storage)
        return {
            total_storage: Number(user.storage_size),
            used_storage: Number(user.used_storage),
            available_storage: availableStorage
        }
    }
}