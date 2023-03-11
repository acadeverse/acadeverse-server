import { ApiError } from '../errors/api.error';
import { ModelError, ModelErrorType } from '../errors/model.error';
import firebaseAdmin from '../services/firebaseProvider';
import httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';
import vars from '../../config/vars';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { AuthError, AuthErrorType } from '../errors/auth.error';
import { Auth } from 'firebase-admin/lib/auth/auth';

export interface AuthMiddleware {
  CheckFirebaseToken: (req: Request, res: Response, next: NextFunction) => void;
  CheckFirebaseTokenStrict: (req: Request, res: Response, next: NextFunction) => void;
}

let authMiddleware: AuthMiddleware = {
  CheckFirebaseToken: async (req: Request, res: Response, next: NextFunction) => {
    console.log('Auth middleware CheckFirebaseToken');
    
    try {
      const firebase_token = req.headers.firebase_token;
      if (firebase_token == undefined || Array.isArray(firebase_token)) throw new Error('missing token');

      let decodedIdToken: DecodedIdToken = await firebaseAdmin.auth().verifyIdToken(firebase_token);
      // let firebase_uid: string = decodedIdToken.uid;

      res.locals.decodedIdToken = decodedIdToken;
    }
    catch (e: any) {
      
    }
    next();
  },

  CheckFirebaseTokenStrict: async (req: Request, res: Response, next: NextFunction) => {
    console.log('Auth middleware CheckFirebaseToken');
    
    try {
      const firebase_token = req.headers.firebase_token;
      if (firebase_token == undefined || Array.isArray(firebase_token)) throw new Error('missing token');

      let decodedIdToken: DecodedIdToken = await firebaseAdmin.auth().verifyIdToken(firebase_token);
      // let firebase_uid: string = decodedIdToken.uid;

      res.locals.decodedIdToken = decodedIdToken;
    }
    catch (e: any) {
      //TODO: different error type for different errors.
      return next(new AuthError({
        type: AuthErrorType.Default,
        message: 'There is a problem with the auth token'
      }));
    }

    next();
  },

}

export default authMiddleware;