# Deployment & Betrieb – Wir wollen weg

Stand: 2026-10-23 · Verantwortlich: Operations Manager · Status: v1.0 (v1.0: **Dateispeicher Reiseunterlagen §0.13** – Optionen Neon/R2/Hetzner/Scaleway/Vercel Blob/B2/IONOS mit Preisen, Virenscan-Stufen, EXIF/HEIC, Upload-/Download-Ablauf mit vorsignierten URLs, Empfehlung je Umgebung, Variablen `DOCUMENTS_ENABLED`/`FILES_*` §4 – Inkrement 12, F-055; v0.9: §0.12 an UX-Spec W23 angeglichen – Beta-Code auf eigener Seite `/beta` vor dem Mailversand, Beta-Pass-Cookie, Einladungsweg Variante A/B, `/install`, `/offline`, „Einladungslink einfügen“, Feedback-Variablen, kein Lösch-Versprechen zum Beta-Ende; v0.8: **geschlossene Freundes-Beta `APP_ENV=beta` + PWA, Gate G0** – Mail-Dienst/Registrar-Empfehlung, Beta-Code, Startschutz, Service Worker, CSP, Rechtstexte §0.12, §3, §4; v0.7: persönliche Reisedaten – Schlüssel-Konzept `TRAVEL_DATA_KEYS`, Rotation, Runbooks, Startschutz, Feature-Schalter `TRAVEL_DATA_ENABLED` §0.11 + §4 – Inkrement 11; v0.6: Löschjob-Umfang inkl. endgültiger Löschung weich gelöschter Ausgaben nach 24 h, §0.10 – Inkrement 10; v0.5: ausgehende Abrufe/SSRF-Betrieb für Link-Vorschau + Bild-Proxy §0.8, CSP-Vorschlag §0.9 – Inkrement 9; v0.4: private Live-Vorschau auf Vercel + Neon, §0.7, PRD Q25 – technischer Teil vom Developer; v0.3: Zugriffslogs ohne Tokens im Pfad, §5.4, R-037) – **aktueller Betriebsmodus: Offline-Demo (§0) + private Vorschau (§0.7); geplant: geschlossene Freundes-Beta (§0.12, Gate G0)**; Hosting-/Mail-Plan (§2–§7) gilt **ab Go-Live** (Auftraggeber-Entscheidung Q15, 2026-10-08)

Bezug: [tech-stack.md](tech-stack.md) · [compliance-checklist.md](compliance-checklist.md) · [**go-live.md – Go-Live-Gate**](go-live.md) · [PRD §8, §12](../product/PRD.md)

> Preise netto, Recherche 2026-10-08 (Quellen am Ende). Hetzner hat 2026 zweimal Preise angepasst und die günstigen CX-/CAX-Tarife waren zeitweise „nicht verfügbar“ – **vor Bestellung live prüfen**.

---

## 0. Aktueller Betriebsmodus: Offline-Demo (gültig seit 2026-10-08)

**Entscheidung Auftraggeber (PRD §12 Q14–Q16):** Bis auf Weiteres läuft „Wir wollen weg“ / „When do we go?“ **nur lokal** als Demo. **Kein Hosting, keine Domain, keine Konten oder Abos** (Hetzner, Lettermint, Postfach, Generator usw.). Impressum und Datenschutz sind **Platzhalter** (Privatperson). Alles in §2–§7 ist der vorbereitete Plan **ab Go-Live**; der Übergang ist ein Gate: [go-live.md](go-live.md).

> **Fortschreibung:** Seit 2026-10-20 zusätzlich private Vorschau mit Demo-Daten (§0.7, Q25). **Ab 2026-10-23 geplant:** geschlossene Freundes-Beta mit echten Daten auf Vercel + Neon, eigene Domain + EU-Mail-Dienst (§0.12, **Gate G0** in [go-live.md](go-live.md)) – die Domain und das Mail-Konto aus Q15 werden dafür vorgezogen; Hetzner/G1 bleibt der Zielbetrieb.

### 0.1 Was die Demo umfasst

| Dienst | Image / Herkunft | Port (Host) | Zweck |
|---|---|---|---|
| `proxy` | `caddy:2-alpine` mit `docker/Caddyfile.demo` (ohne TLS) | `3000` | einziger Zugang zur App; ersetzt einen vom Client gesendeten `X-Forwarded-For` durch die echte Absender-IP (Rate-Limit, R-005) |
| `app` | Produktions-Build aus `docker/Dockerfile` (identisch zum späteren Prod-Image) | nicht veröffentlicht (nur über `proxy`) | die App |
| `db` | `postgres:18` mit benanntem Volume `demo-db` | nicht veröffentlicht (nur internes Netz) | Datenbank |
| `mailpit` | `axllent/mailpit` | `8025` (Web-UI), SMTP `1025` nur intern | fängt **alle** Mails ab – Codes und Magic-Links werden **nie** echt versendet, sondern in der Mailpit-Web-UI angezeigt |

- Datei: `docker/compose.demo.yml` (legt der Developer mit dem Scaffold P1-0 an, neben `compose.dev.yml`). Minimaler Caddy ohne TLS als Vorschaltung (seit R-005), kein Bugsink, kein Backup-Container.
- **Client-IP für Rate-Limits (R-005):** Next.js übernimmt einen vom Client mitgeschickten `X-Forwarded-For` ungeprüft, wenn die App direkt erreichbar ist – IP-Limits ließen sich so per Header umgehen. Deshalb ist die App **nie direkt** erreichbar, sondern nur über einen Proxy, der den Header **überschreibt**: in der Demo `proxy` (Caddy vertraut keinem vorgelagerten Proxy und setzt `X-Forwarded-For` = echte Absender-IP), ab Go-Live Caddy (§5.2). Die App liest die IP aus `AUTH_IP_HEADER` (Standard `x-forwarded-for`), überspringt von rechts Einträge aus `AUTH_TRUSTED_PROXIES` und nimmt den ersten anderen Eintrag. Anfragen ohne auflösbare IP werden außerhalb von `development`/`ci` mit 400 abgelehnt (kein gemeinsamer Sammeltopf). Gleiches gilt für die App-Limits (Einladungen, R-036): ohne IP wird ein Beitritt abgelehnt und ein Fehlversuch nicht gezählt – nie ein Topf „unknown“; IPv6-Adressen zählen dort wie bei Better Auth pro /64-Netz. Ein gültiger Einladungslink wird nie durch das IP-Limit gesperrt.
- **Zugriffslogs in der Demo (R-037):** `docker/Caddyfile.demo` enthält **keine** `log`-Direktive → Caddy schreibt **kein** Zugriffslog; Einladungs- und Magic-Link-Tokens landen also nicht in `docker compose logs proxy`. Die Ausnahme `logging.incomingRequests.ignore` in `next.config.ts` wirkt nur bei `next dev`, nicht im Demo-/Prod-Image. **Änderung für den Developer (Empfehlung, nicht dringend):** in `docker/Caddyfile.demo` einen Kommentar ergänzen „Zugriffslog nur mit Token-Filter aus deployment.md §5.4 einschalten“ – oder gleich den Block aus §5.4 mit `output stdout` übernehmen, damit Demo und Produktion gleich loggen und der Filter lokal testbar ist (Prüfung: `/i/<token>` aufrufen, in `docker compose logs proxy` darf nur `/i/[redacted]` stehen). Der Operations Manager ändert die Datei nicht selbst.
- Umgebungsdatei: `.env.demo` (in `.gitignore`), erzeugt aus `.env.example`; `APP_ENV=demo` (siehe §4).
- `APP_ENV=demo` bewirkt: Mail-Transport fest auf Mailpit (kein externer SMTP möglich), `noindex` überall, sichtbares Banner „Demo – keine echten Daten eingeben“ (DE/EN), Rechtstext-Seiten mit Platzhaltern erlaubt (compliance-checklist.md §0a).

### 0.2 Demo starten (Laptop)

Voraussetzungen: Docker (Desktop oder Engine + Compose-Plugin), Git oder ZIP-Download. Kein Node/pnpm nötig für die reine Demo.

**Empfohlen (seit 2026-10-16, Demo-Abnahme M0.5): ein Befehl** – `bash scripts/demo.sh start` erzeugt beim ersten Lauf `.env.demo` mit zufälligen lokalen Secrets, baut, startet, migriert, spielt einmalig den Seed ein, ermittelt die LAN-IP für den Handy-Test (§0.3) und zeigt die Adressen. Weitere Befehle: `stop`, `seed`, `unlock` (Anmelde-Limits leeren, nur `APP_ENV=demo`), `reset`, `status`, `logs`. Laien-Anleitung: [demo-anleitung.md](demo-anleitung.md), Klick-Drehbuch: [demo-drehbuch.md](demo-drehbuch.md).

Manuell (gleiches Ergebnis ohne Skript):

```bash
cp .env.example .env.demo
# in .env.demo setzen:
#   APP_ENV=demo
#   APP_URL=http://localhost:3000          (für Handy-Test: LAN-IP, siehe 0.3)
#   BETTER_AUTH_URL=<gleicher Wert wie APP_URL>   (.env-Dateien lösen keine Variablen auf)
#   BETTER_AUTH_SECRET=<Ausgabe von: openssl rand -base64 32>
#   POSTGRES_PASSWORD=<beliebig, nur lokal>
docker compose -f docker/compose.demo.yml --env-file .env.demo up -d --build
docker compose -f docker/compose.demo.yml --env-file .env.demo run --rm tools pnpm db:migrate
docker compose -f docker/compose.demo.yml --env-file .env.demo run --rm tools pnpm db:seed:demo   # optional, §0.4
```

Kurzform mit Node/pnpm auf dem Laptop: `pnpm demo:up` (Build + Start + Migration), `pnpm demo:seed`, `pnpm demo:down`, `pnpm demo:reset` (inkl. Daten).

> **Wichtig:** Migration und Seed laufen im Service **`tools`** (Docker-Stage mit Quellcode + Dev-Abhängigkeiten, Compose-Profil `tools`), **nicht** im Service `app`: Das App-Image ist der Next.js-Standalone-Build (`node server.js`) und enthält weder `package.json`-Skripte noch `drizzle-kit`.

- App: <http://localhost:3000> · Mailpit (Codes/Links): <http://localhost:8025>
- Anmelden: E-Mail eingeben (beliebig, z. B. `anna@demo.test`) → Mail erscheint in Mailpit → 6-stelligen Code abtippen **oder** Magic-Link in Mailpit anklicken.
- Stoppen: `docker compose -f docker/compose.demo.yml down` · Komplett zurücksetzen (inkl. Daten): `… down -v`.

Für die tägliche Entwicklung bleibt `compose.dev.yml` (nur PostgreSQL + Mailpit) + `pnpm dev` (§3, Umgebung **dev**).

### 0.3 Auf dem eigenen Handy im WLAN testen

> Mit `scripts/demo.sh` entfallen die Schritte 1–2: Das Skript setzt bei jedem Start `APP_URL`/`BETTER_AUTH_URL` auf `http://<LAN-IP>:3000` (fest vorgebbar mit `DEMO_HOST` in `.env.demo`) und `AUTH_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`, damit der Laptop weiter über `localhost` anmelden kann. Login über `http://<LAN-IP>` am 2026-10-16 geprüft (Cookies ohne `Secure`, da `BETTER_AUTH_URL` mit `http://` beginnt).

1. LAN-IP des Laptops ermitteln (macOS: `ipconfig getifaddr en0`, Linux: `hostname -I`, Windows: `ipconfig`), z. B. `192.168.178.20`.
2. In `.env.demo` `APP_URL=http://192.168.178.20:3000` und `BETTER_AUTH_URL` gleich setzen, dann `up -d` erneut (kein Neubau nötig – keine `NEXT_PUBLIC_*`-Werte, tech-stack.md §1). **Wichtig:** Magic-Links und Einladungslinks werden mit `APP_URL` gebaut; mit `localhost` funktionieren sie auf dem Handy nicht.
3. Handy im **selben WLAN** → `http://192.168.178.20:3000` öffnen; Codes in Mailpit unter `http://192.168.178.20:8025` (zweiter Tab oder Laptop).
4. Firewall des Laptops muss eingehend Port 3000 und 8025 erlauben (macOS fragt beim ersten Mal; Windows: Netzwerk als „Privat“ einstufen).
5. Nur im **eigenen/vertrauenswürdigen WLAN** – im Hotel-/Café-WLAN wären App und Mailpit für alle im Netz sichtbar. Dort stattdessen `DEMO_BIND_ADDRESS=127.0.0.1` in `.env.demo` setzen (Ports nur am Laptop).
6. Wird statt der Demo `pnpm dev` genutzt: LAN-IP in `allowedDevOrigins` (`next.config.ts`) eintragen und `pnpm dev -H 0.0.0.0`, sonst blockiert Next.js Dev-Ressourcen von fremden Origins.

**Grenzen des WLAN-Tests (bewusst in Kauf genommen):**

| Thema | Folge über `http://<LAN-IP>` | Wann wirklich testbar |
|---|---|---|
| Kein HTTPS → kein „Secure Context“ | `navigator.share` (Teilen-Dialog) und `navigator.clipboard` stehen nicht zur Verfügung → Fallback (Link markieren/kopieren) muss funktionieren; Cookies ohne `Secure`/`__Secure-` (tech-stack.md §3.3) | Tunnel (§0.5) oder Staging |
| In-App-Browser (WhatsApp, Instagram …) | Link `http://192.168.…/i/<token>` lässt sich zwar im Chat an sich selbst schicken und im selben WLAN öffnen (grober Vortest, ungeprüft) – aber keine Link-Vorschau (OG-Bild), kein HTTPS, andere Cookie-Bedingungen → **kein belastbarer T2-Test** | erst mit öffentlich erreichbarer HTTPS-URL |
| Echte Mail-Zustellung, Mail-App → Browserwechsel beim Magic-Link | nicht testbar, Mails landen in Mailpit | ab Go-Live Stufe 1 (Mail-Konto + Domain) |
| Testpersonen außerhalb des WLANs | nicht erreichbar | Tunnel (§0.5) oder Staging |

### 0.4 Demo-Seed-Daten

Skript `pnpm db:seed:demo` (Developer, wächst mit den Inkrementen; Vorschlag `scripts/seed-demo.ts`):

- **Nur synthetische Daten:** fiktive Personen mit Adressen unter `@demo.test` (reservierte TLD, kann nie zugestellt werden), z. B. Anna (Orga), Ben, Clara, Deniz, Emil + ein Platzhalter-Mitglied (F-007).
- **Reisen in allen Zuständen**, damit jede Ansicht ohne Klickarbeit vorführbar ist: (1) Reise in Sammelphase mit Lücken (Heatmap F-008, Kandidaten F-009), (2) Reise in Abstimmung (F-010/F-011), (3) festgelegte Reise mit ICS (F-012); Mischung DE/EN-Konten und Regionen (z. B. `DE-BY`, `AT-9`, `GB-ENG`) für Feiertage (F-016).
- Datumsangaben **relativ zum heutigen Tag** erzeugen (sonst veraltet die Demo).
- **Idempotent** (erst leeren, dann einspielen); **verweigert den Lauf**, wenn `APP_ENV` nicht `demo` oder `development` ist (Schutz für später).
- Anmelden als Demo-Person: E-Mail `anna@demo.test` eingeben → Code in Mailpit.

### 0.5 Optional später: temporärer Tunnel für In-App-Browser-Test (ohne Konto)

Für den Gerätetest T2 (tech-stack.md §11) und ggf. kurze Vorführungen bei Freunden außerhalb des WLANs reicht ein **kurzlebiger HTTPS-Tunnel** vom Laptop – noch ohne Hosting, Domain oder Abo. Bewertung (Stand 2026-10-08, Bedingungen vor Nutzung prüfen):

| Option | Konto nötig? | Kosten | Bewertung |
|---|---|---|---|
| **Cloudflare Quick Tunnel** (`cloudflared tunnel --url http://localhost:3000`) | nein | 0 € | zufällige `*.trycloudflare.com`-URL mit HTTPS; für Tests gedacht, ohne Verfügbarkeitszusage; US-Anbieter → **nur synthetische Daten**. **Empfehlung für T2.** |
| localhost.run (`ssh -R 80:localhost:3000 nokey@localhost.run`) | nein | 0 € | nur SSH nötig; URL wechselt; Durchsatz begrenzt |
| ngrok, Tailscale Funnel | **ja** (kostenloses Konto) | 0 € (Free) | widerspricht „keine Konten“ – nur, wenn Auftraggeber zustimmt |

Regeln für jeden Tunnel-Einsatz:
1. **Nur Demo-/Seed-Daten**, Testpersonen nutzen ausgedachte Adressen (`…@demo.test`) – echte Daten würden über einen Drittanbieter laufen und es gibt noch kein echtes Impressum/keine echte Datenschutzerklärung.
2. Tunnel **nur für die Dauer des Tests** öffnen (Minuten bis wenige Stunden), danach beenden; URL nicht öffentlich posten.
3. `APP_URL`/`BETTER_AUTH_URL` auf die Tunnel-URL setzen und `app` neu starten. **Mailpit nicht tunneln** – Codes liest der Tester am Laptop bzw. bekommt sie vom Team.
   Für den Cloudflare-Tunnel zusätzlich `AUTH_IP_HEADER=cf-connecting-ip` (sonst teilen sich alle Tunnel-Nutzer die IP von `cloudflared`) und `DEMO_BIND_ADDRESS=127.0.0.1` (sonst könnte jemand im WLAN `CF-Connecting-IP` fälschen). Anmeldungen direkt über `http://localhost:3000` gehen in diesem Modus nicht (400, kein Header) – über die Tunnel-URL testen. Andere Tunnel: Header des Anbieters prüfen; liefert er keinen eigenen, bleibt `x-forwarded-for` mit der Tunnel-Software in `AUTH_TRUSTED_PROXIES`.
4. Da die Seite damit kurzzeitig öffentlich erreichbar ist: Demo-Banner sichtbar, `noindex`, Rate-Limits an.

Dauerhafte Staging-URL → erst mit Go-Live-Gate Stufe 1 ([go-live.md](go-live.md)).

### 0.6 Platzhalter-Schutz für später

Damit Platzhalter nie versehentlich live gehen: Die App prüft beim Start, ob `APP_ENV=production` **und** Rechtstexte/Betreiberangaben noch den Marker `[PLATZHALTER` enthalten → Start abbrechen (Developer, P1-0/OPS-5). Zusätzlich Punkt in der [Go-Live-Checkliste](go-live.md).

Seit 2026-10-20 prüft derselbe Startschutz (`src/instrumentation.ts`, Regeln in `src/lib/app-env.ts`) außerdem (R-064):

- `APP_ENV` `preview`, `staging` und `production` starten nur mit einer `https://`-Basis-URL (`BETTER_AUTH_URL`, sonst `APP_URL`) – sonst fehlte den Session-Cookies `Secure`.
- `APP_ENV=preview` startet nur mit `PREVIEW_ACCESS_PASSWORD` (≥ 10 Zeichen); Platzhalter in den Rechtstexten blockieren dort **nicht** (Demo-Banner bleibt sichtbar).
- `APP_ENV=production` und `staging` starten nie mit `MAIL_TRANSPORT=inbox` (Demo-Postfach; erlaubt nur `development`, `ci`, `demo`, `preview` – Review 2026-10-20: `staging` hätte ohne Basic Auth alle Login-Codes öffentlich gezeigt).
- Auf Vercel (`VERCEL=1`) starten `development`, `ci` und `demo` nicht; fehlt `APP_ENV` dort, gilt `preview` (also: ohne Passwort zu).
- **Ab Beta G0 (Anforderung, §0.12.4):** `APP_ENV=beta` startet nur mit `https://`-Basis-URL, echtem SMTP, `BETA_ACCESS_CODES`, `LEGAL_OPERATOR_NAME` + `CONTACT_EMAIL`, aktivem Löschjob, ohne Reisedaten und ohne `[PLATZHALTER` in den Beta-Texten.
- **Ab Inkrement 11 (Anforderung):** `staging`/`production` mit eingeschalteten Reisedaten (`TRAVEL_DATA_ENABLED=true`) starten nur mit eigenem, gültigem `TRAVEL_DATA_KEYS`; keine Ableitung aus `BETTER_AUTH_SECRET` (Details §0.11.3).

### 0.7 Private Live-Vorschau: Vercel (Hobby) + Neon (Free) – PRD Q25

**Entscheidung Auftraggeber (2026-10-20):** zusätzlich zur Offline-Demo eine **private Vorschau unter einer festen https-URL**, ohne Download, auf kostenlosen Tarifen. **Nur Demo-Daten**, kein Go-Live (echte Nutzung = Gate G1). Konten (Vercel per GitHub-Login, Neon über die Vercel-Integration) legt der Auftraggeber an. Klick-Anleitung für Laien: [vorschau-anleitung.md](vorschau-anleitung.md) (Operations). Dieser Abschnitt ist die technische Referenz.

**Was die App im Modus `APP_ENV=preview` tut**

| Thema | Umsetzung | Datei |
|---|---|---|
| Zugangsschutz | HTTP Basic Auth vor **allen** Seiten, Server Actions und API-Routen; Benutzername beliebig (z. B. `demo`), nur das Passwort `PREVIEW_ACCESS_PASSWORD` zählt; Vergleich zeitkonstant (SHA-256 + XOR). Ohne gültiges Passwort in der Konfiguration: 503 (fail closed). Offen bleiben nur `/api/health` (nur „ok/error“), `/api/internal/retention` (eigener Token), `/robots.txt`, die Web-App-Manifeste und statische Assets (`/_next/static`, Fonts, Icons). | `src/proxy.ts` (Next.js 16 „Proxy“, früher Middleware, Node.js-Runtime), `src/lib/basic-auth.ts` |
| Nicht indexieren | `X-Robots-Tag: noindex, nofollow` auf jeder Antwort (auch 401), `robots.txt` = `Disallow: /` in allen Modi außer `production` | `src/proxy.ts`, `src/app/robots.ts`, `next.config.ts` |
| https / Cookies | Startschutz verlangt `https://`-Basis-URL → Cookies `__Secure-ww.*` mit `Secure` (R-064) | `src/instrumentation.ts`, `src/lib/app-env.ts` |
| Basis-URL | `APP_URL` optional: ohne Wert gilt `https://$VERCEL_PROJECT_PRODUCTION_URL` (Produktions-Domain des Vercel-Projekts, z. B. `wir-wollen-weg.vercel.app`) | `src/lib/app-env.ts` |
| Mails | `MAIL_TRANSPORT=inbox`: keine echte Mail; jede Mail (An, Betreff, Text, HTML, Code, Link, Zeit) landet in Tabelle `demo_mail` (Migration `0007_demo_inbox`) und auf **`/demo/postfach`** (neueste oben, Filter `?to=<adresse>`, großer Code mit „Code kopieren“, Link-Taste, DE/EN). Mails > 24 h werden beim Schreiben/Lesen und im Löschjob entfernt. Ohne `inbox`, in `production`, in `staging` und bei unbekanntem `APP_ENV` immer 404. Auf der Code-Seite Hinweis „Demo-Postfach öffnen“ (neuer Tab, nach Adresse gefiltert), im Demo-Banner jeder Seite ein Link. | `src/server/mail/demo-inbox.ts`, `src/server/mail/transport.ts`, `src/app/(app)/demo/postfach/page.tsx` |
| Demo-Banner | wie `APP_ENV=demo`: „Demo – bitte keine echten Daten eingeben.“ | `src/components/page-shell.tsx` |
| Demo zurücksetzen | auf `/demo/postfach` unten „Demo zurücksetzen“ (aufklappen, Häkchen, Taste): legt Anna & Co. mit allen Demo-Reisen neu an (Daten relativ zu heute); andere Konten bleiben; nur `APP_ENV=preview` | `src/features/demo/actions.ts`, `src/server/demo/seed.ts` |
| Löschjob | Vercel Cron ruft täglich (03:17 UTC, Hobby: Ausführung irgendwann in dieser Stunde) `GET /api/internal/retention` mit `Authorization: Bearer $CRON_SECRET`; der Endpunkt akzeptiert `CRON_SECRET` und `RETENTION_TOKEN` mit GET und POST, sonst 404 | `vercel.json`, `src/app/api/internal/retention/route.ts` |
| Datenbank | `pg`-Pool pro Instanz klein (Vercel: `max` 3, Leerlauf 5 s, Verbindungsaufbau bis 15 s), Neon-Pooled-Endpunkt (`…-pooler…`, `sslmode=require`); die App nutzt nur transaktionsgebundene Advisory-Locks (`pg_advisory_xact_lock`) → mit PgBouncer im Transaction-Mode verträglich. Migrationen/Seed nehmen `DATABASE_URL_UNPOOLED` (direkt), wenn vorhanden | `src/server/db/client.ts`, `drizzle.config.ts`, `scripts/seed-demo.ts` |
| Client-IP (Rate-Limits, R-005) | Vercel setzt `x-forwarded-for` am Edge selbst und **überschreibt** vom Client gesendete Werte (eigene XFF-Werte nur mit Enterprise-„Trusted Proxy“) → Standard `AUTH_IP_HEADER=x-forwarded-for`, `AUTH_TRUSTED_PROXIES` leer; nichts zu setzen. (Alternative bei einem weiteren Proxy vor Vercel: `x-vercel-forwarded-for`.) | `src/server/auth/client-ip.ts` |

