import {Module} from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { File, Token } from 'src/entity'
import { JwtModule } from 'src/global_bridge/jwt.module'
import { FileRouteController } from './controller';
import { FileBridgeModules } from './bridge.main';
import { FileDbModules } from './db/db.main';
import { FileRawModules } from './raw.main';
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