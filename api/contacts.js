// Kurz: API‑Endpoint zum Lesen von Kontakten (Admin). Liefert JSON.
const { PrismaClient } = require('@prisma/client');

const resolveDatabaseUrl = () =>
  process.env.DATABASE_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DIRECT_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

const databaseUrl = resolveDatabaseUrl();
const prisma = new PrismaClient(
  databaseUrl ? { datasources: { db: { url: databaseUrl } } } : undefined
);

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Nur GET erlaubt.' });
    return;
  }

  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.status(200).json({ contacts });
  } catch (error) {
    console.error('Error loading contacts:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Kontakte.' });
  }
};
