# Deployment & Betrieb – Wir wollen weg

Stand: 2026-10-08 · Verantwortlich: Operations Manager · Status: Entwurf v0.1 (Konzeptphase; wird bis M1 konkretisiert, sobald Hosting-/Mail-Zugänge existieren)

Bezug: [tech-stack.md](tech-stack.md) · [compliance-checklist.md](compliance-checklist.md) · [PRD §8](../product/PRD.md)

> Preise netto, Recherche 2026-10-08 (Quellen am Ende). Hetzner hat 2026 zweimal Preise angepasst und die günstigen CX-/CAX-Tarife waren zeitweise „nicht verfügbar“ – **vor Bestellung live prüfen**.

---

## 1. Grundsätze

- **Alle personenbezogenen Daten bleiben in der EU** bei EU-Anbietern ohne US-Mutter (App, DB, Backups, Mails, Fehler-Tracking). Damit entfällt die Drittland-Bewertung (Art. 44 ff. DSGVO) für den Kernbetrieb.
- **Einfach vor elastisch:** eine VM mit Docker Compose reicht für das MVP um Größenordnungen (max. 30 Personen pro Reise, wenige tausend Nutzer). Kein Kubernetes, keine Serverless-Funktionen.
- **Build once, deploy many:** ein Container-Image pro Commit, identisch für Staging und Produktion; Unterschiede nur über Umgebungsvariablen.
- **Keine Secrets im Repo.** Im Repo nur `.env.example` mit Namen und Platzhaltern.

## 2. Hosting & Kosten

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
| **dev** | lokale Entwicklung | Laptop/Cloud-Session: `docker compose -f docker/compose.dev.yml up` (PostgreSQL 18 + Mailpit), App per `pnpm dev` | synthetisch (Seed-Skript) | Mailpit (`localhost:8025`) | lokal |
| **ci** | automatische Prüfung | GitHub Actions, Service-Container | synthetisch, flüchtig | Mailpit | – |
| **staging** | Abnahme durch Reviewer/CEO/Auftraggeber, Test auf echten Handys (In-App-Browser) | gleiche VM, eigenes Compose-Projekt, `staging.<domain>`, eigene DB | synthetisch, **keine echten Nutzerdaten** | Mailpit-Web-UI hinter Passwort (Tester lesen Codes dort) | HTTP-Basic-Auth vor allem außer `/i/*`-Testlinks; `noindex` |
| **prod** | Beta (M1) und Launch (M2) | `<domain>` | echte Daten | Lettermint | öffentlich |

Keine Preview-Umgebung pro Pull Request im MVP (Kosten, Aufwand, Datenschutz). Bei Bedarf später: kurzlebige Compose-Projekte auf der Staging-VM.

## 4. Umgebungsvariablen (nur Namen – Werte nie ins Repo)

Ablage: Produktion/Staging als Datei `/opt/wir-wollen-weg/<env>/.env` (Rechte `600`, Eigentümer Deploy-Nutzer), Deploy-Zugänge als **GitHub Environment Secrets** (`staging`, `production`, Produktion mit manueller Freigabe). Lokal `.env.local` (in `.gitignore`).

