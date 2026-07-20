import {Global, Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import { File, Snippet, Token, User } from 'src/entity'


@Global()
@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            synchronize: true,
            entities: [User, File, Snippet, Token],
            username: 'racerfs',
            password: 'racerfs123',
            database: 'racerfs_db',
        })
    ],
    exports: [TypeOrmModule]
})
export class AppTypeOrmModule {}