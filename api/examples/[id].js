const prisma = require('../_lib/prisma');

module.exports = async (req, res) => {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const numericId = Array.isArray(id) ? id[0] : id;
  const parsedId = Number.parseInt(numericId, 10);

  if (!Number.isFinite(parsedId)) {
    return res.status(400).json({ message: 'A valid numeric id is required' });
  }

  try {
    await prisma.example.delete({
      where: { id: parsedId },
    });

    return res.status(204).end();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Example not found' });
    }

    console.error('delete example failed', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
