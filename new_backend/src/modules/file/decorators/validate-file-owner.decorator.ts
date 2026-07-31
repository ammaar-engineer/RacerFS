import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract fileName from request and validate ownership
 *
 * This decorator works together with a manual validation call in the controller.
 * It extracts fileName from either body or query params.
 *
 * Usage:
 * async downloadFile(
 *   @CurrentToken('user_id') userId: number,
 *   @ValidateFileOwner() fileName: string
 * ) {
 *   await this.tokenValidation.isOwnerAction(userId, fileName);
 *   // ... rest of logic
 * }
 */
export const ValidateFileOwner = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const fileName = request.body?.fileName || request.query?.fileName;

    if (!fileName) {
      throw new Error('fileName not found in request');
    }

    return fileName;
  },
);
