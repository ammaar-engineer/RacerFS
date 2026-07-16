import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConflictException, InternalServerErrorException } from "src/CustomExceptionHandle";
import { File } from "src/entity";
import { type Request } from "express";
import { MINIO_CLIENT, type MinIOModuleType } from "src/global_modules/minio.module";
import { PassThrough } from "stream";
import { Repository } from "typeorm";
import { FileRouteValidations } from "./validation";

@Injectable()
export class FileRouteService {
    constructor(
        @Inject(MINIO_CLIENT) private readonly minioService: MinIOModuleType,
        @InjectRepository(File) private readonly fileRepo: Repository<File>,
        private readonly fileRouteValidation: FileRouteValidations
    ) {}
    async uploadFile(
        req: Request,
        fileName: string,
        userId: number
    ) {
        // Check file existence
        const fileExist = await this.fileRepo.findOne({
            where: {
                name: fileName,
                user_id: userId
            }
        })
        if (fileExist) {
            throw new ConflictException("File already exist")
        }
        // Create PassThrough stream as middleware with size counter
        const passThroughStream = new PassThrough();
        let fileSize = 0;
        passThroughStream.on('data', (chunk: Buffer) => {
            fileSize += chunk.length;
        });
        req.pipe(passThroughStream);
        // Insert to MinIO
        try {
            await this.minioService.putObject(
                'racerfs_bucket',
                fileName,
                passThroughStream,
                fileSize,
                {
                    "Content-Type": "application/octet-stream"
                }
            )
        } catch (error) {
            throw new InternalServerErrorException("Error while uploading to storage");
        }
        // Note in db
        const newFile = new File()
        newFile.name = fileName
        newFile.size = fileSize
        newFile.user_id = userId
        newFile.is_public = false
        this.fileRepo.save(newFile)
        // Return
        return fileName
    }
    async getUserFileList(userId: number, accessTokenOwnerId: number) {
        const whereValidation = userId == accessTokenOwnerId 
            ? {user_id: userId}
            : {user_id: userId, is_public: true}
        const fileList = await this.fileRepo.find({
            where: whereValidation,
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
}
