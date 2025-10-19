import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteUserSession } from '@/lib/auth';

const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = logoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { refreshToken } = validation.data;

    // Delete session
    await deleteUserSession(refreshToken);

    return NextResponse.json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

