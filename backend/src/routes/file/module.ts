import {Module} from '@nestjs/common'
import { FileRouteController } from './controller';

@Module({
    controllers: [FileRouteController],
    providers: []
})
export class FileRouteModule {}