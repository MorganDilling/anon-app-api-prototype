import express from 'express';
const router = express.Router();
import { Request, Response } from 'express';
import prisma from '@lib/prisma';
import crypto, { KeyLike } from 'crypto';
import { hashPassword, verifyPassword } from '@lib/password';

const tempMessages: { [userId: number]: string } = {};

router.post('/request-reset-a', async (req: Request, res: Response) => {
  const { userId } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const publicKey = user.publicKey;

  const randMessage = crypto.randomBytes(32).toString('base64');

  tempMessages[userId] = randMessage;

  const encryptedRandMessage = crypto.publicEncrypt(
    publicKey,
    Buffer.from(randMessage, 'base64')
  );

  res.status(200).json({
    message: encryptedRandMessage.toString('base64'),
    encryptedPrivateKey: user.encryptedPrivateKey,
  });
});

router.post('/request-reset-b', async (req: Request, res: Response) => {
  const { userId, decryptedMessage, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!tempMessages[userId]) {
    return res.status(404).json({
      message:
        'temporary message not found. Try POSTing to /password/request-reset-a first.',
    });
  }

  if (tempMessages[userId] !== decryptedMessage) {
    return res.status(401).json({ message: 'Bad message' });
  }

  const hashedPassword = hashPassword(newPassword);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  await prisma.token.deleteMany({
    where: {
      userId,
    },
  });

  res.status(200).json({ message: 'Password reset successful' });

  delete tempMessages[userId];
});

export default router;
