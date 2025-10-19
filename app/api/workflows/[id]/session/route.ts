import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const workflowId = params.id;

    // Find the designer session for this workflow
    const session = await prisma.designerSession.findFirst({
      where: {
        workflowId: workflowId,
        userId: userId,
        status: 'active',
      },
      select: {
        id: true,
        stage: true,
        status: true,
        conversationState: true,
        businessContext: true,
        teamDesign: true,
        blueprint: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      sessionId: session.id,
      stage: session.stage,
      status: session.status,
      conversationState: session.conversationState,
      businessContext: session.businessContext,
      teamDesign: session.teamDesign,
      blueprint: session.blueprint,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  } catch (error: any) {
    console.error('Get Workflow Session Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve workflow session', details: error.message },
      { status: 500 }
    );
  }
}