**Build auf Vercel** (`vercel.json` → `buildCommand: pnpm vercel-build` → `scripts/vercel-build.ts`):

1. Schutz: baut nur das Production-Deployment von `main` (`VERCEL_ENV=production`) und nur mit `APP_ENV=preview`; Branch-/PR-Deployments sind zusätzlich in `vercel.json` (`git.deploymentEnabled`: `"**": false`, `"main": true`) abgeschaltet – sie würden sonst ungeprüfte Migrationen auf die gemeinsame Demo-Datenbank anwenden.
2. `drizzle-kit migrate` (alle Migrationen inkl. `0007_demo_inbox`).
3. `node scripts/seed-demo.ts --if-empty`: Demo-Daten **nur**, wenn noch keine `@demo.test`-Person existiert (Daten überleben weitere Deployments).
4. `next build`.

Schlägt ein Schritt fehl, bleibt das vorige Deployment online. Region der Functions: `fra1` (Frankfurt), Neon-Projekt ebenfalls in Frankfurt (`aws-eu-central-1`) und **Postgres 18** (die Tabellen nutzen `uuidv7()`; bei Neon seit 2026 Standard für neue Projekte – beim Anlegen prüfen). Node: `engines.node = 24.x`; pnpm: `packageManager` (`pnpm@12.10.1`, pnpm schaltet selbst auf diese Version um; zeigt das Build-Log eine andere pnpm-Version, `ENABLE_EXPERIMENTAL_COREPACK=1` als Umgebungsvariable setzen).

**Umgebungsvariablen in Vercel** (Project → Settings → Environment Variables, Umgebung **Production**; Werte nie ins Repo):

| Variable | Wert / Beispiel | Zweck | geheim |
|---|---|---|---|
| `APP_ENV` | `preview` | Modus (auf Vercel ohnehin Standard, trotzdem setzen) | nein |
| `PREVIEW_ACCESS_PASSWORD` | ≥ 10 Zeichen, z. B. vier zufällige Wörter `Koffer-Mango-Wolke-17` | Zugangspasswort (Basic Auth); Benutzername beliebig | **ja** |
| `BETTER_AUTH_SECRET` | ≥ 32 Zeichen Zufall (`openssl rand -base64 32` oder Passwort-Generator, 40 Zeichen) | Signatur von Sessions/Tokens, HMAC-Schlüssel der Limits | **ja** |
| `MAIL_TRANSPORT` | `inbox` | Mails ins Demo-Postfach statt Versand | nein |
| `CRON_SECRET` | ≥ 32 Zeichen Zufall | Token des täglichen Löschjobs (Vercel Cron) | **ja** |
| `DATABASE_URL` | von der Neon-Integration gesetzt: `postgresql://…@ep-…-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require…` | Datenbank (Pooled) | **ja** |
| `DATABASE_URL_UNPOOLED` | von der Neon-Integration gesetzt (ohne `-pooler`) | Migrationen + Seed beim Build | **ja** |
| `APP_URL` | optional, leer lassen; nur bei eigener Domain `https://…` | Basis-URL für Links in Mails/Einladungen | nein |
| `CONTACT_EMAIL` | optional, Platzhalter `hallo@example.org` | Kontakt auf der Hilfe-Seite | nein |
| `ENABLE_EXPERIMENTAL_COREPACK` | nur falls nötig: `1` | pnpm-Version aus `packageManager` erzwingen | nein |

Nicht setzen: `BETTER_AUTH_URL` (= `APP_URL`), `AUTH_IP_HEADER`/`AUTH_TRUSTED_PROXIES` (Standard passt), `RETENTION_TOKEN`, `SMTP_*`, `RATE_LIMIT_ENABLED` (Standard `true`). Wird eine Variable geändert, wirkt sie erst nach einem neuen Deployment (Vercel → Deployments → „Redeploy“).

**Lokal nachgestellt** (ohne Vercel): Produktions-Build mit `APP_ENV=preview` gegen die lokale DB; E2E-Projekt `preview-chromium` (`tests/e2e/preview.spec.ts`) startet einen zweiten `next start` auf Port 3100 mit `APP_ENV=preview`, `MAIL_TRANSPORT=inbox`, `https://`-Basis-URL und Basic Auth (in der CI automatisch, lokal `E2E_PREVIEW=1` nach `pnpm build`).

**Grenzen / Risiken der Vorschau**

- **Nur Demo-Daten:** Vercel ist ein US-Anbieter, es gibt kein echtes Impressum/keinen echten Datenschutz (Platzhalter) – Testpersonen nutzen ausgedachte Adressen (`…@demo.test`). Alle mit dem Zugangspasswort sehen das ganze Demo-Postfach und können sich damit als jede Adresse anmelden – gewollt für eine Demo, aber ein weiterer Grund für „keine echten Daten“.
- **Kaltstart:** Neon Free schläft nach 5 Min. ohne Zugriffe ein; der erste Aufruf danach dauert 1–3 s länger. Vercel-Functions starten ebenfalls kalt.
- **Kontingente (kostenlos):** Vercel Hobby nur für private, nicht-kommerzielle Nutzung, begrenzte Function-Aufrufe/CPU-Zeit und Bandbreite pro Monat; Cron höchstens täglich. Neon Free: begrenzter Speicher (0,5 GB) und Rechenzeit pro Monat. Für eine Freundes-Vorschau weit ausreichend; Stand der Grenzen vor dem Einrichten in den Tarif-Seiten prüfen.
- **Basic Auth:** In-App-Browser (WhatsApp, Instagram) und Link-Vorschauen fragen ebenfalls nach dem Passwort bzw. zeigen keine Vorschau; eine zum Home-Bildschirm hinzugefügte Web-App kann erneut fragen.
- **Nur die Haupt-URL benutzen:** Deployment-eigene URLs (`…-git-main-….vercel.app`) sind durch Vercels Deployment Protection gesperrt bzw. nicht als Origin vertraut (Anmelden scheitert).

### 0.8 Ausgehende Abrufe (Egress) – Link-Vorschau und Bild-Proxy (Inkrement 9, F-031, features.md R.7)

**Neu ab Inkrement 9:** Der Server ruft zum ersten Mal **fremde Webseiten** ab (Open-Graph-Daten + ein Vorschaubild je Unterkunfts-Link) und reicht Bilder über einen eigenen Endpunkt an den Browser durch (Q34). Bisher gab es nur ausgehende Verbindungen zu fest konfigurierten Zielen (Datenbank, SMTP/Mailpit, optional HIBP). Verbindliche Sicherheitsregeln: [features.md R.7 „Sicherheit“](../product/features.md) – dieser Abschnitt bewertet nur den **Betrieb** und gibt dem Developer Umsetzungshinweise.

**Bewertung je Umgebung (Stand 2026-10-23)**

| Umgebung | Ausgehende HTTPS-Verbindungen | Bewertung | Was ist nötig |
|---|---|---|---|
| **preview** – Vercel Hobby, Region `fra1`, Node-Runtime | frei möglich (keine Egress-Sperre auf Hobby), Absender-IP = dynamische AWS-Adresse in `eu-central-1`, keine feste IP | **funktioniert.** Viele Portale (Airbnb, Booking …) blocken Rechenzentrums-IPs bzw. Bots → **Platzhalterkarte ist der Normalfall**, kein Fehler (R.7 „Risiko“). Nicht umgehen (kein Browser-User-Agent, keine Proxys) | Node-Runtime erzwingen, `maxDuration` setzen (unten). Kein neues Konto, keine neue Variable |
| **demo** – Docker Compose (`scripts/demo.sh` / `demo.ps1`, `docker/compose.demo.yml`) | Standard-Bridge-Netz mit NAT → frei möglich, **solange der Laptop Internet hat**; offline → Platzhalter (gewollt, Demo-Seed nutzt eigene Bilder unter `public/` und `*.example`-Links) | **funktioniert ohne Änderung** an Compose/Caddy. Achtung: Der `app`-Container erreicht `db:5432`, `mailpit:1025/8025`, `proxy`, das Docker-Host-Gateway und das **Heim-WLAN** (`192.168.x.x`, Router-Oberfläche) – genau das verhindert der SSRF-Schutz | nichts an Docker; SSRF-Schutz zusätzlich: **Hostnamen ohne Punkt** (`db`, `mailpit`, `app`, `proxy`) vorab abweisen (Ergänzung zu R.7 Nr. 2, `localhost`/`*.local`/`*.internal` stehen dort schon; `host.docker.internal` fällt unter `*.internal`) |
| **dev** (Laptop, `pnpm dev`) | frei | funktioniert | – |
| **Claude-Code-Cloud-Sitzungen** | nur über den Agent-Proxy (`HTTPS_PROXY`); Node nutzt den nicht von selbst, direkte DNS-Auflösung schlägt teils fehl | echte Vorschauen **nicht** verfügbar → Platzhalter | Tests dürfen kein Internet brauchen (unten). **Nicht** `NODE_USE_ENV_PROXY`/`EnvHttpProxyAgent` für den Vorschau-Abruf verwenden – ein Proxy würde das DNS-Pinning aushebeln |
| **ci** (GitHub Actions) | frei | funktioniert, aber Tests gegen echte Portale wären instabil und unhöflich | Unit-/Integrationstests mit lokalem TLS-Testserver + eingespeistem Resolver; E2E nur mit Seed-Daten bzw. `*.example`-Links (lösen nicht auf → „keine Vorschau“, deterministisch) |
| **staging/prod** (Hetzner, ab G1) | frei | funktioniert. **Hetzner Cloud hat einen Metadaten-Dienst unter `169.254.169.254`** (Cloud-Init-Daten) → SSRF-Schutz ist Pflicht, zusätzlich Netzwerksperre (unten) | Egress-Härtung auf dem Host (Go-Live-Gate Stufe 2b) |

**Kosten:** 0 €. Vercel Hobby (Stand Juli 2026, vor Einrichtung prüfen): Function-Laufzeit Standard = Maximum **300 s**, 2 GB RAM, **1 Mio. Aufrufe**, **4 h Active CPU**, **100 GB Fast Data Transfer**, **10 GB Fast Origin Transfer** pro Monat. Ein Vorschau-Abruf wartet überwiegend auf das Netz (zählt kaum als Active CPU). Bild-Proxy grob: 30 Vorschläge × ~300 KB × 10 Personen ≈ 90 MB pro Reise beim ersten Laden, danach Browser-Cache → für die Freundes-Vorschau weit unter den Grenzen.

**Wichtige Vercel-Grenze – Antwortgröße 4,5 MB:** Gepufferte Function-Antworten über **4,5 MB** scheitern auf Vercel (`FUNCTION_RESPONSE_PAYLOAD_TOO_LARGE`); nur gestreamte Antworten sind ausgenommen. R.7 erlaubt Bilder bis **5 MB**. **Empfehlung Operations:** Bild-Limit einheitlich auf **4 MB** senken (Vorschaubilder `og:image` sind fast immer < 1 MB; einfacher als Streaming mit Abbruch mitten in der Antwort). Alternative: Bild nach Magic-Byte-Prüfung streamen und bei Überschreitung abbrechen (kaputtes Bild → Platzhalter). → Entscheidung CEO/PM, R.7 ggf. anpassen.

**Route-Konfiguration (Developer)** – für den Vorschau-Endpunkt und den Bild-Proxy (Pfade nach Wahl des Developers):

```ts
export const runtime = "nodejs";      // nie Edge: dns, net/tls, undici, node:zlib nötig (R.7 „Node-Runtime“)
export const dynamic = "force-dynamic";
export const maxDuration = 15;        // Sekunden: 5 s Abruf-Budget + DB + Kaltstart; begrenzt Ausreißer
```

- `runtime = "nodejs"` ist in Next.js 16 ohnehin Standard für Route Handler und `src/proxy.ts`; explizit setzen, damit ein späteres Umstellen auf Edge auffällt. Modul mit `import "server-only"`.
- **Server Action „Vorschlag speichern“ mit Hintergrund-Abruf über `after()`** (R.7 I9-02, wie R-067 `src/server/background.ts`): `after()` läuft innerhalb der `maxDuration` der **Seite**, die die Action enthält → auf `/trips/[id]/stays/new` ebenfalls `export const maxDuration = 20` setzen.
- In Docker/Hetzner hat `maxDuration` keine Wirkung; dort begrenzt allein das 5-s-Gesamt-Zeitlimit des Abrufs (`AbortSignal.timeout(5000)` über alle Weiterleitungen).
- `src/proxy.ts` (Basic Auth in `preview`) schützt auch die neuen Endpunkte – der Matcher nimmt sie bereits mit, Bild-Anfragen sind same-origin und tragen die Basic-Auth-Zugangsdaten automatisch. Nicht in `isOpenPath` aufnehmen.
- **Kein `next/image` für Vorschaubilder** und **`images.remotePatterns` bleibt leer:** Der Next-/Vercel-Bildoptimierer würde fremde Bilder selbst abrufen (ohne unseren SSRF-Schutz) und auf dem CDN speichern – Widerspruch zu Q34. Vorschaubilder als `<img src="/…eigener Endpunkt…" alt="">`; die eigenen Demo-Bilder unter `public/` direkt (`<img>` oder `next/image` mit `unoptimized`, damit kein Optimierungskontingent verbraucht wird).
- Bild-Proxy-Antwort mit `Cache-Control: private, max-age=86400` (R.7) – Vercels CDN cacht `private` nicht (gewollt, Q34). Zusätzlich empfohlen: `Cross-Origin-Resource-Policy: same-origin`.
- **Kein neues Secret:** Den Schlüssel des Vorschau-Tokens (R.7 I9-03; seit R-076 AES-256-GCM-verschlüsselt statt nur HMAC-signiert, damit Link/Bild-URL nicht in Zugriffs-Logs stehen) per HKDF aus `BETTER_AUTH_SECRET` ableiten (eigener `info`-String, wie die Rate-Limit-Schlüssel, tech-stack.md §3.2) → der Auftraggeber muss in Vercel nichts nachtragen. Folge: Rotation von `BETTER_AUTH_SECRET` macht offene Vorschau-Tokens ungültig (≤ 30 min, unkritisch).

**Hinweise zum DNS-Pinning in Node (Developer, Reviewer prüft mit Tests)**

1. **HTTP-Client:** das npm-Paket **`undici`** (MIT, Version pinnen) mit `request()` und **eigenem `Agent`** – nicht das globale `fetch`: Next.js patcht `fetch` (Cache-Semantik), und ein `dispatcher` aus dem npm-`undici` an Nodes eingebautes `fetch` zu übergeben ist versionsabhängig fragil. `request()` folgt keinen Weiterleitungen (gewollt, R.7 Nr. 3 manuell) und speichert keine Cookies.
2. **Pinning über `connect.lookup`:** `new Agent({ connect: { lookup: safeLookup, timeout: 3000 }, headersTimeout: 5000, bodyTimeout: 5000, keepAliveTimeout: 1000 })`. Node ruft `lookup(hostname, options, callback)` beim Verbindungsaufbau auf und verbindet sich **genau mit den zurückgegebenen Adressen** – so geht die Verbindung an die geprüfte IP, ohne zweite Auflösung (Schutz gegen DNS-Rebinding). TLS-Zertifikatsprüfung und SNI laufen weiter gegen den **Hostnamen** (undici setzt `servername` aus der URL); nie `rejectUnauthorized: false`.
3. **`safeLookup`:** `dns.promises.lookup(hostname, { all: true, order: "ipv4first" })` → **jede** Adresse prüfen; ist **eine** gesperrt, gesamten Abruf abbrechen (nicht herausfiltern). Rückgabe an Node: bei `options.all` das ganze geprüfte Array, sonst `(null, address, family)` der ersten. Node ≥ 20 verbindet mit `autoSelectFamily` (Happy Eyeballs) und ruft dabei `lookup` mit `all: true` auf – deshalb beide Formen unterstützen. `ipv4first`, weil Docker-Standardnetze und Vercel-Functions in der Regel **kein IPv6-Egress** haben.
4. **Adressprüfung:** Nodes eingebautes `net.BlockList` (`addSubnet` für alle Bereiche aus R.7 Nr. 2, IPv4 + IPv6) oder `ipaddr.js` (MIT). **IPv4-gemappte/-eingebettete IPv6-Adressen** (`::ffff:a.b.c.d`, `64:ff9b::/96`, `2002::/16` 6to4) vorher **selbst** in IPv4 umrechnen und gegen die IPv4-Liste prüfen – nicht auf implizites Verhalten der Bibliothek verlassen. Zusätzlich sperren: `fd00:ec2::254` (AWS-IPv6-Metadaten, liegt in `fc00::/7`). IP-Literale in der URL (auch `[::1]`, `0x7f.1`, `2130706433` – der WHATWG-URL-Parser normalisiert diese zu IPv4) vorab abweisen.
5. **Vor dem Abruf:** Schema `https:`, Port leer oder `443`, keine Zugangsdaten, Hostname enthält einen Punkt und endet nicht auf `.local`/`.internal`/`.localhost`, Länge ≤ 2 048. Dieselbe Prüfung für **jede** Weiterleitungs-URL (`Location` relativ zur aktuellen URL auflösen, max. 3) und für die `og:image`-URL.
6. **Grenzen beim Streamen:** Body mit `for await` lesen und Bytes zählen, bei Überschreitung `signal`/Body abbrechen. `accept-encoding: identity` senden; kommt trotzdem `content-encoding: gzip|br|deflate`, über `node:zlib` dekomprimieren und die **dekomprimierten** Bytes zählen (Kompressionsbombe), unbekannte Kodierung → „keine Vorschau“.
7. **Ausgehende Header nur:** `user-agent: WirWollenWeg-LinkPreview/1.0`, `accept`, `accept-language` (Reisesprache), `accept-encoding`. Nichts aus der Nutzeranfrage durchreichen.
8. **HTML-Parser:** z. B. `htmlparser2` (MIT, streamend, führt nichts aus); nur `<title>` und `<meta>` im `<head>` auswerten, nach `</head>` abbrechen; Entities dekodieren (`entities`, kommt mit htmlparser2). Lizenz in der Lizenzseite (F-051) nachtragen.
9. **Testbarkeit ohne Internet und ohne Hintertür:** Abruf-Funktion als Fabrik, z. B. `createSafeFetcher({ lookup, ca })` – Produktion nutzt die Standardwerte; Tests spielen einen **Fake-Resolver** ein (liefert private/gemappte Adressen → muss blocken; liefert erst öffentlich, dann privat → Verbindung geht an die erste, geprüfte Adresse) und für den Gut-Fall einen lokalen HTTPS-Testserver mit eigenem Test-CA. **Keine Umgebungsvariable, die den SSRF-Schutz lockert** (auch nicht für E2E) – Reviewer prüft, dass die Produktions-Verdrahtung keine Test-Parameter übergibt.
10. **Logs:** höchstens Hostname + Kategorie (`ok`/`blocked`/`timeout`/`unsafe`/`too_large`/`no_meta`), nie Pfad, Query, Titel oder Bild-URL (R.7 I9-10). Vercel-Function-Logs sind für den Auftraggeber sichtbar – dort gilt dieselbe Regel.

**Ab Go-Live (Hetzner, Stufe 2b): Egress-Härtung als zweite Verteidigungslinie** – zusätzlich zum SSRF-Schutz im Code auf dem Host Regeln in der `DOCKER-USER`-Kette: dem App-Container ausgehend nur `tcp/443` ins Internet erlauben (plus DB/Mail-Relay im internen Compose-Netz und DNS); `169.254.0.0/16`, `10.0.0.0/8`, `172.16.0.0/12` (außer dem eigenen Compose-Netz), `192.168.0.0/16`, `100.64.0.0/10` sperren. Runbook mit OPS-1.

### 0.9 Content-Security-Policy (CSP) – Ist-Stand und Vorschlag (Umsetzung: Developer)

**Ist-Stand (2026-10-23):** **keine CSP.** `next.config.ts` setzt `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY`, `X-Robots-Tag`; tech-stack.md §8 kündigt „CSP mit Nonces“ an. Bestandsaufnahme für eine CSP:

| Quelle | Befund | Folge für die CSP |
|---|---|---|
| Next.js-Framework-Skripte | Inline-Skripte für den RSC-Payload (`self.__next_f.push(…)`), je Seite verschieden | `script-src` ohne `'unsafe-inline'` geht **nur mit Nonce** (dynamisches Rendern) |
| eigenes Inline-Skript | `src/components/document-head.tsx` – `MOTION_BOOTSTRAP_SCRIPT` (setzt `data-motion` vor dem ersten Paint), Inhalt statisch | per Nonce **oder** SHA-256-Hash erlaubbar |
| Inline-Styles | `style={{…}}` in ~10 Komponenten (Ring, Skeleton, Code-Feld, Illustrationen …) – im SSR-HTML als `style`-Attribut | `style-src 'self' 'unsafe-inline'` (geringes Risiko; ohne `'unsafe-inline'` bräche das Layout) |
| Schriften, Icons, Bilder | alles selbst gehostet (`/fonts`, `/favicon.*`, `public/`), keine externen URLs gefunden | `font-src 'self'`, `img-src 'self' data: blob:` sofort möglich |
| Formulare | Server Actions und Better Auth posten an die eigene Origin | `form-action 'self'` |
| Vercel-Toolbar (`vercel.live`) | wird nur in Vercel-**Preview**-Deployments eingeblendet; unsere Vorschau ist das **Production**-Deployment von `main`, Branch-Deployments sind abgeschaltet (`vercel.json`) | keine Ausnahme nötig. Falls je Branch-Deployments eingeschaltet werden: Toolbar in den Projekteinstellungen abschalten, **nicht** die CSP aufweichen |
| Demo im WLAN über `http://192.168…` | kein TLS | **kein** `upgrade-insecure-requests` (würde den Handy-Test brechen); HSTS kommt ab Go-Live über Caddy |

**Stufe 1 – jetzt mit Inkrement 9 (Pflicht, klein, ohne Risiko für Next.js):** eine **globale** CSP **ohne** `script-src`/`default-src` – damit bleibt das Laden der Next-Skripte unberührt, aber Drittbilder, Plugins, fremde Formziele und Einbetten werden blockiert. In `next.config.ts` → `headers()` in die Liste `base` aufnehmen (gilt für alle Umgebungen inkl. dev, weil kein Skript-/Verbindungs-Teil enthalten ist):

