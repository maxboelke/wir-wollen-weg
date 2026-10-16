# Demo-Anleitung – „Wir wollen weg“ / „When do we go?“ auf dem eigenen Laptop

Stand: 2026-10-16 · Gepflegt von: Operations Manager · Zielgruppe: Auftraggeber (keine Programmierkenntnisse nötig) · Technischer Hintergrund: [deployment.md §0](deployment.md) · Klick-Drehbuch: [demo-drehbuch.md](demo-drehbuch.md)

Diese Anleitung bringt die App in etwa 15 Minuten (davon ca. 5–10 Minuten Wartezeit beim ersten Start) auf deinen Mac. Danach kannst du sie am Laptop **und** am Handy im selben WLAN ausprobieren.

**Gut zu wissen**

- Alles läuft **nur auf deinem Laptop**. Es gibt kein Hosting, keine Domain, keine Konten, keine Kosten.
- **Es werden keine echten E-Mails verschickt.** Alle Mails (Login-Codes, Hinweise) landen in einem lokalen Postfach namens **Mailpit**, das du im Browser öffnest.
- Bitte **keine echten Daten** eingeben (der gelbe Balken „Demo – bitte keine echten Daten eingeben“ erinnert daran). Nimm ausgedachte Adressen wie `max@demo.test`.
- Du brauchst **nur Docker** – kein Node.js, kein pnpm, keine Programmierumgebung.

---

## 1. Einmalig: Voraussetzungen

### 1.1 Docker Desktop installieren

1. <https://www.docker.com/products/docker-desktop/> öffnen → **„Download for Mac“**. Wähle die passende Variante:
   - **Apple Chip** (M1, M2, M3, M4 …) oder **Intel Chip**. Welcher du hast, steht unter  → „Über diesen Mac“ bei „Chip“ bzw. „Prozessor“.
2. Die heruntergeladene `Docker.dmg` öffnen und Docker in den Ordner „Programme“ ziehen.
3. **Docker** aus „Programme“ starten. Beim ersten Start:
   - Nutzungsbedingungen akzeptieren (für private Nutzung kostenlos).
   - Die Frage nach einer **Anmeldung kannst du überspringen** („Skip“ / „Continue without signing in“) – ein Docker-Konto ist nicht nötig.
   - ggf. das Mac-Passwort eingeben (Docker richtet Hilfsprogramme ein).
4. Fertig, wenn oben in der Menüleiste das **Wal-Symbol** erscheint und Docker Desktop „Engine running“ zeigt.

> Docker Desktop braucht etwa 2–3 GB Speicher. Die Demo selbst legt weitere ca. 2 GB an (wieder löschbar, siehe Abschnitt 5).

### 1.2 Den Code holen (eine der beiden Varianten)

**Variante A – ZIP (am einfachsten):**

1. Die GitHub-Seite des Projekts öffnen (Link bekommst du vom Team) → grüner Knopf **„Code“** → **„Download ZIP“**.
2. Die ZIP-Datei im Ordner „Downloads“ doppelklicken. Es entsteht ein Ordner, z. B. `wir-wollen-weg-main`.
3. Den Ordner an einen festen Ort verschieben, z. B. in deinen Benutzerordner, und in **`wir-wollen-weg`** umbenennen.

**Variante B – Git** (falls du Git kennst):

```bash
git clone <Projekt-URL> ~/wir-wollen-weg
```

### 1.3 Terminal öffnen und in den Ordner wechseln

1. **Terminal** öffnen: `⌘ + Leertaste` → „Terminal“ tippen → Enter.
2. Folgendes eintippen (bzw. kopieren) und Enter drücken:

```bash
cd ~/wir-wollen-weg
```

> Tipp: Statt den Pfad zu tippen, kannst du `cd ` (mit Leerzeichen) schreiben und dann den Ordner aus dem Finder ins Terminal-Fenster ziehen – Enter drücken.

---

## 2. Demo starten (ein Befehl)

```bash
bash scripts/demo.sh start
```

Was beim **ersten Start** passiert (5–10 Minuten, Internet nötig):

1. Das Skript prüft, ob Docker läuft.
2. Es legt die Datei **`.env.demo`** mit **zufälligen, nur lokal gültigen Schlüsseln** an. Diese Datei bleibt auf deinem Laptop und darf nie weitergegeben oder ins Repository hochgeladen werden (Git ignoriert sie automatisch).
3. Es baut die App, startet Datenbank, Mailpit und App, richtet die Datenbank ein und spielt die **Demo-Daten** ein (Anna, Ben, Carla … mit Reisen in allen Phasen).
4. Am Ende erscheint ein Kasten wie dieser:

