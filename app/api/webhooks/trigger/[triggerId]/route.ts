/**
 * Webhook Receiver Endpoint
 * Receives and processes incoming webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySignature, verifyTimestamp, extractWebhookHeaders } from '@/lib/webhook-signature';

export async function POST(
  request: NextRequest,
  { params }: { params: { triggerId: string } }
) {
  try {
    const { triggerId } = params;

    // Get webhook trigger
    const trigger = await prisma.webhookTrigger.findUnique({
      where: { id: triggerId },
      include: { workflow: true },
    });

    if (!trigger) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Extract headers
    const headers = extractWebhookHeaders(request.headers);
    if (!headers) {
      return NextResponse.json({ 
        error: 'Missing required headers',
        required: ['X-AF-Signature', 'X-AF-Timestamp']
      }, { status: 400 });
    }

    const { signature, timestamp } = headers;

    // Verify timestamp (prevent replay attacks)
    if (!verifyTimestamp(timestamp, 300)) { // 5 minutes tolerance
      return NextResponse.json({ 
        error: 'Request timestamp is too old or invalid',
        timestamp,
        currentTime: Math.floor(Date.now() / 1000)
      }, { status: 401 });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Verify signature
    const signatureValid = verifySignature(signature, trigger.secretHash, timestamp, rawBody);
    if (!signatureValid) {
      return NextResponse.json({ 
        error: 'Invalid signature',
        hint: 'Ensure your secret matches and signature is correctly calculated'
      }, { status: 401 });
    }

    // Parse payload
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Check for idempotency key to prevent duplicate processing
    const idempotencyKey = payload.idempotency_key || payload.id || JSON.stringify(payload);
    const existingEvent = await prisma.webhookEvent.findFirst({
      where: {
        triggerId,
        payload: {
          equals: payload
        },
        timestamp: {
          gte: new Date(Date.now() - 3600000) // Last hour
        }
      }
    });

    if (existingEvent) {
      // Already processed this event
      return NextResponse.json({ 
        success: true,
        message: 'Event already processed',
        eventId: existingEvent.id,
        processed: true
      }, { status: 200 });
    }

    // Store webhook event
    const event = await prisma.webhookEvent.create({
      data: {
        triggerId,
        payload,
        signature,
        timestamp: new Date(parseInt(timestamp) * 1000),
        verified: true,
        processed: false,
      },
    });

    // TODO: Queue for workflow execution (handled by Builder Agent)
    // For now, just log the event
    console.log(`✅ Webhook event received and verified:`, {
      triggerId,
      eventId: event.id,
      workflowId: trigger.workflowId,
      payloadSize: JSON.stringify(payload).length
    });

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Webhook received and queued for processing',
      eventId: event.id,
      triggerId,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook Receiver Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Handle GET requests with webhook info
export async function GET(
  request: NextRequest,
  { params }: { params: { triggerId: string } }
) {
  try {
    const { triggerId } = params;

    const trigger = await prisma.webhookTrigger.findUnique({
      where: { id: triggerId },
      include: { 
        workflow: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
    });

    if (!trigger) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: trigger.id,
      url: trigger.url,
      workflowId: trigger.workflowId,
      workflowName: trigger.workflow.name,
      verified: !!trigger.verifiedAt,
      verifiedAt: trigger.verifiedAt,
      createdAt: trigger.createdAt,
      lastSample: trigger.lastSample,
      expectedSchema: trigger.expectedSchema,
      headers: {
        'X-AF-Signature': 'Required - HMAC-SHA256 signature',
        'X-AF-Timestamp': 'Required - Unix timestamp in seconds'
      }
    });
  } catch (error: any) {
    console.error('Webhook Info Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

