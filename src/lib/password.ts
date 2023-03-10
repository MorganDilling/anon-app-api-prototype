import { randomBytes, createHmac } from 'crypto';

export const hashPassword = (password: string, salt?: string): string => {
  const saltBuffer =
    salt !== undefined ? Buffer.from(salt, 'hex') : randomBytes(32);
  const hash = createHmac('sha512', saltBuffer)
    .update(password)
    .digest('base64');

  return `${hash}:${saltBuffer.toString('hex')}`;
};

export const verifyPassword = (password: string, hash: string): boolean => {
  const [_, salt] = hash.split(':');

  const recalculatedHash = hashPassword(password, salt);

  return recalculatedHash === hash;
};
