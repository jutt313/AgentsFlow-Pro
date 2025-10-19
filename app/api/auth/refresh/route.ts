import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  verifyRefreshToken,
  generateTokens,
  validateSessionToken,
  deleteUserSession,
  createUserSession,
} from '@/lib/auth';

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = refreshSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { refreshToken } = validation.data;

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Validate session exists in database
    const isValidSession = await validateSessionToken(refreshToken);
    if (!isValidSession) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Delete old session
    await deleteUserSession(refreshToken);

    // Generate new tokens
    const newTokens = generateTokens({
      userId: payload.userId,
      email: payload.email,
    });

    // Create new session
    await createUserSession(payload.userId, newTokens.refreshToken);

    return NextResponse.json({
      message: 'Token refreshed successfully',
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

