# 💸 BrokeNoMore – Dein Finanzcheck für junge Leute

**BrokeNoMore** ist eine interaktive Web-App, die jungen Menschen hilft, ihre Finanzen besser zu verstehen und den Überblick über Einnahmen, Ausgaben und Sparziele zu behalten. Von Studierenden – für Studierende. Erstellt im Rahmen eines Hochschulprojekts.

---

## 🚀 Live-Demo
👉 [Jetzt ansehen auf Vercel](https://broke-no-more-ten.vercel.app/)

---

## 🧭 Ziel & Idee
Viele junge Menschen verlieren schnell den Überblick über ihre Finanzen – sei es durch Taschengeld, Nebenjob oder BAföG. **BrokeNoMore** soll helfen, finanzielle Selbstständigkeit einfach und spielerisch zu lernen:

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
| Bereich | Technologie |
|----------|--------------|
| **Frontend** | HTML5, CSS3, JavaScript |
| **Design** | Figma (UI/UX-Konzept) |
| **Versionierung** | Git & GitHub |
| **Deployment** | [Vercel](https://vercel.com) |

---

## ⚙️ Lokale Installation (Frontend)
1. Repository klonen:
   ```bash
   git clone https://github.com/Morty-kk/BrokeNoMore.git
   cd BrokeNoMore
   ```
2. Öffne `index.html` im Browser oder nutze einen einfachen Static Server (z. B. `npx serve`).

---

## 🗄️ Backend (Vercel Functions + Prisma)
Das Projekt nutzt Vercel Functions, um Prisma ohne eigenen Express-Server bereitzustellen. Damit funktioniert das Backend identisch lokal (`vercel dev`) und im Deployment auf [Vercel](https://vercel.com).

1. Node.js installieren (>= 18).
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
   > Hinweis: Prisma benötigt Zugriff auf das npm-Registry. Sollte die Installation fehlschlagen, überprüfe Netzwerk- bzw. Proxy-Einstellungen.
3. Umgebung konfigurieren: Kopiere `.env.example` nach `.env` und setze `DATABASE_URL` (z. B. `file:./dev.db` für SQLite).
4. Prisma vorbereiten:
   ```bash
   npx prisma migrate dev
   ```
5. Lokale Entwicklung starten (nutzt die Vercel-CLI):
   ```bash
   npm run dev
   ```
   Die API ist anschließend unter `http://localhost:3000/api/examples` erreichbar.

### Endpunkte
- `GET /api/examples` – listet vorhandene Einträge.
- `POST /api/examples` – legt einen Eintrag an (`{ "title": "...", "content": "..." }`).
- `DELETE /api/examples/:id` – löscht einen Eintrag über die ID.

### Deployment auf Vercel
- `DATABASE_URL` (und ggf. weitere Secrets) in den Projekt-Settings hinterlegen.
- Beim Build führt Vercel automatisch `npm run build` aus, was den Prisma Client generiert.
- Die API-Routen laufen standardmäßig auf der Node.js Runtime von Vercel (keine Edge Functions).
