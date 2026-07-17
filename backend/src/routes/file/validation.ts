import { Injectable, Module } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UnauthorizedException } from "src/CustomExceptionHandle";
import { Token } from "src/entity";
import { Repository } from "typeorm";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { JwtService } from "src/global_services/jwt.module";

@Injectable()
export class FileRouteValidations {
    constructor(
        @InjectRepository(Token) private readonly tokenRepo: Repository<Token>,
        private readonly jwtService: JwtService
    ) {}

    /**
     * Custom header validation with DTO
     * @param headerDtoClass DTO class for validation
     * @param headers Request headers object
     * @returns Validated header DTO instance
     * @throws ValidationError if validation fails
     */
    async customDtoValidation<T extends object>(
        customDtoClass: new () => T,
        source: Record<string, string>
    ): Promise<T> {
        const customDto = plainToInstance(customDtoClass, source, {
            excludeExtraneousValues: false
        })
        await validateOrReject(customDto)
        
        return customDto
    }
    /**
     * Check if access token exists in database
     * @param accessToken Token string to validate
     * @returns Token entity if found
     * @throws UnauthorizedException if token doesn't exist
     */
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

    /**
     * Validate dual-token authentication (account token + access token)
     * @param headers Request headers object
     * @param dtoClass DTO class for validation
     * @returns Object containing userId and accessTokenOwnerId
     * @throws UnauthorizedException if any validation fails
     */
    async validateDualTokenHeaders<T extends { authorization: string; 'access-token': string }>(
        headers: Record<string, string>,
        dtoClass: new () => T,
        config?: {validateOwner?: boolean}
    ) {
        // 1. Validate headers using DTO
        const headerDto = plainToInstance(dtoClass, headers, {
            excludeExtraneousValues: false
        })
        await validateOrReject(headerDto)

        // 2. Extract tokens
        const accountToken = headerDto['authorization']
        const accessToken = headerDto['access-token']

        // 3. Verify account token JWT
        const accountTokenValue = this.jwtService.verifyJwt<{ user_id: number, type: string }>(accountToken)
        if (!accountTokenValue.user_id || accountTokenValue.type !== "account_token") {
            throw new UnauthorizedException("Invalid account token")
        }

        // 4. Verify access token JWT
        const accessTokenValue = this.jwtService.verifyJwt<{ type: string }>(accessToken)
        if (accessTokenValue.type !== 'file_access_token') {
            throw new UnauthorizedException("Invalid access token")
        }

        const findToken = await this.tokenRepo.findOne({
            where: {
                token: accessToken
            },
            loadEagerRelations: false
        })

        if (!findToken) {
            throw new UnauthorizedException("Access token has been expired")
        }

        if (config?.validateOwner) {
            if (findToken.user_id !== accountTokenValue.user_id) {
                throw new UnauthorizedException("Youre request couldnt be allowed")
            }
        }

        return {
            accountTokenData: {
                rawToken: accountToken,
                value: accountTokenValue
            },
            accessTokenData: {
                rawToken: accessToken,
                value: accessTokenValue
            },
            accessTokenOwner: findToken
        }
    }

    /**
     * Validate single token authentication (account token only)
     * @param headers Request headers object
     * @param dtoClass DTO class for validation
     * @returns User ID from token
     * @throws UnauthorizedException if validation fails
     */
    async validateSingleTokenHeaders<T extends { authorization: string }>(
        headers: Record<string, string>,
        dtoClass: new () => T
    ): Promise<number> {
        // 1. Validate headers using DTO
        const headerDto = plainToInstance(dtoClass, headers, {
            excludeExtraneousValues: false
        })
        await validateOrReject(headerDto)

        // 2. Extract token
        const accountToken = headerDto['authorization']

        // 3. Verify account token JWT
        const accountTokenValue = this.jwtService.verifyJwt<{ user_id: number, type: string }>(accountToken)
        if (!accountTokenValue.user_id || accountTokenValue.type !== "account_token") {
            throw new UnauthorizedException("Invalid account token")
        }

        return accountTokenValue.user_id
    }
}