import {Module} from '@nestjs/common'
import { FileRouteController } from './controller';
import { FileRouteService } from './service';

@Module({
    controllers: [FileRouteController],
    providers: [FileRouteService]
})
export class FileRouteModule {}