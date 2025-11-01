const { PrismaClient } = require('@prisma/client');
const { withAccelerate } = require('@prisma/extension-accelerate');

const prisma = global.prisma || new PrismaClient().$extends(withAccelerate());
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  try {
    switch (req.method) {
      case 'GET': {
        const users = await prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          select: { id: true, createdAt: true, email: true, name: true },
        });
        return res.status(200).json(users);
      }
      case 'POST': {
        let email, name;
        try {
          const body = await readJsonBody(req);
          ({ email, name } = body || {});
        } catch {
          return res.status(400).json({ error: 'Invalid JSON' });
        }

        if (!email || typeof email !== 'string') {
          return res.status(400).json({ error: 'email is required' });
        }

        try {
          const user = await prisma.user.create({
            data: { email: email.trim().toLowerCase(), name: name ? String(name).trim() : null },
            select: { id: true, createdAt: true, email: true, name: true },
          });
          return res.status(201).json(user);
        } catch (error) {
          if (error && error.code === 'P2002') {
            return res.status(409).json({ error: 'email already exists' });
          }
          throw error;
        }
      }
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (e) {
    console.error('api/examples', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
