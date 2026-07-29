import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { JwtService } from 'src/services/jwt.service';

export interface AuthUser {
  user_id: number;
  type: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    try {
      const payload = this.jwtService.verifyJwt<AuthUser>(authHeader);

      if (payload.type !== 'account_token') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Attach user to request object
      request.user = payload;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