```
------------------------------------------------------------------
  Wir wollen weg – Demo läuft

  Am Laptop:      http://localhost:3000
  Login-Codes:    http://localhost:8025   (Mailpit – hier kommen alle Mails an)

  Handy (gleiches WLAN):
                  http://192.168.178.20:3000
  Codes am Handy: http://192.168.178.20:8025

  Demo-Login:     anna@demo.test (Code aus Mailpit)
  Stoppen:        ./scripts/demo.sh stop
------------------------------------------------------------------
```

Spätere Starts dauern etwa eine Minute. Die Demo-Daten werden dabei **nicht** überschrieben – deine Änderungen bleiben erhalten.

> Wenn Docker Desktop beim Start fragt, ob eingehende Verbindungen erlaubt werden sollen, oder macOS „Docker … eingehende Netzwerkverbindungen akzeptieren?“ fragt: **Erlauben** (nötig für den Handy-Test).

### 2.1 Alle Befehle auf einen Blick

| Befehl (im Ordner `wir-wollen-weg`) | Wirkung |
|---|---|
| `bash scripts/demo.sh start` | Demo starten (beim ersten Mal: einrichten) und Adressen anzeigen |
| `bash scripts/demo.sh status` | Läuft alles? Adressen erneut anzeigen |
| `bash scripts/demo.sh stop` | Demo anhalten – **Daten bleiben** erhalten |
| `bash scripts/demo.sh seed` | **Demo-Personen und -Reisen auf Anfang** zurücksetzen (siehe Hinweis unten) |
| `bash scripts/demo.sh unlock` | Anmelde-Sperren aufheben, wenn „Bitte warte kurz …“ erscheint |
| `bash scripts/demo.sh reset` | **Alles löschen** (Datenbank, Mails). Der nächste `start` beginnt wie neu |
| `bash scripts/demo.sh logs` | Technisches Protokoll der App (für das Team, beenden mit `Ctrl + C`) |

**Hinweis zu `seed`:** Es setzt **alle Personen mit Adresse `…@demo.test`** zurück – auch solche, die du selbst angelegt hast (z. B. `max@demo.test`), samt ihrer Reisen. Konten mit anderen Adressen bleiben. Das ist praktisch, um vor einer Vorführung alles frisch zu haben.

Docker Desktop muss laufen, solange du die Demo benutzt. Nach einem Neustart des Macs: Docker Desktop öffnen, dann `bash scripts/demo.sh start`.

---

## 3. Benutzen

### 3.1 Am Laptop

1. **App:** <http://localhost:3000> im Browser (Safari, Chrome, Firefox) öffnen.
2. **Mailpit (Postfach für alle Mails):** <http://localhost:8025> in einem **zweiten Tab** öffnen.
3. Anmelden: in der App „Anmelden“ → E-Mail eingeben (z. B. `anna@demo.test`) → „Code senden“ → in Mailpit erscheint die Mail „123456 ist dein Code für Wir wollen weg“ → den 6-stelligen Code in der App eintippen.
   - Neue Adresse (z. B. `max@demo.test`)? Dann legt die App automatisch ein Konto an und fragt nach deinem Namen.
   - Die Mail enthält zusätzlich einen Anmelde-Link. **Am Laptop lieber den Code nutzen:** Der Link zeigt auf die Handy-Adresse (`http://192.168…`), damit er auch am Handy funktioniert – am Laptop öffnet er die App unter dieser Adresse, und du bist dann dort angemeldet statt unter `localhost`.
4. **Zweite Person gleichzeitig:** Ein **privates Fenster** öffnen (Safari: `⌘ + Umschalt + N`, Chrome: `⌘ + Umschalt + N`) oder einen anderen Browser. Dort kannst du dich als andere Person anmelden.

### 3.2 Demo-Personen (alle Adressen enden auf `@demo.test`)

Die Demo-Daten passen ihre Termine automatisch an das heutige Datum an.

