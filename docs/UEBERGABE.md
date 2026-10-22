# Übergabe – „Wir wollen weg“ / „When do we go?“

Kurzüberblick für Entwickler, die neu einsteigen. Stand: 2026-10-20.

## 1. Worum es geht

Web-App, mit der Freundesgruppen einen gemeinsamen Urlaubszeitraum finden:

1. Die Orga legt eine Reise mit Suchzeitraum und Mindestdauer an und teilt einen Einladungslink.
2. Die Mitglieder treten bei und malen ihre Tage („Geht / Zur Not / Geht nicht“).
3. Die Gruppe sieht eine Heatmap mit automatischen Vorschlägen („Alle dabei“, „Fast alle dabei“).
4. Die Orga erstellt eine Abstimmung, alle stimmen ab, die Orga legt den Termin fest. Danach erscheint die Feier „Es geht los!“ und es gibt einen ICS-Export.

Die App ist zweisprachig (DE/EN), Mobile-first und folgt dem Look „Reise-Cockpit“ (Indigo & Minze) mit Animationen. Jeder braucht ein Konto: Login per 6-stelligem Code oder Magic-Link, Passwort optional.

**Betriebsmodus: Offline-Demo.** Es gibt noch kein Hosting, keine Domain und keine echten Mails; alle Mails landen lokal in Mailpit.

## 2. Stand