```ts
{
  key: "Content-Security-Policy",
  value: [
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
},
```

- **Global statt nur `/trips/*/stays*`:** erfüllt I9-04 (Should) vollständig und vermeidet eine Falle: Setzen mehrere `headers()`-Einträge denselben Schlüssel, **überschreibt der spätere den früheren** – eine routenspezifische CSP müsste die globale komplett wiederholen.
- **Bild-Proxy-Antwort:** Der Route Handler setzt selbst `Content-Security-Policy: default-src 'none'; sandbox` (R.7 I9-04). Damit die globale Regel diese nicht überschreibt, den Proxy-Pfad aus der globalen Quelle ausnehmen (z. B. `source: "/((?!api/stays/image).*)"` – Pfad nach Wahl des Developers) **oder** per Test absichern. Test (Pflicht): Antwort des Bild-Proxys enthält `default-src 'none'` und `sandbox`; eine Unterkunftsseite enthält `img-src 'self' data: blob:`.
- **Abnahme:** E2E-Fixture, die Konsolenmeldungen mit „Content Security Policy“ als Fehler wertet (alle bestehenden Specs laufen grün), plus ein Test, der ein `<img src="https://…">` auf einer Unterkunftsseite einschleust bzw. prüft, dass keine Anfrage an fremde Hosts geht (`page.on("request")`).
- Aufwand: ca. 1–2 h inkl. Tests.

**Stufe 2 – vor Go-Live G1 (Pflichtpunkt in [go-live.md](go-live.md) Stufe 2b): strikte CSP mit Nonce** über `src/proxy.ts` (läuft dann in **allen** Umgebungen; Basic Auth bleibt auf `preview` beschränkt):

```
default-src 'self';
script-src 'self' 'nonce-{NONCE}' 'strict-dynamic';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
connect-src 'self';
worker-src 'self' blob:;
manifest-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none'
```

- Nonce je Anfrage (`Buffer.from(crypto.randomUUID()).toString("base64")`), im Proxy als **Request-Header** `Content-Security-Policy` (Next.js liest den Nonce daraus und versieht seine Framework-Skripte automatisch damit) und `x-nonce` setzen sowie als Response-Header ausliefern.
- `DocumentHead`: Nonce per `(await headers()).get("x-nonce")` an das Inline-Skript geben – oder dessen SHA-256-Hash in `script-src` aufnehmen (Hash per Unit-Test aus `MOTION_BOOTSTRAP_SCRIPT` berechnen, damit er nicht veraltet).
- Nur in `NODE_ENV=development` ergänzen: `'unsafe-eval'` in `script-src` und `ws:` in `connect-src` (React-Dev-Tools/HMR).
- Matcher: statische Assets ausnehmen (wie heute) und Prefetch-Anfragen (`next-router-prefetch`, `purpose: prefetch`) überspringen, wie in der Next.js-Doku zu CSP empfohlen.
- **Folge:** Nonces erzwingen **dynamisches Rendern** aller HTML-Seiten – die statisch vorgerenderten Startseiten `/de`, `/en` werden pro Anfrage gerendert. Auf Hetzner egal; auf Vercel etwas mehr Function-Aufrufe (bei unserer Größe unerheblich).
- **Einführung in zwei Schritten:** ein Inkrement lang als `Content-Security-Policy-Report-Only` (kein externer Report-Endpunkt – Datenschutz; Prüfung über die E2E-Konsolen-Fixture), danach scharf schalten. Alternative ohne Nonce (`script-src 'self' 'unsafe-inline'`) bringt kaum Schutz gegen XSS – nicht empfohlen.
- Aufwand: ca. 0,5–1 Tag inkl. Tests; Zeitpunkt: mit Inkrement 10 oder spätestens im Go-Live-Paket.

Nachzutragen bei Umsetzung: tech-stack.md §8 (Security-Header) – Operations.

### 0.10 Löschjob `/api/internal/retention` – Umfang und Anforderungen (Stand Inkrement 10)

Ein Endpunkt, ein täglicher Lauf in **allen** Umgebungen: Vorschau per Vercel Cron (§0.7, `CRON_SECRET`), ab Go-Live per Timer mit `RETENTION_TOKEN` (§4, §5.2 Dienst `jobs`). Löschregeln fachlich: [compliance-checklist.md §6](compliance-checklist.md). Einstieg im Code: `runRetention()` in `src/server/retention.ts`.

