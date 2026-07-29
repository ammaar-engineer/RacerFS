import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Connections
import { DatabaseModule } from './connections/database.module';
import { EmailModule } from './connections/email.module';
import { MinioModule } from './connections/minio.module';
import { RedisModule } from './connections/redis.module';

// Services
import { JwtModule } from './services/jwt.service';

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

    // Feature Modules will be added here
    // UserModule,
    // FileModule,
    // SnippetModule,
    // TokenModule,
    // PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
