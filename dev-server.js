// Kurz: Entwicklungsserver. Stellt statische Dateien bereit und mountet API-Handler.
// Hinweis: Nur für lokale Entwicklung; nicht für Produktionskonfigurationen.
// load .env when present (optional)
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed — that's fine for deployed environments
}

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mount API handlers from ./api/*.js
const apiDir = path.join(__dirname, 'api');
if (fs.existsSync(apiDir)) {
  fs.readdirSync(apiDir).forEach((file) => {
    if (!file.endsWith('.js')) return;
    const name = file.replace(/\.js$/, '');
    const handlerPath = path.join(apiDir, file);
    try {
      const handler = require(handlerPath);
      app.all(`/api/${name}`, (req, res) => {
        // The api modules expect (req, res) like a typical Node handler.
        try {
          const maybePromise = handler(req, res);
          if (maybePromise && typeof maybePromise.then === 'function') {
            maybePromise.catch((err) => {
              console.error('API handler error:', err);
              if (!res.headersSent) res.status(500).json({ error: 'Handler error' });
            });
          }
        } catch (err) {
          console.error('API handler throw:', err);
          if (!res.headersSent) res.status(500).json({ error: 'Handler exception' });
        }
      });
      console.log(`Mounted /api/${name} -> ${handlerPath}`);
    } catch (e) {
      console.error('Failed to require', handlerPath, e);
    }
  });
} else {
  console.warn('No api/ directory found to mount.');
}

// Serve public and root static files so the site works like before
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

const port = process.env.PORT || 5500;
const host = '0.0.0.0'; // Erlaubt Zugriff von anderen Geräten im Netzwerk
app.listen(port, host, () => {
  console.log(`Dev server running at:`);
  console.log(`  Local:   http://localhost:${port}`);
  console.log(`  Network: http://${getLocalIp()}:${port}`);
});

function getLocalIp() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}
