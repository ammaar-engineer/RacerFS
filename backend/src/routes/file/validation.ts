import { Injectable, Module } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UnauthorizedException } from "src/CustomExceptionHandle";
import { Token } from "src/entity";
import { Repository } from "typeorm";

@Injectable()
export class FileRouteValidations {
    constructor(
        @InjectRepository(Token) private readonly tokenRepo: Repository<Token>
    ) {}
    async checkAccessTokenExist(accessToken: string) {
        const tokenExist = await this.tokenRepo.findOne({
            where: {
                token: accessToken
            },
            loadRelationIds: false
        })
        if (!tokenExist) {
            throw new UnauthorizedException("Access token has expired")
        }
        return tokenExist
    }
}