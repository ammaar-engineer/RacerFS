import { Global, Module, Res } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {Resend} from 'resend'

export const RESEND_CLIENT = "RESEND_CLIENT"

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: RESEND_CLIENT,
            useFactory (configService: ConfigService) {
                return new Resend(configService.get('RESEND_API_KEY'))
            },
            inject: [ConfigService]
        }
    ],
    exports: [RESEND_CLIENT]
})
export class EmailSendModule {}