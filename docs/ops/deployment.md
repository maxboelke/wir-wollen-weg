# Deployment & Betrieb – Wir wollen weg

Stand: 2026-10-08 · Verantwortlich: Operations Manager · Status: v0.2 – **aktueller Betriebsmodus: Offline-Demo (§0)**; Hosting-/Mail-Plan (§2–§7) gilt **ab Go-Live** (Auftraggeber-Entscheidung Q15, 2026-10-08)

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
- **Client-IP für Rate-Limits (R-005):** Next.js übernimmt einen vom Client mitgeschickten `X-Forwarded-For` ungeprüft, wenn die App direkt erreichbar ist – IP-Limits ließen sich so per Header umgehen. Deshalb ist die App **nie direkt** erreichbar, sondern nur über einen Proxy, der den Header **überschreibt**: in der Demo `proxy` (Caddy vertraut keinem vorgelagerten Proxy und setzt `X-Forwarded-For` = echte Absender-IP), ab Go-Live Caddy (§5.2). Die App liest die IP aus `AUTH_IP_HEADER` (Standard `x-forwarded-for`), überspringt von rechts Einträge aus `AUTH_TRUSTED_PROXIES` und nimmt den ersten anderen Eintrag. Anfragen ohne auflösbare IP werden außerhalb von `development`/`ci` mit 400 abgelehnt (kein gemeinsamer Sammeltopf).
- Umgebungsdatei: `.env.demo` (in `.gitignore`), erzeugt aus `.env.example`; `APP_ENV=demo` (siehe §4).
- `APP_ENV=demo` bewirkt: Mail-Transport fest auf Mailpit (kein externer SMTP möglich), `noindex` überall, sichtbares Banner „Demo – keine echten Daten eingeben“ (DE/EN), Rechtstext-Seiten mit Platzhaltern erlaubt (compliance-checklist.md §0a).

### 0.2 Demo starten (Laptop)

Voraussetzungen: Docker (Desktop oder Engine + Compose-Plugin), Git. Kein Node/pnpm nötig für die reine Demo.

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
| `APP_ENV` | ja | `development` \| `ci` \| `demo` \| `staging` \| `production` (steuert Mail-Transport, noindex, Logging, Demo-Banner, Platzhalter-Schutz §0.6) | `development` |
| `APP_URL` | ja | öffentliche Basis-URL ohne Slash am Ende | `http://localhost:3000` |
| `DATABASE_URL` | ja | PostgreSQL-Verbindung | `postgres://app:app@localhost:5432/wirwollenweg` |
| `POSTGRES_PASSWORD` | ja (Compose) | Passwort des DB-Containers | `change-me` |
| `BETTER_AUTH_SECRET` | ja | ≥ 32 Byte Zufall (Signatur/Verschlüsselung von Cookies/Tokens); je Umgebung verschieden | `generate-with-openssl-rand-base64-32` |
| `BETTER_AUTH_URL` | ja | = `APP_URL` | `http://localhost:3000` |
| `AUTH_TRUSTED_ORIGINS` | nein | zusätzliche erlaubte Origins (kommagetrennt) | – |
| `AUTH_IP_HEADER` | nein | Header mit der Client-IP für Rate-Limits; muss vom vorgeschalteten Proxy **überschrieben** werden (R-005, §0.1). Caddy (Demo, staging, prod): `x-forwarded-for`; Cloudflare-Tunnel: `cf-connecting-ip` | `x-forwarded-for` |
| `AUTH_TRUSTED_PROXIES` | nein | IPs/CIDRs vorgelagerter Proxys, deren Einträge im Header von rechts übersprungen werden (nur bei Proxy-Ketten, z. B. CDN → Caddy); ungültige Einträge → Fehler | leer |
| `DEMO_BIND_ADDRESS` | nur demo | Host-Adresse der Demo-Ports (`0.0.0.0` WLAN-Test, `127.0.0.1` nur Laptop/Tunnel) | `0.0.0.0` |
| `MAIL_TRANSPORT` | ja | `smtp` (Standard) | `smtp` |
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
5. Caddy als Reverse-Proxy: automatische TLS-Zertifikate (Let's Encrypt), HTTP→HTTPS, HSTS, Kompression, Zugriffslogs ohne Query-Strings (Tokens!) und mit 7 Tagen Aufbewahrung.
6. DNS-Einträge (§7), Mail-Domain beim Anbieter verifizieren.

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
| Fehler | Sentry-SDK → **Bugsink selbst gehostet** (Daten bleiben auf unserer VM; `sendDefaultPii: false`, `beforeSend` entfernt E-Mail/Token/Codes; Aufbewahrung 30 Tage). Alternative: Sentry SaaS mit Datenstandort Frankfurt (US-Unternehmen → AVV + SCC/DPF nötig). | neue Fehlerart → E-Mail |
| Server | Minimalvariante ohne eigenen Monitoring-Stack: Graphen in der Hetzner-Console + Cron-Skript für Disk > 80 % und Container-Neustarts | E-Mail |
| Mail-Zustellung | Bounce-/Beschwerde-Webhook des Anbieters → Zähler in DB; Dashboard des Anbieters; DMARC-Aggregatberichte an `dmarc@<domain>` | Bounce-Rate > 5 % oder Zustellung > 1 Min. im Median |
| Auth-Sicherheit | Zähler für fehlgeschlagene Code-Prüfungen und Rate-Limit-Treffer (aggregiert) | sprunghafter Anstieg → E-Mail |
| Produkt-Kennzahlen (PRD §4) | **eigene, cookielose Ereignis-Tabelle** (aggregiert, ohne Personenbezug; z. B. „registration_started/verified“, „trip_joined“) – kein Drittanbieter-Analytics | – |

Logs: Docker-JSON-Logs mit Rotation; App-Logs ohne E-Mail/Codes/Tokens; IP-Adressen max. 7 Tage.

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

- Hetzner: [Preisanpassung Juni 2026 (Analyse)](https://privatedevops.com/news/hetzner-june-2026-cloud-price-increase-what-to-do), [Findstack – Hetzner price increase 2026](https://findstack.com/resources/hetzner-price-increase-2026), [Cloud Pricing Comparison 2026-08](https://kimmo.suominen.com/stuff/cpc-2026-08.txt), [Hetzner CX23 (whtop)](https://www.whtop.com/amp/plans/hetzner.com/144086), [Hetzner Object Storage (whtop)](https://www.whtop.com/amp/plans/hetzner.com/144077), [Sliplane – Object Storage Europa](https://sliplane.io/blog/cheap-object-storage-providers-europe), [Hetzner Pricing Breakdown (Backups 20 %)](https://deployhandbook.com/pricing/hetzner)
- Netcup: [valebyte – netcup review 2026](https://valebyte.com/en/blog/netcup-review-2026-the-price-performance-king-and-its-fine-print/)
- Scaleway: [Instances-Preise](https://www.scaleway.com/en/pricing/virtual-instances/), [Managed Databases](https://www.scaleway.com/en/pricing/managed-databases/), [TEM](https://www.scaleway.com/fr/transactional-email-tem/)
- Fehler-Tracking: [Bugsink vs. GlitchTip](https://www.bugsink.com/blog/bugsink-vs-glitchtip/), [Sentry EU-Datenstandort](https://sentry.io/changelog/data-storage-location-in-germany-is-generally-available/)
