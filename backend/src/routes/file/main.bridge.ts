import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UnauthorizedException } from "src/CustomExceptionHandle";
import { File, Token } from "src/entity";
import { JwtModule, JwtService } from "src/global_services/jwt.module";
import { Repository } from "typeorm";

@Injectable()
export class FileBridgeModules {
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(Token) private readonly tokenRepo: Repository<Token>,
        @InjectRepository(File) private readonly fileRepo: Repository<File>
    ) {}
    isValidAccountToken(token: string): {user_id: number, type: 'account_token'} {
        const accountTokenValue = this.jwtService.verifyJwt(token)
        if (accountTokenValue.user_id || accountTokenValue.type !== 'account_token') {
            throw new UnauthorizedException("Invalid account token")
        }
        return accountTokenValue
    }
    isValidAccessToken(token: string) {
        const accessTokenValue = this.jwtService.verifyJwt(token)
        if (accessTokenValue.type !== 'file_access_token') {
            throw new UnauthorizedException("Invalid access token")
        }
    }
    async isAccessTokenExist(token: string) {
        const tokenDb = await this.tokenRepo.findOne({
            where: {
                token
            },
            loadEagerRelations: false
        })
        return tokenDb
    }
    async isOwner(account_token: string, access_token: string) {
        const {user_id} = this.isValidAccountToken(account_token)
        this.isValidAccessToken(access_token)
        const tokenOwnerId = await this.isAccessTokenExist(access_token)
        if (user_id !== tokenOwnerId?.user_id) {
            throw new UnauthorizedException("Unauthorized action")
        }
        return {
            tokenOwner: tokenOwnerId.user_id,
            user_id
        }
    }
    async getUserFileList(userId: number, accessTokenOwnerId: number) {
        const whereValidation = userId == accessTokenOwnerId 
            ? {user_id: userId}
            : {user_id: userId, is_public: true}
        const fileList = await this.fileRepo.find({
            where: whereValidation,
            order: {
                uploaded_at: 'DESC'
            }
        })
        return fileList.map(data => ({
            id: data.id,
            name: data.name,
            size: data.size,
            uploaded_at: data.uploaded_at
        }))
    }
}