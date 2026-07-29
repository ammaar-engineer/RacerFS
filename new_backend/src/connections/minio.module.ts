import * as Minio from 'minio';
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

export type MinioClientType = Minio.Client;
export const MINIO_CLIENT = 'MINIO_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MINIO_CLIENT,
      useFactory(configService: ConfigService) {
        return new Minio.Client({
          endPoint: configService.get<string>('MINIO_HOST', 'localhost'),
          port: configService.get<number>('MINIO_PORT', 9000),
          useSSL: configService.get<boolean>('MINIO_USE_SSL', false),
          accessKey: configService.get<string>('MINIO_ACCESS_KEY') as string,
          secretKey: configService.get<string>('MINIO_SECRET_KEY') as string,
          region: configService.get<string>('MINIO_REGION', 'us-east-1'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [MINIO_CLIENT],
})
export class MinioModule {}
