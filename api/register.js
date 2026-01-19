// Kurz: API‑Endpoint für Registrierung (POST). Legt Nutzer in Prisma DB an.
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
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Nur POST erlaubt.' });
    return;
  }

  try {
    let body = req.body || {};
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        res.status(400).json({ error: 'Ungültiger JSON-Body.' });
        return;
      }
    }

    const { name, email, password } = body || {};
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Alle Felder sind erforderlich.' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'E-Mail ist bereits registriert.' });
      return;
    }

    const user = await prisma.user.create({
      data: { name, email, password },
    });

    res.status(200).json({ message: 'Registrierung erfolgreich.', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Fehler bei der Registrierung.' });
  }
};
