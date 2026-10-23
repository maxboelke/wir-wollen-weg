# Deployment & Betrieb – Wir wollen weg

Stand: 2026-10-23 · Verantwortlich: Operations Manager · Status: v0.5 (v0.5: ausgehende Abrufe/SSRF-Betrieb für Link-Vorschau + Bild-Proxy §0.8, CSP-Vorschlag §0.9 – Inkrement 9; v0.4: private Live-Vorschau auf Vercel + Neon, §0.7, PRD Q25 – technischer Teil vom Developer; v0.3: Zugriffslogs ohne Tokens im Pfad, §5.4, R-037) – **aktueller Betriebsmodus: Offline-Demo (§0)**; Hosting-/Mail-Plan (§2–§7) gilt **ab Go-Live** (Auftraggeber-Entscheidung Q15, 2026-10-08)

Bezug: [tech-stack.md](tech-stack.md) · [compliance-checklist.md](compliance-checklist.md) · [**go-live.md – Go-Live-Gate**](go-live.md) · [PRD §8, §12](../product/PRD.md)

> Preise netto, Recherche 2026-10-08 (Quellen am Ende). Hetzner hat 2026 zweimal Preise angepasst und die günstigen CX-/CAX-Tarife waren zeitweise „nicht verfügbar“ – **vor Bestellung live prüfen**.

---

## 0. Aktueller Betriebsmodus: Offline-Demo (gültig seit 2026-10-08)

**Entscheidung Auftraggeber (PRD §12 Q14–Q16):** Bis auf Weiteres läuft „Wir wollen weg“ / „When do we go?“ **nur lokal** als Demo. **Kein Hosting, keine Domain, keine Konten oder Abos** (Hetzner, Lettermint, Postfach, Generator usw.). Impressum und Datenschutz sind **Platzhalter** (Privatperson). Alles in §2–§7 ist der vorbereitete Plan **ab Go-Live**; der Übergang ist ein Gate: [go-live.md](go-live.md).

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
| Transaktionsmails | Lettermint Starter 10 € (Beta: Free-Plan 0 €) | Scaleway TEM < 1 € |
| Domain (.de) | ~1 € (umgelegt) | ~1 € |
| Postfach für Kontakt/Impressum/DMARC | ~1–3 € (z. B. mailbox.org, Posteo) | ~1 € |
| Fehler-Tracking (Bugsink selbst gehostet) | 0 € | 0 € |
| Uptime-Monitoring (externer Dienst, Free-Plan) | 0 € | 0 € |
| **Summe** | **ca. 30–40 €/Monat** | **ca. 10–15 €/Monat** |

Einmalig/jährlich (nicht enthalten): Rechtstexte (Generator-Abo oder anwaltliche Prüfung, siehe compliance-checklist.md), ggf. Impressums-/Geschäftsadresse, Apple-Developer-Account erst für „Sign in with Apple“ in v1 (99 $/Jahr).

Skalierung: Bei > 70 % CPU/RAM-Auslastung über Tage → größere VM (Hetzner: Rescale in Minuten) oder DB auf eigene VM/Managed DB auslagern.

## 3. Umgebungen

