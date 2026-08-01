export class BaseException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly data: any,
    public readonly errorCode: string,
    public readonly success: boolean
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestException extends BaseException {
  constructor(message: string) {
    super(message, 400, null, 'BAD_REQUEST', false);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string) {
    super(message, 401, null, 'UNAUTHORIZED', false);
  }
}

export class ForbiddenException extends BaseException {
  constructor(message: string) {
    super(message, 403, null, 'FORBIDDEN', false);
  }
}

export class NotFoundException extends BaseException {
  constructor(message: string) {
    super(message, 404, null, 'NOT_FOUND', false);
  }
}

export class ConflictException extends BaseException {
  constructor(message: string) {
    super(message, 409, null, 'CONFLICT', false);
  }
}

export class UnprocessableEntityException extends BaseException {
  constructor(message: string) {
    super(message, 422, null, 'UNPROCESSABLE_ENTITY', false);
  }
}

export class InternalServerErrorException extends BaseException {
  constructor(message: string) {
    super(message, 500, null, 'INTERNAL_SERVER_ERROR', false);
  }
}
