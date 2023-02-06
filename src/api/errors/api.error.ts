import { BaseError, BaseErrorOptions } from './base.error';
import httpStatus from 'http-status';

interface ApiErrorOptions extends BaseErrorOptions {
  message: string,
  stack?: string,
  errors?: string;
  status?: number;
  isPublic?: boolean;
}

export class ApiError extends BaseError {
  public errors: string | undefined;
  public status: number;
  public isPublic: boolean | undefined;
  constructor (options: ApiErrorOptions) {
    super({ 
      message: options.message,
      stack: options.stack,
    });
    this.errors = options.errors;
    this.status = options.status || httpStatus.INTERNAL_SERVER_ERROR;
    this.isPublic = options.isPublic;
  }
}