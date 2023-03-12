import express from 'express';
const router = express.Router();
import { Request, Response } from 'express';
import prisma from '@lib/prisma';
import { hashPassword, verifyPassword } from '@lib/password';
import { generateToken } from '@lib/token';

router.post('/create', async (req: Request, res: Response) => {
  const { password, encryptedPrivateKey, keyRecoveryHash, publicKey } =
    req.body;

  if (!password || !encryptedPrivateKey || !keyRecoveryHash || !publicKey) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const hashedPassword = hashPassword(password);

  const user = await prisma.user.create({
    data: {
      password: hashedPassword,
      encryptedPrivateKey,
      keyRecoveryHash,
      publicKey,
    },
  });

  res.status(201).json({ user });
});

router.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId || isNaN(Number(userId))) {
    return res
      .status(400)
      .json({ message: 'User not specified or is invalid' });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { password, ...userWithoutPassword } = user;

  res.status(200).json({ user: userWithoutPassword });
});

export default router;
