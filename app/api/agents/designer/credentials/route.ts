/**
 * Designer Agent Credentials API
 * Handles secure credential storage for platform integrations
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import crypto from 'crypto';

// Encryption key (in production, use environment variable)
// Must be exactly 32 bytes for AES-256
const ENCRYPTION_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY || 'your-32-character-secret-key!!';
const ALGORITHM = 'aes-256-gcm';

// Ensure key is exactly 32 bytes
function getEncryptionKey(): Buffer {
  const key = ENCRYPTION_KEY.padEnd(32, '!').substring(0, 32);
  return Buffer.from(key, 'utf8');
}

/**
 * Encrypt credentials using AES-256-GCM
 */
function encryptCredentials(credentials: Record<string, string>): string {
  const iv = crypto.randomBytes(16);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encrypted
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt credentials using AES-256-GCM
 */
function decryptCredentials(encryptedData: string): Record<string, string> {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getEncryptionKey();
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 Credentials API - POST request received');
    
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('❌ No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await verifyToken(token);

    if (!decoded) {
      console.log('❌ Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const body = await request.json();
    const { sessionId, platform, credentials } = body;

    console.log('📨 Received credentials for platform:', platform);
    console.log('🆔 Session ID:', sessionId);
    console.log('👤 User ID:', userId);

    // Validate input
    if (!sessionId || !platform || !credentials) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ 
        error: 'Session ID, platform, and credentials are required' 
      }, { status: 400 });
    }

    // Verify session belongs to user
    const session = await prisma.designerSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      console.log('❌ Session not found or user mismatch');
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Encrypt credentials
    const encryptedCredentials = encryptCredentials(credentials);
    console.log('🔒 Credentials encrypted successfully');

    // Store credentials in database
    const credentialRecord = await prisma.credential.create({
      data: {
        userId,
        platform,
        encryptedData: encryptedCredentials,
        metadata: {
          sessionId,
          platform,
          createdAt: new Date().toISOString(),
        },
      },
    });

    console.log('💾 Credentials stored in database:', credentialRecord.id);

    // Update session with credential reference
    const currentCredentials = (session.credentials as any) || {};
    currentCredentials[platform] = {
      credentialId: credentialRecord.id,
      platform,
      connectedAt: new Date().toISOString(),
    };

    await prisma.designerSession.update({
      where: { id: sessionId },
      data: {
        credentials: currentCredentials,
        updatedAt: new Date(),
      },
    });

    console.log('✅ Session updated with credential reference');

    return NextResponse.json({
      success: true,
      platform,
      credentialId: credentialRecord.id,
      message: `${platform} credentials saved successfully`,
    });

  } catch (error: any) {
    console.error('❌ Credentials API Error:', error);
    return NextResponse.json(
      { error: 'Failed to save credentials', details: error.message },
      { status: 500 }
    );
  }
}

// GET: Retrieve credentials (for Builder Agent)
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

    // Get session
    const session = await prisma.designerSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get credentials for this session
    const credentials = (session.credentials as any) || {};
    const credentialIds = Object.values(credentials).map((cred: any) => cred.credentialId);

    const credentialRecords = await prisma.credential.findMany({
      where: {
        id: { in: credentialIds },
        userId,
      },
    });

    // Decrypt credentials
    const decryptedCredentials: Record<string, Record<string, string>> = {};
    credentialRecords.forEach(record => {
      try {
        decryptedCredentials[record.platform] = decryptCredentials(record.encryptedData);
      } catch (error) {
        console.error(`Failed to decrypt credentials for ${record.platform}:`, error);
      }
    });

    return NextResponse.json({
      credentials: decryptedCredentials,
      platforms: Object.keys(decryptedCredentials),
    });

  } catch (error: any) {
    console.error('Get Credentials Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve credentials', details: error.message },
      { status: 500 }
    );
  }
}
