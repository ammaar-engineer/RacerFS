import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'


@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'racerfs',
            password: 'racerfs_password'
        })
    ],
    exports: [TypeOrmModule]
})
export class AppTypeOrmModule {}