| Durchlauf | Regel | Seit | Status |
|---|---|---|---|
| Reisen | Hinweis-Mail an die Orga 14 Tage vorher, Löschung 90 Tage nach Reiseende bzw. 12 Monate nach letzter Aktivität (F-013, Q24) | Inkrement 6 | umgesetzt |
| Konten | Hinweis 30 Tage vorher, Löschung nach 24 Monaten ohne Login (F-043) | Inkrement 6 | umgesetzt |
| Demo-Postfach | Mails > 24 h (nur bei `MAIL_TRANSPORT=inbox`) | Vorschau (PR #18) | umgesetzt |
| **Weich gelöschte Ausgaben** | `trip_expense` mit `deleted_at` älter als **24 h** endgültig löschen, inkl. Anteile (`trip_expense_share` per Kaskade); gilt auch für abgeschlossene Abrechnungen (features.md R.8 I10-03, I10-10) | **Inkrement 10** | **Anforderung an Developer** |
| Lösch-Hinweismail mit offenen Salden | Zusatzsatz «Achtung: In der Abrechnung sind noch {n} Ausgleiche offen.» – **ohne** Namen, Titel, Beträge (I10-10) | Inkrement 10 | Anforderung an Developer |

Anforderungen an die Erweiterung (Developer, Inkrement 10):

1. **Ein** gezieltes `DELETE … WHERE deleted_at < now - 24 h` (Index auf `deleted_at` bzw. Teilindex `WHERE deleted_at IS NOT NULL`) – keine Schleife über alle Reisen; so bleibt der Lauf auch auf Vercel Hobby (Function-Laufzeit) und Neon Free kurz.
2. **Uhrzeit aus dem Parameter** `now` von `runRetention(now)` verwenden (testbar, wie die bestehenden Durchläufe); Unit-/Integrationstest mit simulierter Zeit: 23 h alt → bleibt, 25 h alt → weg, nicht gelöschte Ausgaben unberührt, Salden danach unverändert (gelöschte zählten schon vorher nicht).
3. **Nebenläufigkeit:** Ein gleichzeitiges „Rückgängig“ darf nicht verloren gehen – Bedingung `deleted_at IS NOT NULL AND deleted_at < …` im selben Statement (Rückgängig setzt `deleted_at` auf null, dann greift die Löschung nicht mehr). Rückgängig ist laut UX ohnehin nur 6 s möglich.
4. **Platzhalter-Löschsperre** zählt weich gelöschte Ausgaben mit (R.8) – nach der endgültigen Löschung ist der Platzhalter wieder löschbar; kein zusätzlicher Schritt nötig.
5. **Bericht:** neues Feld z. B. `expensesPurged` in `RetentionReport`; Log nur Anzahlen (bestehende Regel: keine Namen, Titel, Beträge, IDs).
6. **Idempotent:** zweiter Lauf am selben Tag löscht nichts mehr, Fehler in einem Durchlauf brechen die anderen nicht ab.

**Hinweis Taktung:** Der Job läuft einmal täglich. „Nach 24 h“ heißt damit in der Praxis **24–48 h** nach dem Löschen (auf Vercel Hobby zusätzlich bis zu 1 h Versatz). Für die Datenschutzerklärung genügt die Angabe „spätestens nach 2 Tagen endgültig gelöscht“ (compliance-checklist.md §2b); ein häufigerer Lauf ist nicht nötig. Aus **Backups** verschwinden die Daten wie alles andere spätestens nach 30 Tagen (§6.1).

### 0.11 Persönliche Reisedaten – Schlüssel-Konzept und Feature-Schalter (Inkrement 11, F-054, features.md R.9)

Gilt für die Feldverschlüsselung der Freigaben (`travel_data_release.ciphertext`) – AES-256-GCM über Node `crypto`, AAD = Reise-ID + Anfrage-ID + Personen-ID + Schema-Version (R.9 „Verschlüsselung & Schlüssel“ Nr. 1). Dieser Abschnitt regelt **Variable, Format, Erzeugung, Ablage, Rotation, Startschutz und Runbooks**. Für Demo und Vorschau ist er ein **Entwurf, der reicht** – verbindlich wird er mit der G1b-Abnahme ([go-live.md](go-live.md) Stufe G1b, [compliance-checklist.md §12](compliance-checklist.md)).

#### 0.11.1 Feature-Schalter `TRAVEL_DATA_ENABLED`

| `APP_ENV` | Standard (Variable leer) | Darf auf `true`? | Schlüssel-Ursprung |
|---|---|---|---|
| `development`, `ci` | **an** | ja | `TRAVEL_DATA_KEYS`, sonst HKDF-Ableitung aus `BETTER_AUTH_SECRET` |
| `demo` (Docker-Demo) | **an** | ja | wie oben – `.env.demo` braucht **keinen** neuen Eintrag |
| `preview` (Vercel) | **an** | ja | wie oben – **keine neue Variable in Vercel** (Auftraggeber muss nichts nachtragen) |
| `beta` (Freundes-Beta, Vercel, §0.12) | **aus** | **nein** – `true` → Start verweigert (G1b setzt EU-Hosting voraus) | keiner (Ableitung verboten) |
| `staging` | **aus** | ja, nur mit eigenem `TRAVEL_DATA_KEYS` (synthetische Daten, Test vor G1b) | **nur** `TRAVEL_DATA_KEYS`, Ableitung verboten |
| `production` | **aus** | **erst nach dokumentierter G1b-Abnahme** (Freigabe-Tabelle in go-live.md) | **nur** `TRAVEL_DATA_KEYS`, Ableitung verboten |

- Erlaubte Werte: `true` / `false` / leer (= Standard der Umgebung). Jeder andere Wert → **Start verweigert** (kein stilles „aus“ bei Tippfehlern wie `ture`).
- **Aus** heißt: keine Station V4/D3, keine Kachel, Routen `/trips/{id}/travel-data*` antworten 404, Server-Aktionen werden abgelehnt. Die Markierung „Bucht“ und ihre übrigen Rechte (Infoseite, «gebucht ✓») funktionieren weiter (R.9 I11-12).
- **Bestehende Freigaben bei „aus“:** werden nicht angezeigt, aber vom Löschjob weiter nach Frist gelöscht (der Löschjob braucht keinen Schlüssel – er löscht Zeilen, entschlüsselt nicht).
- Das Einschalten in `production` ist eine **organisatorische** Freigabe (G1b); technisch verhindert der Startschutz nur „an ohne eigenen Schlüssel“.

#### 0.11.2 Variable `TRAVEL_DATA_KEYS` – Format

```
TRAVEL_DATA_KEYS=<kid>:<base64-32-Byte>[,<kid>:<base64-32-Byte>…]
# Beispiel (Platzhalter, KEINE echten Werte):
TRAVEL_DATA_KEYS=t202701:AAAA…(44 Zeichen)…=,t202606:BBBB…=
```

| Regel | Vorgabe (Developer prüft beim Start, Fehler → Start verweigert) |
|---|---|
| Trennzeichen | Einträge mit `,`, Kennung und Schlüssel mit dem **ersten** `:`; Leerzeichen am Rand werden entfernt |
| Kennung (`kid`) | `^[a-z0-9-]{1,16}$`, eindeutig in der Liste; Empfehlung `t` + Jahr + Monat der Erzeugung (z. B. `t202701`). Die Kennung `demo` ist **reserviert** für den abgeleiteten Schlüssel und in `TRAVEL_DATA_KEYS` verboten |
| Schlüssel | Standard-Base64, dekodiert **genau 32 Byte**; doppelte Schlüssel unter verschiedenen Kennungen → Fehler |
| Reihenfolge | **erster Eintrag = aktiver Schlüssel** (verschlüsselt alles Neue und jede Änderung); weitere Einträge nur zum Entschlüsseln (Rotation) |
| Länge | 1–3 Einträge (mehr deutet auf vergessenes Aufräumen hin → Warnung im Start-Log, nur Anzahl) |
| Speicherung je Zeile | Spalte `key_id` = Kennung; Zeile mit unbekannter Kennung → generischer Fehler im UI, Zähler `travel_data.decrypt_unknown_key` im Log (ohne IDs) |
| Nie | im Repository, in `.env.example` (dort nur leerer Eintrag mit Kommentar), im Client-Bundle (`server-only`), in Logs/Fehlermeldungen/Bugsink, in GitHub-Actions-Secrets (CI braucht keinen echten Schlüssel) |

**Abgeleiteter Schlüssel (nur `development`, `ci`, `demo`, `preview`; CEO bestätigt 2026-10-23):** Fehlt `TRAVEL_DATA_KEYS`, wird ein Schlüssel per `hkdfSync("sha256", BETTER_AUTH_SECRET, "", "travel-data-demo-v1", 32)` abgeleitet, Kennung `demo` (eigenes Info-Label – Domänentrennung wie bei den Limits pro E-Mail und dem Vorschau-Token, tech-stack.md §3.2, §0.8). Fehlt auch `BETTER_AUTH_SECRET`, ist der Bereich **aus** (fail closed). Folge: Wird `BETTER_AUTH_SECRET` in der Vorschau geändert, sind bestehende Demo-Freigaben unlesbar → **„Demo zurücksetzen“** (vorschau-anleitung.md §7). In `staging`/`production` ist die Ableitung verboten.

#### 0.11.3 Startschutz (Erweiterung von `src/lib/app-env.ts`, wie §0.6)

| Fall | Ergebnis |
|---|---|
| `TRAVEL_DATA_ENABLED` ungültiger Wert (alle Umgebungen) | Start verweigert |
| `TRAVEL_DATA_KEYS` gesetzt, aber fehlerhaft (Format, Länge, doppelte/reservierte Kennung) – alle Umgebungen | Start verweigert (kein stiller Rückfall auf die Ableitung) |
| `staging`/`production` **und** Bereich an **und** `TRAVEL_DATA_KEYS` fehlt | **Start verweigert** – Meldung nennt nur den Variablennamen, nie Werte |
| `staging`/`production` und Bereich aus, `TRAVEL_DATA_KEYS` fehlt | Start ok (Bereich aus) |
| `development`/`ci`/`demo`/`preview`, `TRAVEL_DATA_KEYS` fehlt, `BETTER_AUTH_SECRET` vorhanden | Start ok, Ableitung (Kennung `demo`) |
| `development`/`ci`/`demo`/`preview`, beides fehlt | Start ok, Bereich aus (fail closed) – in `demo`/`preview` bricht der Start ohnehin schon wegen `BETTER_AUTH_SECRET` ab (R-028) |
| Schlüssel identisch mit `BETTER_AUTH_SECRET` bzw. dessen Base64 (Fehlkonfiguration) | Start verweigert in `staging`/`production` |

Tests (Reviewer): je Zeile ein Unit-Test analog `app-env.test.ts`.

#### 0.11.4 Erzeugung

Je Umgebung ein **eigener** Schlüssel (staging ≠ production), nie wiederverwenden, nie aus anderen Secrets ableiten.

```bash
# Linux/macOS (auf dem Server oder offline)
printf 't%s:%s\n' "$(date +%Y%m)" "$(openssl rand -base64 32)"
```
```powershell
# Windows PowerShell
$b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Fill($b); "t$(Get-Date -Format yyyyMM):$([Convert]::ToBase64String($b))"
```

Die Ausgabe direkt in die Secret-Datei schreiben (unten), nicht in Chat, Ticket, Mail oder Shell-History (`HISTCONTROL=ignorespace`, Befehl mit führendem Leerzeichen).

#### 0.11.5 Ablage (ab staging/production)

Ziel: **Wer nur die Datenbank oder ein Backup hat, kann nichts lesen.** Deshalb Schlüssel getrennt von DB-Zugang und Backups:

| Was | Wo | Wer |
|---|---|---|
| Laufender Schlüsselring | eigene Datei `/opt/wir-wollen-weg/<env>/secrets/travel-data.env` (Eigentümer root, Rechte `600`), **nur** per `env_file` an den Dienst `app` (und einmalig an `tools` für `travel-data:rotate`) – **nicht** an `db`, `backup`, `jobs`, `bugsink`. Nicht in der allgemeinen `.env` mit `DATABASE_URL` | Operations |
| Sicherungskopie | Passwort-Manager des Betreibers (Eintrag „TRAVEL_DATA_KEYS <env>“, 2FA), **nicht** im Off-site-Backup-Bucket. Hinweis: Das Hetzner-VM-Image-Backup (§6.1, 7 Tage) enthält die Secret-Datei zwangsläufig mit – Zugriff nur über die Console mit 2FA; akzeptiertes Restrisiko, im TOM dokumentieren | Betreiber (Auftraggeber) |
| Nicht | Repository, GitHub Secrets, CI-Logs, Bugsink, Vercel (die Vorschau braucht keinen), `age`-Backup-Dumps | – |

Der Löschjob und die Backups brauchen den Schlüssel **nicht**. Backups enthalten nur Chiffrat (max. 30 Tage, §6.1).

#### 0.11.6 Rotation – `pnpm travel-data:rotate`

Anlass: **planmäßig jährlich**, außerdem sofort bei Personalwechsel mit Server-Zugang, Verdacht oder Leck (Runbook B). Da Freigaben ohnehin höchstens bis Reiseende + 7 Tage leben, ist der Bestand klein; die Rotation dauert Sekunden.

1. Neuen Schlüssel erzeugen (§0.11.4) und **vorne** einfügen: `TRAVEL_DATA_KEYS=t202701:NEU,t202606:ALT`.
2. App neu starten (`docker compose up -d app`) → neue und geänderte Freigaben nutzen `t202701`.
3. Bestand umschlüsseln: `docker compose run --rm --env-file secrets/travel-data.env tools pnpm travel-data:rotate`.
4. Prüfen: Skript meldet `remaining_old_keys=0` (Ausgabe nur Anzahlen je Kennung).
5. Alten Schlüssel aus der Liste **entfernen**, App neu starten.
6. Alten Schlüssel im Passwort-Manager als „zurückgezogen <Datum>“ markieren und **nach 30 Tagen löschen** (Backup-Fenster §6.1: so bleibt ein Restore der letzten 30 Tage lesbar; danach ist altes Chiffrat in Backups unlesbar = gewollt). **Ausnahme Leck:** sofort vernichten.

Anforderungen an das Skript (Developer, Inkrement 11):
- liest alle Zeilen mit `key_id ≠ aktiver Schlüssel`, entschlüsselt mit dem alten, verschlüsselt mit dem aktiven Schlüssel **neu** (neue 96-Bit-Nonce, gleiche AAD, gleiche `schema_version`), schreibt `ciphertext`, `nonce`, `key_id`; Werte nie ins Log;
- **batchweise** (z. B. 200 Zeilen je Transaktion, `FOR UPDATE SKIP LOCKED`), **idempotent** (zweiter Lauf ändert nichts), nebenläufig sicher (Freigaben, die währenddessen geändert/gelöscht werden, werden übersprungen bzw. sind schon neu);
- Option `--dry-run` (nur zählen); Exit-Code ≠ 0, wenn Zeilen mit unbekannter Kennung oder Entschlüsselungsfehler existieren (Zähler, keine IDs);
- verweigert die Ausführung, wenn der aktive Schlüssel die Kennung `demo` hat und `APP_ENV` `staging`/`production` ist;
- Test: Bestand mit zwei Kennungen → nach Lauf nur noch eine, alle Werte unverändert lesbar; vertauschte AAD bleibt unlesbar.

#### 0.11.7 Runbook A – Schlüsselverlust (Daten unlesbar)

Auslöser: Schlüssel weg (Secret-Datei gelöscht, keine Sicherungskopie) oder Entschlüsselung schlägt für alle Zeilen einer Kennung fehl.
1. Bereich sofort aus: `TRAVEL_DATA_ENABLED=false`, App neu starten (verhindert Fehlermeldungen in Serie).
2. Prüfen, ob die Kennung im Passwort-Manager liegt → wenn ja, wiederherstellen, fertig.
3. Sonst: neuen Schlüssel erzeugen und als einzigen Eintrag setzen.
4. **Alle Freigaben mit der verlorenen Kennung löschen** (Skript-Option `pnpm travel-data:rotate --purge-unreadable`, Developer liefert): Zeilen + Zugriffsprotokoll hart löschen, Antworten → *offen*, damit Gefragte neu freigeben können. Anfragen bleiben bestehen.
5. Hinweis an Betroffene: im UI Hinweis „Deine Angaben mussten aus technischen Gründen gelöscht werden – bitte gib sie bei Bedarf neu frei“ (Wortlaut UX), an „Bucht“-Personen „Freigaben wurden zurückgesetzt“. Keine Mail mit Inhalten.
6. Bewertung Datenpanne: Verlust der Verfügbarkeit ohne Offenlegung → nach Art. 33 DSGVO voraussichtlich **nicht meldepflichtig** (kein Risiko für die Betroffenen, die Daten können neu eingegeben werden); dennoch intern dokumentieren (Art. 33 Abs. 5).
7. Bereich wieder einschalten, Ursache beheben (z. B. Sicherungskopie anlegen).

#### 0.11.8 Runbook B – Schlüsselleck (Schlüssel möglicherweise bekannt)

Auslöser: Secret-Datei/Passwort-Manager kompromittiert, Schlüssel in Log/Chat/Repo gelandet, Server-Einbruch.
1. **Sofort rotieren** (§0.11.6 Schritte 1–5), alten Schlüssel **sofort** vernichten (keine 30 Tage).
2. Prüfen, ob **zusätzlich** DB oder Backups abgeflossen sind – nur dann sind Inhalte tatsächlich offengelegt (Schlüssel allein reicht nicht). Zeitraum eingrenzen, betroffene Freigaben bestimmen (Anzahl, Reisen, Felder; Dokumentnummern ja/nein).
3. Bei Leck von Schlüssel **und** Chiffrat: betroffene Freigaben vorsorglich **löschen** (wie Runbook A Schritt 4) und Betroffene informieren; Meldepflicht **Art. 33 DSGVO binnen 72 h** prüfen (Ausweisnummern → Risiko Identitätsmissbrauch, Meldung wahrscheinlich nötig), Benachrichtigung Betroffener nach Art. 34 prüfen. Datenpannen-Prozess compliance-checklist.md §7.
4. Wenn Schlüssel über das Repository geleakt ist: Commit entfernen reicht nicht – rotieren ist die Maßnahme; zusätzlich GitHub-Secret-Scanning-Meldung prüfen.
5. Ursache beheben, Nachbereitung im Status-Board (ohne Details mit Personenbezug).

#### 0.11.9 Logs und Betrieb

- Betriebs-Logs nur **anonyme Zähler** (z. B. `travel_data.release ok`, `travel_data.reveal ok`, `travel_data.reveal denied`, `travel_data.decrypt_failed`, `travel_data.retention purged=n`) – **keine** IDs von Personen, Reisen, Anfragen, Feldern, keine Kennungen von Schlüsseln mit Bezug zu Zeilen, keine Werte (R.9 I11-10, compliance-checklist.md §12).
- Server-Aktionen des Bereichs loggen keine Argumente; Bugsink: Formularwerte und Request-Bodies des Bereichs nie als Breadcrumb/Extra.
- `Cache-Control: no-store` auf allen Antworten des Bereichs; kein CDN-/Server-Cache.
- **Vorschau (Vercel):** nur Fantasiedaten, Dokumentnummern technisch mit Präfix `DEMO` (R.9 I11-12); Vercel-Funktionslogs enthalten dieselben anonymen Zähler.

### 0.12 Geschlossene Freundes-Beta „Stufe B“ – `APP_ENV=beta` + PWA (Gate G0, 2026-10-23)

**Entscheidung CEO + Auftraggeber (2026-10-23):** Vor dem Go-Live G1 (Hetzner) läuft eine **geschlossene Freundes-Beta mit echten Daten** auf der bestehenden Infrastruktur **Vercel Hobby + Neon Free**, als **eigenes** Vercel-Projekt mit **eigener** Neon-Datenbank und eigener Domain (`app.<domain>`). Echte Login-Mails über einen EU-Mail-Dienst, kein Demo-Postfach, kein „Demo zurücksetzen“, kein Demo-Seed, persönliche Reisedaten (F-054) **aus**, Löschjob aktiv. Statt Basic Auth (funktioniert in iOS-Home-Bildschirm-Apps schlecht) ein **Beta-Code bei der Registrierung**. Die App soll auf dem iPhone als **installierte Web-App (PWA)** laufen; Login dort per **6-stelligem Code** (Magic Link öffnet Safari statt der PWA). Kurzer Datenschutzhinweis mit dem Auftraggeber als Verantwortlichem + Zustimmung der Tester. **Inkrement 12 (Unterlagen) kommt nach der Beta.**

Klick-Anleitung für den Auftraggeber: [beta-anleitung.md](beta-anleitung.md) · Recht/Datenschutz: [compliance-checklist.md §13](compliance-checklist.md) · Gate: [go-live.md – Gate G0](go-live.md). Umsetzung: Developer (Status-Board **P1-B0**), Abnahme Reviewer.

#### 0.12.1 Empfehlung Mail-Dienst und Domain-Registrar (Recherche 2026-10-23)

> Abruf über Websuche (2026-10-23, Lettermint- und INWX-Angaben am Abend erneut bestätigt); die Anbieterseiten selbst waren aus der Arbeitsumgebung nicht direkt abrufbar – **Preise/Tarife vor Abschluss live prüfen**. Quellen am Ende dieses Dokuments. Lettermint-Bezahltarife laut Preisseite: Starter 10 €/Monat (10 000 Mails, weitere 1,50 € je 1 000), Growth 13 €, Pro 15 €.

**Mail-Dienst (Transaktionsmails: Login-Codes, Hinweise)**

| Anbieter | Sitz / Daten | Kostenloser Tarif | SPF / DKIM / DMARC, eigene Domain | AVV | Bewertung für G0 |
|---|---|---|---|---|---|
| **Lettermint** (Lettermint B.V., NL) | Niederlande, keine US-Mutter; Mail-Daten laut Anbieter nur in der EU auf eigener Infrastruktur; ISO 27001 laut Anbieter | **„Developer“: 300 Mails/Monat**, 1 Absender-Domain, 1 Nutzer, **ohne Kreditkarte**, kein Tageslimit mehr (Changelog); danach Starter **10 €/Monat** (10 000 Mails) | ja: DKIM, SPF, Custom Return-Path; DMARC setzt der Domain-Inhaber | **ja**, DPA als Teil der AGB (Stand der DPA-Fassung 2026-04-09: Vertragspartner Lettermint B.V.); einzelne Unterauftragsverarbeiter (Support-Tools) in den USA | **Empfehlung** – identisch mit dem Plan für G1 (tech-stack.md §6), SMTP `smtp.lettermint.co` (465 implizites TLS / 587 STARTTLS, Benutzer `lettermint`, Passwort = Projekt-Token) → kein Code-Umbau |
| Brevo (FR) | Frankreich, Rechenzentren EU | **300 Mails/Tag** inkl. SMTP-Relay und Transaktions-API | ja | ja (im Konto abschließbar, laut Sekundärquellen) | **Ausweichoption** bei Kontingentproblemen; Nachteil: Marketing-Fokus, Brevo-Branding im Free-Plan (laut Reviews), geteilte IPs |
| Scaleway TEM (FR, Iliad) | Frankreich | **300 Mails/Monat** frei, danach 0,25 € / 1 000 | ja | ja (in den AGB) | gute Ausweichoption für G1; für Laien sperriger (Cloud-Konsole, Zahlungsmittel bei Kontoanlage) |
| Mailjet (FR, Sinch-Gruppe SE) | Frankreich/EU | ca. 6 000/Monat (200/Tag), Branding | ja | ja | möglich, nicht nötig |
| Resend, Postmark, SendGrid, Amazon SES | USA | teils großzügig | ja | DPA/SCC | **nein** – Drittland, widerspricht PRD |

**Mengenschätzung G0:** 10–30 Testpersonen × (1 Registrierungsmail + 1–3 Login-Codes/Monat, da Sitzungen bis 90 Tage halten) + wenige Hinweis-/Lösch-Mails ≈ **50–150 Mails/Monat** → Lettermint Free reicht. Bei > 250/Monat: Lettermint Starter (10 €/Monat) oder Wechsel zu Brevo Free – nur Env-Variablen (`SMTP_*`), kein Code.

**Domain-Registrar**

| Registrar | Sitz | `.de` pro Jahr | DNS / DNSSEC / 2FA | Bewertung |
|---|---|---|---|---|
| **INWX** | Berlin | Werbepreis auf der INWX-Seite **5,02 €** (Tracker: Verlängerung ca. 4 $ netto) | DNS-Editor inklusive, DNSSEC, 2FA | **Empfehlung** – übersichtlicher DNS-Editor, kein Paketzwang |
| Hetzner (konsoleH) | Gunzenhausen | **5,38 €** (seit Preissenkung Okt. 2025, bei Bestellung über konsoleH) | DNS kostenlos, 2FA | gleichwertig; passt, falls G1 ohnehin zu Hetzner geht (dann alles bei einem Anbieter) |
| netcup | Karlsruhe | Aktionspreise ab ca. 0,13 €/Monat + 2 € Einrichtung (Deal-Portale) | DNS inkl. | günstig, Oberfläche für Laien sperriger |
| IONOS, Strato | DE | 1. Jahr oft ~1 €, danach deutlich teurer | – | nicht empfohlen (Verlängerungspreise, Upselling) |
| Vercel Domains, Porkbun, Namecheap, Spaceship | USA | teils sehr günstig | – | **nein** – US-Anbieter, DNS läge nicht in der EU |

Domain-Budget des Auftraggebers (~10 €/Jahr) reicht für eine `.de`. Für die Beta genügt **eine** Domain; App unter **`app.<domain>`**, Absender **`login@mail.<domain>`** (Subdomain schützt die Reputation der Hauptdomain, identisch mit §7.2). Die Hauptdomain bleibt für G1 frei.

#### 0.12.2 Aufbau: zweites Vercel-Projekt, eigene Neon-Datenbank, Release-Zweig `beta`

| Thema | Vorschau (bleibt) | **Beta (neu)** |
|---|---|---|
| Vercel-Projekt | `wir-wollen-weg` | **`wir-wollen-weg-beta`** (gleiches Repo) |
| Production-Branch | `main` | **`beta`** – nur geprüfte Stände; Team (Developer auf Anweisung CEO) spult `beta` per Fast-Forward auf einen freigegebenen `main`-Commit vor |
| Neon | Projekt „wispy-tooth-98738747“ | **eigenes Projekt** `wir-wollen-weg-beta` (Frankfurt, PG 18) – **kein** Branch des Vorschau-Projekts: getrennte Zugangsdaten, kein Kontakt mit Demo-Daten/„Demo zurücksetzen“, eigenes Kontingent (Neon Free: 0,5 GB + 100 CU-h **pro Projekt**/Monat, 10 Branches), Beta-Ende = Projekt löschen |
| Domain | `*.vercel.app` | `app.<domain>` (CNAME auf Vercel), `*.vercel.app` per Vercel-Redirect + App-Redirect (§0.12.4 Nr. 9) |
| Zugang | Basic Auth | Beta-Code bei der Registrierung (§0.12.5) |
| Mails | Demo-Postfach | SMTP Lettermint |
| Daten | synthetisch, Seed | **echt**, kein Seed |
| Reisedaten F-054 | an (Fantasiedaten, `DEMO`-Präfix) | **aus** (Start verweigert bei `true`) |
| Löschjob | Vercel Cron, `CRON_SECRET` | gleich (eigenes `CRON_SECRET`) |

**Änderungen an Build/Konfiguration (Developer):**

1. `vercel.json` → `git.deploymentEnabled`: zusätzlich `"beta": true`.
2. **`ignoreCommand`** in `vercel.json` (z. B. `node scripts/vercel-ignore.ts`): Exit 0 (= überspringen), wenn das Projekt nicht zu seinem Zweig passt – `APP_ENV=preview` baut nur `VERCEL_GIT_COMMIT_REF=main`, `APP_ENV=beta` nur `beta`. Sonst entstünden in jedem Projekt fehlschlagende Fremd-Deployments (Rauschen, verwirrt den Auftraggeber).
3. `scripts/vercel-build.ts`: `APP_ENV` `preview` **oder** `beta`; bei `beta` **kein** Seed-Schritt; Migrationen wie bisher (`DATABASE_URL_UNPOOLED`). Zusätzlich bei `beta`: Abbruch, wenn `VERCEL_GIT_COMMIT_REF` ≠ `beta`.
4. `scripts/seed-demo.ts`: verweigert `APP_ENV=beta` (bisher erlaubt: demo/development/preview – so lassen, Test ergänzen).
5. Cron: `vercel.json` gilt für beide Projekte → je ein täglicher Lauf. **Hinweis:** Vercel Hobby erlaubt laut Doku 2 Cron-Jobs (Ausführung irgendwann in der angegebenen Stunde) – mit zwei Projekten à 1 Job ist die Grenze erreicht; keine weiteren Crons anlegen.
6. **Migrationen mit echten Daten:** Jede Migration, die in `beta` geht, muss rückwärtskompatibel mit der laufenden Version sein (Deployment-Wechsel ist nicht atomar) und darf keine Daten verwerfen. Vor Migrationen mit Datenumbau: CEO bittet den Auftraggeber um einen Neon-Sicherungs-Branch (beta-anleitung.md §9). Neon Free hat nur ein kurzes Wiederherstellungsfenster (laut Neon-FAQ 6 h PITR) – kein Ersatz für Backups (Risiko akzeptiert für G0, §0.12.10).

#### 0.12.3 Umgebungsvariablen `APP_ENV=beta` (Vercel, Umgebung „Production“ des Beta-Projekts)

Werte setzt nur der Auftraggeber (beta-anleitung.md §4); **nie** ins Repo, auch nicht `LEGAL_OPERATOR_NAME` (das Repository ist **öffentlich**).

| Variable | Wert / Regel | geheim |
|---|---|---|
| `APP_ENV` | `beta` | nein |
| `APP_URL` | `https://app.<domain>` (Pflicht, `https://`) | nein |
| `BETTER_AUTH_SECRET` | eigener Zufallswert ≥ 32 Zeichen, **≠ Vorschau** | ja |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Neon-Projekt `wir-wollen-weg-beta` | ja |
| `MAIL_TRANSPORT` | `smtp` (Pflicht; `inbox` verboten) | nein |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER` | `smtp.lettermint.co`, `465`, `true`, `lettermint` (Fallback 587 + `SMTP_SECURE=false`, dann `requireTLS`) | nein |
| `SMTP_PASSWORD` | Lettermint-Projekt-Token | ja |
| `MAIL_FROM` | `login@mail.<domain>` | nein |
| `MAIL_FROM_NAME_DE`, `MAIL_FROM_NAME_EN` | optional (Standard: Produktname je Sprache) | nein |
| `MAIL_REPLY_TO` | optional, z. B. Adresse des Auftraggebers | nein |
| `CONTACT_EMAIL` | **Pflicht in beta**: Kontakt im Datenschutzhinweis/Kontaktseite/Hilfe; nicht `example.org` | nein |
| **`LEGAL_OPERATOR_NAME`** *(neu)* | **Pflicht in beta**: Vor- und Nachname des Verantwortlichen (2–100 Zeichen) | nein (aber nicht ins Repo) |
| **`BETA_ACCESS_CODES`** *(neu)* | **Pflicht in beta**: 1–5 Codes, kommagetrennt, **erster = aktueller**, weitere = Übergang bei Rotation; je ≥ 12 Zeichen nach Normalisierung | ja |
| **`BETA_MAX_ACCOUNTS`** *(neu, optional)* | Obergrenze Konten (Standard **50**); erreicht → neue Registrierungen freundlich abgelehnt – gilt für **alle** Wege (`/beta` und Einladungslink) | nein |
| **`BETA_INVITE_SIGNUP`** *(neu, optional)* | nur bei Variante B (Einladungslink ersetzt Beta-Code, §0.12.5 Nr. 9): Standard `true`; `false` = **Notschalter** – neue Konten nur noch über `/beta` (Einladungsweg zeigt dann W23 A.5 „Fast – dir fehlt noch der Beta-Code“). Bei Variante A ohne Wirkung | nein |
| **`FEEDBACK_WHATSAPP_NUMBER`** *(neu, optional)* | Nummer des Auftraggebers für „Feedback geben“ (W23 D.2) im internationalen Format **nur Ziffern**, z. B. `4915112345678` (für `https://wa.me/<Nummer>`). Fehlt → WhatsApp-Taste ausgeblendet. **Nicht ins Repo** (öffentlich) | nein (für Tester sichtbar) |
| **`FEEDBACK_EMAIL`** *(neu, optional)* | Adresse für „Feedback geben“ per Mail (`mailto:`); fehlt → Mail-Taste ausgeblendet; fehlen beide → Menüeintrag „Feedback geben“ ausgeblendet. Darf gleich `CONTACT_EMAIL` sein | nein (für Tester sichtbar) |
| `CRON_SECRET` | eigener Zufallswert ≥ 32 Zeichen (Pflicht in beta) | ja |
| `TRAVEL_DATA_ENABLED` | `false` (leer = aus; `true` → Start verweigert) | nein |
| **`PWA_SW_ENABLED`** *(neu, optional)* | Standard an in `beta`/`production`; `false` = Notschalter: App registriert keinen Service Worker, `/sw.js` meldet sich selbst ab (§0.12.6) | nein |
| `PASSWORD_BREACH_CHECK` | `off` (Empfehlung für G0, Entscheidung bleibt G1) | nein |
| nicht setzen | `PREVIEW_ACCESS_PASSWORD` (wird in beta ignoriert, Warnung im Log), `BETTER_AUTH_URL`, `AUTH_IP_HEADER`, `AUTH_TRUSTED_PROXIES`, `RETENTION_TOKEN`, `RATE_LIMIT_ENABLED`, `TRAVEL_DATA_KEYS` | – |

#### 0.12.4 Startschutz und Verhalten von `APP_ENV=beta` (Erweiterung `src/lib/app-env.ts`, `src/instrumentation.ts`)

`beta` ist ein **internetöffentlicher Modus mit echten Daten ohne Basic Auth** – die Regeln sind deshalb näher an `production` als an `preview`. Jede Verletzung von 1–8 → **Start verweigert** (Meldung nennt Variable + diesen Abschnitt; fail closed).

| # | Regel | Vergleich preview / production |
|---|---|---|
| 1 | `APP_ENVS` um `beta` erweitern; `beta` ∈ `HTTPS_ENVS`; **darf** auf Vercel laufen (nicht in `LOCAL_ONLY_ENVS`) | wie preview |
| 2 | `MAIL_TRANSPORT=smtp` Pflicht; `inbox` verboten (`beta` **nicht** in `INBOX_ENVS`); `SMTP_HOST` ≠ `localhost`/`127.0.0.1`/`mailpit`; `SMTP_USER` + `SMTP_PASSWORD` gesetzt; `MAIL_FROM` nicht auf `example.org`/`.test`/`.invalid` | wie production |
| 3 | `BETA_ACCESS_CODES`: 1–5 Einträge, je ≥ 12 Zeichen nach Normalisierung (§0.12.5), keine Duplikate | nur beta |
| 4 | `LEGAL_OPERATOR_NAME` (2–100 Zeichen) und `CONTACT_EMAIL` (gültige Adresse, nicht `example.org`) gesetzt | nur beta |
| 5 | Löschjob aktiv: `CRON_SECRET` **oder** `RETENTION_TOKEN` gesetzt | production: Pflicht ab Go-Live |
| 6 | `TRAVEL_DATA_ENABLED=true` → verweigert (bis G1b, das EU-Hosting voraussetzt); **keine** HKDF-Ableitung eines Reisedaten-Schlüssels in beta (§0.11.1-Tabelle um Zeile `beta`: Standard **aus**, `true` **nein**) | strenger als production |
| 7 | `RATE_LIMIT_ENABLED=false` → verweigert | wie production |
| 8 | **Platzhalter-Schutz:** die in beta ausgelieferten Rechtstexte (Beta-Datenschutzhinweis, Kontaktseite, Mail-Footer) enthalten keinen `[PLATZHALTER`-Marker; die vollständigen Platzhalter-Seiten der Demo werden in beta **nicht** ausgeliefert (§0.12.8) | wie production, aber nur für die Beta-Texte |
| 9 | **Kanonischer Host:** Proxy leitet jede Anfrage, deren Host ≠ Host von `APP_URL`, per **308** auf `APP_URL` um – **außer** `/api/internal/retention` und `/api/health` (Vercel Cron ruft ggf. die `*.vercel.app`-Adresse auf und folgt Umleitungen nicht verlässlich). `previewTrustedOrigins()` liefert in beta **nichts** (nur `APP_URL` ist vertrauenswürdige Origin) | strenger als preview |
| 10 | Kein Basic Auth (`src/proxy.ts`: beta wie production behandeln, aber Regel 9 und `X-Robots-Tag: noindex, nofollow` auf jeder Antwort; `robots.txt` = `Disallow: /` – ist für Nicht-production schon so, Test ergänzen) | – |
| 11 | Demo-Funktionen aus: `/demo/postfach` 404, kein „Demo zurücksetzen“, **kein** Demo-Banner „keine echten Daten“ (würde der echten Nutzung widersprechen). Stattdessen dezentes **„Beta“-Etikett** neben der Wortmarke + „Feedback geben“ (WhatsApp/Mail aus `FEEDBACK_*`, vorausgefüllter Text **ohne** Reisenamen, IDs, Namen, E-Mail) – Platzierung und Texte W23 D | – |
| 12 | `seed-demo.ts` verweigert beta (§0.12.2 Nr. 4) | wie production |
| 13 | `PREVIEW_ACCESS_PASSWORD` gesetzt → nur Warnung im Start-Log („ignored in beta“) | – |
| 14 | **Routen (W23):** `/beta` (Beta-Einstieg, Schritte `?step=privacy`) existiert **nur** in `beta` (sonst 404); `/install` (Install-Anleitung) und `/offline` (Offline-Seite) sind **[immer]** vorhanden, ohne Anmeldung erreichbar, ohne Personenbezug. Ebenfalls ohne Anmeldung: `/sw.js`, `/manifest-*.webmanifest`, Icons. Landing in beta: Hero-Taste „Ich habe einen Beta-Code“ → `/beta`, „Reise planen“ ohne Konto → `/beta?next=/trips/new` (W23 A.2) | – |
| 15 | `FEEDBACK_WHATSAPP_NUMBER` gesetzt, aber nicht 8–15 Ziffern → **Warnung** im Start-Log und Taste ausgeblendet (kein Startabbruch – Feedback ist nicht sicherheitsrelevant); `FEEDBACK_EMAIL` ungültig → ebenso | – |
| 16 | `BETA_MAX_ACCOUNTS` gesetzt, aber keine ganze Zahl 1–500 → Start verweigert | nur beta |

Tests (Pflicht): Unit-Tests für `startupProblems()` je Regel (positiv/negativ), E2E-Projekt `beta-chromium` analog `preview-chromium` (zweiter `next start` mit `APP_ENV=beta`, Mailpit als SMTP **nur in CI** über eine Test-Ausnahme `E2E_ALLOW_LOCAL_SMTP=1`, die außerhalb `CI=true` wirkungslos ist): `/beta` mit gültigem/falschem/leerem Beta-Code (Fehlermeldung am Feld **vor** jedem Mailversand), Rate-Limit-Meldung, „Beta voll“, Zustimmung Pflicht, Registrierung über Einladungslink (je nach Variante §0.12.5 Nr. 9 mit/ohne Beta-Code), neue Adresse direkt über `/login` ohne Beta-Pass → nach Code-Prüfung Zustand „Fast – dir fehlt noch der Beta-Code“ und **kein** Konto, kein Demo-Banner, `/demo/postfach` 404, Redirect fremder Host, Datenschutzhinweis ohne Platzhalter, Service Worker (§0.12.6).

#### 0.12.5 Beta-Code bei der Registrierung (serverseitig) – Ablauf nach W23

**Grundsatz:** Ein **neues Konto** entsteht in beta nur mit **(a)** einem gültigen **Beta-Pass** (Beta-Code auf `/beta` geprüft) **oder (b)** – nur Variante B, Entscheidung E-G0-2 – einer gültigen **Einladung**; in beiden Fällen **mit Zustimmung** zum Beta-Datenschutzhinweis (Version) und unterhalb von `BETA_MAX_ACCOUNTS`. Bestehende Konten melden sich ganz normal über `/login` an – **ohne** Beta-Code. Oberfläche und Texte: [W23](../ux/wireframes/w23-beta-und-installation.md) A.0–A.10.

**Warum der Beta-Code auf eigener Seite vor der E-Mail geprüft wird:** Der Code hängt an keiner Adresse – eine klare Meldung „Dieser Beta-Code stimmt nicht“ verrät nichts über bestehende Konten. Ein stilles Scheitern („keine Mail, gleiche Antwort“, Entwurf vom Vormittag) ist damit **verworfen** (W23 0.1).

| # | Schritt | Vorgabe |
|---|---|---|
| 1 | **`/beta` Schritt 1 – Code prüfen** (W23 A.3) | Server Action. Ergebnisse: gültig → Beta-Pass setzen → Schritt 2 · leer → `beta.code.errorEmpty` · falsch → `beta.code.errorWrong` · Limit (Nr. 7) → `beta.code.errorRate` mit Minuten (gerundet) · Konten ≥ `BETA_MAX_ACCOUNTS` → `beta.code.errorFull` (Zahl nie anzeigen). **Kein Mailversand in diesem Schritt.** Ist man schon angemeldet → `/trips`; gültiger Pass vorhanden → direkt Schritt 2. `next=` nur intern (Open-Redirect-Schutz wie sitemap §4). Vorbelegung über `#code=…` (Fragment, nicht in Logs) – Feld vorbelegen, **nicht** automatisch absenden |
| 2 | **Beta-Pass** (Cookie) | `ww_beta_pass`: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age` 24 h. Inhalt `{v, iat, kid, consent, consentAt}`, signiert mit HMAC-SHA-256; Schlüssel per HKDF aus `BETTER_AUTH_SECRET` (`info = "ww-beta-pass"`) – **kein** neues Secret. `kid` = erste 8 Hex-Zeichen von SHA-256 des passenden (normalisierten) Codes; der Pass gilt nur, solange ein konfigurierter Code dieses `kid` hat → **Rotation beendet auch offene Pässe**. Enthält **nie** den Code, keine E-Mail. Technisch notwendiges Cookie (compliance §13.5) |
| 3 | **`/beta?step=privacy` – Zustimmung** (W23 A.4) | Ohne Haken → `beta.privacy.errorConsent`. Mit Haken → Pass neu signiert mit `consent = "beta-1"` + Zeitpunkt → `/login?from=beta&next=…`. Texte der Kurzfassung: compliance §13.6 (Operations hat W23 p4/p5 ersetzt) |
| 4 | **Code-Anforderung auf `/login`** | **Unverändert für alle Adressen** – gleiche Antwort, gleiche Code-Seite, Mail wie heute (keine Konto-Ermittlung, R-021). Mail-Fassung in beta: **Code zuerst**, Link als zweite Möglichkeit „im Browser“ (W23 A.5, Schlüssel `codeIntro`/`linkIntro`/`linkText`); Betreff unverändert. Der Client schickt `standalone=true|false` mit; der Server speichert es an der Anforderung (für den Hinweis auf `/auth/magic`, W23 A.6). **Zusatz nur beta – Kontingentschutz:** Mails an Adressen **ohne Konto** und **ohne** Beta-Pass/Einladungs-Pass höchstens **30 pro Tag global** (Code-Konstante); darüber wird für solche Adressen still keine Mail mehr verschickt (gleiche Antwort), Zähler `mail.signup_capped`. Grund: Lettermint Free = 300 Mails/Monat; die bestehenden Limits pro Adresse (5 Codes/h) und pro IP gelten weiter |
| 5 | **Durchsetzung – einziger Ort, an dem Konten entstehen** | `databaseHooks.user.create.before` (hat `context.headers` → Cookies, wie heute für die Sprache genutzt). In beta: erlaubt nur, wenn **(a)** gültiger Beta-Pass mit `consent` (Signatur, `iat` < 24 h, `kid` aktiv) **oder (b)** Variante B: gültiger Einladungs-Pass (Nr. 9) mit Zustimmung; **und** Konten < `BETA_MAX_ACCOUNTS` (Zählung in derselben Transaktion bzw. unter Advisory-Lock). Sonst `APIError FORBIDDEN` mit Grund `BETA_SIGNUP_REQUIRED` bzw. `BETA_FULL` → Oberfläche zeigt W23 A.5 „Fast – dir fehlt noch der Beta-Code“ bzw. „Die Beta ist gerade voll“ (die Person hat ihre Adresse mit dem Code bewiesen – keine Konto-Ermittlung). Gesetzt werden `betaConsentVersion`, `betaConsentAt`, `betaSignupVia` (`code`\|`invite`) am Konto (Migration; Löschung mit dem Konto). Pässe nach Kontoanlage löschen (`Max-Age=0`). Deckt alle Wege ab: Code, Magic Link, Einladung, Platzhalter-Übernahme per persönlichem Link (F-007), künftige Wege – **fail closed** |
| 6 | **Vergleich** | Normalisierung `NFKC` → trim → Kleinbuchstaben → Leerzeichen und `-` entfernen; SHA-256-Digests mit `timingSafeEqual` gegen **alle** konfigurierten Codes (keine frühe Rückkehr). Codes nie loggen, nie an den Client, nie in Fehlermeldungen |
| 7 | **Rate-Limits `/beta`** (IP, IPv6 pro /64 wie R-005/R-036) | max. **5 Fehlversuche / 15 Min.** und **20 / Tag** pro IP; global **200 Fehlversuche / Tag** → Beta-Einstieg 1 h für alle zu (gleiche Meldung `errorRate`; Bestandskonten unberührt). Gültige Codes zählen nicht. Speicher wie bestehende App-Limits (DB). Log nur Zähler `beta_code.invalid`, `beta_code.ok`, `beta_code.locked`, `beta_signup.code`, `beta_signup.invite`, `beta_signup.denied` (ohne IP, ohne Adresse) |
| 8 | **Rotation** | Neuer Code vorn in `BETA_ACCESS_CODES`, alter dahinter, Redeploy; nach Übergangszeit alten entfernen (beta-anleitung.md §9). Bestehende Konten/Sitzungen unberührt; offene Pässe zum entfernten Code verfallen (Nr. 2). „Beta schließen“ = nur ein unbekannter Zufallscode |
| 9 | **Einladungsweg – Entscheidung Auftraggeber (E-G0-2), beide Varianten baubar** | **Variante B (Empfehlung UX, Operations trägt mit):** Gültiger Einladungslink ersetzt den Beta-Code (W23 A.8 Standard). Beim „Beitreten“ auf `/i/{token}` setzt der Server einen **Einladungs-Pass** `ww_invite_pass` (gleiche Cookie-Attribute und Signatur wie Nr. 2, `info = "ww-invite-pass"`, 24 h; Inhalt: SHA-256 des Einladungs-Tokens, Reise-ID, Zustimmung aus Z4a). Wo möglich das bestehende signierte Cookie `pending_invite` (tech-stack.md §3.3, 30 Min.) um Zustimmung erweitern statt ein zweites Cookie einzuführen – dann gilt dessen Laufzeit. Hook prüft zusätzlich: Einladung **noch gültig** (nicht widerrufen/neu erzeugt, Reise existiert, Platzhalter-Link offen) und Limit. Konto nur, wenn der Beitritt gelingt (W23 A.8 Nr. 4). **Notschalter** `BETA_INVITE_SIGNUP=false` (z. B. wenn ein Link in fremde Hände gerät) → Einladungsweg verlangt wieder den Beta-Code (Zustand A.5). Restrisiko: ein weitergeleiteter Link öffnet genau **eine** Reise – das ist ohnehin die Bedeutung eines Einladungslinks (F-004); Orga kann den Link neu erzeugen und Personen entfernen. **Variante A (streng):** Einladungs-Pass berechtigt nicht; Einladungsformular bekommt „Zum ersten Mal hier?“ mit Beta-Code-Feld + Zustimmung (W23 A.8 „Variante streng“); Nachteil: Beta-Code wandert in Gruppenchats. Bauweise so, dass A ↔ B nur eine Bedingung im Hook + die UI-Variante ist |
| 10 | **Versionierung des Hinweises** | Version `beta-1`; jede inhaltliche Änderung → neue Version (`beta-2` …). Bestehende Konten müssen nicht erneut zustimmen; bei wesentlichen Änderungen (neuer Dienstleister, neuer Zweck) informiert der Auftraggeber per Mail/WhatsApp vorab (CEO entscheidet). |

#### 0.12.6 PWA – installierbare Web-App (iPhone „Zum Home-Bildschirm“, Android „App installieren“)

**Ist-Stand:** `public/manifest-de.webmanifest`/`-en` (`display: standalone`, `start_url: /`, `scope: /`, `theme_color #2B2266`, `background_color #F4F2FB`, Icons 192/512 + maskable), `apple-touch-icon.png` 180×180 (RGB, ohne Transparenz ✓), `themeColor` und Manifest-Link in `src/components/document-head.tsx`. **Kein** Service Worker. Push bleibt F-038 (später); hier nur Installierbarkeit + Offline-Hinweis. *(Hinweis an PM: F-038 in „PWA-Basis (G0)“ und „Push (später)“ aufteilen.)*

**Anforderungen (Developer, P1-B0):**

| # | Thema | Vorgabe |
|---|---|---|
| 1 | Manifest | `id: "/"` ergänzen; `start_url` bleibt `/` (Weiterleitung: angemeldet → `/trips`, sonst `/login` im App-Modus, W23 A.7/C.1), kein Tracking-Parameter; `scope: "/"`; `orientation` **nicht** setzen; `display: standalone`; **kein** „Beta“ im Namen; Namen je Sprache (DE „Wir wollen weg“, EN „When do we go?“, Q11); `Content-Type: application/manifest+json`; ohne Anmeldung abrufbar. Maskable-Icon: Designer prüft Schutzzone (80 %) |
| 2 | iOS-Meta | Next.js-Metadata `appleWebApp: { capable: true, title: <Produktname je Sprache>, statusBarStyle: "black-translucent" }` (W23 C.3: Statusleisten-Schrift immer weiß → hinter `env(safe-area-inset-top)` auf jeder Seite eine dunkle Markenfläche/Indigo-Band, Designer D-75); `apple-touch-icon` bleibt |
| 3 | Theme-Farbe | `themeColor` je Farbschema (`media: (prefers-color-scheme: light/dark)`) aus `tokens.css` (Designer liefert Dark-Wert) |
| 4 | Safe Area | `viewport-fit=cover` (`viewport.viewportFit = "cover"`) **und** `env(safe-area-inset-*)`-Abstände für Kopfzeile, untere Leisten, Bottom-Sheets, Toasts – im Standalone-Modus gibt es keine Safari-Leisten mehr. Abnahme auf iPhone mit Dynamic Island + Home-Indikator (hell/dunkel) |
| 5 | Splash | iOS erzeugt aus dem Manifest keinen Splash; ohne `apple-touch-startup-image` erscheint kurz die Hintergrundfarbe. **Für G0 nicht nötig** (optional später, Designer). `background_color` so wählen, dass es hell **und** dunkel nicht blitzt (W23 C.3: Indigo statt `#F4F2FB`, Designer D-76) |
| 6 | Login in der PWA | Erkennung Standalone (`matchMedia("(display-mode: standalone)")` oder `navigator.standalone`) → Code-Seite betont **„Code aus der Mail hier eintippen“**, Hinweis „Der Link in der Mail öffnet Safari“; Code-Feld `inputmode="numeric"`, `autocomplete="one-time-code"`. „Angemeldet bleiben“ ist im App-Modus **immer an** und wird nicht angezeigt (90 Tage rollierend, W23 A.7). Mail-Text in beta: Code zuerst, Link als zweite Möglichkeit „im Browser“ (W23 A.5). Magic-Link-Landeseite rät bei `standalone=true` zum Code (W23 A.6) |
| 7 | Sitzung übernehmen / Install-Hinweis | Ob iOS beim Hinzufügen zum Home-Bildschirm die Anmeldung aus Safari mitnimmt, ist **je iOS-Version unterschiedlich und nicht verlässlich dokumentiert** (meist ja, aber unsicher; danach getrennte Speicher). Deshalb: **erst registrieren, dann installieren**, und in der App bei Bedarf **einmal per Code anmelden** (W23 B-E3, A.7). Install-Anleitung als eigene Seite **`/install`** (W23 B): automatisch **genau einmal** nach Konto-Anlage über `/beta` bzw. erstem Beitritt mit neuem Konto, sonst nur über Avatar-Menü „App installieren“ und Hilfe `#app`. Merker „gesehen“ **serverseitig am Konto** (`installHintSeenAt`, Migration) + `localStorage` gegen Flackern (compliance §13.5). Android: `beforeinstallprompt` nur abfangen, um den Zeitpunkt zu steuern |
| 8 | Einladungen | Links aus WhatsApp/Mail öffnen auf iOS Safari, nie die PWA. Beitritt in Safari funktioniert. In der installierten App: **„Einladungslink einfügen“** (W23 C.8; einen Einladungs*code* gibt es nicht) – akzeptiert nur URLs der **eigenen Origin** mit Pfad `/i/{token}` oder `/trips/{id}…`, sucht die erste passende URL auch in eingefügtem Freitext, öffnet intern; alles andere → Fehlermeldung. Zwischenablage nur auf Tastendruck (`navigator.clipboard.readText()`), nichts wird gespeichert |
| 9 | Externe Links / Downloads | Portal-Links, Google-Kalender, WhatsApp-Teilen öffnen außerhalb (ok). **ICS-Download** und Datenexport im iOS-Standalone-Modus auf dem Gerät testen (Downloads verhalten sich dort anders); Fallback „In Safari öffnen“ (W23 C.6, Gerätetest G-9) |
| 10 | Zurück-Wege, Aktualisieren | Jede Seite mit sichtbarem Zurück-Weg (W23 C.5); **kein** Pull-to-refresh, `overscroll-behavior-y: contain` auf dem App-Container, stilles Neuladen nach ≥ 30 s Hintergrund (W23 C.7). Interne Links im App-Modus nie `target="_blank"` |
| 11 | Keine Push-Benachrichtigungen | in der Beta nicht (W23 C.9; F-038 später) |

**Service Worker (nur App-Shell + Offline-Hinweis, keine personenbezogenen Daten):**

| # | Vorgabe |
|---|---|
| 1 | Datei `/sw.js` (statisch aus `public/` oder Route), Scope `/`, Header `Cache-Control: no-cache` (Updates sofort sichtbar), `Content-Type: text/javascript`. Registrierung durch eine kleine Client-Komponente nach `load`, **nur** wenn `APP_ENV` ∈ {`beta`, `production`} und `PWA_SW_ENABLED` ≠ `false`; **nie** in `development`/`ci`/`demo`/`preview` (Basic Auth, Cache-Verwirrung beim Entwickeln). Ausnahme für E2E: Projekt `beta-chromium` |
| 2 | **Precache bei `install`:** nur `/offline` (statische Seite, **beide Sprachen in einer Datei**, Sprache per Cookie `lang` bzw. `navigator.language`, ohne Personenbezug, ohne Anmeldung, Texte W23 C.2/E `pwa.offline.*`, „Nochmal versuchen“ + automatisches Neuladen beim Ereignis `online`, funktioniert ohne JS) samt Logo-SVG, Schriften (latin), `tokens`-CSS, Offline-Illustration (D-76). Cache-Name versioniert mit der Build-ID (`ww-shell-<buildId>`) |
| 3 | **`fetch`-Regeln:** nur `GET` und gleiche Origin anfassen. Navigationen (`request.mode === "navigate"`): **Netzwerk**, bei Netzfehler die gecachte `/offline`-Seite. `/_next/static/*` (gehashte, unveränderliche Dateien ohne Personenbezug): cache-first erlaubt. **Alles andere wird nicht beantwortet und nicht gecacht**, ausdrücklich: HTML aller App-Seiten, RSC-Anfragen (Header `RSC: 1`, Parameter `_rsc`), Server Actions (`POST`, Header `Next-Action`), `/api/*` (inkl. Bild-Proxy `/api/stays/image`), `/auth/*`, `/i/*`, `/trips/*`, `/account/*`, `/demo/*`, ICS-/Export-Downloads |
| 4 | `activate`: alte `ww-shell-*`-Caches löschen, `clients.claim()`; `skipWaiting()` bei neuer Version (unkritisch, da keine Daten im Cache) |
| 5 | **Kein** Push, kein Background Sync, kein IndexedDB/`localStorage` durch den SW, keine Analytics |
| 6 | Abmelden und Konto löschen: Antwort mit `Clear-Site-Data: "cache"` (leert Browser-/Cache-Storage der Origin; Cookies regelt Better Auth) |
| 7 | **Notschalter** `PWA_SW_ENABLED=false`: keine Registrierung; `/sw.js` liefert einen Worker, der alle `ww-*`-Caches löscht und sich mit `self.registration.unregister()` abmeldet |
| 8 | **Offline-Anzeige in der laufenden App:** bestehender Banner aus W14 – keine Offline-Seite mitten in der Arbeit (W23 C.2). Aussage „wird gespeichert, sobald du wieder online bist“ nur dort, wo das stimmt (Autosave „Meine Tage“ mit Wiederholung) |
| 9 | **Abnahme (E2E, Pflicht):** (a) SW registriert in beta, nicht in preview/dev; (b) `context.setOffline(true)` → Navigation zeigt `/offline`; (c) nach einem Rundgang (Login, Reise öffnen, Kalender, Kosten) enthalten `caches.keys()`/Einträge **nur** `/offline`, deren Assets und `/_next/static/*` – kein `/trips`, kein `/api`, kein `_rsc`, keine E-Mail-Adresse im Cache-Inhalt; (d) Notschalter meldet den SW ab. Manuell: iPhone (iOS aktuell) installieren, anmelden per Code, Offline-Hinweis, Safe Area, Dunkelmodus |

#### 0.12.7 CSP-Anpassung

Stufe 1 (`next.config.ts`, `CSP_STAGE_1`) um **`worker-src 'self'`** und **`manifest-src 'self'`** ergänzen (ohne `script-src`/`default-src` wäre beides ohnehin erlaubt – explizit, damit Stufe 2 nichts bricht). `/sw.js` und `/offline` bekommen dieselbe CSP. Stufe 2 (§0.9) enthält beide Direktiven bereits. **Keine** externen Quellen (kein CDN-Workbox, keine Analytics, keine externen Fonts). `connect-src` bleibt bei Stufe 2 `'self'` (SMTP läuft serverseitig). Feedback (`https://wa.me/…`, `mailto:`) und Karten-Links sind Navigationen, keine CSP-Quellen. `Permissions-Policy` bleibt (`camera=(), microphone=(), geolocation=()`) – **nicht** um `clipboard-read=()` erweitern, sonst scheitert „Einladungslink einfügen“ (W23 C.8).

#### 0.12.8 Rechtstexte in beta – was minimal nötig ist (Einschätzung, keine Rechtsberatung)

| Text | In beta | Inhalt / Quelle |
|---|---|---|
| **Beta-Datenschutzhinweis** (`/datenschutz`, `/privacy`) | **Pflicht** | Kurzfassung nach Art. 13 DSGVO mit `LEGAL_OPERATOR_NAME` + `CONTACT_EMAIL` aus Env; Entwurf in [compliance-checklist.md §13.4](compliance-checklist.md). Versioniert (`beta-1`), Version wird mit der Zustimmung am Konto gespeichert (§0.12.5 Nr. 3 + 5). DE Pflicht, EN als Übersetzung (falls EN-sprachige Tester – Entscheidung E-G0-6) |
| **Anbieter & Kontakt** (`/impressum`, `/imprint`) | **empfohlen** (statt Platzhalter-Impressum) | „Private, nicht-kommerzielle Test-Version für einen geschlossenen Freundeskreis. Verantwortlich: {Name}. Kontakt: {E-Mail}.“ **Keine** Anschrift. Begründung: compliance §13.3 |
| Volle Platzhalter-Seiten der Demo | **nicht ausliefern** | in beta durch die beiden Beta-Texte ersetzt; Startschutz §0.12.4 Nr. 8 |
| Mail-Footer | Pflicht | „Private Beta von Wir wollen weg · Datenschutz: {APP_URL}/datenschutz“ (ohne Platzhalter) |
| Hilfe/Lizenzen (F-051) | bleibt | Kontakt = `CONTACT_EMAIL`; neue Frage `#app` (W23 B.5) und Kasten „Feedback geben“ (W23 D.2) |
| Kurzfassung auf `/beta` Schritt 2 und im Einladungsweg Z4a | Pflicht | Texte **compliance §13.6** (ersetzt W23 `beta.privacy.p4`/`p5`; **kein** Versprechen „am Ende der Beta löschen wir alle Daten“ – es gelten die normalen Löschfristen, CEO 2026-10-23) |
| Nutzungsbedingungen | nicht nötig | erst M2 |

#### 0.12.9 Mail-Transport

- **SMTP über Nodemailer** (bestehend, `src/server/mail/transport.ts`) – kein neuer Code-Pfad nötig. Ergänzen: Timeouts (`connectionTimeout` 10 s, `greetingTimeout` 10 s, `socketTimeout` 20 s – Vercel-Funktionen sollen nicht hängen), bei `SMTP_SECURE=false` und nicht-lokalem Host `requireTLS: true`, kein Pooling (serverlos).
- Versand läuft bereits über `after()` (R-067); Fehler nur als Zähler `mail.send_failed` loggen (keine Adresse, kein Code), Nutzer kann „Neuen Code senden“.
- Ports: 465 (implizites TLS, Empfehlung) oder 587 (STARTTLS); Port 25 ist bei Cloud-Anbietern üblicherweise gesperrt. **Abnahme:** erster Versand aus dem Beta-Projekt auf Vercel. Falls ausgehendes SMTP von Vercel scheitert: Fallback **Lettermint-HTTP-API** als weiterer Transport (`MAIL_TRANSPORT=lettermint-api`, Token in `LETTERMINT_API_TOKEN`) – nur bauen, wenn nötig.
- Keine Tracking-Pixel, keine umgeschriebenen Links (beim Anbieter abgeschaltet, beta-anleitung.md §2 Nr. 9).
- Absender `login@mail.<domain>`; Reply-To optional (Adresse des Auftraggebers); SPF/DKIM über Lettermint, DMARC `p=none` → nach 2–4 Wochen `quarantine` (§7.2).

#### 0.12.10 Grenzen und Risiken der Beta (bewusst akzeptiert bzw. offen)

| Risiko | Bewertung / Maßnahme |
|---|---|
| Vercel = US-Anbieter, AVV für **Hobby** unklar (DPA-Text nennt Pro/Enterprise), KI-Training bei Hobby standardmäßig an | Opt-out Pflicht (beta-anleitung.md §5.1), Hinweis an Tester, Datenminimierung; Alternative Vercel Pro (20 $/Monat) – compliance §13.2, Entscheidung E-G0-1 |
| Keine echten Backups (Neon Free: kurzes PITR-Fenster) | manuelle Neon-Sicherungs-Branches vor Migrationen; Datenverlust wäre ärgerlich, aber für eine Beta tragbar – Testern so kommunizieren |
| Vercel-Funktionslogs enthalten Pfade (`/i/<token>`) – kein Caddy-Filter wie §5.4 | Hobby-Logs werden laut Vercel nur kurz aufbewahrt und sind nur im Konto des Auftraggebers sichtbar; App loggt selbst keine Tokens/Adressen; vor G1 entfällt das Thema (Hetzner + Caddy-Filter) |
| Kontingente (Mails 300/Monat, Neon 100 CU-h, Vercel Hobby) | Obergrenze `BETA_MAX_ACCOUNTS` 50; Auftraggeber schaut monatlich ins Lettermint-Dashboard |
| Beta-Code wird weitergegeben | Rotation, Kontenobergrenze, Fremde sehen keine Reisen ohne Einladung |
| Konten-Ermittlung | Beta-Code-Prüfung ist adressunabhängig (§0.12.5 Nr. 1); Code-Anforderung bleibt neutral (Nr. 4); Ablehnung erst nach bewiesenem Postfach (Nr. 5) |
| Mails an unbekannte Adressen über `/login` verbrauchen Kontingent | unvermeidlich ohne Konto-Ermittlung; Limits pro Adresse/IP + globale Kappe 30/Tag für Adressen ohne Konto und ohne Pass (§0.12.5 Nr. 4) |
| Einladungslink ersetzt Beta-Code (nur Variante B) | weitergeleiteter Link öffnet eine Reise + ein Konto; Kontenobergrenze, Link neu erzeugen (F-004), Notschalter `BETA_INVITE_SIGNUP=false` |
| R-035 (Konto-Adresse als Variante), R-037 (Token-Pfade in Logs), Proxy-Rate-Limit `/i/*` | bleiben Go-Live-Punkte (G1); für G0 als bekannt akzeptiert – **CEO entscheidet**, ob R-035 vor G0 behoben wird (Empfehlung: ja, wenn klein) |

### 0.13 Dateispeicher Reiseunterlagen (F-055, Inkrement 12 – Recherche 2026-10-23)

Gilt für Reiseunterlagen (F-055: PDF/JPG/PNG/HEIC, ≤ 10 MB je Datei, ≤ 100 MB und ≤ 50 Dateien je Reise, Löschung 30 Tage nach Reiseende – Q31) und für die Screenshots der Unterkünfte (F-031 Stufe 2), die dieselbe Infrastruktur nutzen. Anforderungen aus PRD §8 und features.md F-055: **privat**, **keine öffentlichen URLs**, EU-Speicherort, AVV, Virenscan, EXIF-Entfernung, Auslieferung nur nach Mitgliedschafts-/Sichtbarkeitsprüfung.

> **Kernproblem Vercel:** Funktionsanfragen und -antworten sind auf **4,5 MB** begrenzt (§0.8). Dateien bis 10 MB dürfen deshalb **nicht** durch eine Funktion hoch- oder heruntergeladen werden. Lösung: Der Browser lädt **direkt** in den Objektspeicher (vorsignierte PUT-URL) und lädt direkt von dort herunter (vorsignierte GET-URL, ≤ 60 s). Die Funktion selbst holt die Datei für die Prüfung **serverseitig** aus dem Speicher – ausgehende Abrufe einer Funktion fallen nicht unter die 4,5-MB-Grenze.

> Preise netto, über Websuche am 2026-10-23 recherchiert (die Anbieterseiten selbst waren aus der Arbeitsumgebung nicht abrufbar). **Vor dem Anlegen live prüfen.** Quellen am Ende von §0.13.

#### 0.13.1 Optionen im Vergleich

| Option | Sitz / Speicherort | Kosten (Free-Kontingent → danach) | AVV / DPA | S3-API, vorsignierter Upload/Download, CORS, Lifecycle | Bewertung |
|---|---|---|---|---|---|
| **Neon-DB (`bytea`)** | US-Unternehmen, Frankfurt | Free **1 GB Speicher je Projekt** (seit 2026-10-02, vorher 0,5 GB) – für alles, nicht nur Dateien | wie Neon (§0.12, compliance §13.2) | **nein** – jede Datei läuft durch eine Funktion (4,5-MB-Grenze → Aufteilen in Stücke nötig); Dateien landen in DB-Backups/PITR (Löschung schwer nachweisbar) | **ausgeschlossen**: 10 Reisen à 100 MB sprengen das Kontingent, Architektur passt nicht |
| **Cloudflare R2, Bucket mit EU-Jurisdiktion** | US-Unternehmen (DPF); Daten **garantiert in der EU** (Jurisdiktion `eu`, nach dem Anlegen nicht änderbar) | **Free: 10 GB-Monat Speicher, 1 Mio. Schreib- (Klasse A) und 10 Mio. Lese-Operationen (Klasse B) pro Monat, Egress immer frei** → danach 0,015 $/GB-Monat, 4,50 $/Mio. A, 0,36 $/Mio. B. Zum Aktivieren muss ein **Zahlungsmittel** hinterlegt werden (bleibt im Free-Rahmen 0 €; **keine harte Kostenbremse**) | Cloudflare-DPA (v6.4, 2026-04-03) gilt laut Dritt-Quelle bei Self-Serve-Tarifen automatisch über die AGB; Unterauftragsverarbeiter-Liste prüfen | ja: S3-API über Endpunkt `https://<ACCOUNT_ID>.eu.r2.cloudflarestorage.com` (Standard-Endpunkt erreicht EU-Buckets **nicht**), vorsignierte URLs 1 s – 7 Tage, CORS (Pflicht für Browser-Upload), Lifecycle-Regeln je Präfix, Verschlüsselung at rest. **Kein** POST-Policy-Upload belegt → Größengrenze über signierten `Content-Length` (§0.13.4 Nr. 2) | **Empfehlung Vorschau** (0 €, gleicher S3-Pfad wie Produktion); bedingt Beta (§0.13.5) |
| **Hetzner Object Storage** | Hetzner Online GmbH (DE); Falkenstein, Nürnberg, Helsinki | **kein** Free-Kontingent; Grundpreis **6,49 €/Monat inkl. 1 TB Speicher + 1 TB Egress** (seit 1.4.2026, vorher 4,99 €), stundengenau abgerechnet, **solange mindestens ein Bucket existiert** (auch leer); Mehrspeicher ~8,70 €/TB, Egress 1 €/TB, API-Aufrufe und Eingang frei | AVV per Klick in der Hetzner-Konsole (derselbe wie für die VM, compliance §3) | ja (S3-kompatibel, Doku-Seiten zu unterstützten Aktionen, CORS und Lifecycle vorhanden – Details vor Einrichtung prüfen); Endpunkt `https://<standort>.your-objectstorage.com`. **Zugangsschlüssel gelten projektweit** (prüfen) → eigenes Hetzner-Projekt für Unterlagen, getrennt von Backups | **Empfehlung Produktion (G1b)**: deutscher Anbieter, ein AVV, gleiches Rechenzentrum wie die VM (ClamAV, interner Verkehr frei) |
| **Scaleway Object Storage** | Scaleway SAS (FR, Iliad); Paris, Amsterdam, Warschau | nutzungsabhängig: One Zone ~0,0075 €/GB-Monat, Multi-AZ ~0,0146 €/GB-Monat; **75 GB Egress/Monat frei**, Anfragen + Eingang frei; Neukunden: 750 GB Multi-AZ für 90 Tage. Früheres „75 GB Speicher frei“ **aktuell nicht bestätigt** – bei unserer Größe (MB bis wenige GB) ohnehin **Cent-Beträge** | DPA in den AGB | ja (S3, vorsignierte URLs, CORS, Lifecycle) | **EU-only-Alternative** zu R2 für Vorschau/Beta, falls kein weiterer US-Anbieter gewünscht ist; Kreditkarte nötig |
| **Vercel Blob (privat)** | Vercel Inc. (US); Store-Region wählbar (u. a. `fra1`), nach dem Anlegen fest | Hobby: **1 GB** Speicher, 10 GB Transfer, 10 000 einfache + 2 000 erweiterte Operationen; bei Überschreitung **30 Tage gesperrt** (keine Abrechnung) | wie Vercel – Geltung für Hobby unklar (E-G0-1) | **eigene API, kein S3**; privat + signierte URLs (PUT/GET, ≤ 7 Tage) seit 2026-06-30 GA → würde einen **zweiten Speicher-Treiber** erfordern | nur Demo-Notlösung ohne neues Konto; **nicht empfohlen** (Doppelarbeit, Sperr-Risiko, kein Weg in die Produktion) |
| **Backblaze B2 (EU Central, Amsterdam)** | US-Unternehmen | **10 GB frei**, danach ~6,95 $/TB-Monat; Egress bis 3× Speichermenge frei; Klasse-A/B/C-Aufrufe frei | DPA verfügbar | ja (S3, vorsignierte URLs, CORS) | technisch ok, aber **kein Vorteil** gegenüber R2 (ebenfalls US-Unternehmen) |
| **IONOS S3 Object Storage** | IONOS (DE); u. a. Frankfurt, Berlin | pro GB-Stunde (Dritt-Quellen: ~0,005–0,007 $/GB-Monat, **nicht bestätigt**), Egress kostenpflichtig (gestaffelt), API frei; kein Free | AVV (deutscher Anbieter) | ja (S3) | Alternative zu Hetzner für die Produktion, falls Hetzner ausfällt; Konto eher für Geschäftskunden |

#### 0.13.2 Virenscan – was ohne eigenen Server realistisch ist

ClamAV braucht laut offizieller Doku **3–4 GiB RAM** (≈ 1,2 GiB nur für die Signaturen, beim Signatur-Update kurzzeitig doppelt) und einen Dauerprozess – **auf Vercel-Funktionen nicht betreibbar**. Optionen:

| Option | Wo | Kosten | Wirkung | Eignung |
|---|---|---|---|---|
| **A – Schutzpaket Stufe 1** (§0.13.4 Nr. 4): Typ-Whitelist über Dateiinhalt (Magic Bytes), Bilder neu kodieren, PDF auf aktive Inhalte prüfen (JavaScript, Launch-Aktionen, eingebettete Dateien, XFA) und bei Fund ablehnen, Auslieferung nur von **fremder Origin** als Datei | Vercel-Funktion (bzw. App-Server) | 0 € | blockiert ausführbare Dateien, Archive, Office-Makros, HTML/SVG; neutralisiert präparierte Bilder (Neukodierung); fängt die typischen Angriffswege in PDFs ab. **Erkennt keine bekannte Schadsoftware per Signatur** | **Pflicht in allen Umgebungen**; allein ausreichend für Vorschau und – mit dokumentiertem Restrisiko – für eine kleine Beta |
| **B – ClamAV (`clamd`) als Dienst im Compose** | Hetzner-VM (Produktion, §5.2) | VM mit **8 GB** statt 4 GB RAM; Mehrkosten je nach verfügbarem Tarif ca. **3–15 €/Monat** (live prüfen, §2.1) | zusätzlich Signatur-Erkennung bekannter Schadsoftware (inkl. PDF-Malware), tägliche Updates über `freshclam` | **Pflicht für Produktion (G1b)** – erfüllt F-055 „Virenscan jeder Datei vor Freigabe“ |
| C – ClamAV auf kleiner Extra-VM für einen Vercel-Betrieb | Hetzner-VM mit TLS + Token vor `clamd` | ~5–15 €/Monat + Betrieb (Updates, Überwachung) | wie B | nur falls die Produktion länger auf Vercel bliebe – nicht geplant |
| D – Scan-API eines EU-Anbieters (z. B. attachmentAV, widdix GmbH, EU-Endpunkt) | SaaS | Abo; API-Preise nicht öffentlich bestätigt (Plugin-Tarif ab ~58 €/Jahr für 1 000 Scans/Monat ist nicht direkt vergleichbar) | wie B, ohne eigenen Betrieb; **Datei verlässt unseren Speicher** → AVV, Unterauftragsverarbeiter (AWS?) prüfen | Rückfalloption, falls B nicht gewollt |
| E – Cloudflare-Upload-Scan (WAF „Content Scanning“) | – | Enterprise-Zusatz | greift nur für Anfragen über den Cloudflare-Proxy, **nicht** für Direkt-Uploads in R2 | ungeeignet |
| F – VirusTotal & Co. | – | – | hochgeladene Dateien werden mit Dritten geteilt | **ausgeschlossen** (Tickets enthalten Namen + Buchungscodes) |

**Risiko-Bewertung (Betriebssicht):** Hochladen dürfen nur eingeladene Mitglieder einer Reise; Empfänger sind dieselbe kleine Gruppe. Hauptgefahren sind (1) eine als Ticket getarnte ausführbare Datei, (2) ein präpariertes PDF, (3) ein präpariertes Bild, (4) HTML/SVG für XSS. (1), (3), (4) deckt Stufe 1 vollständig ab; (2) zum größten Teil (aktive Inhalte werden abgelehnt), offen bleiben Exploits in PDF-Parsern ohne aktive Inhalte – die auch ein Signatur-Scanner nur erkennt, wenn sie bekannt sind.
- **Vorschau (nur Fantasie-Dateien):** Stufe 1 genügt. Risiko **niedrig**.
- **Freundes-Beta (echte Tickets, ≤ 50 Konten, Bekannte):** Stufe 1 genügt **mit dokumentiertem Restrisiko** (compliance §13). Risiko **niedrig bis mittel** – vor allem bei einem übernommenen Konto.
- **Produktion (unbekannte Gruppen, Einladungslinks):** Stufe 1 **+ ClamAV (B)**. Ohne Signatur-Scan **nicht** freigeben (Startschutz §0.13.6).

#### 0.13.3 EXIF-Entfernung und HEIC – wo und womit

| Schritt | Ort | Bibliothek (Lizenz) | Zweck |
|---|---|---|---|
| HEIC/HEIF → JPEG | **Browser vor dem Upload** (Web Worker, nur bei Bedarf nachladen) | `heic-to` (LGPL-3.0, enthält libheif 1.23 als WebAssembly; Einstieg `heic-to/csp` ohne `unsafe-eval` für die strikte CSP §0.9) – Alternative `heic2any` (MIT, älter, nur Ansicht) | Server muss kein HEIC dekodieren: die vorkompilierten `sharp`-Binärdateien enthalten **kein** HEIC (Patent-Lage). iOS Safari wandelt Fotos bei passendem `accept` (`image/jpeg,image/png,application/pdf`) oft schon selbst in JPEG um – **im Gerätetest prüfen** |
| Bilder verkleinern (optional, z. B. längste Kante 3 000 px) | Browser | Canvas / `createImageBitmap` | spart Upload-Volumen auf dem Handy; **keine** Sicherheitsfunktion |
| **Metadaten entfernen + neu kodieren (maßgeblich)** | **Server** (Funktion nach dem Upload) | `sharp` (Apache-2.0, libvips LGPL; auf Vercel lauffähig, Next.js nutzt es bereits) | `sharp(buf, { limitInputPixels: 50_000_000 }).rotate()` (Ausrichtung anwenden, dann EXIF weg) → `.jpeg({ quality: 85, mozjpeg: true })` bzw. `.png()`; `sharp` übernimmt Metadaten nur mit `withMetadata()` → **nicht** aufrufen. Der Server vertraut dem Browser nie: auch „schon umgewandelte“ Bilder werden neu kodiert |
| HEIC kommt trotzdem beim Server an | Server | – | ablehnen mit Hinweis «Bitte als JPG oder PDF hochladen» (Magic Bytes `ftypheic`/`ftypmif1`); serverseitige Umwandlung (`heic-convert`, LGPL, langsam) erst bei Bedarf |
| PDF | Server | `pdfjs-dist` (Apache-2.0, Node-„legacy“-Build) | **nicht** umschreiben (Tickets könnten kaputtgehen), nur prüfen: lässt sich öffnen (Besitzer-Passwort ok, **Öffnen-Passwort → ablehnen**), keine JavaScript-Aktionen, keine Anhänge, kein XFA; zusätzlich Rohdaten nach `/JavaScript`, `/JS`, `/Launch`, `/EmbeddedFile`, `/RichMedia`, `/XFA` durchsuchen. PDFs haben keine EXIF-Daten; XMP-Metadaten (Autor, Programm) bleiben – vertretbar |
| Dateityp | Server | `file-type` (MIT) | Prüfung über Inhalt, nicht über Endung oder `Content-Type` des Browsers |

Lizenzhinweise (`heic-to` LGPL, `sharp`/libvips, `pdfjs-dist`, `file-type`, AWS-SDK bzw. `aws4fetch`) auf der Lizenzseite (F-051) nachtragen; `heic-to` als eigener, dynamisch geladener Chunk (LGPL-Austauschbarkeit).

#### 0.13.4 Technische Vorgaben (Umsetzung: Developer, Inkrement 12)

1. **Ein Speicher-Modul, zwei Treiber:** `s3` (jeder S3-kompatible Speicher: R2, Hetzner, Scaleway) und `fs` (lokales Verzeichnis; nur `development`, `ci`, `demo` – bildet vorsignierte URLs über eine eigene, HMAC-signierte, kurzlebige Route nach, damit der Ablauf identisch bleibt). **Kein** Vercel-Blob-Treiber. Signieren mit `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (Apache-2.0) oder dem schlanken `aws4fetch` (MIT).
2. **Upload anfordern** (Server-Aktion/Route): Login, Mitgliedschaft, Phase 3, Rate-Limit (z. B. 30/h je Konto, 100/Tag je Reise); erklärter Typ in der Whitelist, erklärte Größe ≤ 10 MB; **Kontingent reservieren** (≤ 100 MB, ≤ 50 Dateien je Reise, in einer Transaktion mit Sperre auf der Reise, „wird geprüft“ zählt mit). Datensatz `status = pending`, Objekt-Schlüssel `incoming/<tripId>/<documentId>` (**keine Dateinamen, keine Personennamen im Schlüssel**). Antwort: vorsignierte **PUT**-URL, gültig **5 Min.**, mit **signiertem `Content-Length` und `Content-Type`** – der Speicher weist abweichende Größen ab.
3. **Browser** lädt direkt hoch (`fetch(url, { method: "PUT", body })`, Fortschritt über `XMLHttpRequest`), danach „Fertig melden“.
4. **Prüfen** (Route mit `maxDuration` 60 s): `HEAD` (Größe = reserviert), Datei serverseitig holen (≤ 10 MB im Speicher), **Schutzpaket Stufe 1** (Magic Bytes → Bild neu kodieren bzw. PDF prüfen, §0.13.3), falls `FILES_SCAN=clamav`: an `clamd` (`INSTREAM`) – Fund oder Scanner nicht erreichbar → **ablehnen** (fail closed, Hinweis «Konnte nicht geprüft werden – bitte später erneut»). Ergebnis als `files/<tripId>/<documentId>` schreiben, mit festem `Content-Type` und `Content-Disposition` (Dateiname aus dem Titel, ASCII-sicher + `filename*`), `incoming/…` löschen, `status = ready`. Bei Ablehnung Objekt sofort löschen, Reservierung freigeben, `status = rejected` mit Grund-Kategorie (ohne Inhalte).
5. **Ansehen/Herunterladen:** Route prüft bei **jedem** Aufruf Login, Mitgliedschaft und Sichtbarkeit (alle / ausgewählte Personen) und antwortet mit **302 auf eine vorsignierte GET-URL, gültig ≤ 60 s**, `Cache-Control: no-store`, `Referrer-Policy: no-referrer`. Die Datei kommt damit von der **Speicher-Origin**, nie von der App-Origin → selbst ein präpariertes Dokument kann keine Skripte im Kontext der App ausführen. „Ansehen“ = `response-content-disposition=inline`, „Herunterladen“ = `attachment`. Hinweis: `X-Content-Type-Options`/CSP-Sandbox lassen sich bei vorsignierten URLs nicht setzen – durch die fremde Origin und den fest gesetzten Typ abgedeckt (Abweichung von F-055 „Antwort-Header“, Reviewer bestätigt).
6. **Vorschaubilder** in Listen: nur über vorsignierte GET-URLs (≤ 5 Min.) → CSP `img-src` um die Speicher-Origin ergänzen; bei CSP Stufe 2 (§0.9, OPS-14) zusätzlich `connect-src` für den Upload. Service Worker (§0.12.6) cacht **nichts** von der Speicher-Origin.
7. **Bucket-Regeln:** privat, kein öffentlicher Zugriff (R2: keine `r2.dev`-Adresse, keine eigene Domain), **keine Versionierung** (Löschen muss wirklich löschen), CORS nur für `APP_URL` (Methoden `PUT`, `GET`, `HEAD`; Header `content-type`; `MaxAgeSeconds` 3600), Lifecycle: `incoming/` nach **1 Tag** löschen (Abbrüche), unvollständige Multipart-Uploads nach 1 Tag (R2-Standard: 7 Tage); nur in der Vorschau zusätzlich **alles nach 60 Tagen**.
8. **Löschen:** sofort beim Löschen durch Hochladende/Orga (DB + Objekt), beim Verlassen (Abfrage laut F-055), mit Reise/Konto; Löschjob (§0.10) neu: Unterlagen **30 Tage nach Reiseende** (Zeitzone `APP_TIME_ZONE`), Hinweis im Cockpit vorher (F-055); **Abgleich** einmal pro Lauf: Objekte ohne Datensatz und `pending`-Datensätze > 24 h entfernen. Löschen im Speicher idempotent; scheitert es, bleibt ein Lösch-Auftrag in der DB und wird im nächsten Lauf wiederholt. „Demo zurücksetzen“ leert den Bucket-Präfix.
9. **Keine Backups der Dateien** (bewusst): Unterlagen werden nicht gesichert – sie liegen bei den Nutzern ohnehin in den Buchungsmails; das macht die Löschfristen ohne Backup-Nachlauf einhaltbar. In der Hilfe/Datenschutzerklärung so formulieren.
10. **Logs:** nur Zähler (`documents.upload ok/rejected:<kategorie>`, `documents.download ok/denied`, `documents.retention purged=n`) – **keine** Dateinamen, Titel, Schlüssel mit Personenbezug, vorsignierten URLs (enthalten Signaturen!), Reisenamen.
11. **Abnahme (Reviewer):** Upload > 10 MB scheitert am Speicher (nicht nur im Browser); Kontingent-Wettlauf (zwei gleichzeitige Uploads); fremde Reise/ausgeschlossene Person → 404; URL nach 60 s ungültig; EXIF/GPS nach Upload weg (Testbild mit GPS); `.exe` umbenannt in `.pdf` → abgelehnt; PDF mit JavaScript → abgelehnt; HTML/SVG → abgelehnt; Löschjob mit verschobener Uhr; Objekte nach Löschung tatsächlich weg (`HEAD` → 404). **Vor dem Einschalten in der Beta/Produktion:** ca. 20 echte Ticket-PDFs aus dem eigenen Postfach des Auftraggebers lokal durch die PDF-Prüfung schicken (Ablehnungsquote ≈ 0 %?).

#### 0.13.5 Empfehlung je Umgebung

| Umgebung | Speicher | Virenscan | Dateien | Kosten/Monat | Auftraggeber legt an |
|---|---|---|---|---|---|
| **Lokal / CI / Docker-Demo** | Treiber `fs` (Docker-Volume), Tests des `s3`-Treibers gegen einen S3-Emulator im CI (z. B. `adobe/s3mock`, Apache-2.0; MinIO-Community-Images werden nicht mehr gepflegt – nicht einplanen) | Stufe 1 | Fantasie-Dateien aus dem Demo-Seed (Designer: 3–4 Tickets mit „DEMO“-Wasserzeichen) | 0 € | nichts |
| **Private Vorschau** (Vercel + Neon, nur Fantasie-Dateien) | **Cloudflare R2, Bucket `wir-wollen-weg-preview`, Jurisdiktion EU** | Stufe 1 | Fantasie-Dateien; Hinweis «Demo – bitte nur Beispiel-Dateien hochladen» nicht wegklickbar; Lifecycle „alles nach 60 Tagen“ | **0 €** (Free-Kontingent; selbst 50 Reisen × 100 MB = 5 GB) | Cloudflare-Konto mit 2FA, R2 aktivieren (Zahlungsmittel), Bucket + CORS + Lifecycle, API-Token „Object Read & Write“ **nur für diesen Bucket**, 5 Werte als Vercel-Variablen (§0.13.6) – Klick-Anleitung folgt mit Inkrement 12 in vorschau-anleitung.md |
| **Freundes-Beta G0** (echte Tickets, ≤ 50 Konten) | Standard: **`DOCUMENTS_ENABLED=false`** – Unterlagen wie Reisedaten **aus** (Gate G1b: echte Dateien erst auf EU-Hosting, PRD §6b; Inkrement 12 kommt ohnehin nach dem Beta-Start). **Nur falls der Auftraggeber eine Ausnahme beschließt (E-G0-10, Option B):** zweiter R2-Bucket `wir-wollen-weg-beta` (EU) mit eigenem Token – oder Scaleway (EU-Unternehmen), wenn kein weiterer US-Anbieter gewünscht ist | Stufe 1, Restrisiko dokumentiert | echte Tickets (Namen, Buchungscodes) | **0 €** (R2) bzw. < 0,10 € (Scaleway) | bei Option B: zweiter Bucket + Token (bzw. Scaleway-Konto), Variablen im Beta-Projekt; Ergänzung Beta-Datenschutzhinweis (compliance §13.7) |
| **Produktion (G1 + G1b)** | **Hetzner Object Storage**, Standort wie die VM (Falkenstein/Nürnberg), eigenes Projekt bzw. eigener Bucket `wir-wollen-weg-files`, getrennt vom Backup-Ziel | Stufe 1 **+ ClamAV** (`clamd` im Compose, `freshclam` täglich), fail closed | echte Dateien | **6,49 €** Object Storage + **~3–15 €** größere VM für ClamAV (8 GB RAM) ≈ **10–22 €** zusätzlich | im Rahmen von OPS-1: Object Storage aktivieren, Bucket privat anlegen, S3-Zugangsschlüssel (in `/opt/wir-wollen-weg/production/.env`, nie ins Repo), AVV ist der Hetzner-AVV; VM-Größe mit ClamAV einplanen |

**Warum nicht gleich überall Hetzner?** 6,49 € Grundgebühr ab dem ersten Bucket und ein weiteres Konto widersprechen dem Arbeitsmodus Q25 (keine kostenpflichtigen Konten bis Go-Live); R2 kostet in der Vorschau nichts und nutzt **denselben S3-Code** – der Wechsel zu Hetzner ist nur ein Tausch von Endpunkt und Schlüsseln.

#### 0.13.6 Umgebungsvariablen und Startschutz (Erweiterung `src/lib/app-env.ts`, wie §0.11.3)

| `APP_ENV` | `DOCUMENTS_ENABLED` leer = | darf `true`? | `FILES_STORAGE` | `FILES_SCAN` |
|---|---|---|---|---|
| `development`, `ci`, `demo` | an | ja | `fs` (Standard) oder `s3` | `basic` (Standard) oder `clamav` |
| `preview` | an | ja | **nur `s3`** (auf Vercel ist das Dateisystem flüchtig – `fs` bei gesetztem `VERCEL` → Start verweigert) | `basic` |
| `beta` | **aus** | nur nach Entscheidung E-G0-10 = B (organisatorisch, wie G1b) | nur `s3` | `basic` erlaubt |
| `staging` | aus | ja (synthetische Dateien) | nur `s3` | `clamav` empfohlen |
| `production` | **aus** | **erst nach G1b-Abnahme** | nur `s3` | **nur `clamav`** – sonst Start verweigert |

Ungültige Werte → Start verweigert. Bereich „aus“: keine Station/Kachel, Routen 404, bestehende Dateien werden nicht angezeigt, aber vom Löschjob weiter fristgerecht gelöscht (braucht dafür Speicher-Zugang).

Neue Variablen (§4): `DOCUMENTS_ENABLED`, `FILES_STORAGE`, `FILES_FS_DIR`, `FILES_S3_ENDPOINT`, `FILES_S3_REGION`, `FILES_S3_BUCKET`, `FILES_S3_ACCESS_KEY_ID`, `FILES_S3_SECRET_ACCESS_KEY`, `FILES_SCAN`, `CLAMAV_HOST`, `CLAMAV_PORT`. Werte für die Vorschau (Beispiel mit Platzhaltern, **keine echten Werte**): `FILES_S3_ENDPOINT=https://<ACCOUNT_ID>.eu.r2.cloudflarestorage.com`, `FILES_S3_REGION=auto`, `FILES_S3_BUCKET=wir-wollen-weg-preview`; Hetzner: `FILES_S3_ENDPOINT=https://fsn1.your-objectstorage.com`, `FILES_S3_REGION=fsn1`.

#### 0.13.7 Risiken und offene Punkte

| Risiko | Bewertung / Maßnahme |
|---|---|
| R2 ohne harte Kostenbremse, Zahlungsmittel hinterlegt | Kontingent je Reise (100 MB) + Rate-Limits + Vorschau-Lifecycle 60 Tage halten den Verbrauch weit unter 10 GB; Auftraggeber prüft monatlich das R2-Dashboard |
| Cloudflare = US-Unternehmen (CLOUD Act), trotz EU-Speicherort | für Fantasie-Dateien (Vorschau) unerheblich; für echte Tickets nur per Ausnahme E-G0-10 B – oder Scaleway; Produktion ohnehin Hetzner |
| Hetzner: Verschlüsselung at rest, CORS-/Presign-Details, projektweite Schlüssel nicht abschließend belegt | vor G1b am echten Bucket prüfen (Testskript: vorsigniertes PUT mit falscher Länge → 403, CORS-Preflight, Lifecycle); falls keine Verschlüsselung at rest: SSE-C oder Hinweis in den TOM (compliance §7) |
| PDF-Prüfung lehnt echte Tickets ab (z. B. Formularfelder, Druck-Skripte) | Testlauf mit ~20 echten Ticket-PDFs vor dem Einschalten; Fehlermeldung mit Ausweg «als Bild/Screenshot hochladen» |
| Vorsignierte URLs könnten weitergeleitet werden | Gültigkeit ≤ 60 s, nur nach Prüfung erzeugt, nie geloggt |
| Hetzner-Preise 2026 zweimal angepasst | vor Bestellung live prüfen; Ausweichoptionen Scaleway/IONOS mit identischem S3-Code |
| Rechtsrahmen Dateien (DSA-Meldeweg, Nutzungsbedingungen, Datenschutz-Abschnitt) | compliance §12.8 (G1b) bzw. §13.7 (G0) |

**Quellen §0.13 (Abruf 2026-10-23, über Websuche – Anbieterseiten aus der Arbeitsumgebung nicht direkt abrufbar):**
- Cloudflare R2: [Preise/Free-Tier (Zusammenfassung)](https://nubbo.app/blog/cloudflare-r2-free-tier/), [Cloudflare Pläne](https://www.cloudflare.com/plans.md), [Datenstandort/Jurisdiktion](https://developers.cloudflare.com/r2/reference/data-location/index.md), [SimpleBackups – EU-Endpunkt](https://simplebackups.com/docs/storage-providers/cloudflare-r2.md), [Vorsignierte URLs](https://developers.cloudflare.com/r2/data-access/s3-api/presigned-urls/), [CORS](https://developers.cloudflare.com/r2/buckets/cors), [Lifecycle](https://developers.cloudflare.com/r2/buckets/object-lifecycles), [Zahlungsmittel beim Aktivieren](https://tech-insider.org/how-to-set-up-cloudflare-r2-2026/), [Cloudflare DPA](https://www.cloudflare.com/dpa), [DPA bei Self-Serve (donneespersonnelles.fr)](https://donneespersonnelles.fr/cloudflare-rgpd)
- Hetzner Object Storage: [Preise (Sliplane, 2026)](https://sliplane.io/blog/cheap-object-storage-providers-europe), [Preiserhöhung 1.4.2026 (agentdeals)](https://agentdeals.dev/hetzner-pricing-2026), [Hetzner-Preisseite](https://www.hetzner.com/storage/object-storage/pricing/), [Hetzner Docs Object Storage](https://docs.hetzner.com/storage/object-storage)
- Scaleway: [Preise Storage](https://www.scaleway.com/en/pricing/storage), [FAQ Object Storage](https://scaleway.com/en/docs/faq/objectstorage)
- Vercel Blob: [Usage & Pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing), [Private Blob GA](https://vercel.com/changelog/vercel-private-blob-is-now-generally-available), [Regionen](https://vercel.com/changelog/vercel-blob-now-available-in-all-vercel-regions)
- Neon: [Free-Plan 1 GB je Projekt](https://neon.com/blog/neon-free-plan-1-gb-per-project), [Changelog 2026-10-02](https://neon.com/docs/changelog/2026-10-02)
- Backblaze B2: [Upstash – B2-Preise Okt. 2026](https://upstash.com/blog/backblaze-b2-pricing-explained-2026) · IONOS: [Preismodell S3](https://docs.ionos.com/cloud/storage-and-backup/s3-object-storage/overview/pricing)
- Virenscan: [ClamAV in Docker (RAM)](https://docs.clamav.net/manual/Installing/Docker.html), [attachmentAV SDK (EU-Endpunkt)](https://cdn.jsdelivr.net/npm/@attachmentav/virus-scan-sdk-ts@0.8.0/README.md), [attachmentAV Preise (WP-Plugin)](https://wpmayor.com/discover-attachmentav-for-wordpress/)
- Bilder/HEIC: [sharp – kein HEIC in vorkompilierten Binärdateien](https://github.com/lovell/sharp/issues/2004), [heic-to](https://cdn.jsdelivr.net/npm/heic-to@1.6.6/README.md), [heic2any](https://npmjs.com/package/heic2any)

---

> **Ab hier: Plan ab Go-Live.** §1–§7 beschreiben den Zielbetrieb (Hetzner, Lettermint, Domain). Nichts davon wird vor Freigabe des [Go-Live-Gates](go-live.md) bestellt oder eingerichtet.

## 1. Grundsätze (ab Go-Live)

- **Alle personenbezogenen Daten bleiben in der EU** bei EU-Anbietern ohne US-Mutter (App, DB, Backups, Mails, Fehler-Tracking). Damit entfällt die Drittland-Bewertung (Art. 44 ff. DSGVO) für den Kernbetrieb.
- **Einfach vor elastisch:** eine VM mit Docker Compose reicht für das MVP um Größenordnungen (max. 30 Personen pro Reise, wenige tausend Nutzer). Kein Kubernetes, keine Serverless-Funktionen.
- **Build once, deploy many:** ein Container-Image pro Commit, identisch für Staging und Produktion; Unterschiede nur über Umgebungsvariablen.
- **Keine Secrets im Repo.** Im Repo nur `.env.example` mit Namen und Platzhaltern.

## 2. Hosting & Kosten (ab Go-Live)

> Während der Offline-Demo: **0 € laufende Kosten** (§0). Die folgenden Kosten fallen erst nach Freigabe des [Go-Live-Gates](go-live.md) an.

### 2.1 Optionen (App + Datenbank)

| Option | Sitz / Drittland | Betrieb | Kosten MVP/Monat (netto, ca.) | Bewertung |
|---|---|---|---|---|
| **A: Hetzner Cloud (Nürnberg/Falkenstein), 1 VM mit Docker Compose (App, PostgreSQL, Caddy, Bugsink)** | DE, kein Drittland | VM-Updates, Backups selbst (automatisierbar) | VM **CX23** (2 vCPU/4 GB) ca. 5,50–6 € *falls bestellbar*, sonst **CPX22** (2 vCPU/4 GB) ca. 19,50 € + IPv4 0,50 € · Server-Backups +20 % · Object Storage ab ca. 5–6,50 € | **Empfehlung** |
| B: Netcup VPS 1000 G12 (Nürnberg/Wien) | DE, kein Drittland | wie A | ca. 10,40 € inkl. USt (4 vCore/8 GB, lt. Sekundärquelle) | gute Sparalternative, weniger API/Ökosystem |
| C: Scaleway (Paris): Instance DEV1-S + **Managed PostgreSQL** DB-DEV-S | FR, kein Drittland | DB gemanagt (Backups, Updates) | DEV1-S ca. 6,55 € + IPv4 ca. 2,92 € + DB ca. 11,40 € + Storage → ca. **22–25 €** | gute Alternative, wenn keine DB selbst betrieben werden soll |
| D: Scaleway Serverless Containers + Managed PostgreSQL | FR | fast kein Server-Betrieb | nutzungsabhängig + DB ca. 11,40 € | möglich; Kaltstarts beachten |
| E: Vercel / Netlify (EU-Region) | US-Unternehmen → Drittlandbezug (DPF/SCC, CLOUD Act) | sehr bequem | Hobby-Plan nicht kommerziell; Pro ca. 20 $/Nutzer + DB extern | **nein** – widerspricht PRD „Hosting in der EU“ |
| F: Fly.io / Railway / Render (EU-Regionen) | US-Unternehmen | bequem | ca. 5–25 $ + DB | nein – Drittland |
| G: Supabase / Neon (EU-Region) als DB | US-Unternehmen, Rechenzentren in der EU | DB gemanagt | Free-Tiers, sonst ab ca. 19–25 $ | nein für personenbezogene Kerndaten |

**Empfehlung: Option A (Hetzner, Deutschland).** Deutscher Anbieter, AVV per Klick in der Console, günstig, Snapshots/Backups und Object Storage aus einer Hand, große Community. Fallback bei fehlender Verfügbarkeit/Preissprung: **Option C (Scaleway)** – der Stack ist identisch (Docker), nur die DB wird gemanagt.

### 2.2 Monatliche Kosten MVP (Empfehlung)

| Posten | Empfehlung | Sparvariante |
|---|---|---|
| VM (prod + staging auf einer VM) | Hetzner CPX22: ~20,00 € | Hetzner CX23 (falls verfügbar) ~6,00 € oder Netcup ~9 € |
| Server-Backups (7 tägliche Images, +20 %) | ~4,00 € | ~1,20 € |
| Off-site-Datenbank-Backups (Object Storage) | Hetzner Object Storage ~5–6,50 € *oder* Scaleway Object Storage (nutzungsabhängig, < 1 €) | < 1 € |
| **Ab G1b: Reiseunterlagen** (§0.13) – Object Storage für Dateien + ClamAV (VM mit 8 GB RAM statt 4 GB) | Hetzner Object Storage 6,49 € (eigener Bucket, getrennt vom Backup-Ziel §6.1) + VM-Aufpreis ~3–15 € | Scaleway Object Storage < 1 € + VM-Aufpreis |
| Transaktionsmails | Lettermint Starter 10 € (Beta: Free-Plan 0 €) | Scaleway TEM < 1 € |
| Domain (.de) | ~1 € (umgelegt) | ~1 € |
| Postfach für Kontakt/Impressum/DMARC | ~1–3 € (z. B. mailbox.org, Posteo) | ~1 € |
| Fehler-Tracking (Bugsink selbst gehostet) | 0 € | 0 € |
| Uptime-Monitoring (externer Dienst, Free-Plan) | 0 € | 0 € |
| **Summe** | **ca. 30–40 €/Monat** (+ ca. 10–22 € ab G1b, §0.13.5) | **ca. 10–15 €/Monat** (+ ca. 4–16 € ab G1b) |

Einmalig/jährlich (nicht enthalten): Rechtstexte (Generator-Abo oder anwaltliche Prüfung, siehe compliance-checklist.md), ggf. Impressums-/Geschäftsadresse, Apple-Developer-Account erst für „Sign in with Apple“ in v1 (99 $/Jahr).

Skalierung: Bei > 70 % CPU/RAM-Auslastung über Tage → größere VM (Hetzner: Rescale in Minuten) oder DB auf eigene VM/Managed DB auslagern.

## 3. Umgebungen

| Umgebung | Zweck | Wo | Daten | Mails | Zugriff |
|---|---|---|---|---|---|
| **preview** (seit 2026-10-20, PRD Q25) | private Online-Vorschau ohne Download | Vercel Hobby (`fra1`) + Neon Free (Frankfurt), §0.7 | synthetisch (Seed beim ersten Build, „Demo zurücksetzen“) | Demo-Postfach `/demo/postfach` (`MAIL_TRANSPORT=inbox`) | HTTP-Basic-Auth vor allem (`PREVIEW_ACCESS_PASSWORD`), `noindex` |
| **beta** *(Gate G0, geplant – §0.12)* | geschlossene Freundes-Beta mit echten Daten, als PWA auf dem iPhone | Vercel Hobby, **eigenes** Projekt `wir-wollen-weg-beta` (Branch `beta`, `fra1`) + **eigenes** Neon-Projekt (Frankfurt), `app.<domain>` | **echt** (Freundeskreis), kein Seed; Reisedaten F-054 aus | Lettermint (SMTP), `login@mail.<domain>` | öffentlich erreichbar, **Beta-Code bei der Registrierung**, `noindex`, Kontenobergrenze |
| **demo** (aktuell) | Vorführung, Handy-Test im WLAN | Laptop: `docker compose -f docker/compose.demo.yml` (App-Prod-Build + PostgreSQL + Mailpit), §0 | synthetisch (`db:seed:demo`) | Mailpit (`:8025`) | lokal/WLAN; optional kurzzeitig per Tunnel (§0.5) |
| **dev** | lokale Entwicklung | Laptop/Cloud-Session: `docker compose -f docker/compose.dev.yml up` (PostgreSQL 18 + Mailpit), App per `pnpm dev` | synthetisch (Seed-Skript) | Mailpit (`localhost:8025`) | lokal |
| **ci** | automatische Prüfung | GitHub Actions, Service-Container | synthetisch, flüchtig | Mailpit | – |
| **staging** *(ab Go-Live-Gate Stufe 1)* | Abnahme durch Reviewer/CEO/Auftraggeber, Test auf echten Handys (In-App-Browser) | gleiche VM, eigenes Compose-Projekt, `staging.<domain>`, eigene DB | synthetisch, **keine echten Nutzerdaten** | Mailpit-Web-UI hinter Passwort (Tester lesen Codes dort) | HTTP-Basic-Auth vor allem außer `/i/*`-Testlinks; `noindex` |
| **prod** *(ab Go-Live-Gate Stufe 2)* | Beta (M1) und Launch (M2) | `<domain>` | echte Daten | Lettermint | öffentlich |

Keine Preview-Umgebung pro Pull Request im MVP (Kosten, Aufwand, Datenschutz). Bei Bedarf später: kurzlebige Compose-Projekte auf der Staging-VM.

## 4. Umgebungsvariablen (nur Namen – Werte nie ins Repo)

Ablage: Produktion/Staging als Datei `/opt/wir-wollen-weg/<env>/.env` (Rechte `600`, Eigentümer Deploy-Nutzer), Deploy-Zugänge als **GitHub Environment Secrets** (`staging`, `production`, Produktion mit manueller Freigabe). Lokal `.env.local` (in `.gitignore`).

| Variable | Pflicht | Beschreibung | Beispiel/Platzhalter in `.env.example` |
|---|---|---|---|
| `NODE_ENV` | ja | `production` in demo/staging/prod | `development` |
| `APP_ENV` | ja | `development` \| `ci` \| `demo` \| `staging` \| `preview` \| `beta` (Freundes-Beta, §0.12) \| `production` (steuert Mail-Transport, noindex, Logging, Demo-Banner, Zugangsschutz, Startschutz §0.6). Auf Vercel ohne Wert: `preview` | `development` |
| `APP_URL` | ja | öffentliche Basis-URL ohne Slash am Ende; `preview`/`staging`/`production` nur mit `https://` (R-064). Auf Vercel ohne Wert: `https://$VERCEL_PROJECT_PRODUCTION_URL` | `http://localhost:3000` |
| `APP_TIME_ZONE` | nein | IANA-Zeitzone, die „heute“ für Reisen bestimmt (Countdown, Phasen, Fristen, Abreisetag-Feier – R-072). Leer/ungültig = `Europe/Berlin`. Wird beim **Build** eingelesen (auch für den Browser) – Änderung erst nach neuem Build/Deployment wirksam. Später ggf. Zeitzone pro Reise | leer |
| `PREVIEW_ACCESS_PASSWORD` | nur preview | Passwort der HTTP-Basic-Auth (≥ 10 Zeichen, Benutzername beliebig); fehlt es, startet die Vorschau nicht bzw. antwortet 503 (§0.7) | leer |
| `BETA_ACCESS_CODES` | nur beta (Pflicht) | Beta-Code(s) für **neue** Konten: 1–5, kommagetrennt, erster = aktueller, je ≥ 12 Zeichen nach Normalisierung; Vergleich zeitkonstant, Rate-Limit (§0.12.5). Nie ins Repo/Log | leer |
| `BETA_MAX_ACCOUNTS` | nein | nur beta: Obergrenze Konten (Standard 50), gilt für `/beta` **und** Einladungsweg | leer |
| `BETA_INVITE_SIGNUP` | nein | nur beta, nur Variante B (§0.12.5 Nr. 9): `false` = Notschalter, Einladungslink ersetzt den Beta-Code nicht mehr | leer (= `true`) |
| `FEEDBACK_WHATSAPP_NUMBER` | nein | nur beta: Ziffern der WhatsApp-Nummer des Auftraggebers für „Feedback geben“ (W23 D.2); nie ins Repo | leer (Taste aus) |
| `FEEDBACK_EMAIL` | nein | nur beta: Adresse für „Feedback geben“ per Mail; nie ins Repo | leer (Taste aus) |
| `LEGAL_OPERATOR_NAME` | nur beta (Pflicht); ab G1 durch echte Rechtstexte ersetzt | Name des Verantwortlichen im Beta-Datenschutzhinweis/Kontaktseite – absichtlich als Env-Variable, weil das Repository öffentlich ist | leer |
| `PWA_SW_ENABLED` | nein | Service Worker (App-Shell + Offline-Hinweis) in `beta`/`production` an; `false` = Notschalter, `/sw.js` meldet sich selbst ab (§0.12.6) | leer |
| `DATABASE_URL` | ja | PostgreSQL-Verbindung (Neon: Pooled-Endpunkt `…-pooler…`) | `postgres://app:app@localhost:5432/wirwollenweg` |
| `DATABASE_URL_UNPOOLED` | nein | Neon (preview): direkte Verbindung – Migrationen und Seed nutzen sie, wenn gesetzt | – |
| `DATABASE_POOL_MAX` | nein | Verbindungen pro Server-Instanz (Standard 10, auf Vercel 3) | leer |
| `POSTGRES_PASSWORD` | ja (Compose) | Passwort des DB-Containers | `change-me` |
| `BETTER_AUTH_SECRET` | ja | ≥ 32 Byte Zufall (Signatur/Verschlüsselung von Cookies/Tokens; per HKDF abgeleitet auch HMAC-Schlüssel der Limits pro E-Mail, tech-stack.md §3.2); je Umgebung verschieden. **Fehlt es außerhalb von `APP_ENV` `development`/`ci`, bricht der Start ab** (R-028) | `generate-with-openssl-rand-base64-32` |
| `BETTER_AUTH_URL` | ja | = `APP_URL` | `http://localhost:3000` |
| `AUTH_TRUSTED_ORIGINS` | nein | zusätzliche erlaubte Origins (kommagetrennt) | – |
| `AUTH_IP_HEADER` | nein | Header mit der Client-IP für Rate-Limits; muss vom vorgeschalteten Proxy **überschrieben** werden (R-005, §0.1). Caddy (Demo, staging, prod): `x-forwarded-for`; Cloudflare-Tunnel: `cf-connecting-ip` | `x-forwarded-for` |
| `AUTH_TRUSTED_PROXIES` | nein | IPs/CIDRs vorgelagerter Proxys, deren Einträge im Header von rechts übersprungen werden (nur bei Proxy-Ketten, z. B. CDN → Caddy); ungültige Einträge → Fehler | leer |
| `DEMO_BIND_ADDRESS` | nur demo | Host-Adresse der Demo-Ports (`0.0.0.0` WLAN-Test, `127.0.0.1` nur Laptop/Tunnel) | `0.0.0.0` |
| `MAIL_TRANSPORT` | ja | `smtp` (Standard) \| `inbox` (nur Vorschau/Demo: Mails in Tabelle `demo_mail`, Anzeige `/demo/postfach`; in `production` verboten, §0.7) | `smtp` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE` | ja | SMTP des Mail-Anbieters bzw. Mailpit | `localhost`, `1025`, leer, leer, `false` |
| `MAIL_FROM` | ja | Absenderadresse | `login@mail.example.org` |
| `MAIL_FROM_NAME_DE`, `MAIL_FROM_NAME_EN` | ja | Absendername je Sprache | `Wir wollen weg`, `Wir wollen weg` |
| `MAIL_REPLY_TO` | ja | Antwortadresse (Kontaktpostfach) | `hallo@example.org` |
| `MAIL_WEBHOOK_SECRET` | nein | Signaturprüfung Bounce-/Beschwerde-Webhook | – |
| `SENTRY_DSN` | nein | DSN des Bugsink-Projekts (leer = aus) | – |
| `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE` | nein | Umgebung, Git-SHA | `development` |
| `LOG_LEVEL` | nein | `info` (prod), `debug` (dev) | `debug` |
| `RATE_LIMIT_ENABLED` | nein | in E2E-Tests gezielt abschaltbar (nie in prod); betrifft nur die IP-Limits – die Limits pro E-Mail-Adresse (Inkrement 1) sind immer aktiv | `true` |
| `PASSWORD_BREACH_CHECK` | nein | `hibp` = neue Passwörter zusätzlich online gegen „Have I Been Pwned“ prüfen (k-Anonymität, kein Konto nötig, fail-open); `off` = nur Offline-Liste. In der Offline-Demo `off`; vor Go-live entscheiden | `off` |
| `CONTACT_EMAIL` | ja (beta, Go-live) | Kontaktadresse auf der Hilfe-Seite (F-051) | `hallo@example.org` (Platzhalter) |
| `RETENTION_TOKEN` | ja (Go-live) | Bearer-Token für `POST /api/internal/retention` (tägliche Löschläufe F-013/F-043: alte Reisen, inaktive Konten, Hinweis-Mails; ab Inkrement 10 zusätzlich weich gelöschte Ausgaben > 24 h, §0.10). Ohne Wert ist der Endpunkt aus (404). **Operations: täglichen Timer einrichten** (z. B. systemd-Timer/cron mit `curl -fsS -X POST -H "Authorization: Bearer …" http://app:3000/api/internal/retention`); nachgetragen vom Developer (Inkrement 6) | leer (Demo: aus) |
| `TRAVEL_DATA_ENABLED` | nein | Feature-Schalter persönliche Reisedaten (F-054, Inkrement 11): `true` \| `false` \| leer = Standard der Umgebung (**an** in `development`/`ci`/`demo`/`preview`, **aus** in `staging`/`production`). In `production` erst nach dokumentierter **G1b-Abnahme** auf `true` (go-live.md). Ungültiger Wert → Start verweigert (§0.11.1) | leer |
| `TRAVEL_DATA_KEYS` | ja, wenn Reisedaten in `staging`/`production` an | Schlüsselring der Feldverschlüsselung (AES-256-GCM): `kid:base64(32 Byte)`, kommagetrennt, **erster Eintrag aktiv**; eigene Datei `secrets/travel-data.env`, getrennt von `DATABASE_URL` und Backups; fehlt er bei eingeschaltetem Bereich in `staging`/`production` → Start verweigert. In `development`/`ci`/`demo`/`preview` optional – sonst HKDF-Ableitung aus `BETTER_AUTH_SECRET` (Kennung `demo`), **Vercel braucht keine neue Variable**. Rotation `pnpm travel-data:rotate`, Runbooks §0.11 | leer (Kommentar: nie echte Werte) |
| *(keine neue Variable in Inkrement 9)* | – | Link-Vorschau/Bild-Proxy brauchen kein eigenes Secret: Schlüssel des (AES-256-GCM-verschlüsselten, R-076) Vorschau-Tokens per HKDF aus `BETTER_AUTH_SECRET` (§0.8) | – |
| `DOCUMENTS_ENABLED` | nein | Feature-Schalter Reiseunterlagen (F-055, Inkrement 12): `true` \| `false` \| leer = Standard der Umgebung (**an** in `development`/`ci`/`demo`/`preview`, **aus** in `beta`/`staging`/`production`). `beta` nur nach Entscheidung E-G0-10, `production` erst nach G1b und nur mit `FILES_SCAN=clamav`; ungültiger Wert → Start verweigert (§0.13.6) | leer |
| `FILES_STORAGE` | nein | `fs` (lokales Verzeichnis; nur `development`/`ci`/`demo`) \| `s3` (Pflicht auf Vercel und ab `staging`) | `fs` |
| `FILES_FS_DIR` | nur `fs` | Ablageverzeichnis (Docker-Demo: Volume) | `./.data/files` |
| `FILES_S3_ENDPOINT`, `FILES_S3_REGION`, `FILES_S3_BUCKET` | ja bei `s3` | S3-Endpunkt, Region, Bucket des **privaten** Unterlagen-Speichers – R2 (Vorschau): `https://<ACCOUNT_ID>.eu.r2.cloudflarestorage.com`, `auto`; Hetzner (Produktion): `https://<standort>.your-objectstorage.com`, `<standort>` (§0.13.5) | leer |
| `FILES_S3_ACCESS_KEY_ID`, `FILES_S3_SECRET_ACCESS_KEY` | ja bei `s3` | Zugangsschlüssel **nur für diesen Bucket** (R2: Token „Object Read & Write“, auf den Bucket beschränkt); je Umgebung eigener Schlüssel; nie ins Repo/Log | leer |
| `FILES_SCAN` | nein | `basic` (Schutzpaket Stufe 1: Magic Bytes, Neukodierung, PDF-Prüfung) \| `clamav` (zusätzlich `clamd`, fail closed); `production` nur `clamav` (§0.13.2) | `basic` |
| `CLAMAV_HOST`, `CLAMAV_PORT` | bei `clamav` | `clamd` im Compose-Netz (nicht veröffentlicht) | `clamav`, `3310` |
| `CRON_SECRET` | preview, beta | Vercel Cron ruft `GET /api/internal/retention` mit `Authorization: Bearer $CRON_SECRET` auf; wird wie `RETENTION_TOKEN` akzeptiert (≥ 32 Zeichen) | leer |
| `STAGING_BASIC_AUTH` | nur staging | Caddy-Basic-Auth (Hash) | – |
| `BACKUP_S3_ENDPOINT`, `BACKUP_S3_REGION`, `BACKUP_S3_BUCKET`, `BACKUP_S3_ACCESS_KEY_ID`, `BACKUP_S3_SECRET_ACCESS_KEY` | ja (prod) | Off-site-Backup-Ziel | – |
| `BACKUP_AGE_RECIPIENT` | ja (prod) | öffentlicher `age`-Schlüssel zur Verschlüsselung der Dumps (privater Schlüssel **offline** beim Betreiber) | – |
| *später v1:* `DATA_ENCRYPTION_KEYS` | v1.1 | Schlüsselring (AES-256-GCM) für Kalender-URLs/CalDAV-Passwörter (F-019, F-048) – gleiches Format wie `TRAVEL_DATA_KEYS`, aber **eigener** Ring (Trennung der Zwecke) | – |
| *später v1:* `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | v1.1 | Social Login (F-045) / Kalender (F-020) | – |
| *später v1:* `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | v1.1 | Sign in with Apple (F-045) | – |
| *später v1:* `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` | v1.2 | F-021 | – |
| *später:* Zahlungsanbieter-Schlüssel | Phase 3 | F-050 | – |

GitHub-Secrets für Deployment (Environment `staging`/`production`): `DEPLOY_SSH_HOST`, `DEPLOY_SSH_USER`, `DEPLOY_SSH_PRIVATE_KEY`, `DEPLOY_SSH_KNOWN_HOSTS`. Container-Registry: GitHub Container Registry mit dem automatischen `GITHUB_TOKEN` (Images enthalten keine personenbezogenen Daten).

Regeln: Secrets je Umgebung verschieden; Rotation bei Personalwechsel/Verdacht; `BETTER_AUTH_SECRET`-Rotation meldet alle Nutzer ab (bewusst einplanen) und macht in Demo/Vorschau die abgeleiteten Reisedaten-Freigaben unlesbar (→ „Demo zurücksetzen“, §0.11.2); `TRAVEL_DATA_KEYS` nur nach §0.11.6 rotieren (neuen Schlüssel voranstellen, nie einfach ersetzen – sonst Runbook A).

## 5. Deployment-Ablauf (ab Go-Live)

### 5.1 Server-Grundeinrichtung (einmalig, Runbook vor M1)
1. Hetzner-Projekt anlegen, **AVV in der Console abschließen**, 2FA für alle Konten.
2. VM (Ubuntu LTS) in DE mit SSH-Key, Hetzner-Firewall: nur 22 (auf feste IPs bzw. per Key), 80, 443. Server-Backups aktivieren.
3. Härtung: eigener Deploy-Nutzer, kein Root-Login, kein Passwort-Login, `unattended-upgrades`, `fail2ban`, Zeitzone UTC.
4. Docker Engine + Compose-Plugin; Verzeichnisse `/opt/wir-wollen-weg/{production,staging}` mit `compose.yml` und `.env`.
5. Caddy als Reverse-Proxy: automatische TLS-Zertifikate (Let's Encrypt), HTTP→HTTPS, HSTS, Kompression, Zugriffslogs **ohne Tokens** – weder im Pfad (`/i/<token>`, `/auth/*`) noch in Query-Strings oder `Referer` – und mit 7 Tagen Aufbewahrung (Caddyfile-Baustein §5.4, R-037).
6. DNS-Einträge (§7), Mail-Domain beim Anbieter verifizieren.
7. **Egress-Härtung** für den App-Container (`DOCKER-USER`-Regeln: nur `tcp/443` ins Internet, interne/Link-Local-Netze inkl. Metadaten `169.254.169.254` gesperrt) – zweite Verteidigungslinie neben dem SSRF-Schutz der Link-Vorschau (§0.8).

### 5.2 Compose-Dienste (prod)
`caddy` (80/443; ohne `trusted_proxies`, ersetzt also einen vom Client gesendeten `X-Forwarded-For` durch die echte Absender-IP – Grundlage der Rate-Limits, `AUTH_IP_HEADER=x-forwarded-for`, R-005) → `app` (Next.js standalone, Port 3000 **nur intern**, nie direkt veröffentlichen) → `db` (PostgreSQL 18, Volume, nur internes Netz) · `bugsink` (Fehler-Tracking, eigene Subdomain mit Login) · `backup` (Cron-Container: `pg_dump` + `age` + Upload) · `jobs` (Cron: Lösch-/Inaktivitäts-Jobs F-013/F-043, täglich 03:00 UTC, ruft `pnpm job:retention` im `tools`-Image auf – das Standalone-App-Image hat keine Skripte; Alternative bei OPS-3: Job als eigenes Node-Bundle ins App-Image).

### 5.3 Release-Ablauf (Workflow `deploy.yml`, wird erstellt, sobald Zugänge existieren)
1. Merge auf `main` → CI grün (Lint, Typecheck, Unit, Build, E2E).
2. Image bauen, taggen mit Git-SHA, nach `ghcr.io/<owner>/wir-wollen-weg` pushen.
3. **Staging automatisch:** per SSH `docker compose pull && docker compose run --rm tools pnpm db:migrate && docker compose up -d` (Migration im `tools`-Image, siehe §0.2; OPS-3 baut und pusht beide Images mit demselben Git-SHA); Smoke-Test (`/api/health` liefert 200 inkl. DB-Ping).
4. Abnahme auf Staging (Reviewer ✅, ggf. Auftraggeber).
5. **Produktion per manueller Freigabe** (GitHub Environment Protection) mit demselben Image-Tag; vor der Migration automatischer `pg_dump`.
6. Rollback: vorherigen Image-Tag deployen. Migrationen nur **rückwärtskompatibel** (expand → migrate → contract über zwei Releases), damit Rollback ohne DB-Restore möglich ist.
7. Release-Notiz in `docs/ops/status.md` (Version, Datum, Feature-IDs).

Kurze Downtime (Sekunden) beim Container-Neustart ist im MVP akzeptiert; Zero-Downtime (z. B. zwei App-Container hinter Caddy) bei Bedarf nach Launch.

### 5.4 Zugriffslogs ohne Tokens (Caddy, staging + prod, R-037)

**Problem:** Tokens stehen nicht nur in Query-Strings, sondern auch im **Pfad**: Einladungslink `/i/<token>` (wer ihn kennt, kann der Reise beitreten) und Magic-Link `/auth/magic?token=…`. Außerdem tragen Folgeanfragen derselben Seite (Assets, Server Actions) die URL im **`Referer`**, weil auf `/i/*` und `/auth/*` bewusst `Referrer-Policy: same-origin` gilt (tech-stack.md §8). Ein Filter nur für Query-Strings reicht deshalb nicht. Die Ausnahme in `next.config.ts` (`logging.incomingRequests.ignore`) wirkt nur bei `next dev`.

**Lösung:** ein gemeinsamer Log-Baustein im Caddyfile, den Staging und Produktion importieren:

```caddyfile
# Access log without tokens (R-037): mask everything after /i/ and /auth/,
# drop every query string, drop Referer/Location (may contain a token URL).
(access_log_redacted) {
	log {
		output file /data/logs/access-{args[0]}.log {
			roll_size 50MiB
			roll_keep_for 168h   # 7 days (compliance-checklist.md §6)
		}
		format filter {
			wrap json
			fields {
				request>uri regexp `^(/(?:i|auth)/)\S*|(\?)\S*` `$1$2[redacted]`
				request>headers>Referer delete
				resp_headers>Location delete
			}
		}
	}
}

app.<domain> {
	import access_log_redacted prod
	reverse_proxy app:3000
}

staging.<domain> {
	import access_log_redacted staging
	basic_auth { … }               # STAGING_BASIC_AUTH
	reverse_proxy app-staging:3000
}
```

Ergebnis der Ersetzung: `/i/AbC…xyz` → `/i/[redacted]`, `/auth/magic?token=…` → `/auth/[redacted]`, `/login?next=/i/AbC…` → `/login?[redacted]`, `/trips/k3x9…` bleibt (Reise-ID ist kein Geheimnis). `Cookie`, `Set-Cookie` und `Authorization` schwärzt Caddy standardmäßig (globale Option `log_credentials` **nicht** setzen).

Regeln und Prüfung:
- Die Regex steht in Backticks (Caddyfile-Rohtext, Backslashes werden nicht verdoppelt); Ersetzung `$1$2[redacted]` ohne geschweifte Klammern, damit Caddy sie nicht als Platzhalter liest. Bei Caddy-Updates mit `caddy validate` und `caddy adapt` prüfen (Syntax von `format filter` hat sich zwischen 2.x-Versionen leicht geändert; `fields { }` wird weiterhin akzeptiert).
- **Alternative**, falls Filter nicht greifen: `/i/*` und `/auth/*` gar nicht loggen (`log_skip /i/*` bzw. `log_skip /auth/*`, in älteren Versionen `skip_log`). Nachteil: Missbrauch (Token-Raten) ist im Log unsichtbar – Rate-Limit-Zähler der App (§6.2) decken das aber ab.
- **Fehler-Logs von Caddy** (`http.log.error`, `http.handlers.reverse_proxy`) enthalten das Request-Objekt inkl. URI und gehen über stderr in die Docker-Logs. Bei Einrichtung (OPS-1) eine absichtlich fehlschlagende Anfrage auf `/i/<test-token>` auslösen (z. B. App kurz stoppen → 502) und prüfen; falls die URI ungefiltert erscheint: globales `log default { level WARN }` plus Docker-Log-Rotation von 7 Tagen, oder den Fehlerlogger ebenfalls über `format filter` schicken.
- **Abnahmetest** (Go-Live-Gate Stufe 2b): Testreise anlegen, Einladungslink und Magic-Link aufrufen, dann `grep -E '/i/[A-Za-z0-9_-]{10,}|token=' /data/logs/*.log` und `docker compose logs caddy app` – erwartet: kein Treffer.

## 6. Backups, Monitoring, Fehler-Tracking (ab Go-Live)

> Offline-Demo: keine Backups, kein Monitoring – Demo-Daten sind per `db:seed:demo` jederzeit reproduzierbar; `down -v` löscht alles.

### 6.1 Backups
| Was | Wie | Aufbewahrung | Ziel |
|---|---|---|---|
| Datenbank logisch | `pg_dump` (custom format), stündlich | stündlich 48 h, täglich 30 Tage | verschlüsselt (`age`) in Object Storage **bei einem zweiten Anbieter oder Standort** |
| VM-Image | Hetzner Server-Backup | 7 Tage | Hetzner |
| Vor jeder Migration | `pg_dump` | 7 Tage | lokal + Object Storage |

- **RPO ≤ 1 h, RTO ≤ 4 h** (MVP-Ziel).
- **Restore-Test** monatlich auf Staging (Runbook, Ergebnis im Status-Board).
- Löschkonzept: Gelöschte Daten verschwinden spätestens nach **30 Tagen** auch aus Backups – so in der Datenschutzerklärung angeben (compliance-checklist.md §6).

### 6.2 Monitoring & Alarme
| Bereich | Werkzeug | Alarm |
|---|---|---|
| Erreichbarkeit | externer Uptime-Dienst (Free-Plan, prüft nur `/api/health`, keine personenbezogenen Daten) | Ausfall > 2 Min. → E-Mail/Push an Betreiber |
| Fehler | Sentry-SDK → **Bugsink selbst gehostet** (Daten bleiben auf unserer VM; `sendDefaultPii: false`; `beforeSend` und `beforeBreadcrumb` scrubben E-Mail/Codes und **Tokens in URLs und Headern**: `request.url`, `request.query_string`, `request.headers` (`Referer`, `Cookie`, `Authorization` entfernen), Breadcrumb-URLs (Navigation/Fetch) und Transaktionsnamen – `/i/<token>` → `/i/[redacted]`, `/auth/*` und Query-Strings wie in §5.4; Aufbewahrung 30 Tage; R-037). Alternative: Sentry SaaS mit Datenstandort Frankfurt (US-Unternehmen → AVV + SCC/DPF nötig). | neue Fehlerart → E-Mail |
| Server | Minimalvariante ohne eigenen Monitoring-Stack: Graphen in der Hetzner-Console + Cron-Skript für Disk > 80 % und Container-Neustarts | E-Mail |
| Mail-Zustellung | Bounce-/Beschwerde-Webhook des Anbieters → Zähler in DB; Dashboard des Anbieters; DMARC-Aggregatberichte an `dmarc@<domain>` | Bounce-Rate > 5 % oder Zustellung > 1 Min. im Median |
| Auth-Sicherheit | Zähler für fehlgeschlagene Code-Prüfungen und Rate-Limit-Treffer (aggregiert) | sprunghafter Anstieg → E-Mail |
| Produkt-Kennzahlen (PRD §4) | **eigene, cookielose Ereignis-Tabelle** (aggregiert, ohne Personenbezug; z. B. „registration_started/verified“, „trip_joined“) – kein Drittanbieter-Analytics | – |

Logs: Docker-JSON-Logs mit Rotation (7 Tage); App-Logs ohne E-Mail/Codes/Tokens; Caddy-Zugriffslogs nach §5.4 (keine Tokens in Pfad, Query, `Referer`); IP-Adressen max. 7 Tage.

## 7. Domain, DNS & Mail-Authentifizierung (ab Go-Live)

### 7.1 Domain
Zurückgestellt bis Go-Live (Q15). Zwei Produktnamen (Q11): „Wir wollen weg“ (DE) und „When do we go?“ (EN) → Domain- **und** Markenprüfung für beide ([go-live.md](go-live.md), Stufe 1/2a). Optionen (Verfügbarkeit vor Kauf prüfen): `wirwollenweg.de`, `wir-wollen-weg.de`, zusätzlich ggf. `.app`/`.com` für Englisch. Registrar in der EU (z. B. INWX, Hetzner), DNSSEC aktivieren; DNS bei Hetzner (kostenlos) oder beim Registrar.

### 7.2 DNS-Einträge (Vorlage; konkrete Werte liefert der Mail-Anbieter)

| Name | Typ | Inhalt | Zweck |
|---|---|---|---|
| `@`, `www` | A / AAAA | VM-IPv4/IPv6 | App (www → Redirect auf Apex) |
| `staging` | A / AAAA | VM | Staging |
| `errors` | A / AAAA | VM | Bugsink |
| `@` | CAA | `0 issue "letsencrypt.org"` | nur Let's Encrypt darf Zertifikate ausstellen |
| `@` | MX | Postfach-Anbieter | Kontakt-/Impressums-Adresse `hallo@` |
| `@` | TXT | `v=spf1 include:<postfach-anbieter> -all` | SPF für Postfach |
| `mail` (Absender-Subdomain) | TXT | `v=spf1 include:<mail-anbieter> -all` | SPF Transaktionsmails |
| `<selector>._domainkey.mail` | CNAME/TXT | vom Mail-Anbieter | **DKIM** (2048 Bit) |
| Return-Path, z. B. `bounces.mail` | CNAME | vom Mail-Anbieter | Custom Return-Path → SPF-Alignment |
| `_dmarc` | TXT | Start: `v=DMARC1; p=none; rua=mailto:dmarc@<domain>; adkim=s; aspf=r` | **DMARC** |
| `_dmarc.mail` | TXT | wie oben (oder vom Apex geerbt) | DMARC Subdomain |

**DMARC-Einführung:** 2–4 Wochen `p=none` (Berichte auswerten) → `p=quarantine` → vor Launch (M2) `p=reject`, sobald alle legitimen Absender bestehen.
**Absender:** `Wir wollen weg <login@mail.<domain>>`, Reply-To `hallo@<domain>`. Getrennte Subdomain schützt die Reputation der Hauptdomain; für spätere Benachrichtigungen (F-014, v1) eigene Subdomain `notify.<domain>`.
Optional später: MTA-STS/TLS-RPT für die Empfangsdomain.

## 8. Go-Live-Checkliste

Ausgelagert und erweitert als Gate: **[go-live.md](go-live.md)** (Stufe 1 Staging, Stufe 2 Beta M1, Stufe 3 Launch M2). Der CEO legt sie dem Auftraggeber vor Go-Live vor.

---

## Quellen (Abruf 2026-10-08)

- **Beta G0 (Abruf 2026-10-23, über Websuche; Anbieterseiten aus der Arbeitsumgebung nicht direkt abrufbar – vor Abschluss live prüfen):**
  - Lettermint: [Preise](https://lettermint.co/pricing), [Changelog „Developer plan without daily limit“](https://lettermint.co/changelog/developer-plan-now-without-daily-limit), [DPA](https://lettermint.co/dpa), [SMTP-Doku](https://docs.lettermint.co/guides/send-email-with-smtp), [Vergleich Amazon SES (Sitz NL)](https://lettermint.co/compare/amazon-ses-alternative)
  - Brevo: [Free SMTP](https://www.brevo.com/free-smtp-server), [TechRadar-Review (Branding)](https://www.techradar.com/pro/software-services/brevo-review) · Scaleway TEM: [Preise](https://scaleway.com/en/pricing/managed-services), [FAQ](https://www.scaleway.com/en/docs/transactional-email/faq/)
  - Domains: [INWX .de](https://www.inwx.de/en/de-domain), [domainoffer.net – INWX .de](https://domainoffer.net/tld/de/inwx), [Hetzner .de-Preissenkung](https://www.hetzner.com/de/news/de-domain-pricedrop/), [mydealz – netcup .de](https://www.mydealz.de/deals/netcup-de-domain-013eur-pro-monat-2694935)
  - Vercel: [DPF-Zertifizierung](https://vercel.com/kb/guide/is-vercel-certified-under-dpf), [DPA](https://vercel.com/legal/dpa), [Terms](https://vercel.com/legal/terms), [ToS-Update März 2026 (KI-Training Hobby, Opt-out)](https://vercel.com/changelog/updates-to-terms-of-service-march-2026), [Cron-Kontingente](https://vercel.com/docs/cron-jobs/usage-and-pricing), [ComplyDog – Vercel DPA-Geltungsbereich](https://complydog.com/blog/is-vercel-gdpr-compliant-the-dpa-and-your-deployment)
  - Neon: [Free-Plan-Grenzen](https://neon.com/faqs/free-plan-limits-and-quotas), [DPA](https://neon.com/dpa), [GDPR-Blog](https://neon.com/blog/gdpr-compliance-and-neon)
  - iOS-Web-Apps: [WWDC23 „What's new in web apps“ (getrennte Cookies, OTP statt Magic Link)](https://wwdcnotes.com/notes/wwdc23/10120), [WebKit Bug 181849](https://bugs.webkit.org/show_bug.cgi?id=181849)
- Vercel (Abruf 2026-10-23, für §0.8): [Limits-Übersicht](https://vercel.com/docs/limits), [Functions – Limitations (4,5 MB Payload)](https://vercel.com/docs/functions/limitations), [Body-Size-Limit umgehen (Streaming)](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions), [FUNCTION_RESPONSE_PAYLOAD_TOO_LARGE](https://vercel.com/docs/errors/function_response_payload_too_large)

- Hetzner: [Preisanpassung Juni 2026 (Analyse)](https://privatedevops.com/news/hetzner-june-2026-cloud-price-increase-what-to-do), [Findstack – Hetzner price increase 2026](https://findstack.com/resources/hetzner-price-increase-2026), [Cloud Pricing Comparison 2026-08](https://kimmo.suominen.com/stuff/cpc-2026-08.txt), [Hetzner CX23 (whtop)](https://www.whtop.com/amp/plans/hetzner.com/144086), [Hetzner Object Storage (whtop)](https://www.whtop.com/amp/plans/hetzner.com/144077), [Sliplane – Object Storage Europa](https://sliplane.io/blog/cheap-object-storage-providers-europe), [Hetzner Pricing Breakdown (Backups 20 %)](https://deployhandbook.com/pricing/hetzner)
- Netcup: [valebyte – netcup review 2026](https://valebyte.com/en/blog/netcup-review-2026-the-price-performance-king-and-its-fine-print/)
- Scaleway: [Instances-Preise](https://www.scaleway.com/en/pricing/virtual-instances/), [Managed Databases](https://www.scaleway.com/en/pricing/managed-databases/), [TEM](https://www.scaleway.com/fr/transactional-email-tem/)
- Fehler-Tracking: [Bugsink vs. GlitchTip](https://www.bugsink.com/blog/bugsink-vs-glitchtip/), [Sentry EU-Datenstandort](https://sentry.io/changelog/data-storage-location-in-germany-is-generally-available/)
