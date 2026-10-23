# Deployment & Betrieb – Wir wollen weg

Stand: 2026-10-23 · Verantwortlich: Operations Manager · Status: v0.8 (v0.8: **geschlossene Freundes-Beta `APP_ENV=beta` + PWA, Gate G0** – Mail-Dienst/Registrar-Empfehlung, Beta-Code, Startschutz, Service Worker, CSP, Rechtstexte §0.12, §3, §4; v0.7: persönliche Reisedaten – Schlüssel-Konzept `TRAVEL_DATA_KEYS`, Rotation, Runbooks, Startschutz, Feature-Schalter `TRAVEL_DATA_ENABLED` §0.11 + §4 – Inkrement 11; v0.6: Löschjob-Umfang inkl. endgültiger Löschung weich gelöschter Ausgaben nach 24 h, §0.10 – Inkrement 10; v0.5: ausgehende Abrufe/SSRF-Betrieb für Link-Vorschau + Bild-Proxy §0.8, CSP-Vorschlag §0.9 – Inkrement 9; v0.4: private Live-Vorschau auf Vercel + Neon, §0.7, PRD Q25 – technischer Teil vom Developer; v0.3: Zugriffslogs ohne Tokens im Pfad, §5.4, R-037) – **aktueller Betriebsmodus: Offline-Demo (§0) + private Vorschau (§0.7); geplant: geschlossene Freundes-Beta (§0.12, Gate G0)**; Hosting-/Mail-Plan (§2–§7) gilt **ab Go-Live** (Auftraggeber-Entscheidung Q15, 2026-10-08)

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

> Abruf über Websuche; die Anbieterseiten selbst waren aus der Arbeitsumgebung nicht direkt abrufbar – **Preise/Tarife vor Abschluss live prüfen**. Quellen am Ende dieses Dokuments.

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
| **`BETA_MAX_ACCOUNTS`** *(neu, optional)* | Obergrenze Konten (Standard **50**); erreicht → neue Registrierungen freundlich abgelehnt | nein |
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
| 11 | Demo-Funktionen aus: `/demo/postfach` 404, kein „Demo zurücksetzen“, **kein** Demo-Banner „keine echten Daten“ (würde der echten Nutzung widersprechen). Stattdessen dezentes **„Beta“-Kennzeichen** neben der Wortmarke + Link „Feedback/Kontakt“ (Text/Platzierung: UI/UX) | – |
| 12 | `seed-demo.ts` verweigert beta (§0.12.2 Nr. 4) | wie production |
| 13 | `PREVIEW_ACCESS_PASSWORD` gesetzt → nur Warnung im Start-Log („ignored in beta“) | – |

Tests (Pflicht): Unit-Tests für `startupProblems()` je Regel (positiv/negativ), E2E-Projekt `beta-chromium` analog `preview-chromium` (zweiter `next start` mit `APP_ENV=beta`, Mailpit als SMTP **nur in CI** über eine Test-Ausnahme `E2E_ALLOW_LOCAL_SMTP=1`, die außerhalb `CI=true` wirkungslos ist): Registrierung mit/ohne Beta-Code, kein Demo-Banner, `/demo/postfach` 404, Redirect fremder Host, Datenschutzhinweis ohne Platzhalter, Service Worker (§0.12.6).

#### 0.12.5 Beta-Code bei der Registrierung (serverseitig)

**Grundsatz:** Ein **neues Konto** entsteht nur mit gültigem Beta-Code **und** Zustimmung zum Beta-Datenschutzhinweis. Bestehende Konten melden sich ohne Code an. Und: **Ohne gültigen Beta-Code verschickt die App an unbekannte Adressen keine Mail** – sonst könnte jeder über das offene Formular Mails an beliebige Adressen auslösen (Spam, Kontingent 300/Monat).

Ablauf (Konten entstehen heute durch Code-/Link-Anmeldung, `emailAndPassword.disableSignUp` ist bereits `true`):

