import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinIOModule } from './global_modules/minio.module';
import { RedisClientModule } from './global_modules/redis.module';
import { EmailSendModule } from './global_modules/resend.module';
import { AppTypeOrmModule } from './global_modules/typeorm.module';
import { JwtModule } from './global_services/jwt.services';
import { TokenModule } from './global_services/token.services';
import { FileRouteModule } from './routes/file/module';
import { PaymentRouteModule } from './routes/payments/module';
import { SnippetRouteModule } from './routes/snippet/module';
import { UserRoutesModule } from './routes/user/module';

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
    SnippetRouteModule,
    PaymentRouteModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}