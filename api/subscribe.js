const { PrismaClient } = require('@prisma/client');

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

async function readJsonBody(req) {
  // If Vercel provides parsed body, use it
  if (req.body && typeof req.body === 'object') return req.body;

  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      // Protect against giant payloads
      if (data.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  // Basic CORS/OPTIONS support if needed
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  let name, email;
  try {
    const body = await readJsonBody(req);
    ({ name, email } = body || {});
  } catch (e) {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'email is required' });
    return;
  }

  try {
    const record = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name ? String(name).trim() : null,
      },
    });
    res.status(201).json({ id: record.id, createdAt: record.createdAt });
  } catch (error) {
    if (error && error.code === 'P2002') {
      res.status(409).json({ error: 'email already exists' });
      return;
    }
    console.error('Failed to create record:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