1. Login-Seite (nur beta): unter dem E-Mail-Feld aufklappbar **„Zum ersten Mal hier?“** mit Feld **Beta-Code** und Pflicht-Häkchen „Ich habe den [Datenschutzhinweis](/datenschutz) gelesen und bin einverstanden.“ (+ Hinweis Mindestalter 16). Texte DE/EN: UI/UX.
2. Server-Action „Code senden“:
   - Adresse hat ein Konto → wie heute (Beta-Code wird ignoriert).
   - Keine Konto-Adresse **und** gültiger Beta-Code **und** Häkchen → **Beta-Pass** anlegen (serverseitig in `verification`: `identifier = beta-pass:<HMAC(normalisierte E-Mail)>`, Ablauf 30 Min., Wert = Version des Datenschutzhinweises, z. B. `beta-1`) → Code-Mail wie heute.
   - Keine Konto-Adresse, Code fehlt/ungültig → **keine Mail**, aber **dieselbe Antwort und dieselbe Code-Seite** wie in den anderen Fällen (Schutz gegen Konten-Ermittlung, R-021 bleibt gültig). Die Code-Seite zeigt in beta den Zusatz „Keine Mail bekommen? Beim ersten Mal brauchst du den Beta-Code.“ Ungültige Codes zählen in das Limit unten.
3. **Durchsetzung an der einzigen Stelle, an der Konten entstehen:** `databaseHooks.user.create.before` prüft in beta, dass ein gültiger Beta-Pass für die (normalisierte) Adresse existiert, verbraucht ihn und setzt `betaConsentVersion` + `betaConsentAt` am Konto (neue Spalten, Migration); sonst `APIError FORBIDDEN` (fail closed). Damit sind alle Wege abgedeckt (Code, Magic Link, Einladungsflow, Platzhalter-Übernahme per persönlichem Link F-007, künftige Wege).
4. **`BETA_MAX_ACCOUNTS`** (Standard 50) im selben Hook prüfen (Zählung `user`, transaktional/Advisory-Lock); erreicht → freundliche Meldung „Die Beta ist gerade voll“.
5. **Vergleich:** Normalisierung `NFKC` → trim → Kleinbuchstaben → Leerzeichen und `-` entfernen; Vergleich der SHA-256-Digests mit `timingSafeEqual` gegen **alle** konfigurierten Codes (keine frühe Rückkehr). Codes nie loggen, nie an den Client, nie in Fehlermeldungen.
6. **Rate-Limits (IP, wie bestehende Limits pro /64 bei IPv6, R-005-Logik):** max. **5 Fehlversuche / 15 Min.** und **20 / Tag** pro IP; zusätzlich global **200 Fehlversuche / Tag** → danach Registrierung für 1 h für alle geschlossen (Bestandskonten unberührt). Gültige Codes zählen nicht. Bestehende Limits pro E-Mail (5 Codes/h) bleiben. Log nur Zähler `beta_code.invalid`, `beta_code.ok`, `beta_code.locked` (ohne IP, ohne Adresse).
7. **Rotation:** neuer Code vorn in `BETA_ACCESS_CODES`, alter dahinter, Redeploy; nach Übergangszeit alten entfernen (beta-anleitung.md §9). Rotation ändert nichts an bestehenden Konten/Sitzungen.
8. **Einladungslinks:** Entscheidungsstand 2026-10-23 = Beta-Code bei **jeder** Registrierung, auch im Einladungsflow (Option A). Option B (gültiger Einladungslink ersetzt den Beta-Code) ist bequemer, öffnet aber die Beta für jeden, an den ein Link weitergeleitet wird → offen beim CEO (Status-Board E-G0-2). Der Code oben ist so zu bauen, dass B später nur eine Bedingung im Hook ist.

#### 0.12.6 PWA – installierbare Web-App (iPhone „Zum Home-Bildschirm“, Android „App installieren“)

**Ist-Stand:** `public/manifest-de.webmanifest`/`-en` (`display: standalone`, `start_url: /`, `scope: /`, `theme_color #2B2266`, `background_color #F4F2FB`, Icons 192/512 + maskable), `apple-touch-icon.png` 180×180 (RGB, ohne Transparenz ✓), `themeColor` und Manifest-Link in `src/components/document-head.tsx`. **Kein** Service Worker. Push bleibt F-038 (später); hier nur Installierbarkeit + Offline-Hinweis. *(Hinweis an PM: F-038 in „PWA-Basis (G0)“ und „Push (später)“ aufteilen.)*

**Anforderungen (Developer, P1-B0):**

