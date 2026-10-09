# Wir wollen weg · When do we go?

Web-App, mit der Freundesgruppen einen gemeinsamen Urlaubszeitraum finden. Entwickelt von einem Team aus Claude-Code-Subagents unter Leitung des Hauptchats (CEO).

- Team und Ablauf: [CLAUDE.md](CLAUDE.md) · Agent-Definitionen: [.claude/agents/](.claude/agents/)
- Planung, Design, UX, Review, Ops: [docs/](docs/) – Stack & Konventionen: [docs/ops/tech-stack.md](docs/ops/tech-stack.md)

**Aktueller Stand:** Inkrement 2 – Konto, Reise anlegen, einladen, beitreten, Rollen, „Meine Reisen“ (Tabs „Meine Tage“, „Gruppe“, „Abstimmen“ folgen in Inkrement 3–5). Betriebsmodus **Offline-Demo** – kein Hosting, alle Mails landen lokal in Mailpit.

## Voraussetzungen

- Docker (Desktop oder Engine + Compose-Plugin)
- Für die Entwicklung zusätzlich: Node.js 24 (`.nvmrc`) und pnpm über Corepack (`corepack enable` – Version kommt aus `package.json`)

## Entwicklung lokal

```bash
corepack enable
pnpm install
cp .env.example .env.local                 # BETTER_AUTH_SECRET setzen: openssl rand -base64 32
docker compose -f docker/compose.dev.yml up -d   # PostgreSQL 18 (:5432) + Mailpit (:1025/:8025)
pnpm db:migrate                            # Migrationen aus drizzle/ anwenden
pnpm db:seed:demo                          # optional: 8 Demo-Personen, 6 Reisen in allen Phasen (gibt Links aus)
pnpm dev                                   # http://localhost:3000
```

- App: <http://localhost:3000> (leitet je nach Browsersprache auf `/de` oder `/en`)
- **Mailpit (Codes und Magic-Links): <http://localhost:8025>**
- Anmelden: <http://localhost:3000/login> → beliebige Adresse, z. B. `anna@demo.test` → Code in Mailpit ablesen.
- Demo-Daten: nach `pnpm db:seed:demo` als `anna@demo.test` anmelden (in allen Reisen dabei, Orga von dreien). Einladung testen: einen der ausgegebenen Links `/i/<token>` öffnen (z. B. in einem privaten Fenster).
- Handy im WLAN: `DEV_ALLOWED_ORIGINS=<LAN-IP>` in `.env.local`, `pnpm dev -H 0.0.0.0`, `APP_URL`/`BETTER_AUTH_URL` auf `http://<LAN-IP>:3000` (Details: [deployment.md §0.3](docs/ops/deployment.md)).

## Offline-Demo (ohne Node, nur Docker)

App als Produktions-Build + PostgreSQL + Mailpit ([deployment.md §0](docs/ops/deployment.md)):

```bash
cp .env.example .env.demo   # dort setzen: APP_ENV=demo, BETTER_AUTH_SECRET, POSTGRES_PASSWORD
docker compose -f docker/compose.demo.yml --env-file .env.demo up -d --build
docker compose -f docker/compose.demo.yml --env-file .env.demo run --rm tools pnpm db:migrate
docker compose -f docker/compose.demo.yml --env-file .env.demo run --rm tools pnpm db:seed:demo
```

App <http://localhost:3000> · Mailpit <http://localhost:8025> · Stoppen: `… down` · Zurücksetzen inkl. Daten: `… down -v`. Mit pnpm gibt es Kurzbefehle: `pnpm demo:up`, `demo:seed`, `demo:down`, `demo:reset`.

## Skripte

| Skript                              | Zweck                                                                                  |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `pnpm dev`                          | Entwicklungsserver (Turbopack)                                                         |
| `pnpm build` / `pnpm start`         | Produktions-Build / -Server                                                            |
| `pnpm lint`                         | `next typegen` + ESLint (Next, typescript-eslint strict, jsx-a11y, keine JSX-Literale) |
| `pnpm format` / `pnpm format:check` | Prettier schreiben / prüfen                                                            |
| `pnpm typecheck`                    | `next typegen` + `tsc --noEmit`                                                        |
| `pnpm i18n:check`                   | `messages/de.json` und `en.json` haben identische Schlüssel, keine leeren Werte        |
| `pnpm test`                         | Unit-Tests (Vitest)                                                                    |
| `pnpm test:e2e`                     | E2E (Playwright; startet die App selbst, braucht PostgreSQL + Mailpit)                 |
| `pnpm db:generate`                  | Migration aus `src/server/db/schema.ts` erzeugen (`drizzle/`)                          |
| `pnpm db:migrate`                   | Migrationen anwenden                                                                   |
| `pnpm db:seed:demo`                 | Demo-Daten: Personen `*@demo.test`, Reisen in allen Phasen (nur `development`/`demo`)  |
| `pnpm dev:services`                 | `docker/compose.dev.yml` starten                                                       |

E2E-Hinweise: Lokal am zuverlässigsten im CI-Modus (`pnpm build`, dann `CI=1 pnpm test:e2e`). Lädt `pnpm dev` die Seiten ständig neu (beobachtet mit einem alten `.next`-Ordner), hilft `rm -rf .next`. Projekte `desktop-chromium`, `mobile-chromium`, `mobile-webkit`. Auswahl mit `E2E_PROJECTS=desktop-chromium,mobile-chromium`; vorinstalliertes Chromium mit `E2E_CHROMIUM_PATH=/pfad/zu/chrome`. In CI baut der Workflow vorher (`pnpm build`) und Playwright startet `pnpm start`.

## Struktur (Kurzfassung)

```
src/app/[locale]/        öffentliche Seiten mit Sprachpräfix (/de, /en)
src/app/(app)/           sprachneutrale App-Routen (/login, /i/<token>, /trips, /trips/new, /trips/<id>/…, /auth/magic)
src/app/api/             Better Auth (/api/auth/*), /api/health
src/features/            fachliche Module (auth, invite, trips, account, locale)
src/lib/                 reine, getestete Logik
src/server/              DB (Drizzle), Auth (Better Auth), Mail (Nodemailer)
src/i18n/                next-intl: Locale-Ermittlung (Cookie lang → Accept-Language)
src/styles/globals.css   importiert docs/design/tokens.css direkt (eine Quelle der Wahrheit)
messages/                UI-Texte DE/EN
drizzle/                 SQL-Migrationen
docker/                  compose.dev.yml, compose.demo.yml, Dockerfile
tests/e2e/               Playwright inkl. Mailpit-Client
```
