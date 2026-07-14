import {Module} from '@nestjs/common'
import { UserController } from './controller'
import { UserService } from './service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entity'
import { JwtModule } from 'src/global_services/jwt.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule,
    ],
    controllers: [UserController],
    providers: [UserService]
})
export class UserRoutesModule {}