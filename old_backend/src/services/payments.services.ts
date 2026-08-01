import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NotFoundException } from "src/CustomExceptionHandle";
import { User } from "src/entity";
import { Repository } from "typeorm";

@Injectable()
export class PaymentServices {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
    ) {}

    async addStorage(userId: number, additionalSize: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            loadEagerRelations: false
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }
        console.log("STORAGE BERTAMBAH: ", Number(user.storage_size) + additionalSize)
        user.storage_size = Number(user.storage_size) + additionalSize;
        await this.userRepo.save(user);

        return user;
    }
}