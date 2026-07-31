import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '../../../services/jwt.service';
import { Token } from '../../../entities/token.entity';
import { File } from '../../../entities/file.entity';
import {
  UnauthorizedException,
  NotFoundException,
} from '../../../middleware/exceptions';

interface TokenPayload {
  user_id: number;
  type: string;
}

@Injectable()
export class TokenValidation {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepo: Repository<Token>,
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Verify and decode account token (JWT)
   */
  isValidAccountToken(authHeader: string): TokenPayload {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    // Remove 'Bearer ' prefix if present
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    try {
      const payload = this.jwtService.verifyJwt<TokenPayload>(token);

      if (payload.type !== 'account_token') {
        throw new UnauthorizedException('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Check if user owns the file
   */
  async isOwnerAction(
    userId: number,
    fileName: string,
  ): Promise<{ isOwner: boolean; file: File | null }> {
    const file = await this.fileRepo.findOne({
      where: {
        name: fileName,
        user_id: userId,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return {
      isOwner: file.user_id === userId,
      file,
    };
  }

  /**
   * Validate access token exists and return it
   */
  async validateAccessToken(accessToken: string): Promise<Token> {
    const token = await this.tokenRepo.findOne({
      where: { token: accessToken },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid access token');
    }

    return token;
  }
}
