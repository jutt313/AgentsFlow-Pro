/**
 * Designer Agent Chat API
 * Handles conversation with Designer Agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ConversationManager, ConversationStage } from '@/lib/designer-agent';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Designer Chat API - POST request received');
    
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
    const { message, sessionId } = body;

    console.log('📨 Received message:', message);
    console.log('🆔 Session ID:', sessionId);
    console.log('👤 User ID:', userId);

    // Validate input
    if (!message) {
      console.log('❌ No message provided');
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let conversationManager: ConversationManager;
    let session;

    // Load or create session
    if (sessionId) {
      console.log('📂 Loading existing session:', sessionId);
      // Load existing session
      session = await prisma.designerSession.findUnique({
        where: { id: sessionId },
      });

      if (!session || session.userId !== userId) {
        console.log('❌ Session not found or user mismatch');
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      console.log('✅ Session loaded successfully');
      // Load conversation state
      conversationManager = new ConversationManager(session.id, userId);
      conversationManager.loadState(session.conversationState as any);
    } else {
      console.log('🆕 Creating new session');
      
      // Create draft workflow first
      console.log('📋 Creating draft workflow');
      const draftWorkflow = await prisma.aIWorkflow.create({
        data: {
          userId,
          name: 'New Workflow (In Progress)',
          description: 'AI workforce design in progress',
          status: 'DRAFT',
        },
      });

      console.log('✅ Draft workflow created:', draftWorkflow.id);

      // Create new session linked to workflow
      session = await prisma.designerSession.create({
        data: {
          userId,
          workflowId: draftWorkflow.id,
          stage: ConversationStage.INITIAL,
          conversationState: {},
          status: 'active',
        },
      });

      console.log('✅ New session created:', session.id);
      conversationManager = new ConversationManager(session.id, userId);
      
      // Initialize conversation
      console.log('👋 Initializing conversation with greeting');
      const greeting = await conversationManager.initializeConversation();
      
      // Save initial state
      await prisma.designerSession.update({
        where: { id: session.id },
        data: {
          conversationState: conversationManager.getState() as any,
        },
      });

      console.log('💾 Initial state saved to database');
      console.log('📤 Returning greeting response');

      return NextResponse.json({
        sessionId: session.id,
        message: greeting,
        stage: ConversationStage.INITIAL,
        workflowId: draftWorkflow.id,
      });
    }

    // Process user message
    console.log('🔄 Processing user message through conversation manager');
    const response = await conversationManager.processUserMessage(message);
    const state = conversationManager.getState();

    console.log('✅ Message processed successfully');
    console.log('📊 New conversation state:', {
      stage: state.stage,
      messageCount: state.messages.length,
      hasBusinessContext: !!state.businessContext,
      hasTeamDesign: !!state.teamDesign,
      hasBlueprint: !!state.blueprint
    });

    // Update session in database
    console.log('💾 Updating session in database');
    await prisma.designerSession.update({
      where: { id: session.id },
      data: {
        stage: state.stage,
        conversationState: state as any,
        businessContext: state.businessContext as any,
        teamDesign: state.teamDesign as any,
        blueprint: state.blueprint as any,
        credentials: state.credentials as any,
        updatedAt: new Date(),
      },
    });

    console.log('✅ Session updated in database');

    // Update workflow name based on business context
    if (state.businessContext && session.workflowId) {
      const businessType = state.businessContext.businessType || 'Business';
      const industry = state.businessContext.industry || 'General';
      const workflowName = `${businessType} - ${industry} (${state.stage})`;
      
      console.log('📝 Updating workflow name:', workflowName);
      await prisma.aIWorkflow.update({
        where: { id: session.workflowId },
        data: {
          name: workflowName,
          description: `AI workforce for ${businessType} in ${industry} industry`,
        },
      });
    }

    // If conversation is complete, update workflow status
    if (state.stage === ConversationStage.COMPLETE && state.blueprint && session.workflowId) {
      console.log('🎉 Conversation complete! Updating workflow status');
      
      await prisma.aIWorkflow.update({
        where: { id: session.workflowId },
        data: {
          name: state.blueprint.workflow_name || 'Completed AI Workforce',
          description: state.blueprint.business_context?.business_type || 'AI workforce automation',
          status: 'ACTIVE',
        },
      });

      console.log('✅ Workflow updated to ACTIVE status');
    }

    console.log('📤 Returning response to client');
    console.log('📝 Response preview:', response.substring(0, 100) + (response.length > 100 ? '...' : ''));

        return NextResponse.json({
          sessionId: session.id,
          message: response,
          stage: state.stage,
          businessContext: state.businessContext,
          teamDesign: state.teamDesign,
          isComplete: state.stage === ConversationStage.COMPLETE,
          blueprint: state.blueprint || undefined,
          credentialButtons: (state.stage === ConversationStage.CREDENTIALS || state.stage === ConversationStage.APPROVAL) ? 
            (state.businessContext?.requiredIntegrations || []) : undefined,
        });
  } catch (error: any) {
    console.error('Designer Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to process message', details: error.message },
      { status: 500 }
    );
  }
}

// GET: Retrieve session state
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

    return NextResponse.json({
      sessionId: session.id,
      stage: session.stage,
      businessContext: session.businessContext,
      teamDesign: session.teamDesign,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  } catch (error: any) {
    console.error('Get Session Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session', details: error.message },
      { status: 500 }
    );
  }
}
