import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../entities/token.entity';
import { AccessTokenPayload } from '../decorators/current-token.decorator';

/**
 * AccessTokenAuthGuard validates file access tokens from access-token header
 * and injects the token data into request.token
 *
 * Usage:
 *   @UseGuards(AccessTokenAuthGuard)
 *   @Get('shared-file')
 *   async method(@CurrentToken('user_id') userId: number) { ... }
 */
@Injectable()
export class AccessTokenAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepo: Repository<Token>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers['access-token'];

    if (!accessToken) {
      throw new UnauthorizedException('Access token header is required');
    }

    try {
      // Validate access token exists in database
      const tokenData = await this.tokenRepo.findOne({
        where: {
          token: accessToken,
          type: 'file_access_token',
        },
      });

      if (!tokenData) {
        throw new UnauthorizedException('Invalid access token');
      }

      // Create payload matching interface
      const payload: AccessTokenPayload = {
        token_id: Number(tokenData.id),
        user_id: tokenData.user_id,
        type: 'file_access_token',
      };

      // Attach token payload to request object
      request.token = payload;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Access token validation failed');
    }
  }
}
