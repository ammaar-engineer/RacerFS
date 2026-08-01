import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessTokenPayload } from '../decorators/current-token.decorator';
import { Token } from '../entities/token.entity';
import { JwtService } from '../services/jwt.service';

/**
 * AccessTokenAuthGuard validates file access tokens (JWT) from access-token header
 *
 * Strategy: Hybrid JWT + DB whitelist
 * 1. Verify JWT signature and decode payload
 * 2. Check if token exists in DB (whitelist) — allows revocation via delete
 *
 * Usage:
 *   @UseGuards(AccessTokenAuthGuard)
 *   @Get('public-download')
 *   async method(@CurrentToken('user_id') userId: number) { ... }
 */
@Injectable()
export class AccessTokenAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepo: Repository<Token>,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers['access-token'];

    if (!accessToken) {
      throw new UnauthorizedException('Access token header is required');
    }

    try {
      // Step 1: Verify JWT signature and decode
      const payload = this.jwtService.verifyJwt<AccessTokenPayload>(accessToken);

      if (payload.type !== 'file_access_token') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Step 2: Check if token exists in DB whitelist (allows revocation)
      const tokenData = await this.tokenRepo.findOne({
        where: {
          token: accessToken,
          type: 'file_access_token',
        },
      });

      if (!tokenData) {
        throw new UnauthorizedException('Access token has been revoked or does not exist');
      }

      // Attach payload to request
      request.token = {
        token_id: Number(tokenData.id),
        user_id: payload.user_id,
        type: 'file_access_token',
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.log(error)
      throw new UnauthorizedException('Access token validation failed');
    }
  }
}
