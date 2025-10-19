import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { redis } from './redis';

// Queue names
export const QUEUE_NAMES = {
  DESIGNER: 'designer-agent-queue',
  BUILDER: 'builder-agent-queue',
  MONITOR: 'monitor-agent-queue',
  DEPLOYMENT: 'deployment-queue',
  NOTIFICATION: 'notification-queue',
} as const;

// Queue configuration
const queueConfig = {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 1000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs
      age: 7 * 24 * 3600, // Keep for 7 days
    },
  },
};

// Create queues
export const designerQueue = new Queue(QUEUE_NAMES.DESIGNER, queueConfig);
export const builderQueue = new Queue(QUEUE_NAMES.BUILDER, queueConfig);
export const monitorQueue = new Queue(QUEUE_NAMES.MONITOR, queueConfig);
export const deploymentQueue = new Queue(QUEUE_NAMES.DEPLOYMENT, queueConfig);
export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATION, queueConfig);

// Queue events for monitoring
const designerEvents = new QueueEvents(QUEUE_NAMES.DESIGNER, {
  connection: redis,
});
const builderEvents = new QueueEvents(QUEUE_NAMES.BUILDER, {
  connection: redis,
});
const monitorEvents = new QueueEvents(QUEUE_NAMES.MONITOR, {
  connection: redis,
});

// Listen to queue events
designerEvents.on('completed', ({ jobId }) => {
  console.log(`✅ Designer job ${jobId} completed`);
});

designerEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Designer job ${jobId} failed:`, failedReason);
});

builderEvents.on('completed', ({ jobId }) => {
  console.log(`✅ Builder job ${jobId} completed`);
});

builderEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Builder job ${jobId} failed:`, failedReason);
});

monitorEvents.on('completed', ({ jobId }) => {
  console.log(`✅ Monitor job ${jobId} completed`);
});

monitorEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Monitor job ${jobId} failed:`, failedReason);
});

// Job data types
export interface DesignerJobData {
  type: 'conversation' | 'blueprint_generation' | 'credential_collection';
  userId: string;
  workflowId?: string;
  data: any;
  correlationId: string;
}

export interface BuilderJobData {
  type: 'deploy' | 'test' | 'heal' | 'update';
  workflowId: string;
  blueprint?: any;
  correlationId: string;
}

export interface MonitorJobData {
  type: 'health_check' | 'error_detection' | 'performance_analysis';
  agentId?: string;
  workflowId?: string;
  data: any;
  timestamp: Date;
}

export interface DeploymentJobData {
  workflowId: string;
  agentId: string;
  config: any;
}

export interface NotificationJobData {
  type: 'email' | 'internal' | 'alert';
  userId: string;
  message: string;
  data?: any;
}

// Helper functions to add jobs
export async function addDesignerJob(
  data: DesignerJobData,
  options?: any
): Promise<Job<DesignerJobData>> {
  return designerQueue.add('designer-task', data, options);
}

export async function addBuilderJob(
  data: BuilderJobData,
  options?: any
): Promise<Job<BuilderJobData>> {
  return builderQueue.add('builder-task', data, options);
}

export async function addMonitorJob(
  data: MonitorJobData,
  options?: any
): Promise<Job<MonitorJobData>> {
  return monitorQueue.add('monitor-task', data, options);
}

export async function addDeploymentJob(
  data: DeploymentJobData,
  options?: any
): Promise<Job<DeploymentJobData>> {
  return deploymentQueue.add('deployment-task', data, options);
}

export async function addNotificationJob(
  data: NotificationJobData,
  options?: any
): Promise<Job<NotificationJobData>> {
  return notificationQueue.add('notification-task', data, options);
}

// Get queue statistics
export async function getQueueStats(queueName: string) {
  let queue: Queue;
  
  switch (queueName) {
    case QUEUE_NAMES.DESIGNER:
      queue = designerQueue;
      break;
    case QUEUE_NAMES.BUILDER:
      queue = builderQueue;
      break;
    case QUEUE_NAMES.MONITOR:
      queue = monitorQueue;
      break;
    case QUEUE_NAMES.DEPLOYMENT:
      queue = deploymentQueue;
      break;
    case QUEUE_NAMES.NOTIFICATION:
      queue = notificationQueue;
      break;
    default:
      throw new Error(`Unknown queue: ${queueName}`);
  }

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    queueName,
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

// Clean up old jobs
export async function cleanupQueues() {
  await Promise.all([
    designerQueue.clean(24 * 3600 * 1000, 100), // Clean completed jobs older than 24h
    builderQueue.clean(24 * 3600 * 1000, 100),
    monitorQueue.clean(24 * 3600 * 1000, 100),
    deploymentQueue.clean(24 * 3600 * 1000, 100),
    notificationQueue.clean(24 * 3600 * 1000, 100),
  ]);
}

// Graceful shutdown
export async function shutdownQueues() {
  await Promise.all([
    designerQueue.close(),
    builderQueue.close(),
    monitorQueue.close(),
    deploymentQueue.close(),
    notificationQueue.close(),
    designerEvents.close(),
    builderEvents.close(),
    monitorEvents.close(),
  ]);
}

