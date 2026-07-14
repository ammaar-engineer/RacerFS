import {Module} from '@nestjs/common'
import { UserController } from './controller'
import { UserService } from './service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entity'
import { JwtModule } from 'src/global_services/jwt.module'
import { UserValidationModule } from './validation'

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule,
        UserValidationModule,
    ],
    controllers: [UserController],
    providers: [UserService]
})
export class UserRoutesModule {}