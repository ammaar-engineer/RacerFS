import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from '../../entities/file.entity';
import { User } from '../../entities/user.entity';
import { Token } from '../../entities/token.entity';
import { MinioModule } from '../../connections/minio.module';
import { JwtModule } from '../../services/jwt.service';
import { AccountTokenAuthGuard } from '../../middleware/account-token-auth.guard';
import { AccessTokenAuthGuard } from '../../middleware/access-token-auth.guard';
import { FileController } from './controllers/file.controller';
import { FileService } from './services/file.service';
import { FileValidation } from './validations/file.validation';
import { TokenValidation } from './validations/token.validation';
import { FileOwnerGuard } from './guards/file-owner.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, User, Token]),
    MinioModule,
    JwtModule,
  ],
  controllers: [FileController],
  providers: [
    FileService,
    FileValidation,
    TokenValidation,
    AccountTokenAuthGuard,
    AccessTokenAuthGuard,
    FileOwnerGuard,
  ],
  exports: [FileService],
})
export class FileModule {}
