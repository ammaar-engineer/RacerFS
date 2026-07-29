import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Connections
import { DatabaseModule } from './connections/database.module';
import { RedisModule } from './connections/redis.module';
import { MinioModule } from './connections/minio.module';
import { EmailModule } from './connections/email.module';

// Services
import { JwtModule } from './services/jwt.service';
// TokenModule is not needed in app.module since it's already @Global()

// Feature Modules
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    // Global Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // External Connections
    DatabaseModule, // PostgreSQL via TypeORM
    RedisModule, // Redis for caching
    MinioModule, // MinIO for object storage
    EmailModule, // Resend for email service

    // Shared Services
    JwtModule, // JWT authentication
    // TokenModule is @Global(), automatically available

    // Feature Modules
    UserModule, // User authentication & management
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
