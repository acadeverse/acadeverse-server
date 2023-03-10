import { NextFunction, Request, Response } from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import firebaseAdmin from '../services/firebaseProvider';
import UserModel from '../models/user.model';
import { ApiError } from "../errors/api.error";
import { ModelError, ModelErrorType } from "../errors/model.error";
import { modelToApiError } from '../utils/model.util';
import httpStatus from 'http-status';

interface AuthController {
  register(req: Request, res: Response, next: NextFunction): Promise<void | NextFunction>,
  login(req: Request, res: Response, next: NextFunction): Promise<void | NextFunction>,
}

let controller: AuthController = {
  register: async (req: Request, res: Response, next: NextFunction) : Promise<void | NextFunction> => {
    const { name } = req.body;

    let firebase_uid: string = res.locals.decodedIdToken.uid;

    console.log(`Registering: "${name}", firebase_uid: ${firebase_uid}`);

    try {
      let results: string = await UserModel.registerUser(name, firebase_uid);
      res.status(201).send(results);
    }
    catch(e: any) {
      console.log("Controller: " + e.message);
      next(e);

      // if (e instanceof ModelError) {
      //   throw modelToApiError(e);
      // }
      // throw new ApiError({message: e.message});
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) : Promise<void | NextFunction> => {
    let firebase_uid: string = res.locals.decodedIdToken.uid;

    console.log(`Logging in: firebase_uid: ${firebase_uid}`);

    try {
      let results: string = await UserModel.loginUser(firebase_uid);
      res.status(201).send(results);
      console.log(`User logged in with UUID: ${results}`);
    }
    catch(e: any) {
      console.log("Controller: " + e.message);
      next(e);

      // if (e instanceof ModelError) {
      //   throw modelToApiError(e);
      // }
      // throw new ApiError({message: e.message});
    }
  }
}

export default controller;