/**
 * Designer Agent Sessions API
 * List and manage designer sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    // Get all sessions for user
    const sessions = await prisma.designerSession.findMany({
      where: {
        userId,
        status,
      },
      select: {
        id: true,
        stage: true,
        status: true,
        businessContext: true,
        createdAt: true,
        updatedAt: true,
        workflow: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('List Sessions Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve sessions', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Verify ownership and delete
    const session = await prisma.designerSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await prisma.designerSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete Session Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session', details: error.message },
      { status: 500 }
    );
  }
}

