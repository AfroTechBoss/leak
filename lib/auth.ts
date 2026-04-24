import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcrypt';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
);

export interface JournalistPayload {
  id: string;
  email: string;
  name: string;
  newsroom: string;
}

export async function signToken(payload: JournalistPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? '8h')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JournalistPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as JournalistPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
