import express from 'express';
const router = express.Router();
import { Request, Response } from 'express';
import prisma from '@lib/prisma';
import { hashPassword, verifyPassword } from '@lib/password';
import { generateToken, deleteToken, verifyToken } from '@lib/token';

router.post('/login', async (req: Request, res: Response) => {
  const { password, userId } = req.body;

  console.log(password, userId);

  if (!password || password == '' || !userId) {
    return res.status(401).json({ access: false });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user)
    return res.status(404).json({ access: false, message: 'User not found' });

  const isValid = verifyPassword(password, user.password);

  if (!isValid)
    return res.status(401).json({ access: false, message: 'Invalid password' });

  const token = await generateToken(userId);

  res
    .status(200)
    .json({
      access: true,
      token,
      encryptedPrivateKey: user.encryptedPrivateKey,
    });
});

router.post('/logout', async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token || token == '')
    return res.status(401).json({ access: false }).send();

  const [isValid, user] = await verifyToken(token);

  if (!isValid) return res.status(401).json({ access: false });

  await deleteToken(token);

  res.status(200).send();
});

router.post('/logout-all', async (req: Request, res: Response) => {
  const { token, password, userId } = req.body;

  if (!token || token == '' || !password || password == '' || !userId)
    return res.status(401).json({ access: false });

  const [isValidToken, user] = await verifyToken(token);

  if (!isValidToken) return res.status(401).json({ access: false });

  const isValidPassword = verifyPassword(password, user?.password ?? '');

  if (!isValidPassword)
    return res.status(401).json({ access: false, message: 'Invalid password' });

  await prisma.token.deleteMany({
    where: {
      userId: user?.id,
    },
  });

  res.status(200).send();
});

router.post('/verify-token', async (req: Request, res: Response) => {
  const { token } = req.body;

  console.log(token);

  if (!token || token == '')
    return res
      .status(401)
      .json({ access: false, breakpoint: 'token existance check' });

  const [isValid, user] = await verifyToken(token);

  console.log('isvalid', isValid, user);

  if (!isValid)
    return res
      .status(401)
      .json({ access: false, breakpoint: 'token verification' });

  res
    .status(200)
    .json({ access: true, user, breakpoint: 'token verification success' });
});

router.use((req: Request, res: Response, next: any) => {
  const tokenHeader: string | undefined = req.get('token');

  if (tokenHeader !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ access: false });
  }

  next();
});

router.post('/generate-token', async (req: Request, res: Response) => {
  const { userId } = req.body;

  const token = await generateToken(userId);

  res.status(201).json({ token });
});

router.post('/verify-password', async (req: Request, res: Response) => {
  const { password, userId } = req.body;

  if (!password || password == '' || !userId) {
    return res.status(401).json({ access: false });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user)
    return res.status(404).json({ access: false, message: 'User not found' });

  const isValid = verifyPassword(password, user.password);

  if (!isValid)
    return res
      .status(401)
      .json({ access: false, message: 'Password not correct' });

  res.status(200).json({ access: true });
});

export default router;
