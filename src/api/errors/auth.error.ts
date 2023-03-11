import { BaseError, BaseErrorOptions } from './base.error';

export enum AuthErrorType {
  Default,
  TokenNotFound,
  InvalidToken,
  ExpiredToken,
  Unauthorized
}

export interface AuthErrorOptions extends BaseErrorOptions {
  message: string,
  stack?: string,
  type?: AuthErrorType;
}

export class AuthError extends BaseError {
  public type: AuthErrorType | undefined;
  constructor (options: AuthErrorOptions) {
    super({
      message: options.message,
      stack: options.stack,
    });
    this.type = options.type;
  }
}