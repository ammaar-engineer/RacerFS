import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity";
import { Repository } from "typeorm";
import { ConflictException, NotFoundException } from "src/CustomExceptionHandle";

@Injectable()
export class UserValidations {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
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
}