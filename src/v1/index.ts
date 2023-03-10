import express from 'express';
const router = express.Router();
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@lib/token';
import { User } from '@prisma/client';

import users from './routes/users';
import auth from './routes/auth';

const excludeRoutes = ['/users/create', '/auth/login', '/auth/verify-token'];

router.get('/', (req: Request, res: Response) => {
  res.json({
    'is-alive': true,
  });
});

router.all('*', async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.path);
  console.log(req.body);

  if (excludeRoutes.includes(req.path)) return next();

  const token: string | undefined = req.get('token');

  if (!token || token == '') return res.status(401).json({ access: false });

  const [isValid, user] = await verifyToken(token);

  if (!isValid) return res.status(401).json({ access: false });

  req.user = user;

  next();
});

router.use('/users', users);
router.use('/auth', auth);

export default router;
