import {Module} from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { File, Token } from 'src/entity'
import { JwtModule } from 'src/global_services/jwt.module'
import { FileRouteController } from './controller';
import { FileBridgeModules } from './main.bridge';
import { FileDbModules } from './db/db';
import { FileRawModules } from './raw';
import { FileDbinioModules } from './db/db.minio';

@Module({
    imports: [
        TypeOrmModule.forFeature([File, Token]),
        JwtModule,
    ],
    controllers: [FileRouteController],
    providers: [FileBridgeModules, FileDbModules, FileRawModules, FileDbinioModules]
})
export class FileRouteModule {}