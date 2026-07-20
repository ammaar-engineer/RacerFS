import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConflictException, NotFoundException } from "src/CustomExceptionHandle";
import { User } from "src/entity";
import { Repository } from "typeorm";

@Injectable()
export class UserDbModules {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>
    ) {}
    async isEmail(action: 'exist' | 'notexist', email: string) {
        const emailExist = await this.userRepo.findOne({
            where: {
                email
            }
        })
        if (action == 'exist' && !emailExist) {
            throw new NotFoundException("Email not found")
        }
        if (action == 'notexist' && emailExist) {
            throw new ConflictException("Email already exist")
        }
        return emailExist
    }
    async createNewEmail(email: string) {
        const newUser = this.userRepo.create({email})
        await this.userRepo.save(newUser)
        return newUser
    }
    async findUser(email: string) {
        const user = await this.userRepo.findOne({
            where: {
                email
            }
        })
        return user
    }
}