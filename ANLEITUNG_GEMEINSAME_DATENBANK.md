# Anleitung: Gemeinsame Datenbank nutzen

## Problem
Ihr habt beide eure eigenen SQLite-Datenbanken. Wenn du Daten auf die Datenbank deines Freundes speichern willst, musst du die API-Konfiguration ändern.

## Lösung

### 1. IP-Adresse des Freundes herausfinden
**WICHTIG:** Dein Freund muss seine **Netzwerk-IP** herausfinden, **NICHT** `127.0.0.1` oder `localhost`!

Dein Freund sollte auf seinem Computer im Terminal ausführen:
```powershell
ipconfig
```

Die IP-Adresse steht bei **"IPv4-Adresse"** unter "Drahtlos-LAN-Adapter WLAN" oder "Ethernet-Adapter":
- Beispiele: `192.168.1.100`, `192.168.178.50`, `10.0.0.5`, `134.103.200.31`
- **FALSCH:** `127.0.0.1` (das ist nur localhost!)

**Beispiel-Output:**
```
Drahtlos-LAN-Adapter WLAN:
   IPv4-Adresse  . . . . . . . . . . : 192.168.1.100  ← DIESE IP!
```

### 2. Server des Freundes muss richtig laufen
Dein Freund muss seinen Server gestartet haben:
```powershell
npm run dev
```

**WICHTIG:** Der Server muss anzeigen:
```
Dev server running at:
  Local:   http://localhost:5500
  Network: http://192.168.1.100:5500  ← Diese Network-URL ist wichtig!
```

Falls nur `http://localhost:5500` angezeigt wird, wurde der Server nicht richtig konfiguriert!

### 3. Deine Konfiguration anpassen
Öffne die Datei: `public/js/config.js`

Ändere diese Zeile:
```javascript
baseURL: ''
```

In:
```javascript
baseURL: 'http://FREUND_IP_ADRESSE:5500'
```

**Beispiel:**
Wenn die IP deines Freundes `192.168.1.100` ist:
```javascript
window.API_CONFIG = {
  baseURL: 'http://192.168.1.100:5500'
};
```

### 4. Beide müssen im selben WLAN sein!
Wichtig: Beide Computer müssen im **selben Netzwerk** (WLAN) sein.

### 5. Firewall
Falls es nicht funktioniert, muss dein Freund möglicherweise Port 5500 in seiner Windows Firewall freigeben.

## Zurück zur eigenen Datenbank
Um wieder auf deine eigene Datenbank zuzugreifen:
```javascript
window.API_CONFIG = {
  baseURL: ''
};
```

## Häufige Fehler

### ❌ Freund nutzt 127.0.0.1 oder localhost
**Problem:** `http://127.0.0.1:5500` funktioniert nur auf dem Computer des Freundes selbst!

**Lösung:** Freund muss die richtige Netzwerk-IP herausfinden (siehe Schritt 1) und den Server neu starten.

### ❌ "Network: http://..." wird nicht angezeigt
**Problem:** Server läuft nur auf localhost.

**Lösung:** Die Datei `dev-server.js` muss `host: '0.0.0.0'` verwenden. Das sollte bereits konfiguriert sein - einfach Server neu starten.

### ❌ CORS-Fehler im Browser
**Problem:** Browser blockiert Anfragen von einem anderen Host.

**Lösung:** Die CORS-Middleware ist bereits eingebaut. Falls Probleme auftreten, beide im selben WLAN überprüfen.
