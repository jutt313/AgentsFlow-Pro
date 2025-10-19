import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAccessToken } from '@/lib/auth';
import { addBuilderJob } from '@/lib/queue';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

const deploySchema = z.object({
  workflowId: z.string().min(1, 'Workflow ID is required'),
  blueprint: z.any().optional(),
});

/**
 * POST /api/agents/builder/deploy - Deploy workflow with Builder Agent
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
    const validation = deploySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { workflowId, blueprint } = validation.data;

    // Check workflow exists and belongs to user
    const workflow = await prisma.aIWorkflow.findFirst({
      where: {
        id: workflowId,
        userId: payload.userId,
      },
      include: {
        blueprint: true,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Use blueprint from request or from database
    const blueprintData = blueprint || workflow.blueprint?.blueprintData;
    
    if (!blueprintData) {
      return NextResponse.json(
        { error: 'No blueprint found for deployment' },
        { status: 400 }
      );
    }

    // Generate correlation ID
    const correlationId = nanoid();

    // Add job to Builder Agent queue
    const job = await addBuilderJob({
      type: 'deploy',
      workflowId,
      blueprint: blueprintData,
      correlationId,
    });

    return NextResponse.json({
      message: 'Deployment request queued',
      jobId: job.id,
      correlationId,
      workflowId,
      status: 'deploying',
    });
  } catch (error) {
    console.error('Builder deploy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

