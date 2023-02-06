export interface BaseErrorOptions {
  message: string,
  stack?: string,
}

export class BaseError extends Error {

  // public isOperational: boolean;

  constructor(options: BaseErrorOptions) {
    super(options.message);
    this.name = this.constructor.name;
    this.message = options.message;

    // this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    this.stack = options.stack;
    // Error.captureStackTrace(this, this.constructor.name);
  }
}