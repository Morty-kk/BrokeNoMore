// Kurz: API‑Endpoint für Login (POST). Prüft Benutzer via Prisma DB.
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

    const { email, password } = body || {};
    if (!email || !password) {
      res.status(400).json({ error: 'Alle Felder sind erforderlich.' });
      return;
    }

    const user = await prisma.user.findFirst({ where: { email, password } });
    if (!user) {
      res.status(401).json({ error: 'E-Mail oder Passwort falsch.' });
      return;
    }

    res.status(200).json({ message: 'Login erfolgreich.', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Fehler beim Login.' });
  }
};
