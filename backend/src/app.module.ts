import { Module } from '@nestjs/common';
import { AppTypeOrmModule } from './global_modules/typeorm.module';
import { RedisClientModule } from './global_modules/redis.module';
import { EmailSendModule } from './global_modules/resend.module';
import { MinIOModule } from './global_modules/minio.module';
import { JwtModule } from './global_modules/jwt.module';
import { ConfigModule } from '@nestjs/config';
import { TokenModule } from './services/token.services';
import { UserRoutesModule } from './routes/user/module';
import { FileRouteModule } from './routes/file/module';
import { SnippetRouteModule } from './routes/snippet/module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AppTypeOrmModule,
    RedisClientModule,
    EmailSendModule,
    MinIOModule,
    JwtModule,
    TokenModule,
    UserRoutesModule,
    FileRouteModule,
    SnippetRouteModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}