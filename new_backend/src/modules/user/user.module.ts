import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { User } from '../../entities/user.entity';
import { Token } from '../../entities/token.entity';
import { File } from '../../entities/file.entity';

// Shared Services
import { JwtModule } from '../../services/jwt.service';

// Controllers
import { UserController } from './controllers/user.controller';

// Services
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';

// Validations
import { UserValidation } from './validations/user.validation';
import { AuthValidation } from './validations/auth.validation';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Token, File]),
    JwtModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    AuthService,
    UserValidation,
    AuthValidation,
  ],
  exports: [UserService, AuthService],
})
export class UserModule {}