| Umgebung | Zweck | Wo | Daten | Mails | Zugriff |
|---|---|---|---|---|---|
| **preview** (seit 2026-10-20, PRD Q25) | private Online-Vorschau ohne Download | Vercel Hobby (`fra1`) + Neon Free (Frankfurt), §0.7 | synthetisch (Seed beim ersten Build, „Demo zurücksetzen“) | Demo-Postfach `/demo/postfach` (`MAIL_TRANSPORT=inbox`) | HTTP-Basic-Auth vor allem (`PREVIEW_ACCESS_PASSWORD`), `noindex` |
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
| `APP_ENV` | ja | `development` \| `ci` \| `demo` \| `staging` \| `preview` \| `production` (steuert Mail-Transport, noindex, Logging, Demo-Banner, Zugangsschutz, Startschutz §0.6). Auf Vercel ohne Wert: `preview` | `development` |
| `APP_URL` | ja | öffentliche Basis-URL ohne Slash am Ende; `preview`/`staging`/`production` nur mit `https://` (R-064). Auf Vercel ohne Wert: `https://$VERCEL_PROJECT_PRODUCTION_URL` | `http://localhost:3000` |
| `APP_TIME_ZONE` | nein | IANA-Zeitzone, die „heute“ für Reisen bestimmt (Countdown, Phasen, Fristen, Abreisetag-Feier – R-072). Leer/ungültig = `Europe/Berlin`. Wird beim **Build** eingelesen (auch für den Browser) – Änderung erst nach neuem Build/Deployment wirksam. Später ggf. Zeitzone pro Reise | leer |
| `PREVIEW_ACCESS_PASSWORD` | nur preview | Passwort der HTTP-Basic-Auth (≥ 10 Zeichen, Benutzername beliebig); fehlt es, startet die Vorschau nicht bzw. antwortet 503 (§0.7) | leer |
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
| `CONTACT_EMAIL` | ja (Go-live) | Kontaktadresse auf der Hilfe-Seite (F-051) | `hallo@example.org` (Platzhalter) |
| `RETENTION_TOKEN` | ja (Go-live) | Bearer-Token für `POST /api/internal/retention` (tägliche Löschläufe F-013/F-043: alte Reisen, inaktive Konten, Hinweis-Mails). Ohne Wert ist der Endpunkt aus (404). **Operations: täglichen Timer einrichten** (z. B. systemd-Timer/cron mit `curl -fsS -X POST -H "Authorization: Bearer …" http://app:3000/api/internal/retention`); nachgetragen vom Developer (Inkrement 6) | leer (Demo: aus) |
| *(keine neue Variable in Inkrement 9)* | – | Link-Vorschau/Bild-Proxy brauchen kein eigenes Secret: Schlüssel des (AES-256-GCM-verschlüsselten, R-076) Vorschau-Tokens per HKDF aus `BETTER_AUTH_SECRET` (§0.8) | – |
| `CRON_SECRET` | nur preview | Vercel Cron ruft `GET /api/internal/retention` mit `Authorization: Bearer $CRON_SECRET` auf; wird wie `RETENTION_TOKEN` akzeptiert (≥ 32 Zeichen) | leer |
| `STAGING_BASIC_AUTH` | nur staging | Caddy-Basic-Auth (Hash) | – |
| `BACKUP_S3_ENDPOINT`, `BACKUP_S3_REGION`, `BACKUP_S3_BUCKET`, `BACKUP_S3_ACCESS_KEY_ID`, `BACKUP_S3_SECRET_ACCESS_KEY` | ja (prod) | Off-site-Backup-Ziel | – |
| `BACKUP_AGE_RECIPIENT` | ja (prod) | öffentlicher `age`-Schlüssel zur Verschlüsselung der Dumps (privater Schlüssel **offline** beim Betreiber) | – |
| *später v1:* `DATA_ENCRYPTION_KEYS` | v1.1 | Schlüsselring (AES-256-GCM) für Kalender-URLs/CalDAV-Passwörter (F-019, F-048) | – |
| *später v1:* `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | v1.1 | Social Login (F-045) / Kalender (F-020) | – |
| *später v1:* `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | v1.1 | Sign in with Apple (F-045) | – |
| *später v1:* `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` | v1.2 | F-021 | – |
| *später:* Zahlungsanbieter-Schlüssel | Phase 3 | F-050 | – |

GitHub-Secrets für Deployment (Environment `staging`/`production`): `DEPLOY_SSH_HOST`, `DEPLOY_SSH_USER`, `DEPLOY_SSH_PRIVATE_KEY`, `DEPLOY_SSH_KNOWN_HOSTS`. Container-Registry: GitHub Container Registry mit dem automatischen `GITHUB_TOKEN` (Images enthalten keine personenbezogenen Daten).

Regeln: Secrets je Umgebung verschieden; Rotation bei Personalwechsel/Verdacht; `BETTER_AUTH_SECRET`-Rotation meldet alle Nutzer ab (bewusst einplanen).

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

- Vercel (Abruf 2026-10-23, für §0.8): [Limits-Übersicht](https://vercel.com/docs/limits), [Functions – Limitations (4,5 MB Payload)](https://vercel.com/docs/functions/limitations), [Body-Size-Limit umgehen (Streaming)](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions), [FUNCTION_RESPONSE_PAYLOAD_TOO_LARGE](https://vercel.com/docs/errors/function_response_payload_too_large)

- Hetzner: [Preisanpassung Juni 2026 (Analyse)](https://privatedevops.com/news/hetzner-june-2026-cloud-price-increase-what-to-do), [Findstack – Hetzner price increase 2026](https://findstack.com/resources/hetzner-price-increase-2026), [Cloud Pricing Comparison 2026-08](https://kimmo.suominen.com/stuff/cpc-2026-08.txt), [Hetzner CX23 (whtop)](https://www.whtop.com/amp/plans/hetzner.com/144086), [Hetzner Object Storage (whtop)](https://www.whtop.com/amp/plans/hetzner.com/144077), [Sliplane – Object Storage Europa](https://sliplane.io/blog/cheap-object-storage-providers-europe), [Hetzner Pricing Breakdown (Backups 20 %)](https://deployhandbook.com/pricing/hetzner)
- Netcup: [valebyte – netcup review 2026](https://valebyte.com/en/blog/netcup-review-2026-the-price-performance-king-and-its-fine-print/)
- Scaleway: [Instances-Preise](https://www.scaleway.com/en/pricing/virtual-instances/), [Managed Databases](https://www.scaleway.com/en/pricing/managed-databases/), [TEM](https://www.scaleway.com/fr/transactional-email-tem/)
- Fehler-Tracking: [Bugsink vs. GlitchTip](https://www.bugsink.com/blog/bugsink-vs-glitchtip/), [Sentry EU-Datenstandort](https://sentry.io/changelog/data-storage-location-in-germany-is-generally-available/)
