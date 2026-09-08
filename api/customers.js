import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const DEFAULT_CUSTOMERS = [
  "Rare & Air",
  "Bloomingdales",
  "Colette",
  "bloomingdales Client",
  "build-it client",
  "build-it",
  "The House Of Decor",
  "Devon",
  "Beryl"
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      let customers = await redis.get('customers');
      if (!customers) {
        customers = DEFAULT_CUSTOMERS;
        await redis.set('customers', customers);
      }
      return res.status(200).json(customers);
    }

    if (req.method === 'POST') {
      const customers = req.body;
      await redis.set('customers', customers);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    if (req.method === 'GET') {
      return res.status(200).json(DEFAULT_CUSTOMERS);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}