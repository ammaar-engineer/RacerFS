import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from '../../entities/file.entity';
import { User } from '../../entities/user.entity';
import { Token } from '../../entities/token.entity';
import { MinioModule } from '../../connections/minio.module';
import { JwtModule } from '../../services/jwt.service';
import { FileController } from './controllers/file.controller';
import { FileService } from './services/file.service';
import { ObjectService } from './services/object.service';
import { FileValidation } from './validations/file.validation';
import { TokenValidation } from './validations/token.validation';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, User, Token]),
    MinioModule,
    JwtModule,
  ],
  controllers: [FileController],
  providers: [FileService, ObjectService, FileValidation, TokenValidation],
  exports: [FileService],
})
export class FileModule {}
