import { Injectable, Module } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/entity";
import { ConflictException, NotFoundException } from "src/CustomExceptionHandle";
import { TypeOrmModule } from "@nestjs/typeorm";

@Injectable()
export class UserValidationService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {}

    /**
     * Validasi apakah email sudah terdaftar
     * @param email Email yang akan dicek
     * @throws ConflictException jika email sudah ada
     */
    async validateEmailNotExists(email: string) {
        const emailExist = await this.userRepository.findOne({
            where: { email }
        });
        
        if (emailExist) {
            throw new ConflictException("Account already exists");
        }
        return emailExist
    }

    /**
     * Validasi apakah user dengan email tersebut ada di database
     * @param email Email yang akan dicek
     * @throws NotFoundException jika user tidak ditemukan
     */
    async validateEmailExists(email: string) {
        const user = await this.userRepository.findOne({
            where: { email }
        });
        
        if (!user) {
            throw new NotFoundException("Account not found. Please register first");
        }
        return user
    }

    /**
     * Validasi action untuk login - user harus sudah ada
     * @param email Email yang akan dicek
     * @param action Action yang sedang dilakukan
     * @throws NotFoundException jika action login tapi user tidak ada
     */
    async validateLoginAction(email: string, action: string) {
        if (action === 'login') {
            return await this.validateEmailExists(email);
        }
    }

    /**
     * Validasi action untuk register - email harus belum terdaftar
     * @param email Email yang akan dicek
     * @param action Action yang sedang dilakukan
     * @throws ConflictException jika action register tapi email sudah ada
     */
    async validateRegisterAction(email: string, action: string) {
        if (action === 'register') {
            return await this.validateEmailNotExists(email)
        }
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserValidationService],
    exports: [UserValidationService]
})
export class UserValidationModule {}
