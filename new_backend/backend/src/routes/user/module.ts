import {Module} from '@nestjs/common'
import { UserController } from './controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { File, Token, User } from 'src/entity'
import { JwtModule } from 'src/global_services/jwt.services'
import { UserServices } from 'src/services/user.services'
import { AuthServices } from 'src/services/auth.services'
import { FileServices } from 'src/services/file.services'
import { AuthValidations } from 'src/validation/auth.validations'
import { UserValidations } from 'src/validation/user.validations'
import { FileValidations } from 'src/validation/file.validations'

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Token, File]),
        JwtModule
    ],
    controllers: [UserController],
    providers: [FileValidations, UserServices, AuthServices, FileServices, AuthValidations, UserValidations],
    exports: [UserServices, AuthServices]
})
export class UserRoutesModule {}