| Anmelden als | Name | Sprache / Region | Was man mit ihr/ihm gut zeigen kann |
|---|---|---|---|
| `anna@demo.test` | Anna Schmidt | DE, Bayern | **Hauptperson** – in fast allen Reisen dabei, Orga von „Lissabon 2027“, „Familientreffen Harz“, „Malle 2026“, „Kroatien Segeln“. Hat in „JGA Tim“ erst eine von drei Optionen bewertet |
| `ben@demo.test` | Ben Wagner | DE, Berlin | Orga von „Skiurlaub Arlberg“ (hat dort die Abstimmung abgebrochen) |
| `carla@demo.test` | Carla Rossi | **EN**, Großbritannien | Orga von „JGA Tim“ (Abstimmung läuft) – zeigt die **englische** Oberfläche |
| `david@demo.test` | David Huber | DE, Österreich | Mitglied mit österreichischen Feiertagen |
| `emma@demo.test` | Emma Brown | **EN**, USA | Mitglied, englisch, Kommentar „Only in September“ |
| `felix@demo.test` | Felix Meier | DE, Schweiz | Orga von „Wanderwoche Dolomiten“ (Beitritt geschlossen); in „Lissabon 2027“ noch ohne Tage |
| `greta@demo.test` | Greta Lind | DE | sieht beim „Familientreffen Harz“ einmalig die Feier **„Es geht los!“** |
| `hanna@demo.test` | Hanna Koch | DE, Nordrhein-Westfalen | ebenfalls Feier „Es geht los!“ beim „Familientreffen Harz“ |
| `ida@demo.test` | Ida Vogel | DE, Hamburg | zum Ausprobieren von **„Konto löschen“**: Orga von „Städtetrip Wien“ (mit anderen → Orga-Übergabe nötig) und einer Solo-Reise |

**Die vorbereiteten Reisen**

| Reise | Phase | Orga | Besonderheit |
|---|---|---|---|
| Lissabon 2027 | Tage sammeln | Anna | 5 von 9 haben abgegeben, 2 Platzhalter (Mia, Tom); Gruppenkalender mit deutlichen Vorschlägen „Alle dabei“ / „Fast alle dabei“; Annas Tage sind noch ein **Entwurf** |
| Skiurlaub Arlberg | Tage sammeln | Ben | Abstimmung wurde **abgebrochen** – Anna sieht im Tab „Abstimmen“ einmal den Hinweis |
| JGA Tim | **Abstimmung läuft** | Carla | 3 Optionen, Frist in 5 Tagen; Anna sieht Ergebnisse **nur** bei der Option, die sie schon bewertet hat |
| Familientreffen Harz | **Termin steht fest** | Anna | Countdown-Ring, Kalender-Export; Hanna und Greta sehen beim ersten Öffnen die Feier |
| Wanderwoche Dolomiten | Tage sammeln | Felix | **Beitritt geschlossen**, Platzhalter „Jule“ |
| Malle 2026 | vergangen | Anna | unter „Vergangene Reisen“ |
| Kroatien Segeln | vergangen | Anna | Hinweis **„Wird am … gelöscht“** (automatische Löschung 90 Tage nach Reiseende) |
| Städtetrip Wien, Idas Testreise | Tage sammeln | Ida | für „Konto löschen“ |

### 3.3 Am Handy (gleiches WLAN)

Voraussetzung: Laptop und Handy sind im **selben WLAN** (z. B. zu Hause). In Gast-WLANs, Hotels oder Firmennetzen sind Geräte oft voneinander abgeschirmt – dann klappt es nicht (siehe 4.5).

1. Beim Start zeigt das Skript die **Handy-Adresse**, z. B. `http://192.168.178.20:3000`. Jederzeit erneut anzeigen: `bash scripts/demo.sh status`.
2. Diese Adresse am Handy in **Safari** bzw. **Chrome** eintippen – **mit `http://` und `:3000`**.
3. Anmelden wie am Laptop. Den Code liest du am einfachsten in Mailpit **am Laptop** ab – oder am Handy in einem zweiten Tab unter der angezeigten Adresse mit `:8025`.
4. **Einladungslink aufs Handy bringen:** In der App am Laptop „Link kopieren“ und dann z. B. per **AirDrop**, **Notizen** (iCloud) oder als Nachricht an dich selbst aufs iPhone schicken. Einladungs- und Anmeldelinks zeigen automatisch auf die Handy-Adresse.

**Was am Handy bewusst (noch) nicht geht** – das ist der Offline-Demo geschuldet, nicht der App:

- **Kein „Teilen …“-Menü des Handys und kein automatisches Kopieren:** Browser erlauben das nur bei verschlüsselten Seiten (`https://`). Die App zeigt stattdessen den markierten Text zum Kopieren (langes Drücken → „Kopieren“). Am Laptop unter `localhost` funktionieren die Kopieren-Knöpfe normal.
- **WhatsApp/Instagram-Vorschau** eines Einladungslinks und echte Mail-Zustellung gibt es erst mit einer echten Internet-Adresse (Go-Live).
- Ändert sich die WLAN-Adresse des Laptops (anderes WLAN, Router-Neustart), einfach `bash scripts/demo.sh start` erneut ausführen – die Adresse wird bei jedem Start neu ermittelt. Am Handy musst du dich danach einmal neu anmelden.

