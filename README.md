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

## 🗄️ Backend (Express + Prisma)
Für serverseitige Funktionen mit Prisma wurde ein einfaches Express-Backend ergänzt.

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
5. Entwicklungserver starten:
   ```bash
   npm run dev
   ```
6. API-Endpunkte stehen anschließend unter `http://localhost:3000/api/*` zur Verfügung.

Für das Deployment auf Vercel müssen `DATABASE_URL` (und ggf. weitere Secrets) als Environment Variables hinterlegt werden. Stelle außerdem sicher, dass das Projekt auf der Node.js Runtime läuft (keine Edge Functions).
