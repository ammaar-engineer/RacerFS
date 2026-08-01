import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Token payload interfaces for different token types
 */
export interface AccountTokenPayload {
  user_id: number;
  type: 'account_token';
}

export interface AccessTokenPayload {
  token_id: number;
  user_id: number;
  type: 'file_access_token';
}

export type TokenPayload = AccountTokenPayload | AccessTokenPayload;

/**
 * Extract authenticated token payload or a specific field from the request.
 *
 * The token payload is injected by guards (AccountTokenAuthGuard or AccessTokenAuthGuard).
 *
 * @example
 * // Get full token payload
 * @CurrentToken() token: TokenPayload
 *
 * // Get account token user_id
 * @CurrentToken('user_id') userId: number
 *
 * // Get access token details
 * @CurrentToken() token: AccessTokenPayload
 *
 * Note: Requires appropriate auth guard to be applied first
 */
export const CurrentToken = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const token: TokenPayload = ctx.switchToHttp().getRequest().token;
    return field ? token?.[field] : token;
  },
);