### 3.4 Sicherheit im WLAN

Solange die Demo läuft, können **alle Geräte im selben WLAN** die App und Mailpit (also auch die Login-Codes) öffnen. Zu Hause ist das unproblematisch.

- **Café, Hotel, Zug, Büro:** In der Datei `.env.demo` die Zeile `DEMO_BIND_ADDRESS=0.0.0.0` auf `DEMO_BIND_ADDRESS=127.0.0.1` ändern und `bash scripts/demo.sh start` ausführen. Dann ist die Demo **nur am Laptop** erreichbar (kein Handy-Test).
- Die Datei `.env.demo` öffnest du z. B. mit `open -e .env.demo` (TextEdit) im Terminal.
- Nach der Vorführung: `bash scripts/demo.sh stop`.

---

## 4. Fehlerbehebung

### 4.1 „Docker läuft nicht“ / „Cannot connect to the Docker daemon“

Docker Desktop ist nicht gestartet. Programm **Docker** öffnen, warten, bis das Wal-Symbol in der Menüleiste ruhig ist („Engine running“), dann den Befehl wiederholen.

### 4.2 „Docker ist nicht installiert“ / „command not found: docker“

Docker Desktop installieren (Abschnitt 1.1). Wenn es installiert ist: Terminal einmal schließen und neu öffnen.

### 4.3 „Port 3000 (oder 8025) ist schon belegt“

Ein anderes Programm nutzt die Adresse schon – oft eine ältere Demo oder ein Entwicklungsserver.

1. Erst `bash scripts/demo.sh stop` und dann wieder `start` versuchen.
2. In Docker Desktop unter **„Containers“** nachsehen, ob noch etwas anderes läuft (z. B. `wir-wollen-weg-dev`), und es mit dem Stopp-Knopf beenden.
3. Herausfinden, welches Programm den Port belegt: `lsof -nP -iTCP:3000 -sTCP:LISTEN` – das Programm beenden (oder den Mac neu starten).

### 4.4 Der Code kommt nicht an

- **Mails gehen nie in dein echtes Postfach** (auch nicht bei iCloud-Adressen) – immer in **Mailpit**: <http://localhost:8025>. Ggf. Mailpit-Seite neu laden.
- Richtige Adresse eingegeben? Mailpit zeigt, an wen die Mail ging.
- **„Bitte warte kurz …“** oder „Zu viele Versuche“: Pro Adresse sind 5 Codes pro Stunde erlaubt (Schutz gegen Missbrauch – bleibt so für den Echtbetrieb). In der Demo einfach `bash scripts/demo.sh unlock` ausführen und neu versuchen.
- Code abgelaufen (nach 15 Minuten) → „Neuen Code senden“.
- Tipp: Wenn du „Angemeldet bleiben“ aktiviert lässt, musst du dich am selben Gerät nicht erneut anmelden.

### 4.5 Das Handy erreicht die App nicht

1. Ist das Handy im **selben WLAN** (nicht Mobilfunk, nicht Gast-WLAN)?
2. Adresse genau so eingetippt, inkl. `http://` und `:3000`? Safari ergänzt sonst manchmal `https://` – dann die Adresse vollständig neu tippen.
3. `bash scripts/demo.sh status` – stimmt die angezeigte Handy-Adresse noch? Sonst `start` erneut ausführen.
4. **Mac-Firewall:**  → Systemeinstellungen → Netzwerk → Firewall. Ist sie an, unter „Optionen“ prüfen, dass **Docker** eingehende Verbindungen **erlaubt** sind.
5. Steht in `.env.demo` `DEMO_BIND_ADDRESS=127.0.0.1`? Dann ist der Handy-Zugriff absichtlich aus (siehe 3.4).
6. Wird am Mac eine falsche Adresse erkannt (z. B. bei VPN oder mehreren Netzwerken)? Die richtige WLAN-Adresse steht unter  → Systemeinstellungen → WLAN → „Details …“ → „IP-Adresse“. In `.env.demo` bei `DEMO_HOST=` eintragen (z. B. `DEMO_HOST=192.168.178.20`) und `start` erneut ausführen.

### 4.6 Anmeldung klappt am Handy nicht („Das hat nicht geklappt“, keine Reaktion)

