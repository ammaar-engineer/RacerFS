import {Module} from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { File, Token, User } from 'src/entity'
import { FileRouteController } from './controller';
import { FileServices } from 'src/services/file.services';
import { DtoUtilites } from 'src/utilities/custom.dto.validator';
import { FileValidations } from 'src/validation/file.validations';

@Module({
    imports: [
        TypeOrmModule.forFeature([File, Token, User]),
    ],
    controllers: [FileRouteController],
    providers: [FileServices, DtoUtilites, FileValidations],
    exports: [FileServices]
})
export class FileRouteModule {}