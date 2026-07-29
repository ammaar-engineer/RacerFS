import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../middleware/auth.guard';

/**
 * Extract authenticated user or a specific field from the request.
 * Usage:
 *   @CurrentUser() user: AuthUser           → full user object
 *   @CurrentUser('user_id') userId: number  → specific field
 */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const user: AuthUser = ctx.switchToHttp().getRequest().user;
    return field ? user[field] : user;
  },
);