| Variable | Pflicht | Beschreibung | Beispiel/Platzhalter in `.env.example` |
|---|---|---|---|
| `NODE_ENV` | ja | `production` in staging/prod | `development` |
| `APP_ENV` | ja | `development` \| `ci` \| `staging` \| `production` (steuert Mail-Transport, noindex, Logging) | `development` |
| `APP_URL` | ja | öffentliche Basis-URL ohne Slash am Ende | `http://localhost:3000` |
| `DATABASE_URL` | ja | PostgreSQL-Verbindung | `postgres://app:app@localhost:5432/wirwollenweg` |
| `POSTGRES_PASSWORD` | ja (Compose) | Passwort des DB-Containers | `change-me` |
| `BETTER_AUTH_SECRET` | ja | ≥ 32 Byte Zufall (Signatur/Verschlüsselung von Cookies/Tokens); je Umgebung verschieden | `generate-with-openssl-rand-base64-32` |
| `BETTER_AUTH_URL` | ja | = `APP_URL` | `http://localhost:3000` |
| `AUTH_TRUSTED_ORIGINS` | nein | zusätzliche erlaubte Origins (kommagetrennt) | – |
| `TRUSTED_PROXY_IP_HEADER` | ja (prod) | Header mit Client-IP hinter Caddy | `x-forwarded-for` |
| `MAIL_TRANSPORT` | ja | `smtp` (Standard) | `smtp` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE` | ja | SMTP des Mail-Anbieters bzw. Mailpit | `localhost`, `1025`, leer, leer, `false` |
| `MAIL_FROM` | ja | Absenderadresse | `login@mail.example.org` |
| `MAIL_FROM_NAME_DE`, `MAIL_FROM_NAME_EN` | ja | Absendername je Sprache | `Wir wollen weg`, `Wir wollen weg` |
| `MAIL_REPLY_TO` | ja | Antwortadresse (Kontaktpostfach) | `hallo@example.org` |
| `MAIL_WEBHOOK_SECRET` | nein | Signaturprüfung Bounce-/Beschwerde-Webhook | – |
| `SENTRY_DSN` | nein | DSN des Bugsink-Projekts (leer = aus) | – |
| `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE` | nein | Umgebung, Git-SHA | `development` |
| `LOG_LEVEL` | nein | `info` (prod), `debug` (dev) | `debug` |
| `RATE_LIMIT_ENABLED` | nein | in E2E-Tests gezielt abschaltbar (nie in prod) | `true` |
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

## 5. Deployment-Ablauf

### 5.1 Server-Grundeinrichtung (einmalig, Runbook vor M1)
1. Hetzner-Projekt anlegen, **AVV in der Console abschließen**, 2FA für alle Konten.
2. VM (Ubuntu LTS) in DE mit SSH-Key, Hetzner-Firewall: nur 22 (auf feste IPs bzw. per Key), 80, 443. Server-Backups aktivieren.
3. Härtung: eigener Deploy-Nutzer, kein Root-Login, kein Passwort-Login, `unattended-upgrades`, `fail2ban`, Zeitzone UTC.
4. Docker Engine + Compose-Plugin; Verzeichnisse `/opt/wir-wollen-weg/{production,staging}` mit `compose.yml` und `.env`.
5. Caddy als Reverse-Proxy: automatische TLS-Zertifikate (Let's Encrypt), HTTP→HTTPS, HSTS, Kompression, Zugriffslogs ohne Query-Strings (Tokens!) und mit 7 Tagen Aufbewahrung.
6. DNS-Einträge (§7), Mail-Domain beim Anbieter verifizieren.

### 5.2 Compose-Dienste (prod)
`caddy` (80/443) → `app` (Next.js standalone, Port 3000 nur intern) → `db` (PostgreSQL 18, Volume, nur internes Netz) · `bugsink` (Fehler-Tracking, eigene Subdomain mit Login) · `backup` (Cron-Container: `pg_dump` + `age` + Upload) · `jobs` (Cron: Lösch-/Inaktivitäts-Jobs F-013/F-043, täglich 03:00 UTC, ruft `pnpm job:retention` im App-Image auf).

### 5.3 Release-Ablauf (Workflow `deploy.yml`, wird erstellt, sobald Zugänge existieren)
1. Merge auf `main` → CI grün (Lint, Typecheck, Unit, Build, E2E).
2. Image bauen, taggen mit Git-SHA, nach `ghcr.io/<owner>/wir-wollen-weg` pushen.
3. **Staging automatisch:** per SSH `docker compose pull && docker compose run --rm app pnpm db:migrate && docker compose up -d`; Smoke-Test (`/api/health` liefert 200 inkl. DB-Ping).
4. Abnahme auf Staging (Reviewer ✅, ggf. Auftraggeber).
5. **Produktion per manueller Freigabe** (GitHub Environment Protection) mit demselben Image-Tag; vor der Migration automatischer `pg_dump`.
6. Rollback: vorherigen Image-Tag deployen. Migrationen nur **rückwärtskompatibel** (expand → migrate → contract über zwei Releases), damit Rollback ohne DB-Restore möglich ist.
7. Release-Notiz in `docs/ops/status.md` (Version, Datum, Feature-IDs).

Kurze Downtime (Sekunden) beim Container-Neustart ist im MVP akzeptiert; Zero-Downtime (z. B. zwei App-Container hinter Caddy) bei Bedarf nach Launch.

## 6. Backups, Monitoring, Fehler-Tracking

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

## 7. Domain, DNS & Mail-Authentifizierung

### 7.1 Domain
Entscheidung durch den Auftraggeber (siehe Entscheidungsbedarf im Bericht). Optionen (Verfügbarkeit vor Kauf prüfen): `wirwollenweg.de`, `wir-wollen-weg.de`, zusätzlich ggf. `.app`/`.com` für Englisch. Registrar in der EU (z. B. INWX, Hetzner), DNSSEC aktivieren; DNS bei Hetzner (kostenlos) oder beim Registrar.

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

## 8. Checkliste „Go-Live“ (M1 Beta / M2 Launch)

- [ ] AVVs abgeschlossen (Hetzner, Mail-Anbieter, ggf. Object-Storage-Anbieter) – compliance-checklist.md §3
- [ ] Impressum + Datenschutzerklärung DE/EN + Nutzungsbedingungen live (M2: Pflicht; M1: mindestens Impressum + Datenschutzerklärung DE)
- [ ] SPF/DKIM/DMARC grün (z. B. mit Mail-Tester geprüft), DMARC `p=reject` (M2)
- [ ] Backups laufen, Restore-Test erfolgreich dokumentiert
- [ ] Uptime- und Fehler-Alarme kommen an
- [ ] Retention-Job (F-013/F-043) läuft täglich, Testlauf auf Staging
- [ ] Security-Header geprüft (z. B. securityheaders.com), TLS A/A+, `noindex` auf Reiseseiten
- [ ] `/.well-known/security.txt` mit Kontakt
- [ ] Rate-Limits aktiv (`RATE_LIMIT_ENABLED=true`)
- [ ] Reviewer-Freigabe ✅ für alle Features des Meilensteins (DE und EN)

---

## Quellen (Abruf 2026-10-08)

- Hetzner: [Preisanpassung Juni 2026 (Analyse)](https://privatedevops.com/news/hetzner-june-2026-cloud-price-increase-what-to-do), [Findstack – Hetzner price increase 2026](https://findstack.com/resources/hetzner-price-increase-2026), [Cloud Pricing Comparison 2026-08](https://kimmo.suominen.com/stuff/cpc-2026-08.txt), [Hetzner CX23 (whtop)](https://www.whtop.com/amp/plans/hetzner.com/144086), [Hetzner Object Storage (whtop)](https://www.whtop.com/amp/plans/hetzner.com/144077), [Sliplane – Object Storage Europa](https://sliplane.io/blog/cheap-object-storage-providers-europe), [Hetzner Pricing Breakdown (Backups 20 %)](https://deployhandbook.com/pricing/hetzner)
- Netcup: [valebyte – netcup review 2026](https://valebyte.com/en/blog/netcup-review-2026-the-price-performance-king-and-its-fine-print/)
- Scaleway: [Instances-Preise](https://www.scaleway.com/en/pricing/virtual-instances/), [Managed Databases](https://www.scaleway.com/en/pricing/managed-databases/), [TEM](https://www.scaleway.com/fr/transactional-email-tem/)
- Fehler-Tracking: [Bugsink vs. GlitchTip](https://www.bugsink.com/blog/bugsink-vs-glitchtip/), [Sentry EU-Datenstandort](https://sentry.io/changelog/data-storage-location-in-germany-is-generally-available/)
