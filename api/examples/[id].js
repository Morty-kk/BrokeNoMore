const { PrismaClient } = require('@prisma/client');
const { withAccelerate } = require('@prisma/extension-accelerate');

const prisma = global.prisma || new PrismaClient().$extends(withAccelerate());
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

module.exports = async (req, res) => {
  try {
    if (req.method !== 'DELETE') {
      res.setHeader('Allow', ['DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const id = Number(req.query.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id must be an integer' });

    await prisma.user.delete({ where: { id } });
    return res.status(204).end();
  } catch (e) {
    console.error('api/examples/[id]', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
