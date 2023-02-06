import express, { Request, Response } from 'express';
import authRoutes from './auth.routes';

const router = express.Router();

router.get('/status', (req: Request, res: Response) => {
  console.log('Status check OK');
  res.send('ok');
});

router.use('/auth', authRoutes);

export default router;