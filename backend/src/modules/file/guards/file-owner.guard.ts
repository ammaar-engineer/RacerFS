import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokenValidation } from '../validations/token.validation';

/**
 * Guard to automatically validate file ownership before executing route handler
 *
 * This guard:
 * 1. Extracts userId from JWT token (set by AccountTokenAuthGuard)
 * 2. Extracts fileName from request body or query
 * 3. Validates that the user owns the file
 *
 * Usage in controller:
 * @UseGuards(AccountTokenAuthGuard, FileOwnerGuard)
 * @Get('download')
 * async downloadFile(@CurrentToken('user_id') userId: number, @Query() query: DownloadFileDto) {
 *   // Ownership already validated by guard - no need to call tokenValidation.isOwnerAction()
 * }
 */
@Injectable()
export class FileOwnerGuard implements CanActivate {
  constructor(private readonly tokenValidation: TokenValidation) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.token?.user_id; // Set by AccountTokenAuthGuard
    const fileName = request.body?.fileName || request.query?.fileName;

    if (!userId) {
      // This should not happen if AccountTokenAuthGuard is applied first
      return false;
    }

    if (!fileName) {
      // Skip validation if fileName is not present
      // This allows the guard to be used flexibly
      return true;
    }

    // Validate ownership - throws exception if user doesn't own the file
    await this.tokenValidation.isOwnerAction(userId, fileName);

    return true;
  }
}
