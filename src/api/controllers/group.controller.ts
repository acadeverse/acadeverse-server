import { NextFunction, Request, Response } from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import firebaseAdmin from '../services/firebaseProvider';
import GroupModel, { GroupJoinType, GroupStatusType, GroupViewModel, GroupVisibilityType } from '../models/group.model';
import GroupMemberModel, { GroupMemberViewModel } from '../models/groupMember.model';
import UserModel, { User } from '../models/user.model';
import { ApiError } from "../errors/api.error";
import { ModelError, ModelErrorType } from "../errors/model.error";
import { modelToApiError } from '../utils/model.util';
import httpStatus from 'http-status';

interface GroupController {
  createGroup(req: Request, res: Response, next: NextFunction): Promise<void | NextFunction>,
  readOneGroup(req: Request, res: Response, next: NextFunction): Promise<void | NextFunction>,
  readAvailableGroup(req: Request, res: Response, next: NextFunction): Promise<void | NextFunction>,
  // updateGroup(req: Request, res: Response, next: NextFunction): Promise<void | NextFunction>,
  // deleteGroup(req: Request, res: Response, next: NextFunction): Promise<void | NextFunction>,
  // createEvent(req: Request, res: Response, next: NextFunction): Promise<void | NextFunction>,
  // deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void | NextFunction>,
  joinGroup(req: Request, res: Response, next: NextFunction): Promise<void | NextFunction>,
  leaveGroup(req: Request, res: Response, next: NextFunction): Promise<void | NextFunction>,
}

let controller: GroupController = {
  createGroup: async (req: Request, res: Response, next: NextFunction) : Promise<void | NextFunction> => {
    const { 
      name,
      description
    } = req.body;

    let firebase_uid: string = res.locals.decodedIdToken.uid;

    console.log(`Creating group: "${name}", firebase_uid: ${firebase_uid}`);

    try {
      let user_uuid: string = (await UserModel.getOneByFirebaseUID(firebase_uid)).uuid;
      let results: string = await GroupModel.createGroup({
        uuid: '',
        name: name,
        owner_uuid: user_uuid,
        latitude: 0,
        longitude: 0,
        description: description,
        max_members: 10,
        cover_photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/A_Stream_of_Stars_over_Paranal.jpg/1280px-A_Stream_of_Stars_over_Paranal.jpg",
        thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/A_Stream_of_Stars_over_Paranal.jpg/1280px-A_Stream_of_Stars_over_Paranal.jpg",
        visibility: GroupVisibilityType.public,
        join_type: GroupJoinType.admin_approve,
        status: GroupStatusType.active
      });
      res.status(201).send(results);
    }
    catch(e: any) {
      console.log("Controller: " + e.message);
      next(e);
    }
  },
  readOneGroup: async (req: Request, res: Response, next: NextFunction) : Promise<void | NextFunction> => {
    let firebase_uid: string = res.locals.decodedIdToken?.uid;
    if (req.params.group_uuid == undefined) {
      next(new ApiError({message: `Missing group UUID`}));
      return;
    }

    try {
      let user: User = await UserModel.getOneByFirebaseUID(firebase_uid);
      //TODO: check if group is visible to user.
      let results: GroupViewModel = await GroupModel.getOne(req.params.group_uuid.toString(), user.uuid);
      res.status(200).send(results);
    }
    catch(e: any) {
      console.log("Controller: " + e.message);
      next(e);
    }
  },
  readAvailableGroup: async (req: Request, res: Response, next: NextFunction) : Promise<void | NextFunction> => {
    let firebase_uid: string = res.locals.decodedIdToken?.uid;
    console.log(firebase_uid);

    try {
      // let user: User = await UserModel.getOneByFirebaseUID(firebase_uid);
      //TODO: check if group is visible to user.
      let results: GroupViewModel[] = await GroupModel.getAllAccessibleByUser('');
      res.status(200).send(results);
    }
    catch(e: any) {
      console.log("Controller: " + e.message);
      next(e);
    }
  },

  joinGroup: async (req: Request, res: Response, next: NextFunction) : Promise<void | NextFunction> => {
    let firebase_uid: string = res.locals.decodedIdToken?.uid;
    console.log(firebase_uid);
    if (req.params.group_uuid == undefined) {
      next(new ApiError({message: `Missing group UUID`}));
      return;
    }

    try {
      let user: User = await UserModel.getOneByFirebaseUID(firebase_uid);
      //TODO: check if group is visible to user.
      await GroupMemberModel.joinGroup(req.params.group_uuid, user.uuid);
      res.status(201).send();
    }
    catch(e: any) {
      console.log("Controller: " + e.message);
      next(e);
    }
  },

  leaveGroup: async (req: Request, res: Response, next: NextFunction) : Promise<void | NextFunction> => {
    let firebase_uid: string = res.locals.decodedIdToken?.uid;
    console.log(firebase_uid);
    if (req.params.group_uuid == undefined) {
      next(new ApiError({message: `Missing group UUID`}));
      return;
    }

    try {
      let user: User = await UserModel.getOneByFirebaseUID(firebase_uid);
      //TODO: check if group is visible to user.
      await GroupMemberModel.leaveGroup(req.params.group_uuid, user.uuid);
      res.status(204).send();
    }
    catch(e: any) {
      console.log("Controller: " + e.message);
      next(e);
    }
  },
}

export default controller;