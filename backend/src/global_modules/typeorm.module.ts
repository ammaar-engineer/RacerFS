import {Global, Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'


@Global()
@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'racerfs',
            password: 'racerfs123',
            database: 'racerfs_db',
        })
    ],
    exports: [TypeOrmModule]
})
export class AppTypeOrmModule {}