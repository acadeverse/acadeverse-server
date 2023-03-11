import express, { Request, Response } from 'express';
import authRoutes from './auth.routes';
import groupRoutes from './group.routes';

const router = express.Router();

router.get('/status', (req: Request, res: Response) => {
  console.log('Status check OK');
  res.send('ok');
});

router.use('/auth', authRoutes);
router.use('/group', groupRoutes);

export default router;