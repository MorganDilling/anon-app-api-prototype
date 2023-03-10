import prisma from '@lib/prisma';
import { User } from '@prisma/client';
import { randomBytes, createHmac } from 'crypto';

const generateRandomBufferAsync = (size = 1024): Promise<Buffer> =>
  new Promise((resolve, reject) =>
    randomBytes(size, (err, buffer) => {
      if (err) return reject(err);
      resolve(buffer);
    })
  );

export const generateToken = async (userId: number): Promise<string | null> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) return null;

  const randBuffer = await generateRandomBufferAsync();

  const salt = randomBytes(32);
  const hash = createHmac('sha512', salt).update(randBuffer).digest('base64');

  const tokenString = `${hash}.${salt.toString('hex')}`;

  const token = await prisma.token.create({
    data: {
      token: tokenString,
      userId: user.id,
    },
  });

  const returnString = `${randBuffer.toString('base64')}.${salt.toString(
    'hex'
  )}`;

  console.log('returnString', returnString);

  const [valid, userObj] = await verifyToken(returnString);

  console.log(valid, userObj);

  return returnString;
};

export const verifyToken = async (
  tokenRaw: string
): Promise<[boolean, User | null]> => {
  const [inToken, inSalt] = tokenRaw.split('.');
  if (!inToken || !inSalt) return [false, null];

  const token = Buffer.from(inToken, 'base64'),
    salt = Buffer.from(inSalt, 'hex');

  const recalculatedHash = createHmac('sha512', salt)
    .update(token)
    .digest('base64');

  const tokenEntry = await prisma.token.findFirst({
    where: { token: `${recalculatedHash}.${inSalt}` },
  });

  const user =
    tokenEntry !== null
      ? await prisma.user.findFirst({ where: { id: tokenEntry.userId } })
      : null;

  return [tokenEntry !== null, user];
};

export const deleteToken = async (tokenRaw: string): Promise<boolean> => {
  const [inToken, inSalt] = tokenRaw.split('.');
  if (!inToken || !inSalt) false;

  const token = Buffer.from(inToken, 'base64'),
    salt = Buffer.from(inSalt, 'hex');

  const recalculatedHash = createHmac('sha512', salt)
    .update(token)
    .digest('base64');

  const tokenEntry = await prisma.token.findFirst({
    where: { token: `${recalculatedHash}.${inSalt}` },
  });

  if (tokenEntry === null) return false;

  await prisma.token.delete({ where: { id: tokenEntry.id } });

  return true;
};
