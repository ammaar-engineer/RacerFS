import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Token } from 'src/entity'
import { TokenRouteController } from './controller';
import { DtoUtilites } from 'src/utilities/custom.dto.validator';

@Module({
    imports: [
        TypeOrmModule.forFeature([Token]),
    ],
    controllers: [TokenRouteController],
    providers: [DtoUtilites],
})
export class TokenRouteModule {}
