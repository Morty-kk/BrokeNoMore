const { PrismaClient } = require('@prisma/client');

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  const { name, email } = req.body || {};

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
    // Handle unique constraint on email (Postgres error code P2002 via Prisma)
    if (error && error.code === 'P2002') {
      res.status(409).json({ error: 'email already exists' });
      return;
    }
    console.error('Failed to create record:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
