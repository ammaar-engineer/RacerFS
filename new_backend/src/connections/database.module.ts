import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { File } from '../entities/file.entity';
import { Snippet } from '../entities/snippet.entity';
import { Token } from '../entities/token.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USERNAME', 'racerfs'),
        password: configService.get<string>('DATABASE_PASSWORD', 'racerfs123'),
        database: configService.get<string>('DATABASE_NAME', 'racerfs_db'),
        entities: [User, File, Snippet, Token],
        synchronize: configService.get<boolean>('DATABASE_SYNC', true),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
