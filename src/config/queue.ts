import { Queue } from 'bullmq';
import Redis from 'ioredis';

export const QUEUE_NAME = 'keyword-processing';

export const redisConnection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT || 6379),
  maxRetriesPerRequest: null,
});

export const keywordQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
});
