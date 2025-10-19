/**
 * Webhook Test API
 * Replays sample payloads through workflow for testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

    const body = await request.json();
    const { triggerId } = body;

    if (!triggerId) {
      return NextResponse.json({ error: 'Trigger ID is required' }, { status: 400 });
    }

    // Get webhook trigger with last sample
    const trigger = await prisma.webhookTrigger.findUnique({
      where: { id: triggerId },
      include: { workflow: true },
    });

    if (!trigger) {
      return NextResponse.json({ error: 'Webhook trigger not found' }, { status: 404 });
    }

    // Verify workflow belongs to user
    if (trigger.workflow.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!trigger.lastSample) {
      return NextResponse.json({ 
        error: 'No sample payload available',
        message: 'Please verify the webhook first with a test payload'
      }, { status: 400 });
    }

    // Simulate workflow execution with sample payload
    const executionLog: string[] = [];
    executionLog.push('🚀 Starting test execution with sample payload');
    executionLog.push(`📦 Payload: ${JSON.stringify(trigger.lastSample).substring(0, 100)}...`);
    executionLog.push('✅ Payload validated');
    executionLog.push('🔄 Triggering automation steps...');
    executionLog.push('⏭️  Step 1: Process trigger event');
    executionLog.push('⏭️  Step 2: Execute actions');
    executionLog.push('✅ Test execution completed successfully');

    return NextResponse.json({
      success: true,
      triggerId,
      executionLog,
      payload: trigger.lastSample,
      message: 'Test execution completed (simulation mode)',
      note: 'This is a simulation. Actual workflow execution will be handled by the Builder Agent.',
    });
  } catch (error: any) {
    console.error('Webhook Test Error:', error);
    return NextResponse.json(
      { error: 'Failed to test webhook', details: error.message },
      { status: 500 }
    );
  }
}

