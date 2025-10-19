/**
 * Webhook Verification API
 * Verifies webhook triggers with test payloads
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { verifySignature } from '@/lib/webhook-signature';

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
    const { triggerId, testPayload, signature, timestamp } = body;

    if (!triggerId) {
      return NextResponse.json({ error: 'Trigger ID is required' }, { status: 400 });
    }

    // Get webhook trigger
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

    // If signature provided, verify it
    let signatureValid = false;
    if (signature && timestamp) {
      const payloadString = JSON.stringify(testPayload);
      signatureValid = verifySignature(signature, trigger.secretHash, timestamp, payloadString);
    }

    // Store sample payload
    await prisma.webhookTrigger.update({
      where: { id: triggerId },
      data: {
        lastSample: testPayload,
        verifiedAt: new Date(),
      },
    });

    // Create webhook event record
    await prisma.webhookEvent.create({
      data: {
        triggerId,
        payload: testPayload,
        signature: signature || '',
        timestamp: timestamp ? new Date(parseInt(timestamp) * 1000) : new Date(),
        verified: signatureValid || !signature, // Mark as verified if no signature required
        processed: false,
      },
    });

    return NextResponse.json({
      verified: true,
      signatureValid: signature ? signatureValid : null,
      sample: testPayload,
      message: 'Webhook verified successfully',
    });
  } catch (error: any) {
    console.error('Webhook Verification Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify webhook', details: error.message },
      { status: 500 }
    );
  }
}

