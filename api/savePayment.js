// Kurz: API‑Endpoint zum Speichern von Zahlungen (savePayment).
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

    const { holderName, last4, expMonth, expYear } = body || {};

    if (!holderName || !last4 || !expMonth || !expYear) {
      res.status(400).json({ error: 'Alle Felder sind erforderlich (gespeichert werden: Inhaber, letzte 4 Stellig, Ablauf).' });
      return;
    }

    const payment = await prisma.payment.create({
      data: {
        holderName,
        last4,
        expMonth: parseInt(expMonth, 10),
        expYear: parseInt(expYear, 10),
      },
    });

    res.status(200).json({ message: 'Zahlungsdaten (maskiert) gespeichert.', payment });
  } catch (error) {
    console.error('Error saving payment:', error);
    res.status(500).json({ error: 'Fehler beim Speichern der Zahlungsdaten.' });
  }
};
