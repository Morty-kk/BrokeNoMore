const { PrismaClient } = require('@prisma/client');

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

module.exports = async (req, res) => {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  const { id } = req.query;
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId)) {
    res.status(400).json({ error: 'id must be an integer' });
    return;
  }

  try {
    await prisma.example.delete({ where: { id: parsedId } });
    res.status(204).end();
  } catch (error) {
    console.error('❌ Failed to delete example:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
