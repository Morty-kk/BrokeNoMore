const { PrismaClient } = require('@prisma/client');

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

module.exports = async (req, res) => {
  switch (req.method) {
    case 'GET':
      try {
        const examples = await prisma.example.findMany({
          orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(examples);
      } catch (error) {
        console.error('❌ Failed to fetch examples:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
      break;
    case 'POST': {
      const { title, content } = req.body || {};

      if (!title) {
        res.status(400).json({ error: 'title is required' });
        return;
      }

      try {
        const example = await prisma.example.create({
          data: {
            title,
            content: content ?? null,
          },
        });
        res.status(201).json(example);
      } catch (error) {
        console.error('❌ Failed to create example:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
};
