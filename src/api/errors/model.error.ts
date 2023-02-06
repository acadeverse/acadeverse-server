import { BaseError, BaseErrorOptions } from './base.error';

export enum ModelErrorType {
  Default,
  NotFonud,
  AlreadyExists,
  DatabaseError
}

export interface ModelErrorOptions extends BaseErrorOptions {
  message: string,
  stack?: string,
  type?: ModelErrorType;
}

export class ModelError extends BaseError {
  public type: number | undefined;
  constructor (options: ModelErrorOptions) {
    super({
      message: options.message,
      stack: options.stack,
    });
    this.type = options.type;
  }
}