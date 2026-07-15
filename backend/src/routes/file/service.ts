import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConflictException, InternalServerErrorException } from "src/CustomExceptionHandle";
import { File } from "src/entity";
import { type Request } from "express";
import { MINIO_CLIENT, type MinIOModuleType } from "src/global_modules/minio.module";
import { PassThrough } from "stream";
import { Repository } from "typeorm";

@Injectable()
export class FileRouteService {
    constructor(
        @Inject(MINIO_CLIENT) private readonly minioService: MinIOModuleType,
        @InjectRepository(File) private readonly fileRepo: Repository<File>
    ) {}
    async uploadFIle(
        req: Request,
        fileName: string
    ) {
        // Check file existence
        const fileExist = await this.fileRepo.findOne({
            where: {
                name: fileName
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
                fileSize
            )
        } catch (error) {
            throw new InternalServerErrorException("Error while uploading to storage");
        }
        // Note in db
        const noteFile = await this.fileRepo

    }
}