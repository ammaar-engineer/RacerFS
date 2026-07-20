import { Global, Module, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { UnauthorizedException } from 'src/CustomExceptionHandle';

@Injectable()
export class JwtService {
    private readonly secretKey: string;

    constructor(private readonly configService: ConfigService) {
        this.secretKey = this.configService.get<string>('JWT_SECRET') as string;
        
        if (!this.secretKey) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
    }

    /**
     * Generate JWT token
     * @param payload Object containing data to be encoded in the token
     * @param expiresIn Token expiration time in seconds (default: 691200 = 8 days)
     * @returns JWT token string
     */
    generateJwt(payload: object | string, expireTime: number = 691200): string {
        // Pastikan string JSON di-parse menjadi object agar klaim 'expiresIn' bisa ditanam oleh library
        const formattedPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;

        return jwt.sign(formattedPayload, this.secretKey, {
            expiresIn: expireTime
        });
    }

    /**
     * Verify JWT token
     * @param token JWT token string
     * @returns Decoded payload if valid
     * @throws UnauthorizedException if token is invalid or expired
     */
    verifyJwt<T = any>(token: string): T {
        try {
            return jwt.verify(token, this.secretKey) as T;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedException('Token has expired');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedException('Invalid token');
            }
            throw new UnauthorizedException('Token verification failed');
        }
    }
}

@Module({
    imports: [ConfigModule],
    providers: [JwtService],
    exports: [JwtService]
})
export class JwtModule {}
