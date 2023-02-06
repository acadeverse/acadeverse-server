import express, { NextFunction, Request, Response } from 'express';
import AuthController from '../../controllers/auth.controller';

const router = express.Router();

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  console.log('Login request');
  
  //TODO: analytics, detect user device, send email warning, etc
  AuthController.login(req, res, next)
});

router.post('/register', (req: Request, res: Response, next: NextFunction) => {
  console.log('Register request');
  
  AuthController.register(req, res, next)

});

export default router;