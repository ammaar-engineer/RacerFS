import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity";
import { Repository } from "typeorm";
import { TokenServices } from "../global_services/token.services";

@Injectable()
export class UserServices {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly tokenServices: TokenServices
    ) {}

    async HandleLoginAction(email: string) {
        const user = await this.findUser(email)
        return {
            token: this.tokenServices.generateToken({
                user_id: user?.id as number,
                type: "account_token"
            })
        }
    }

    async HandleRegisterAction(email: string) {
        const user = await this.createNewEmail(email)
        return {
            token: this.tokenServices.generateToken({
                user_id: user.id,
                type: "account_token"
            })
        }
    }

    async OtpAction(action: 'login' | 'register', email: string) {
        return action == 'login' ? this.HandleLoginAction(email) : this.HandleRegisterAction(email)
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

    async deleteUser(email: string) {
        await this.userRepo.delete({email})
    }
}