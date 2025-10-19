import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAccessToken } from '@/lib/auth';
import { addBuilderJob } from '@/lib/queue';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

const healSchema = z.object({
  workflowId: z.string().min(1, 'Workflow ID is required'),
  reason: z.string().optional(),
});

/**
 * POST /api/agents/monitor/heal - Trigger auto-healing for a workflow
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
    const validation = healSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { workflowId, reason } = validation.data;

    // Check workflow exists and belongs to user
    const workflow = await prisma.aIWorkflow.findFirst({
      where: {
        id: workflowId,
        userId: payload.userId,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Generate correlation ID
    const correlationId = nanoid();

    // Add healing job to Builder Agent queue
    const job = await addBuilderJob({
      type: 'heal',
      workflowId,
      correlationId,
    });

    // Create system alert
    await prisma.systemAlert.create({
      data: {
        type: 'AGENT_ERROR',
        severity: 'MEDIUM',
        message: `Auto-healing triggered for workflow ${workflow.name}${reason ? `: ${reason}` : ''}`,
        resolved: false,
      },
    });

    return NextResponse.json({
      message: 'Auto-healing triggered',
      jobId: job.id,
      correlationId,
      workflowId,
      status: 'healing',
    });
  } catch (error) {
    console.error('Healing trigger error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

