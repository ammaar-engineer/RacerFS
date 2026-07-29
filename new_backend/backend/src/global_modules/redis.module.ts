import { Global, Logger, Module } from "@nestjs/common";
import { createClient } from "redis";
import {ConfigModule, ConfigService} from '@nestjs/config'


export type RedisModuleType = ReturnType<typeof createClient>
export const REDIS_CLIENT = "REDIS_CLIENT"
@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
             provide: REDIS_CLIENT,
             async useFactory(configService: ConfigService) {
                const logger = new Logger(REDIS_CLIENT)
                const client = createClient({
                    url: configService.get<string>('REDIS_URL')
                })
                client.on('error', (err) => logger.error("Redis connection error", err))
                await client.connect()
                return client
             },
             inject: [ConfigService]
        }
    ],
    exports: [REDIS_CLIENT]
})
export class RedisClientModule {}