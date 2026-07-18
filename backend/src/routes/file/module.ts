import {Module} from '@nestjs/common'
import { FileRouteController } from './controller';
import { FileRouteService } from './service';
import { FileRouteValidations } from './validation';
import { WebSocketValidation } from './web_socket_validation';
import { SignalUploadControlCenter } from './web_socket_controller';
import { HttpValidation } from './http_validation';

@Module({
    controllers: [FileRouteController],
    providers: [FileRouteService, FileRouteValidations, WebSocketValidation, SignalUploadControlCenter, HttpValidation]
})
export class FileRouteModule {}