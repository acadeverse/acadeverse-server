import { ApiError } from '../errors/api.error';
import { ModelError, ModelErrorType } from '../errors/model.error';
import httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';
import vars from '../../config/vars';
import { AuthError, AuthErrorType } from '../errors/auth.error';

export interface ErrorMiddleware {
  Handler: (err: ApiError, req: Request, res: Response, next: NextFunction) => void;
  ConvertToApiError: (err: Error, req: Request, res: Response, next: NextFunction) => void;
}

let errorMiddleware: ErrorMiddleware = {
  Handler: (err: ApiError, req: Request, res: Response, next: NextFunction) => {
    console.log('Handler middleware');
    
    const response = {
      code: err.status,
      message: err.message || httpStatus[err.status],
      errors: err.errors,
      stack: err.stack,
    };

    if (vars.env !== 'development') {
      delete response.stack;
    }

    console.log(`Sending HTTP ${err.status}`);
    console.log(`Message: ${response.message}`);
    res.status(err.status);
    res.json(response);
  },

  ConvertToApiError: (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log('ConvertToApiError middleware');
    
    let type: number = httpStatus.INTERNAL_SERVER_ERROR;

    if (err instanceof ModelError) {
      switch (err.type) {
        case ModelErrorType.Default:
          type = httpStatus.INTERNAL_SERVER_ERROR;
          break;
        case ModelErrorType.NotFonud:
          type = httpStatus.INTERNAL_SERVER_ERROR;
          break;
        case ModelErrorType.AlreadyExists:
          type = httpStatus.INTERNAL_SERVER_ERROR;
          break;
        case ModelErrorType.DatabaseError:
          type = httpStatus.INTERNAL_SERVER_ERROR;
          break;
      }
    }
    if (err instanceof AuthError) {
      switch (err.type) {
        case AuthErrorType.Default:
          type = httpStatus.INTERNAL_SERVER_ERROR;
          break;
        case AuthErrorType.TokenNotFound:
          type = httpStatus.INTERNAL_SERVER_ERROR;
          break;
        case AuthErrorType.InvalidToken:
          type = httpStatus.INTERNAL_SERVER_ERROR;
          break;
        case AuthErrorType.ExpiredToken:
          type = httpStatus.INTERNAL_SERVER_ERROR;
          break;
        case AuthErrorType.Unauthorized:
          type = httpStatus.INTERNAL_SERVER_ERROR;
          break;
      }
    }

    return errorMiddleware.Handler(new ApiError({
      message: err.message,
      status: type
    }), req, res, next);
  }
}

export default errorMiddleware;

//  errorMiddleware;