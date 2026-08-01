import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioModule } from '../../connections/minio.module';
import { File } from '../../entities/file.entity';
import { Token } from '../../entities/token.entity';
import { User } from '../../entities/user.entity';

// Using global service and middleware
import { AccessTokenAuthGuard } from '../../middleware/access-token-auth.guard';
import { AccountTokenAuthGuard } from '../../middleware/account-token-auth.guard';
import { JwtModule } from '../../services/jwt.service';

import { FileController } from './controllers/file.controller';
import { FileOwnerGuard } from './guards/file-owner.guard';
import { FileService } from './services/file.service';
import { FileValidation } from './validations/file.validation';
import { TokenValidation } from './validations/token.validation';

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
