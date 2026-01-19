// Kurz: Exportiert Kontakte und Zahlungen aus der Prisma‑DB als JSON.
// Achtung: verwendet lokale Prisma‑Konfiguration; nicht verändern ohne Backup.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
  let payments = [];
  try {
    payments = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' } });
  } catch (error) {
    if (error && error.code === 'P2021') {
      payments = [];
    } else {
      throw error;
    }
  }
  console.log(JSON.stringify({ contacts, payments }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