| Bereich | Status |
|---|---|
| Inkremente 1–6 (Konto, Reisen, Meine Tage, Heatmap/Vorschläge, Abstimmung/Festlegung, Datenschutz/Konto löschen) | fertig, vom Reviewer freigegeben, auf `main` |
| Meilenstein M0.5 „Demo“ | Demo-Paket fertig (`scripts/demo.sh`, Windows: `scripts/demo.ps1`, PR #17 offen); **Demo-Abnahme durch den Auftraggeber läuft** |
| Inkrement 7 (F-015 „Gruppe erinnern“, F-017 Fristen komplett, Motion „MVP+“ inkl. Haptik) | offen |
| Go-Live-Gate G1 (echte Testgruppen) | offen, Entscheidungen des Auftraggebers ausstehend (siehe §7) |
| Danach (v1) | Kalender-Import inkl. Apple/iOS, E-Mail-Benachrichtigungen; Idee F-031 „Unterkünfte per Swipe bewerten“ |

**Wo du einsteigst:** Feedback aus der Demo-Abnahme einarbeiten, danach Inkrement 7 oder Go-Live-Vorbereitung, je nach Entscheidung des Auftraggebers. Kleine bekannte Punkte, die du jederzeit aufgreifen kannst, stehen in §6.

## 3. Stack

- **Next.js 16** (App Router, Server Actions) mit TypeScript strict und **React 19**; pnpm, Node 24
- **PostgreSQL 18** mit **Drizzle** (Schema in `src/server/db/schema.ts`, Migrationen in `drizzle/0000–0006`)
- **Better Auth 1.7** (Code + Magic-Link in einer Mail, optional Argon2id-Passwort) mit eigenem Plugin für Rate-Limits pro E-Mail
- **next-intl** (DE/EN): App-Routen ohne Präfix, Sprache per Cookie `lang`; öffentliche Seiten unter `/de` und `/en`
- **date-holidays** für Feiertage (DE inkl. Länder, AT, CH, GB, US)
- **CSS Modules** mit Design-Tokens aus `docs/design/tokens.css` (Präfix `--ww-`); eigene Motion-Helfer (WAAPI) in `src/lib/motion.ts`
- **Tests:** Vitest (Unit, ca. 325) und Playwright (E2E, ca. 325, Chromium; WebKit/iPhone 15 nur in der CI) mit axe
- **CI:** GitHub Actions (`.github/workflows/ci.yml`: detect → lint/typecheck/unit → build → E2E), Node 24
- **Geplantes Hosting:** Hetzner (DE) und Lettermint (EU-Mail), noch nicht eingerichtet

## 4. Loslegen

```bash
corepack enable && pnpm install
cp .env.example .env.local              # BETTER_AUTH_SECRET: openssl rand -base64 32
pnpm dev:services                       # PostgreSQL :5432 + Mailpit :8025 (Docker)
pnpm db:migrate && pnpm db:seed:demo    # Schema + Demo-Daten (9 Personen, 12 Reisen in allen Phasen)
pnpm dev                                # http://localhost:3000
```

- Login z. B. als `anna@demo.test`; den Code liest du in Mailpit unter <http://localhost:8025> ab.
- Prüfungen wie in der CI: `pnpm lint && pnpm typecheck && pnpm i18n:check && pnpm format:check && pnpm test && pnpm build && CI=1 pnpm test:e2e`
- Lokales Chromium für E2E: `E2E_CHROMIUM_PATH=…`; siehe `playwright.config.ts`.
- **Demo ohne Node:** `bash scripts/demo.sh start` (Windows: `powershell -ExecutionPolicy Bypass -File scripts\demo.ps1 start`). Anleitung: `docs/ops/demo-anleitung.md`.

## 5. Codeaufbau

```
src/app/(app)/        Routen mit Login: trips/[id]/{page,days,group,poll,poll/new,invite,settings,event.ics},
                      account (+ /delete), login, auth, i/[token] (Einladung), goodbye, dev/ui (Komponenten-Showcase)
src/app/[locale]/     Öffentliche Seiten: Landing, Hilfe, Datenschutz, Impressum (DE/EN)
src/app/api/          auth (Better Auth), health, internal/retention (Löschjob, Bearer-Token)
src/features/<x>/     Server Actions, Laden der Daten, Komponenten je Bereich
                      (auth, account, trips, invite, days, group, poll, help, legal, locale)
src/server/           DB-Zugriff (trips, availability, poll, account-deletion, retention), auth/*, rate-limit
src/lib/              Reine Logik mit Unit-Tests: heatmap, suggestions, poll, calendar, holidays, ics,
                      motion, retention, trip-input, email-limits, safe-path …
src/components/ui/    Basis-Komponenten (Button, Sheet, Snackbar, Code-Feld …)
messages/{de,en}.json Alle Texte (keine Literale im JSX – ESLint-Regel)
tests/e2e/            Playwright-Specs pro Inkrement, helpers/ (DB, axe, Login)
scripts/              seed-demo.ts, i18n-check.ts, demo.sh, demo.ps1
```

**Regeln, die überall gelten:**

- **Kein IDOR:** Jede Abfrage zu einer Reise läuft über die Mitgliedschaft (`findMembership`). Orga-Aktionen prüfen die Rolle auf dem Server.
- **Phasenwechsel** (Abstimmung starten/abbrechen, Termin festlegen/aufheben) sperren die Reisezeile mit `FOR UPDATE`; Abstimmen nutzt `FOR SHARE`.
- **Q13 a:** Das Ergebnis einer Abstimmungsoption sieht man erst nach der eigenen Stimme. Das wird serverseitig in `pollForViewer` durchgesetzt, Daten verdeckter Optionen landen nie im RSC-Payload.
- **Animationen:** nur `transform` und `opacity`, reduzierte Bewegung wird respektiert. Server-gerenderter Inhalt darf nie verschwinden oder blinken (R-017). Zahlen zählen nie hoch.
- **Nach Node 24 testen:** `new Request(request, {headers})` bricht dort (R-011).
- **E2E-Tests** müssen auch auf 393×659 laufen (iPhone 15 in der CI): `expect.poll` statt einmal lesen, Animationen nur auf sichtbaren Elementen.

## 6. Wo was dokumentiert ist

| Thema | Datei |
|---|---|
| Projektstand, Team, Ablauf (immer zuerst lesen) | `CLAUDE.md` |
| Produkt, Entscheidungen Q1–Q24 | `docs/product/PRD.md` (§12), `features.md` (F-IDs + Akzeptanzkriterien), `roadmap.md` |
| UX: Flows, Wireframes W01–W15, Spec | `docs/ux/` (`ux-spec.md` §12/§13 = abgenommene Abweichungen) |
| Design-System, Tokens, Assets | `docs/design/` |
| Motion-System, Interaktions-Katalog, Prototypen | `docs/motion/` |
| Review-Findings R-001–R-064 (Status, Lehren) | `docs/review/findings.md` |
| Betrieb, Deployment, Compliance, Go-Live, Status-Board | `docs/ops/` |

**Offene Findings und kleine Punkte:**

- R-014: doppelte IP-Auflösung, später entscheiden.
- R-035 (vor Go-Live): Die Konto-Adresse zählt selbst als Variante beim E-Mail-Rate-Limit.
- R-037 (vor Go-Live): Einladungs-Token stehen in Zugriffslogs.
- R-064 (vor Go-Live): Startschutz gegen eine `http://`-Basis-URL in production fehlt.
- UX-Restpunkte vor Go-Live:
  - Tagesliste bei großer Schrift (U-5/D-15)
  - Link „Platzhalter verwalten“
  - Abbruch-Hinweis der Abstimmung auch in der Übersicht
  - Löschjob-Abfrage auf Kandidaten einschränken
  - Designer-Abnahmen R-052 und R-057

## 7. Vor dem Go-Live (Gate G1)

**Entscheidungen des Auftraggebers:**

- echte Betreiber- und Impressumsangaben (Q14);
- wie die Rechtstexte entstehen, per Generator oder mit Anwalt (Q16);
- Domain, Hosting- und Mail-Konten (Q15);
- HIBP-Passwortprüfung ja oder nein.

**Technik:**

- R-035, R-037 und R-064 beheben;
- Proxy-Rate-Limit für `/i/*`;
- täglicher Timer für `POST /api/internal/retention` und `RETENTION_TOKEN` setzen;
- Caddy-Log-Redaction;
- Platzhalter in den Rechtstexten ersetzen; die App startet mit `APP_ENV=production` nicht, solange noch Platzhalter da sind.

Checklisten: `docs/ops/go-live.md` und `docs/ops/compliance-checklist.md`.

## 8. Arbeitsweise

- Branch-Workflow: Jede Stufe kommt als PR auf `main` und wird erst nach Freigabe des Reviewers **und** des Auftraggebers gemergt. Die CI muss grün sein, inklusive WebKit.
- Dokumente schreiben wir auf Deutsch; Code, Bezeichner und Commits auf Englisch.
- Feature-IDs heißen `F-xxx`, Findings `R-xxx`.
- Keine Secrets im Repo: `.env.*` ist ignoriert, nur `.env.example` ist versioniert.
