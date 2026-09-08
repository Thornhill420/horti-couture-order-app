import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const DEFAULT_INVOICE = 83;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      let invoiceNum = await redis.get('invoiceNumber');
      if (invoiceNum === null) {
        invoiceNum = DEFAULT_INVOICE;
        await redis.set('invoiceNumber', invoiceNum);
      }
      return res.status(200).json({ invoiceNumber: invoiceNum });
    }

    if (req.method === 'POST') {
      const { invoiceNumber } = req.body;
      await redis.set('invoiceNumber', invoiceNumber);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(200).json({ invoiceNumber: DEFAULT_INVOICE });
  }
}