| # | Thema | Vorgabe |
|---|---|---|
| 1 | Manifest | `id: "/"` ergänzen; `start_url` muss angemeldete Personen ohne Umweg zu „Meine Reisen“ führen (heute `/` – prüfen, sonst `/trips`); `display: standalone`; Namen je Sprache (DE „Wir wollen weg“, EN „When do we go?“, Q11); `Content-Type: application/manifest+json`; ohne Anmeldung abrufbar. Maskable-Icon: Designer prüft Schutzzone (80 %) |
| 2 | iOS-Meta | Next.js-Metadata `appleWebApp: { capable: true, title: <Produktname je Sprache>, statusBarStyle: "default" }` (erzeugt `mobile-web-app-capable`, `apple-mobile-web-app-title`); `apple-touch-icon` bleibt |
| 3 | Theme-Farbe | `themeColor` je Farbschema (`media: (prefers-color-scheme: light/dark)`) aus `tokens.css` (Designer liefert Dark-Wert) |
| 4 | Safe Area | `viewport-fit=cover` (`viewport.viewportFit = "cover"`) **und** `env(safe-area-inset-*)`-Abstände für Kopfzeile, untere Leisten, Bottom-Sheets, Toasts – im Standalone-Modus gibt es keine Safari-Leisten mehr. Abnahme auf iPhone mit Dynamic Island + Home-Indikator (hell/dunkel) |
| 5 | Splash | iOS erzeugt aus dem Manifest keinen Splash; ohne `apple-touch-startup-image` erscheint kurz die Hintergrundfarbe. **Für G0 nicht nötig** (optional später, Designer). `background_color` = Seitenhintergrund, damit es nicht blitzt |
| 6 | Login in der PWA | Erkennung Standalone (`matchMedia("(display-mode: standalone)")` oder `navigator.standalone`) → Code-Seite betont **„Code aus der Mail hier eintippen“**, Hinweis „Der Link in der Mail öffnet Safari“; Code-Feld `inputmode="numeric"`, `autocomplete="one-time-code"`. „Angemeldet bleiben“ in der PWA vorausgewählt (90 Tage, F-040). Mail-Text in beta: Code zuerst und groß, Link als zweite Option mit Satz „Nutzt du die App vom Home-Bildschirm? Dann gib bitte den Code ein.“ |
| 7 | Sitzung übernehmen | iOS kopiert beim Hinzufügen zum Home-Bildschirm die Cookies aus Safari einmalig in die Web-App (danach getrennte Speicher). UX-Empfehlung: Install-Hinweis erst **nach** erfolgreicher Anmeldung zeigen (optional, Hinweiskarte nur in iOS-Safari, nicht standalone, wegklickbar, Cookie-/Storage-frei oder als Eintrag in compliance §4) |
| 8 | Einladungen | Links aus WhatsApp öffnen auf iOS Safari, nie die PWA. Beitritt in Safari funktioniert; in der PWA zusätzlich der bestehende Weg **Einladungscode eingeben** gut auffindbar machen (UI/UX) |
| 9 | Externe Links / Downloads | Portal-Links, Google-Kalender, WhatsApp-Teilen öffnen außerhalb (ok). **ICS-Download** und Datenexport im iOS-Standalone-Modus auf dem Gerät testen (Downloads verhalten sich dort anders); Fallback „In Safari öffnen“ |

**Service Worker (nur App-Shell + Offline-Hinweis, keine personenbezogenen Daten):**

| # | Vorgabe |
|---|---|
| 1 | Datei `/sw.js` (statisch aus `public/` oder Route), Scope `/`, Header `Cache-Control: no-cache` (Updates sofort sichtbar), `Content-Type: text/javascript`. Registrierung durch eine kleine Client-Komponente nach `load`, **nur** wenn `APP_ENV` ∈ {`beta`, `production`} und `PWA_SW_ENABLED` ≠ `false`; **nie** in `development`/`ci`/`demo`/`preview` (Basic Auth, Cache-Verwirrung beim Entwickeln). Ausnahme für E2E: Projekt `beta-chromium` |
| 2 | **Precache bei `install`:** nur `/offline` (statische Seite DE/EN ohne Personenbezug, ohne Anmeldung, im Design der App, „Keine Verbindung – bitte später erneut versuchen“) samt ihrer CSS-/Font-/Icon-Dateien, Logo. Cache-Name versioniert mit der Build-ID (`ww-shell-<buildId>`) |
| 3 | **`fetch`-Regeln:** nur `GET` und gleiche Origin anfassen. Navigationen (`request.mode === "navigate"`): **Netzwerk**, bei Netzfehler die gecachte `/offline`-Seite. `/_next/static/*` (gehashte, unveränderliche Dateien ohne Personenbezug): cache-first erlaubt. **Alles andere wird nicht beantwortet und nicht gecacht**, ausdrücklich: HTML aller App-Seiten, RSC-Anfragen (Header `RSC: 1`, Parameter `_rsc`), Server Actions (`POST`, Header `Next-Action`), `/api/*` (inkl. Bild-Proxy `/api/stays/image`), `/auth/*`, `/i/*`, `/trips/*`, `/account/*`, `/demo/*`, ICS-/Export-Downloads |
| 4 | `activate`: alte `ww-shell-*`-Caches löschen, `clients.claim()`; `skipWaiting()` bei neuer Version (unkritisch, da keine Daten im Cache) |
| 5 | **Kein** Push, kein Background Sync, kein IndexedDB/`localStorage` durch den SW, keine Analytics |
| 6 | Abmelden und Konto löschen: Antwort mit `Clear-Site-Data: "cache"` (leert Browser-/Cache-Storage der Origin; Cookies regelt Better Auth) |
| 7 | **Notschalter** `PWA_SW_ENABLED=false`: keine Registrierung; `/sw.js` liefert einen Worker, der alle `ww-*`-Caches löscht und sich mit `self.registration.unregister()` abmeldet |
| 8 | **Offline-Anzeige in der laufenden App:** `online`/`offline`-Ereignisse → dezenter Balken „Keine Verbindung – Änderungen werden gespeichert, sobald du wieder online bist“ **nur dort, wo das stimmt** (Autosave „Meine Tage“ mit Wiederholung); sonst „… werden nicht gespeichert“. Texte: UI/UX |
| 9 | **Abnahme (E2E, Pflicht):** (a) SW registriert in beta, nicht in preview/dev; (b) `context.setOffline(true)` → Navigation zeigt `/offline`; (c) nach einem Rundgang (Login, Reise öffnen, Kalender, Kosten) enthalten `caches.keys()`/Einträge **nur** `/offline`, deren Assets und `/_next/static/*` – kein `/trips`, kein `/api`, kein `_rsc`, keine E-Mail-Adresse im Cache-Inhalt; (d) Notschalter meldet den SW ab. Manuell: iPhone (iOS aktuell) installieren, anmelden per Code, Offline-Hinweis, Safe Area, Dunkelmodus |

