import {Module} from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { File, Token } from 'src/entity'
import { JwtModule } from 'src/global_services/jwt.module'
import { FileRouteController } from './controller';
import { FileBridgeModules } from './main.bridge';

@Module({
    imports: [
        TypeOrmModule.forFeature([File, Token]),
        JwtModule,
    ],
    controllers: [FileRouteController],
    providers: [FileBridgeModules]
})
export class FileRouteModule {}