- Die App über die **Handy-Adresse aus dem Startkasten** öffnen, nicht über eine selbst ermittelte andere Adresse – sonst lehnt die App die Anmeldung aus Sicherheitsgründen ab. Notfalls `bash scripts/demo.sh start` erneut ausführen und die neue Adresse nutzen.

### 4.7 Der erste Start bricht ab

- Internetverbindung prüfen (beim ersten Start werden Bausteine heruntergeladen) und den Befehl einfach wiederholen.
- Docker Desktop → Einstellungen → „Resources“: mindestens **4 GB Arbeitsspeicher** zuweisen.
- Bleibt der Fehler: die letzten Zeilen der Ausgabe kopieren und ans Team schicken.

### 4.8 Neue Version der App ausprobieren

Neue ZIP herunterladen (oder `git pull`), alten Ordner ersetzen, `bash scripts/demo.sh start`. Deine Demo-Daten bleiben erhalten (sie liegen in Docker, nicht im Ordner). Für frische Demo-Daten zusätzlich `bash scripts/demo.sh seed`.

### 4.9 „Die App antwortet nicht“

`bash scripts/demo.sh logs` zeigt das Protokoll. Meist hilft `bash scripts/demo.sh stop` und anschließend `start`. Sonst die letzten Zeilen ans Team schicken.

---

## 5. Aufräumen

- **Pause:** `bash scripts/demo.sh stop` – Daten bleiben, Docker Desktop kann beendet werden.
- **Alles löschen:** `bash scripts/demo.sh reset` und anschließend in Docker Desktop unter „Images“ die Einträge `wir-wollen-weg-demo-…` löschen (gibt ca. 2 GB frei). Den Projektordner kannst du dann einfach in den Papierkorb ziehen – auch `.env.demo` darin ist damit weg.
- Docker Desktop deinstallieren: Docker Desktop → Einstellungen → „Troubleshoot“ → „Uninstall“.

---

## 6. Für das Team (technische Hinweise)

- Skript: `scripts/demo.sh` (bash, macOS/Linux; Windows nur über WSL – ungetestet). Es nutzt ausschließlich `docker compose -f docker/compose.demo.yml --env-file .env.demo` mit den Diensten `proxy` (Caddy, Port 3000), `app`, `db`, `mailpit` (Port 8025) und dem Hilfsdienst `tools` für Migration und Seed. Node/pnpm am Laptop sind nicht nötig.
- `.env.demo` wird beim ersten Start erzeugt: `APP_ENV=demo`, `BETTER_AUTH_SECRET` (32 Byte zufällig), `POSTGRES_PASSWORD` (zufällig), `DEMO_BIND_ADDRESS`, `DEMO_HOST`. Rechte `600`, in `.gitignore` (`.env.*`).
- Adressen: Das Skript ermittelt die LAN-IP (macOS: Schnittstelle der Standardroute bzw. `en0`/`en1`; Linux: `ip route get`) und setzt bei jedem Start `APP_URL` = `BETTER_AUTH_URL` = `http://<LAN-IP>:3000` sowie `AUTH_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000` (Umgebungsvariablen haben in Compose Vorrang vor `--env-file`). So funktionieren Anmeldung über `localhost` (Laptop) **und** über die LAN-IP (Handy); Links in Mails/Einladungen zeigen auf die LAN-IP. Bei `DEMO_BIND_ADDRESS=127.0.0.1` wird `localhost` verwendet.
- HTTP im LAN: Better Auth setzt Cookies ohne `Secure`, weil `BETTER_AUTH_URL` mit `http://` beginnt (geprüft: Cookie `ww.session_token`, `secure=false`) – Login über `http://<LAN-IP>` funktioniert. Kein „Secure Context“ → Web-Share/Clipboard-API fehlen, Fallback greift (deployment.md §0.3).
- Das Datenbank-Volume (`wir-wollen-weg-demo_demo-db`) überlebt `.env.demo` (Datei gelöscht, neue ZIP-Version in anderem Ordner). Damit das Passwort trotzdem passt, setzt `start` das DB-Passwort bei jedem Start per Socket-Login im Container auf den Wert aus `.env.demo` (`alter user app …`). `stop` und `reset` funktionieren auch ohne `.env.demo`.
- Seed nur beim ersten Start (wenn keine `@demo.test`-Person existiert), danach manuell mit `seed`. `unlock`/`seed` leeren `auth_attempt`, `rate_limit`, `rate_limit_event` – nur bei `APP_ENV=demo`.
- Die `pnpm demo:*`-Kurzbefehle (package.json) bleiben für Entwickler; sie nutzen `APP_URL` aus `.env.demo` (Standard `localhost`, also ohne Handy-Links).
