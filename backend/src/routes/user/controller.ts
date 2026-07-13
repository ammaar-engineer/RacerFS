import { Controller, Inject, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AppTypeOrmModule } from "src/global_modules/typeorm.module";
import * as Minio from 'minio'
import { User } from "src/entity";

@Controller("user")
export class UserController {
    constructor(
        @InjectRepository(User) private readonly mainDb: AppTypeOrmModule,
        @Inject("MINIO_CLIENT") private readonly minioClient: Minio.Client
    ) {}

    @Post('amar')
    async LoginUser() {
        
    }

}