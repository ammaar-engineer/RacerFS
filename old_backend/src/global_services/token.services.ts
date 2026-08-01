import { Global, Module, Injectable } from "@nestjs/common";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "src/global_services/jwt.services";
import { TokenValidations } from "src/validation/token.validations";
import { Token, TokenType } from "src/entity";
import { NotFoundException, UnauthorizedException } from "src/CustomExceptionHandle";

@Injectable()
export class TokenServices {
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(Token) private readonly tokenRepo: Repository<Token>,
    ) {}

    generateToken(payload: { user_id: number, type: string }): string {
        return this.jwtService.generateJwt(payload)
    }

    async generateAccessToken(user_id: number): Promise<string> {
        const token = this.jwtService.generateJwt({
            user_id,
            type: "file_access_token"
        })
        return token
    }

    async createAccessToken(user_id: number, token: string) {
        const newToken = new Token()
        newToken.token = token
        newToken.user_id = user_id
        newToken.type = "file_access_token"
        await this.tokenRepo.save(newToken)
        return newToken
    }

    async deleteAccessToken(token_to_delete: string, requesting_user_id: number) {
        const tokenDb = await this.tokenRepo.findOne({
            where: { 
                token: token_to_delete,
                type: TokenType.file_access_token
            },
            loadEagerRelations: false
        })
        
        if (!tokenDb) {
            throw new NotFoundException("Access token not found")
        }
        
        if (tokenDb.user_id !== requesting_user_id) {
            throw new UnauthorizedException("You don't own this access token")
        }
        
        await this.tokenRepo.delete({ token: token_to_delete })
    }
}

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([Token])],
    providers: [TokenServices, TokenValidations],
    exports: [TokenServices, TokenValidations]
})
export class TokenModule {}