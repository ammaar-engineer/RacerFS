import { Module } from '@nestjs/common';
import { AppTypeOrmModule } from './global_modules/typeorm.module';
import { RedisClientModule } from './global_modules/redis.module';
import { EmailSendModule } from './global_modules/resend.module';
import { MinIOModule } from './global_modules/minio.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRoutesModule } from './routes/user/module';
import { FileRouteModule } from './routes/file/module';
import { PermissionBridgeModule } from './global_bridge/permission.bridge';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AppTypeOrmModule,
    RedisClientModule,
    EmailSendModule,
    MinIOModule,
    PermissionBridgeModule,
    UserRoutesModule,
    FileRouteModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
