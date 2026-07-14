import {Global, Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import { Bucket, File, Snippet, User } from 'src/entity'


@Global()
@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            synchronize: true,
            entities: [User, Bucket, File, Snippet],
            username: 'racerfs',
            password: 'racerfs123',
            database: 'racerfs_db',
        })
    ],
    exports: [TypeOrmModule]
})
export class AppTypeOrmModule {}