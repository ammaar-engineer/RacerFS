import {Module} from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { File, Token, User } from 'src/entity'
import { JwtModule } from 'src/global_modules/jwt.module'
import { FileRouteController } from './controller';
import { FileDbModules } from './db/db.main';
import { FileDbinioModules } from './db/db.minio';
import { FileServices } from 'src/services/file.services';
import { DtoUtilites } from 'src/utilities/custom.dto.validator';

@Module({
    imports: [
        TypeOrmModule.forFeature([File, Token, User]),
        JwtModule,
    ],
    controllers: [FileRouteController],
    providers: [FileDbModules, FileDbinioModules, FileServices, DtoUtilites],
    exports: [FileServices]
})
export class FileRouteModule {}