import { Global, Module, Injectable } from "@nestjs/common";
import { UnauthorizedException } from "src/CustomExceptionHandle";
import { JwtService, JwtModule } from "./jwt.module";

@Injectable()
export class PermissionGlobalBridge {
    constructor(private readonly jwtService: JwtService) {}

    isValidAccountToken(token: string): {user_id: number, type: 'account_token'} {
        const accountTokenValue = this.jwtService.verifyJwt(token)
        if (!accountTokenValue.user_id || accountTokenValue.type !== 'account_token') {
            throw new UnauthorizedException("Invalid account token")
        }
        return accountTokenValue
    }

    isValidAccessToken(token: string): {user_id: number, type: 'file_access_token'} {
        const accessTokenValue = this.jwtService.verifyJwt(token)
        if (accessTokenValue.type !== 'file_access_token' || !accessTokenValue?.user_id) {
            throw new UnauthorizedException("Invalid access token")
        }
        return accessTokenValue
    }

    async isOwnerAction(
        account_token: string, 
        access_token: string, 
        {throwError = false}: {throwError: boolean}
    ) {
        const accountToken = this.isValidAccountToken(account_token)
        const accessToken = this.isValidAccessToken(access_token)
        if (accountToken.user_id !== accessToken.user_id && throwError) {
            throw new UnauthorizedException("Unauthorized action")
        }
        return {
            accessToken_user_id: accessToken?.user_id,
            accountToken_user_id: accountToken.user_id,
            isOwner: accountToken.user_id == accessToken.user_id
        }
    }
}

@Global()
@Module({
    imports: [JwtModule],
    providers: [PermissionGlobalBridge],
    exports: [PermissionGlobalBridge]
})
export class PermissionBridgeModule {}
