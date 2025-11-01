// Load environment variables
require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client'); // <- wieder Standardpfad

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// ✅ GET all examples
app.get('/api/examples', async (req, res) => {
  try {
    const examples = await prisma.example.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(examples);
  } catch (error) {
    console.error('❌ Failed to fetch examples:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ POST new example
app.post('/api/examples', async (req, res) => {
  const { title, content } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
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
});

// ✅ DELETE example by ID
app.delete('/api/examples/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'id must be an integer' });
  }

  try {
    await prisma.example.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    console.error('❌ Failed to delete example:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ Start API Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 API server ready on http://localhost:${port}`);
});

// ✅ Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔌 Disconnecting Prisma...');
  await prisma.$disconnect();
  process.exit(0);
});
