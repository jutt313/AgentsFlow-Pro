import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test user
  const passwordHash = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@agentflow.pro' },
    update: {},
    create: {
      email: 'test@agentflow.pro',
      passwordHash,
      name: 'Test User',
    },
  });

  console.log('✅ Created test user:', user.email);

  // Create sample workflow
  const workflow = await prisma.aIWorkflow.create({
    data: {
      userId: user.id,
      name: 'E-commerce Automation',
      description: 'Complete e-commerce store automation with AI agents',
      status: 'DRAFT',
    },
  });

  console.log('✅ Created sample workflow:', workflow.name);

  // Create sample agents
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        workflowId: workflow.id,
        name: 'Manager Agent',
        type: 'MANAGER',
        role: 'Team Coordinator',
        status: 'PENDING',
        config: {
          description: 'Coordinates all agent activities',
        },
      },
    }),
    prisma.agent.create({
      data: {
        workflowId: workflow.id,
        name: 'Customer Support Agent',
        type: 'SPECIALIST',
        role: 'Customer Support',
        status: 'PENDING',
        config: {
          description: 'Handles customer inquiries',
        },
      },
    }),
    prisma.agent.create({
      data: {
        workflowId: workflow.id,
        name: 'Inventory Agent',
        type: 'SPECIALIST',
        role: 'Inventory Management',
        status: 'PENDING',
        config: {
          description: 'Manages inventory and stock levels',
        },
      },
    }),
  ]);

  console.log(`✅ Created ${agents.length} sample agents`);

  // Create sample logs
  await prisma.agentLog.createMany({
    data: [
      {
        agentId: agents[0].id,
        level: 'INFO',
        message: 'Agent initialized successfully',
        timestamp: new Date(),
      },
      {
        agentId: agents[1].id,
        level: 'INFO',
        message: 'Ready to handle customer inquiries',
        timestamp: new Date(),
      },
      {
        agentId: agents[2].id,
        level: 'INFO',
        message: 'Inventory monitoring system active',
        timestamp: new Date(),
      },
    ],
  });

  console.log('✅ Created sample logs');

  // Create health checks
  await prisma.healthCheck.createMany({
    data: agents.map((agent) => ({
      agentId: agent.id,
      status: 'HEALTHY',
      responseTime: Math.floor(Math.random() * 100) + 50,
      timestamp: new Date(),
    })),
  });

  console.log('✅ Created health checks');

  console.log('🌱 Database seed completed successfully!');
  console.log('\nTest credentials:');
  console.log('Email: test@agentflow.pro');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

