// Kurz: API‑Endpoint zum Speichern von Kontaktanfragen (saveContact).
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
      } catch (e) {
        res.status(400).json({ error: 'Ungültiger JSON-Body.' });
        return;
      }
    }

    const { name, email, message } = body || {};

    // Masked log for incoming contact submission
    try {
      const maskedEmail = email ? (email.split('@')[0].slice(0,1) + '...' + '@' + email.split('@')[1]) : null;
      console.log('saveContact payload (masked):', { name: name ? String(name).slice(0,1) + '...' : null, email: maskedEmail });
    } catch (e) {}

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Alle Felder sind erforderlich.' });
      return;
    }

    const contact = await prisma.contact.create({
      data: { name, email, message }
    });

    res.status(200).json({ message: 'Kontakt erfolgreich gespeichert.', contact });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ error: 'Fehler beim Speichern der Kontaktdaten.' });
  }
};
