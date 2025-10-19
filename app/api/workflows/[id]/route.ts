import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

const updateWorkflowSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'STOPPED', 'ERROR']).optional(),
});

/**
 * GET /api/workflows/[id] - Get workflow details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get workflow
    const workflow = await prisma.aIWorkflow.findFirst({
      where: {
        id,
        userId: payload.userId,
      },
      include: {
        agents: {
          include: {
            logs: {
              orderBy: { timestamp: 'desc' },
              take: 10,
            },
            healthChecks: {
              orderBy: { timestamp: 'desc' },
              take: 1,
            },
          },
        },
        blueprint: true,
        integrations: true,
        automations: true,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Get workflow error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workflows/[id] - Update workflow
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    
    // Validate input
    const validation = updateWorkflowSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Check workflow exists and belongs to user
    const existingWorkflow = await prisma.aIWorkflow.findFirst({
      where: {
        id,
        userId: payload.userId,
      },
    });

    if (!existingWorkflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Update workflow
    const workflow = await prisma.aIWorkflow.update({
      where: { id },
      data: validation.data,
      include: {
        agents: true,
      },
    });

    return NextResponse.json({
      message: 'Workflow updated successfully',
      workflow,
    });
  } catch (error) {
    console.error('Update workflow error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/[id] - Delete workflow
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check workflow exists and belongs to user
    const existingWorkflow = await prisma.aIWorkflow.findFirst({
      where: {
        id,
        userId: payload.userId,
      },
    });

    if (!existingWorkflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Delete workflow (cascade will delete related records)
    await prisma.aIWorkflow.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Workflow deleted successfully',
    });
  } catch (error) {
    console.error('Delete workflow error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

