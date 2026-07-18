import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { plainToInstance } from "class-transformer";
import { validateOrReject, ValidationError, IsString, IsNotEmpty, IsNumberString } from "class-validator";
import { UnauthorizedException, NotFoundException } from "src/CustomExceptionHandle";
import { Token } from "src/entity";
import { JwtService } from "src/global_services/jwt.module";

// DTO Classes
export class FileUploadHeadersDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
    
    @IsString()
    @IsNotEmpty()
    "access-token"!: string
    
    @IsString()
    @IsNotEmpty()
    "x-file-name"!: string
}

export class FileUploadQueryDTO {
    @IsString()
    @IsNotEmpty()
    fileName!: string
}

export class FileListHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
    
    @IsString()
    @IsNotEmpty()
    "access-token"!: string
}

export class FileEditHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
    
    @IsString()
    @IsNotEmpty()
    "access-token"!: string
}

export class FileEditQueryDTO {
    @IsString()
    @IsNotEmpty()
    fileKey!: string

    @IsString()
    @IsNotEmpty()
    "new-name"!: string
}

export class FileDownloadHeaderDTO {
    @IsString()
    @IsNotEmpty()
    "authorization"!: string
}

export class FileDownloadQueryDTO {
    @IsString()
    @IsNotEmpty()
    fileName!: string

    @IsNumberString()
    @IsNotEmpty()
    userId!: string
}

@Injectable()
export class HttpValidation {
    constructor(
        @InjectRepository(Token) private readonly tokenRepo: Repository<Token>,
        private readonly jwtService: JwtService
    ) {}

    /**
     * Validate headers using DTO
     */
    private async _validateHeaders<T extends object>(
        dtoClass: new () => T,
        headers: Record<string, string>
    ): Promise<T> {
        const dto = plainToInstance(dtoClass, headers, {
            excludeExtraneousValues: false
        });

        try {
            await validateOrReject(dto);
        } catch (errors) {
            if (Array.isArray(errors) && errors.length > 0) {
                const firstError = errors[0] as ValidationError;
                const constraints = firstError.constraints;
                const errorMessage = constraints 
                    ? Object.values(constraints)[0] 
                    : "Header validation failed";
                throw new NotFoundException(errorMessage);
            }
            throw new NotFoundException("Header validation failed");
        }

        return dto;
    }

    /**
     * Validate query parameters using DTO
     */
    private async _validateQuery<T extends object>(
        dtoClass: new () => T,
        query: Record<string, string>
    ): Promise<T> {
        const dto = plainToInstance(dtoClass, query, {
            excludeExtraneousValues: false
        });

        try {
            await validateOrReject(dto);
        } catch (errors) {
            if (Array.isArray(errors) && errors.length > 0) {
                const firstError = errors[0] as ValidationError;
                const constraints = firstError.constraints;
                const errorMessage = constraints 
                    ? Object.values(constraints)[0] 
                    : "Query validation failed";
                throw new NotFoundException(errorMessage);
            }
            throw new NotFoundException("Query validation failed");
        }

        return dto;
    }

    /**
     * Verify account token JWT
     */
    private _verifyAccountToken(token: string): { user_id: number; type: string } {
        const accountTokenValue = this.jwtService.verifyJwt<{ user_id: number; type: string }>(token);
        
        if (!accountTokenValue.user_id || accountTokenValue.type !== "account_token") {
            throw new UnauthorizedException("Invalid account token");
        }

        return accountTokenValue;
    }

    /**
     * Verify access token JWT and check database
     */
    private async _verifyAccessToken(token: string): Promise<Token> {
        const accessTokenValue = this.jwtService.verifyJwt<{ type: string }>(token);
        
        if (accessTokenValue.type !== 'file_access_token') {
            throw new UnauthorizedException("Invalid access token");
        }

        const findToken = await this.tokenRepo.findOne({
            where: {
                token: token
            },
            loadEagerRelations: false
        });

        if (!findToken) {
            throw new UnauthorizedException("Access token has been expired");
        }

        return findToken;
    }

    /**
     * Check token ownership
     */
    private _checkTokenOwnership(accountUserId: number, accessTokenUserId: number): void {
        if (accountUserId !== accessTokenUserId) {
            throw new UnauthorizedException("You're not allowed to access this resource");
        }
    }

    /**
     * Validate GET /file/list request
     */
    async validateFileListRequest(headers: Record<string, string>): Promise<{
        userId: number;
        accessTokenOwnerId: number;
    }> {
        // Validate headers
        const headerDto = await this._validateHeaders(FileListHeaderDTO, headers);

        // Verify account token
        const accountTokenData = this._verifyAccountToken(headerDto.authorization);

        // Verify access token
        const accessToken = await this._verifyAccessToken(headerDto['access-token']);

        return {
            userId: accountTokenData.user_id,
            accessTokenOwnerId: accessToken.user_id
        };
    }

    /**
     * Validate PATCH /file/rename request
     */
    async validateFileRenameRequest(
        headers: Record<string, string>,
        query: Record<string, string>
    ): Promise<{
        userId: number;
        accessTokenOwnerId: number;
        fileKey: string;
        newName: string;
    }> {
        // Validate headers
        const headerDto = await this._validateHeaders(FileEditHeaderDTO, headers);

        // Verify account token
        const accountTokenData = this._verifyAccountToken(headerDto.authorization);

        // Verify access token
        const accessToken = await this._verifyAccessToken(headerDto['access-token']);

        // Check ownership
        this._checkTokenOwnership(accountTokenData.user_id, accessToken.user_id);

        // Validate query
        const queryDto = await this._validateQuery(FileEditQueryDTO, query);

        return {
            userId: accountTokenData.user_id,
            accessTokenOwnerId: accessToken.user_id,
            fileKey: queryDto.fileKey,
            newName: queryDto['new-name']
        };
    }

    /**
     * Validate GET /file/download request
     */
    async validateFileDownloadRequest(
        headers: Record<string, string>,
        query: Record<string, string>
    ): Promise<{
        userId: number;
        fileName: string;
        targetUserId: number;
    }> {
        // Validate headers
        const headerDto = await this._validateHeaders(FileDownloadHeaderDTO, headers);

        // Verify account token
        const accountTokenData = this._verifyAccountToken(headerDto.authorization);

        // Validate query
        const queryDto = await this._validateQuery(FileDownloadQueryDTO, query);

        return {
            userId: accountTokenData.user_id,
            fileName: queryDto.fileName,
            targetUserId: parseInt(queryDto.userId, 10)
        };
    }

    /**
     * Validate POST /file/upload request
     */
    async validateFileUploadRequest(headers: Record<string, string>): Promise<{
        userId: number;
        accessTokenOwnerId: number;
        fileName: string;
    }> {
        // Validate headers
        const headerDto = await this._validateHeaders(FileUploadHeadersDTO, headers);

        // Verify account token
        const accountTokenData = this._verifyAccountToken(headerDto.authorization);

        // Verify access token
        const accessToken = await this._verifyAccessToken(headerDto['access-token']);

        // Check ownership
        this._checkTokenOwnership(accountTokenData.user_id, accessToken.user_id);

        return {
            userId: accountTokenData.user_id,
            accessTokenOwnerId: accessToken.user_id,
            fileName: headerDto['x-file-name']
        };
    }
}
