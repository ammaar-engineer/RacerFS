import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark an endpoint as public — skips AccountTokenAuthGuard.
 * Use together with AccessTokenAuthGuard for endpoints that accept
 * access tokens instead of account JWT.
 *
 * @example
 * @Public()
 * @UseGuards(AccessTokenAuthGuard)
 * @Get('public-list')
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
