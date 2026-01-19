# 💸 BrokeNoMore – Dein Finanzcheck für junge Leute

**BrokeNoMore** ist eine interaktive Web-App, die jungen Menschen hilft, ihre Finanzen besser zu verstehen und den Überblick über Einnahmen, Ausgaben und Sparziele zu behalten.  
Von Studierenden – für Studierende.  
Erstellt im Rahmen eines Hochschulprojekts.

---

## 🚀 Lokal ausführen (ohne Vercel/Netlify)
Diese Version läuft komplett lokal mit einem Express-Server und SQLite-Datenbank über Prisma.

---

## 🧭 Ziel & Idee
Viele junge Menschen verlieren schnell den Überblick über ihre Finanzen – sei es durch Taschengeld, Nebenjob oder BAföG.  
**BrokeNoMore** soll helfen, finanzielle Selbstständigkeit einfach und spielerisch zu lernen:

- 💰 **Budget-Check:** Finde heraus, wohin dein Geld wirklich fließt.
- 🎯 **Sparziele:** Setze dir erreichbare Ziele und verfolge deinen Fortschritt.
- ⚠️ **Finanzfallen:** Erkenne unnötige Ausgaben und vermeide sie.
- 💡 **Tipps & Tricks:** Kurze, praxisnahe Ratschläge für Studis im Alltag.

---

## 🧩 Funktionen
- Responsives Webdesign (Mobile & Desktop)
- Interaktive Startseite mit Call-to-Action
- Übersichtliche Navigation (Home, About, Services, Blog, Kontakt)
- Blogbereich mit Artikeln zu Budget, Lohnrechner und Sparen
- Einfacher, moderner Stil mit freundlicher Farbpalette

---

## 🖥️ Tech Stack
| Bereich | Technologie             |
|----------|-------------------------|
| **Frontend** | HTML5, CSS3, JavaScript |
| **Design** | Figma (UI/UX-Konzept)   |
| **Versionierung** | Git & GitLab            |

---

## ⚙️ Lokale Installation
1. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
2. Datenbank initialisieren:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Server starten:
   ```bash
   npm run dev
   ```

Der Server läuft anschließend auf http://localhost:5500

### Admin‑Seite (Datenbankeinträge)
Öffne die Admin‑Ansicht unter http://localhost:5500/pages/admin.html

Der Zugriff ist mit einem Token geschützt. Lege das Token in [.env](.env) fest:

```
ADMIN_TOKEN="local-admin"
```

Dann auf der Seite das Token eingeben und laden.

### Datenbank-Konfiguration
Die lokale SQLite-Datenbank wird über die Datei [.env](.env) gesteuert:

```
DATABASE_URL="file:./dev.db"
```
