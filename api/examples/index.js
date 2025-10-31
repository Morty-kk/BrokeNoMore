const prisma = require('../_lib/prisma');

function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === 'string') {
    try {
      return req.body ? JSON.parse(req.body) : {};
    } catch (error) {
      return {};
    }
  }

  return req.body;
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const examples = await prisma.example.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(examples);
    }

    if (req.method === 'POST') {
      const data = parseBody(req);
      const title = data.title?.trim();
      const content = data.content?.trim() ?? null;

      if (!title) {
        return res.status(400).json({ message: 'title is required' });
      }

      const created = await prisma.example.create({
        data: { title, content },
      });

      return res.status(201).json(created);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('examples handler failed', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
