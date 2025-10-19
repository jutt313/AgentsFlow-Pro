import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

const createWorkflowSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

/**
 * GET /api/workflows - List all workflows for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Get workflows
    const workflows = await prisma.aIWorkflow.findMany({
      where: { userId: payload.userId },
      include: {
        agents: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
        _count: {
          select: {
            agents: true,
            integrations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error('Get workflows error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows - Create a new workflow
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    
    // Validate input
    const validation = createWorkflowSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, description } = validation.data;

    // Create workflow
    const workflow = await prisma.aIWorkflow.create({
      data: {
        userId: payload.userId,
        name,
        description: description || null,
        status: 'DRAFT',
      },
      include: {
        agents: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Workflow created successfully',
        workflow,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create workflow error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

