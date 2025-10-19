/**
 * Webhook Trigger Creation API
 * Creates webhook URLs and secrets for automation triggers
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { generateSecret, hashSecret } from '@/lib/webhook-signature';

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
    const { workflowId, sourceApp, eventType, expectedSchema } = body;

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    // Verify workflow belongs to user
    const workflow = await prisma.aIWorkflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow || workflow.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Generate unique secret
    const secret = generateSecret(32);
    const secretHash = hashSecret(secret);

    // Create webhook trigger
    const trigger = await prisma.webhookTrigger.create({
      data: {
        workflowId,
        url: '', // Will be set after creation
        secretHash,
        expectedSchema: expectedSchema || {},
      },
    });

    // Generate webhook URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const webhookUrl = `${baseUrl}/api/webhooks/trigger/${trigger.id}`;

    // Update trigger with URL
    await prisma.webhookTrigger.update({
      where: { id: trigger.id },
      data: { url: webhookUrl },
    });

    // Generate setup instructions based on source app
    const setupInstructions = generateSetupInstructions(sourceApp, webhookUrl, secret);

    return NextResponse.json({
      triggerId: trigger.id,
      url: webhookUrl,
      secret, // Return only once, never stored in plain text
      headers: {
        'X-AF-Signature': 'HMAC-SHA256(secret, timestamp + body)',
        'X-AF-Timestamp': 'Unix timestamp in seconds',
      },
      setupInstructions,
      sourceApp,
      eventType,
    });
  } catch (error: any) {
    console.error('Webhook Creation Error:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Generate platform-specific setup instructions
 */
function generateSetupInstructions(sourceApp: string | undefined, webhookUrl: string, secret: string): string {
  if (!sourceApp) {
    return `1. Copy the webhook URL: ${webhookUrl}\n` +
           `2. Copy the secret: ${secret}\n` +
           `3. Configure your application to send POST requests to this URL\n` +
           `4. Include X-AF-Signature and X-AF-Timestamp headers\n` +
           `5. Send a test event to verify the connection`;
  }

  const app = sourceApp.toLowerCase();

  switch (app) {
    case 'shopify':
      return `**Shopify Webhook Setup:**\n\n` +
             `1. Go to Shopify Admin > Settings > Notifications\n` +
             `2. Scroll to "Webhooks" section\n` +
             `3. Click "Create webhook"\n` +
             `4. Select event (e.g., "Order creation")\n` +
             `5. Format: JSON\n` +
             `6. URL: ${webhookUrl}\n` +
             `7. Save webhook\n` +
             `8. Store this secret safely: ${secret}\n` +
             `9. Send a test order to verify`;

    case 'stripe':
      return `**Stripe Webhook Setup:**\n\n` +
             `1. Go to Stripe Dashboard > Developers > Webhooks\n` +
             `2. Click "Add endpoint"\n` +
             `3. Endpoint URL: ${webhookUrl}\n` +
             `4. Select events to listen to\n` +
             `5. Add endpoint\n` +
             `6. Copy signing secret: ${secret}\n` +
             `7. Test with Stripe CLI or send test event`;

    case 'github':
      return `**GitHub Webhook Setup:**\n\n` +
             `1. Go to Repository > Settings > Webhooks\n` +
             `2. Click "Add webhook"\n` +
             `3. Payload URL: ${webhookUrl}\n` +
             `4. Content type: application/json\n` +
             `5. Secret: ${secret}\n` +
             `6. Select events to trigger\n` +
             `7. Active: checked\n` +
             `8. Add webhook`;

    case 'slack':
      return `**Slack Webhook Setup:**\n\n` +
             `1. Go to api.slack.com/apps\n` +
             `2. Select your app > Event Subscriptions\n` +
             `3. Enable Events\n` +
             `4. Request URL: ${webhookUrl}\n` +
             `5. Subscribe to bot events\n` +
             `6. Save changes\n` +
             `7. Store secret: ${secret}`;

    default:
      return `**${sourceApp} Webhook Setup:**\n\n` +
             `1. Find webhook/integration settings in ${sourceApp}\n` +
             `2. Add new webhook with URL: ${webhookUrl}\n` +
             `3. Configure secret: ${secret}\n` +
             `4. Select events to trigger\n` +
             `5. Save and test`;
  }
}

