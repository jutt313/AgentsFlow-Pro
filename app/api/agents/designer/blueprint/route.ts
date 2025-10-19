/**
 * Designer Agent Blueprint API
 * Handles blueprint generation and retrieval
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { validateBlueprint } from '@/lib/blueprint-generator';

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
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Get session with blueprint
    const session = await prisma.designerSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.blueprint) {
      return NextResponse.json({ error: 'Blueprint not yet generated' }, { status: 404 });
    }

    // Validate blueprint
    const validation = validateBlueprint(session.blueprint as any);

    return NextResponse.json({
      blueprint: session.blueprint,
      validation,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  } catch (error: any) {
    console.error('Get Blueprint Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve blueprint', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Get session
    const session = await prisma.designerSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.blueprint) {
      return NextResponse.json(
        { error: 'Complete the conversation first to generate a blueprint' },
        { status: 400 }
      );
    }

    // Validate blueprint
    const validation = validateBlueprint(session.blueprint as any);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Blueprint validation failed',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Create or update workflow with blueprint
    const workflow = session.workflowId
      ? await prisma.aIWorkflow.update({
          where: { id: session.workflowId },
          data: {
            status: 'ACTIVE',
            updatedAt: new Date(),
          },
        })
      : await prisma.aIWorkflow.create({
          data: {
            userId,
            name: (session.blueprint as any).workflow_name,
            description: (session.blueprint as any).business_context.business_type,
            status: 'ACTIVE',
          },
        });

    // Update session
    await prisma.designerSession.update({
      where: { id: sessionId },
      data: {
        workflowId: workflow.id,
        status: 'completed',
      },
    });

    return NextResponse.json({
      success: true,
      workflowId: workflow.id,
      blueprint: session.blueprint,
      message: 'Blueprint approved and workflow created successfully',
    });
  } catch (error: any) {
    console.error('Approve Blueprint Error:', error);
    return NextResponse.json(
      { error: 'Failed to approve blueprint', details: error.message },
      { status: 500 }
    );
  }
}

