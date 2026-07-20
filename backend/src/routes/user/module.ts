import {Module} from '@nestjs/common'
import { UserController } from './controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entity'
import { JwtModule } from 'src/global_bridge/jwt.module'
import { UserDbModules } from './db.main'
import { UserBridgeModules } from './bridge/bridge.main'
import { SessionBridgeModules } from './bridge/bridge.session'

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule,
    ],
    controllers: [UserController],
    providers: [UserDbModules, UserBridgeModules, SessionBridgeModules]
})
export class UserRoutesModule {}