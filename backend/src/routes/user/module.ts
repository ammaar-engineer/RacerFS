import {Module} from '@nestjs/common'
import { UserController } from './controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entity'
import { JwtModule } from 'src/global_modules/jwt.module'
import { UserServices } from 'src/services/user.services'
import { AuthServices } from 'src/services/auth.services'

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule,
    ],
    controllers: [UserController],
    providers: [UserServices, AuthServices],
    exports: [UserServices, AuthServices]
})
export class UserRoutesModule {}