import {Module} from '@nestjs/common'
import { UserController } from './controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entity'
import { JwtModule } from 'src/global_services/jwt.module'
import { UserDbModules } from './db'
import { UserBridgeModules } from './bridge/main.bridge'
import { SessionBridgeModules } from './bridge/session.bridge'

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule,
    ],
    controllers: [UserController],
    providers: [UserDbModules, UserBridgeModules, SessionBridgeModules]
})
export class UserRoutesModule {}