#### 0.12.7 CSP-Anpassung

Stufe 1 (`next.config.ts`, `CSP_STAGE_1`) um **`worker-src 'self'`** und **`manifest-src 'self'`** ergänzen (ohne `script-src`/`default-src` wäre beides ohnehin erlaubt – explizit, damit Stufe 2 nichts bricht). `/sw.js` und `/offline` bekommen dieselbe CSP. Stufe 2 (§0.9) enthält beide Direktiven bereits. **Keine** externen Quellen (kein CDN-Workbox, keine Analytics, keine externen Fonts). `connect-src` bleibt bei Stufe 2 `'self'` (SMTP läuft serverseitig).

#### 0.12.8 Rechtstexte in beta – was minimal nötig ist (Einschätzung, keine Rechtsberatung)

| Text | In beta | Inhalt / Quelle |
|---|---|---|
| **Beta-Datenschutzhinweis** (`/datenschutz`, `/privacy`) | **Pflicht** | Kurzfassung nach Art. 13 DSGVO mit `LEGAL_OPERATOR_NAME` + `CONTACT_EMAIL` aus Env; Entwurf in [compliance-checklist.md §13.4](compliance-checklist.md). Versioniert (`beta-1`), Version wird mit der Zustimmung am Konto gespeichert (§0.12.5 Nr. 3). DE Pflicht, EN als Übersetzung (falls EN-sprachige Tester – Entscheidung E-G0-6) |
| **Anbieter & Kontakt** (`/impressum`, `/imprint`) | **empfohlen** (statt Platzhalter-Impressum) | „Private, nicht-kommerzielle Test-Version für einen geschlossenen Freundeskreis. Verantwortlich: {Name}. Kontakt: {E-Mail}.“ **Keine** Anschrift. Begründung: compliance §13.3 |
| Volle Platzhalter-Seiten der Demo | **nicht ausliefern** | in beta durch die beiden Beta-Texte ersetzt; Startschutz §0.12.4 Nr. 8 |
| Mail-Footer | Pflicht | „Private Beta von Wir wollen weg · Datenschutz: {APP_URL}/datenschutz“ (ohne Platzhalter) |
| Hilfe/Lizenzen (F-051) | bleibt | Kontakt = `CONTACT_EMAIL` |
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
| Konten-Ermittlung | wie bisher neutral (§0.12.5 Nr. 2) |
| R-035 (Konto-Adresse als Variante), R-037 (Token-Pfade in Logs), Proxy-Rate-Limit `/i/*` | bleiben Go-Live-Punkte (G1); für G0 als bekannt akzeptiert – **CEO entscheidet**, ob R-035 vor G0 behoben wird (Empfehlung: ja, wenn klein) |

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
| `BETA_MAX_ACCOUNTS` | nein | nur beta: Obergrenze Konten (Standard 50) | leer |
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
