import express, { NextFunction, Request, Response } from 'express';
import GroupController from '../../controllers/group.controller';
import authMiddleware from '../../middlewares/auth.middleware';

const router = express.Router();

router.get('/', authMiddleware.CheckFirebaseToken, (req: Request, res: Response, next: NextFunction) => {
  console.log('Group get request');
  
  GroupController.readAvailableGroup(req, res, next)
});

router.get('/:group_uuid', authMiddleware.CheckFirebaseToken, (req: Request, res: Response, next: NextFunction) => {
  console.log('Group get request');
  
  GroupController.readOneGroup(req, res, next)
});

router.post('/create', authMiddleware.CheckFirebaseTokenStrict, (req: Request, res: Response, next: NextFunction) => {
  console.log('Group create request');
  
  //TODO: analytics, detect user device, send email warning, etc
  GroupController.createGroup(req, res, next)
});

router.post('/join/:group_uuid', authMiddleware.CheckFirebaseTokenStrict, (req: Request, res: Response, next: NextFunction) => {
  console.log('Group create request');
  
  //TODO: analytics, detect user device, send email warning, etc
  GroupController.joinGroup(req, res, next)
});

router.post('/leave/:group_uuid', authMiddleware.CheckFirebaseTokenStrict, (req: Request, res: Response, next: NextFunction) => {
  console.log('Group create request');
  
  //TODO: analytics, detect user device, send email warning, etc
  GroupController.leaveGroup(req, res, next)
});

// router.post('/update', (req: Request, res: Response, next: NextFunction) => {
//   console.log('Group update request');
  
//   GroupController.register(req, res, next)
// });

// router.post('/delete', (req: Request, res: Response, next: NextFunction) => {
//   console.log('Group update request');
  
//   GroupController.register(req, res, next)
// });

export default router;