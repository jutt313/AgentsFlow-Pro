import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRedisHealth } from '@/lib/redis';

/**
 * GET /api/agents/monitor/health - Get system health status
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const agentId = searchParams.get('agentId');

    // Check system health
    const redisHealthy = await checkRedisHealth();

    // Get overall statistics
    const [totalWorkflows, activeWorkflows, totalAgents, activeAgents] = await Promise.all([
      prisma.aIWorkflow.count({ where: { userId: payload.userId } }),
      prisma.aIWorkflow.count({ where: { userId: payload.userId, status: 'ACTIVE' } }),
      prisma.agent.count({
        where: {
          workflow: { userId: payload.userId },
        },
      }),
      prisma.agent.count({
        where: {
          workflow: { userId: payload.userId },
          status: 'ACTIVE',
        },
      }),
    ]);

    const response: any = {
      system: {
        status: redisHealthy ? 'HEALTHY' : 'DEGRADED',
        redis: redisHealthy,
        timestamp: new Date(),
      },
      overview: {
        totalWorkflows,
        activeWorkflows,
        totalAgents,
        activeAgents,
      },
    };

    // Get specific workflow health
    if (workflowId) {
      const workflow = await prisma.aIWorkflow.findFirst({
        where: {
          id: workflowId,
          userId: payload.userId,
        },
        include: {
          agents: {
            include: {
              healthChecks: {
                orderBy: { timestamp: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      if (workflow) {
        response.workflow = {
          id: workflow.id,
          name: workflow.name,
          status: workflow.status,
          agents: workflow.agents.map((agent) => ({
            id: agent.id,
            name: agent.name,
            type: agent.type,
            status: agent.status,
            lastHealthCheck: agent.healthChecks[0] || null,
          })),
        };
      }
    }

    // Get specific agent health
    if (agentId) {
      const agent = await prisma.agent.findFirst({
        where: {
          id: agentId,
          workflow: { userId: payload.userId },
        },
        include: {
          healthChecks: {
            orderBy: { timestamp: 'desc' },
            take: 10,
          },
          logs: {
            orderBy: { timestamp: 'desc' },
            take: 20,
          },
        },
      });

      if (agent) {
        response.agent = {
          id: agent.id,
          name: agent.name,
          type: agent.type,
          status: agent.status,
          healthChecks: agent.healthChecks,
          recentLogs: agent.logs,
        };
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

