import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate access and refresh tokens
 */
export function generateTokens(payload: TokenPayload): AuthTokens {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify a token (alias for verifyAccessToken for backwards compatibility)
 */
export function verifyToken(token: string): TokenPayload | null {
  return verifyAccessToken(token);
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Create a user session in the database
 */
export async function createUserSession(
  userId: string,
  refreshToken: string
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.userSession.create({
    data: {
      userId,
      token: refreshToken,
      expiresAt,
    },
  });
}

/**
 * Delete a user session from the database
 */
export async function deleteUserSession(token: string): Promise<void> {
  await prisma.userSession.deleteMany({
    where: { token },
  });
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.userSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

/**
 * Validate a session token exists in database
 */
export async function validateSessionToken(token: string): Promise<boolean> {
  const session = await prisma.userSession.findUnique({
    where: { token },
  });

  if (!session) return false;
  if (session.expiresAt < new Date()) {
    await deleteUserSession(token);
    return false;
  }

  return true;
}

