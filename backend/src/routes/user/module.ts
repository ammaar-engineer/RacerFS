import {Module} from '@nestjs/common'
import { UserController } from './controller'
import { UserService } from './service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entity'
import { RedisClientModule } from 'src/global_modules/redis.module'
import { EmailSendModule } from 'src/global_modules/resend.module'
import { JwtModule } from 'src/global_services/jwt.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule,
        RedisClientModule,
        EmailSendModule
    ],
    controllers: [UserController],
    providers: [UserService]
})
export class UserRoutesModule {}