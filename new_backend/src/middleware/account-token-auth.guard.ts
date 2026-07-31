import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../services/jwt.service';
import { AccountTokenPayload } from '../decorators/current-token.decorator';

/**
 * AccountTokenAuthGuard validates account tokens (JWT) from Authorization header
 * and injects the decoded payload into request.token
 *
 * Usage:
 *   @UseGuards(AccountTokenAuthGuard)
 *   @Get('endpoint')
 *   async method(@CurrentToken('user_id') userId: number) { ... }
 */
@Injectable()
export class AccountTokenAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    try {
      const payload = this.jwtService.verifyJwt<AccountTokenPayload>(authHeader);

      if (payload.type !== 'account_token') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Attach token payload to request object
      request.token = payload;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
