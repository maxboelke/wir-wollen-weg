# Tech-Stack & Konventionen – Wir wollen weg

Stand: 2026-10-08 · Verantwortlich: Operations Manager · Status: v1.2 (v1.0 mit M0 am 2026-10-08 freigegeben; v1.1 = Abweichungen aus Scaffold P1-0 übernommen: Routing §4, ESLint/TS-Versionen, T3, Standalone, Referrer-Policy; v1.2 (2026-10-09) = §3.2 auf Ist-Stand Inkrement 1 + Review-Fixes R-021–R-028: Limits pro Adresse/Postfach, Sperre ohne Mail-Sperre, HMAC-Schlüssel, Re-Auth, Argon2id, `PASSWORD_BREACH_CHECK`) · Betriebsmodus: **Offline-Demo** bis zum [Go-Live-Gate](go-live.md)

Bezug: [PRD](../product/PRD.md) (§6, §8, §10, §12) · [features.md](../product/features.md) · [roadmap.md](../product/roadmap.md) · [deployment.md](deployment.md) · [go-live.md](go-live.md) · [compliance-checklist.md](compliance-checklist.md) · [status.md](status.md)

> Versionsangaben: per `npm view` am 2026-10-08 geprüft. Preise: Web-Recherche am 2026-10-08, Quellen am Ende; alle Preise netto (zzgl. USt) und **vor Bestellung auf der Anbieterseite zu prüfen** – insbesondere Hetzner hat 2026 zweimal die Preise geändert.

---

## 1. Entscheidung auf einen Blick

| Bereich | Empfehlung | Version (2026-10-08) |
|---|---|---|
| Sprache | TypeScript (strict) | **6.0.x** (6.0.3) – nicht 7.x, solange `typescript-eslint` es nicht unterstützt |
| Framework | **Next.js (App Router), React Server Components, Server Actions** | `next` 16.4.0 |
| Laufzeit | **Node.js 24 LTS** (Wechsel auf Node 26 nach LTS-Start Ende Okt. 2026 und Ökosystem-Check, spätestens Q2 2027) | 24.x |
| Rendering | SSR (dynamisch) für alle App-Seiten; statisch für Startseite & Rechtstexte; nur Node-Runtime (keine Edge-Runtime) | – |
| Datenbank | **PostgreSQL 18** | 18.x |
| ORM / Migrationen | **Drizzle ORM + drizzle-kit** | 0.45.x / 0.31.x |
| Validierung | Zod | 4.x |
| Auth | **Better Auth** (Bibliothek, Daten in eigener DB) mit Plugins `emailOTP`, `magicLink`, E-Mail+Passwort (Leak-Prüfung eigen: Offline-Liste, HIBP optional per `PASSWORD_BREACH_CHECK`, §3.2); später `socialProviders` (Google, Apple) | 1.7.7 |
| Passwort-Hash | Argon2id (m=19456 KiB, t=2, p=1, 32 Byte; PHC-Format) über Node `crypto.argon2` (ab Node 24.7), Rückfall `@noble/hashes` – als eigene hash/verify-Funktion in Better Auth (§3.2) | – |
| i18n | **next-intl** (ICU-Messages; App-Routen ohne Sprachpräfix, Präfix nur für öffentliche Seiten – §4) | 4.14.x |
| Datum | ISO-Kalendertage `YYYY-MM-DD` + `@internationalized/date`; Formatierung über `Intl` / next-intl | – |
| Feiertage | **date-holidays** (serverseitig) | 3.37.0 |
| Styling | **CSS Modules + globale CSS-Custom-Properties aus `docs/design/tokens.css`** | – |
| Barrierefreie Primitives | `react-aria-components` (Dialog, Menü, Kalender-Grundlagen, Fokus-Management) – optional, Entscheidung Developer nach UX-Spec | 1.x |
| Mails | React Email (Vorlagen) + Nodemailer (SMTP, anbieterneutral) | react-email 6.x |
| Mail-Anbieter | Demo/Dev/CI: **Mailpit** (lokal). **Ab Go-Live:** Lettermint (NL, EU-only); Alternative Scaleway TEM | – |
| Unit-Tests | **Vitest** (+ Testing Library für Komponenten) | 5.0.x |
| E2E-Tests | **Playwright** (WebKit-iPhone, Chromium-Android, Desktop) + `@axe-core/playwright` + Mailpit für Codes | 1.64.x |
| Lint / Format | **ESLint (Flat Config, `eslint-config-next`, `typescript-eslint`, `jsx-a11y`) + Prettier** | **ESLint 9.39.x** (nicht 10 – §2.1), Prettier 3.x |
| Paketmanager | **pnpm** (Version über `packageManager`-Feld in `package.json` fixiert, Corepack) | 12.x |
| Hosting | Aktuell **keins** – Offline-Demo per Docker Compose auf dem Laptop (App + PostgreSQL + Mailpit, [deployment.md §0](deployment.md)). **Ab Go-Live:** Hetzner Cloud (Deutschland), Docker Compose: App + PostgreSQL + Caddy (TLS) | – |
| Fehler-Tracking | ab Go-Live: Sentry-SDK → **selbst gehostetes Bugsink** auf derselben VM (Alternative: Sentry SaaS EU-Region) | – |
| CI | GitHub Actions: Lint, Typecheck, Unit, Build, E2E ([ci.yml](../../.github/workflows/ci.yml)) | – |

**Kosten Offline-Demo: 0 €.** **Kosten MVP ab Go-Live (Beta bis Launch, geringe Last):** ca. **30–40 €/Monat netto** in der Empfehlung, ca. **15 €/Monat** in der Sparvariante – Aufschlüsselung in [deployment.md §2](deployment.md#2-hosting--kosten).

---

## 2. Begründung & Alternativen

### 2.1 Framework & Rendering

**Next.js 16 (App Router)**, weil:
- Server Components + Server Actions passen zum Datenmodell (viele kleine, autorisierte Mutationen: Tag setzen, abstimmen, beitreten) – keine separate API-Schicht nötig.
- Größtes Ökosystem: next-intl, Better Auth, React Email, React Aria, Playwright-Beispiele; für ein Agent-Team mit wechselnden Sessions ist „gut dokumentiert und verbreitet“ ein echter Vorteil.
- Self-Hosting mit `output: "standalone"` im Docker-Container ist offiziell unterstützt – keine Bindung an Vercel. Umgesetzt (Scaffold): `standalone` nur bei `NEXT_OUTPUT_STANDALONE=1` (setzt das Dockerfile, Start mit `node server.js`); lokal und in CI liefert `pnpm start` (= `next start`) den normalen Build.
- Kandidaten-Berechnung (F-009) als reine TypeScript-Funktion läuft auf Server **und** Client (Filter „Person X ausblenden“ in F-008 wirkt nur lokal → im Browser rechnen).

Hinweise für den Developer:
- In Next.js 16 heißt die Middleware `proxy.ts`. **Wir brauchen keine** (Scaffold): Die Sprache wird pro Request in `src/i18n/request.ts` bestimmt (§4), Security-/`noindex`-Header kommen aus `next.config.ts`.
- **ESLint 9.39 statt 10 / TypeScript 6.0.x** (Abweichung Developer, Scaffold 2026-10-08): `eslint-config-next` 16.4 bzw. die mitgelieferten Plugins (`eslint-plugin-react`, `jsx-a11y`) und `typescript-eslint` 8.x sind mit ESLint 10 bzw. TypeScript 7 noch nicht kompatibel. Upgrade, sobald die Plugins nachziehen (Dependabot-PRs nicht blind mergen).
- `next lint` gibt es nicht mehr → ESLint direkt aufrufen.
- Next.js veröffentlicht 2026 regelmäßig Security-Releases (u. a. 16.2.6 mit 13 Advisories im Mai) → Dependabot ist Pflicht, Patch-Updates zeitnah einspielen.
- Keine `NEXT_PUBLIC_*`-Variablen für umgebungsspezifische Werte (werden beim Build eingebrannt; wir bauen ein Image für Demo, Staging und Produktion – so lässt sich `APP_URL` für den Handy-Test im WLAN oder einen Tunnel ohne Neubau umstellen).

| Alternative | Pro | Contra | Bewertung |
|---|---|---|---|
| SvelteKit + Paraglide | Kleinere Bundles, sehr schnell auf schwachen Handys, Paraglide typsicher | Kleineres Ökosystem (Auth/Mail/A11y-Komponenten), weniger Agent-Erfahrung | gute zweite Wahl |
| React Router v7 (ehem. Remix) | Web-Standards, einfache Formulare, gutes Progressive Enhancement | Weniger Integrationen (i18n, Auth-Beispiele) | möglich |
| Nuxt (Vue) | Reif, gutes i18n-Modul | Team/Agents eher React-lastig | nein |
| Laravel / Rails | Auth, Mails, Jobs „eingebaut“ | Zweite Sprache neben TS-Frontend, weniger passend für interaktive Heatmap | nein |

### 2.2 Datenbank & ORM

**PostgreSQL 18** (relational, Constraints für Rollen/Mitgliedschaften, `date`-Typ für Kalendertage, eingebautes `uuidv7()`, JSONB bei Bedarf). Datenmenge im MVP winzig (30 Mitglieder × 365 Tage = max. ~11 000 Zeilen Verfügbarkeit pro Reise).

**Drizzle ORM**: SQL-nah, kein Codegen-Schritt, leichtgewichtig im Container, offizieller Better-Auth-Adapter, Migrationen als SQL-Dateien im Repo (reviewbar). Alternative **Prisma**: komfortabler, aber schwererer Client/Engine und Codegen; Kysely: nur Query-Builder, mehr Eigenbau.

Modellierungsregeln:
- Kalendertage als `date` (keine Zeitzone), API/Code als String `YYYY-MM-DD`; Zeitstempel als `timestamptz` (UTC).
- Primärschlüssel `uuid` (v7). Einladungs-Tokens: 32 Byte Zufall, base64url (256 Bit, PRD fordert ≥ 128 Bit).
- Alle reisebezogenen Tabellen mit `ON DELETE CASCADE` an Reise bzw. Mitgliedschaft – Löschkonzept (F-013/F-043) wird so durch die DB erzwungen.
- Obergrenze 30 Mitglieder (inkl. Platzhalter) serverseitig in einer Transaktion prüfen.

Alternativen Datenbank-Hosting: siehe [deployment.md §2](deployment.md#2-hosting--kosten) (Managed PostgreSQL bei Scaleway; Supabase/Neon EU-Region mit US-Mutter).

### 2.3 Styling & Design-Tokens

- **CSS Modules** pro Komponente + **eine globale Token-Datei**. Quelle der Wahrheit ist `docs/design/tokens.css` (Designer). Sie wird im Root-Layout direkt importiert (`import "../../docs/design/tokens.css"` bzw. über `src/styles/globals.css` mit `@import`). Falls der Bundler Importe außerhalb von `src/` ablehnt: Sync-Skript `pnpm tokens:sync` kopiert nach `src/styles/tokens.css`, CI prüft mit `git diff --exit-code`, dass beide identisch sind.
- Die Datei (v0.1 vom Designer) nutzt das Präfix `--ww-`, Theme-Steuerung über `prefers-color-scheme` und `<html data-theme="light|dark">` → reines CSS, mit CSS Modules direkt kompatibel. Die Theme-Wahl wird serverseitig (Cookie) gesetzt, damit kein Aufflackern beim Laden entsteht.
- In Komponenten **nur `var(--token)`**, keine hart codierten Farben/Abstände (Reviewer-Kriterium).
- Kein Tailwind im MVP (weniger Abstraktion, Tokens 1:1 nutzbar). Falls später gewünscht: Tailwind v4 kann Tokens über `@theme` referenzieren.
- Schriften selbst hosten (`next/font/local` bzw. `next/font/google` lädt zur Build-Zeit herunter) – **kein** Laden von Google-Fonts-CDN zur Laufzeit (Datenschutz).
- Dunkelmodus/Heatmap-Farben ausschließlich über Tokens; Muster/Symbole für Zustände (WCAG, PRD §8).

### 2.4 Tests

| Ebene | Werkzeug | Pflicht-Abdeckung |
|---|---|---|
| Unit | Vitest | Kandidaten-Berechnung F-009 (alle Testfälle aus features.md), Feiertage F-016, Urlaubstage-Zählung, ICS-Erzeugung F-012, Löschregeln F-013/F-043, Rechteprüfungen F-004. Ziel ≥ 90 % Zeilenabdeckung in `src/lib/`. Performance-Test: 30 × 365 < 500 ms. |
| Komponenten | Vitest + Testing Library (jsdom) | Verfügbarkeits-Kalender (Tastatur), Code-Eingabe, Sprachumschalter |
| E2E | Playwright | Kernfluss DE und EN: Reise anlegen → Link → Registrierung per Code (Code aus Mailpit-API) → Beitritt → Verfügbarkeit → Heatmap → Abstimmung → Festlegung → ICS-Download; Konto löschen; Rate-Limit-Verhalten. Projekte: `mobile-webkit` (iPhone), `mobile-chromium` (Pixel), `desktop-chromium`. |
| Barrierefreiheit | `@axe-core/playwright` in E2E | 0 Verstöße „serious/critical“ auf allen Kernseiten |
| i18n | Skript `i18n:check` | `de.json` und `en.json` haben identische Schlüssel; keine leeren Werte |

### 2.5 Lint & Format

- ESLint Flat Config: `eslint-config-next`, `typescript-eslint` (strict, type-checked), `eslint-plugin-jsx-a11y`, Regel gegen hart codierte UI-Texte in JSX (z. B. `i18next/no-literal-string` oder `react/jsx-no-literals` mit Ausnahmen) – erfüllt PRD-Risiko „Build schlägt bei fehlenden Schlüsseln fehl“.
- Prettier 3 (Standardkonfiguration, `printWidth: 100`).
- Alternative **Biome 2.x** (ein Tool, sehr schnell) – verworfen, weil Next-/a11y-Regeln in ESLint vollständiger sind.

### 2.6 Paketmanager & Node

- **pnpm** über Corepack, Version fix in `package.json` (`"packageManager": "pnpm@12.x.y"`), Lockfile wird committet; `pnpm install --frozen-lockfile` in CI.
- `.nvmrc` mit `24`; `engines.node: ">=24 <25"` (Anheben auf 26 als eigenes Ticket nach LTS-Start).

---

## 3. Login-Lösung (F-040–F-043, später F-045)

### 3.1 Vergleich

| Lösung | Typ | Code (OTP) + Magic-Link + Passwort | Social (v1) | Daten/DSGVO | Rate-Limit/Brute-Force | Kosten | Bewertung |
|---|---|---|---|---|---|---|---|
| **Better Auth** | Open-Source-Bibliothek (MIT), läuft in unserer App | Ja: Plugins `emailOTP` (6-stellig, Versuchslimit, gehashte Speicherung), `magicLink`, `emailAndPassword`; Plugin `haveIBeenPwned` | Ja (Google, Apple u. v. m.) | Alle Daten in **unserer** EU-DB, kein Auftragsverarbeiter | Eingebauter Rate-Limiter (Speicher: DB), Versuchslimit pro Code; Per-E-Mail-Limits als eigener Hook | 0 € | **Empfehlung** |
| Auth.js (NextAuth) | Bibliothek | Nur Magic-Link nativ; OTP/Passwort Eigenbau (Credentials-Provider wird nicht empfohlen) | Ja | eigene DB | wenig eingebaut | 0 € | nein – Projekt wird seit Herbst 2025 vom Better-Auth-Team betreut, Neuentwicklung findet dort statt |
| Lucia-Ansatz | Anleitung zum Selbstbauen (Bibliothek seit 2025 eingestellt) | alles Eigenbau | Eigenbau (Arctic) | eigene DB | Eigenbau | 0 € | nur als Referenz für Session-Design |
| Supabase Auth | Dienst (US-Unternehmen, EU-Region wählbar) | OTP + Magic-Link + Passwort | Ja | Auftragsverarbeitung durch US-Anbieter (DPF/SCC), Bindung an Supabase | eingebaut | Free-Tier, sonst ab ca. 25 $/Monat¹ | nein – Drittlandbezug, Lock-in |
| Clerk | Dienst (US) | Ja, sehr komfortabel | Ja | Daten bei Clerk (US) | eingebaut | Free bis Kontingent, danach pro aktivem Nutzer | nein – Drittland, Kosten bei Wachstum, UI im In-App-Browser schwer kontrollierbar |
| Hanko | Open Source (DE) / Hanko Cloud EU | OTP + Passkeys + Passwort | Ja | EU | eingebaut | Self-Host 0 €, Cloud kostenpflichtig | Alternative, falls Better Auth im Spike scheitert |
| Keycloak / Zitadel / Authentik | Identity-Server | Ja | Ja | selbst gehostet | Ja | Betrieb aufwendig (eigener Dienst, Redirect-Flows) | zu schwer für MVP; Redirect-Flows im In-App-Browser riskant |

**Empfehlung: Better Auth.** Läuft im selben Prozess wie die App (keine Weiterleitung auf fremde Domains → robust im In-App-Browser), alle Daten bleiben in unserer Datenbank in Deutschland, alle MVP-Methoden plus v1-Social-Login abgedeckt, keine Lizenz- oder Nutzerkosten.

### 3.2 Konfiguration (Vorgabe für den Developer, Inkrement 1)

Geprüft am Paket `better-auth@1.7.7` (Typdefinitionen). **Stand 2026-10-09:** Zeilen Passwort, Re-Auth und Rate-Limiting beschreiben den umgesetzten Ist-Stand nach Inkrement 1 und den Review-Fixes R-021–R-028 ([findings.md](../review/findings.md)).

| Anforderung (PRD §8 / F-040–F-043) | Umsetzung |
|---|---|
| 6-stelliger Code, 15 Min. gültig | `emailOTP({ otpLength: 6, expiresIn: 900 })` (Standard wäre 300 s) |
| max. 5 Fehlversuche pro Code | `allowedAttempts: 5` (Standard 3) |
| Code nicht im Klartext speichern | `storeOTP: "hashed"` (dann `resendStrategy: "rotate"` – jede Neuanforderung erzeugt neuen Code, alter wird ungültig) |
| Registrierung mit Name in einem Schritt | Sign-in per OTP legt unbekannte Nutzer automatisch an und akzeptiert `name` (`disableSignUp: false`) |
| Keine Konto-Enumeration | Code-Anforderung antwortet immer gleich; Mailversand **nicht awaiten** (Hinweis der Bibliothek gegen Timing-Angriffe) |
| Code **und** Link in **einer** Mail | Nicht out-of-the-box: `emailOTP` und `magicLink` versenden getrennt. Lösung: eigener schlanker Endpunkt/Plugin „email-access“, der Magic-Link-Token und OTP gemeinsam erzeugt und **eine** Mail rendert. → **Spike in Inkrement 1** (½–1 Tag). |
| Magic-Link: Token ≥ 128 Bit, 15 Min., einmalig | `magicLink({ expiresIn: 900 })`, Token-Speicherung gehasht; `callbackURL` nur relative, intern validierte Pfade (Schutz vor Open Redirect) |
| Optionales Passwort, 10–128 Zeichen, Argon2id, Leak-Prüfung | **Ist-Stand Inkrement 1:** `emailAndPassword: { enabled: true, minPasswordLength: 10, password: { hash, verify } }` mit eigener Implementierung `src/server/auth/password-hash.ts`: **Argon2id m=19456 KiB (19 MiB), t=2, p=1, 32 Byte** (OWASP-Empfehlung), PHC-String `$argon2id$v=19$m=19456,t=2,p=1$…`; Node `crypto.argon2` (Node ≥ 24.7: CI, Produktion), sonst `@noble/hashes` – beide liefern identische Hashes (Known-Answer-Test, R-030). Leak-Prüfung (`src/lib/password-policy.ts`, `src/server/auth/breach-check.ts`): **immer** Offline-Liste häufiger Passwörter + triviale Muster + „E-Mail als Passwort“; **optional** Online-Abgleich mit „Have I Been Pwned“ über `PASSWORD_BREACH_CHECK=hibp` (k-Anonymität: nur 5 Zeichen des SHA-1-Hashs verlassen den Server, fail-open). **In der Offline-Demo `off`** (keine externen Dienste); Einschalten ist Entscheidungspunkt im [Go-Live-Gate](go-live.md) – bei `hibp` in der Datenschutzerklärung erwähnen. |
| Sessions 90 Tage rollierend | `session: { expiresIn: 60*60*24*90, updateAge: 60*60*24 }` |
| „Angemeldet bleiben“ aus → Session endet mit Browser | Bei Passwort-Login eingebaut (`rememberMe`); für OTP/Magic-Link **nicht** eingebaut → eigener After-Hook setzt Session-Cookie ohne `Max-Age` (Teil des Spikes) |
| Überall abmelden | `revokeSessions` / `revokeOtherSessions` |
| Re-Auth für Anmeldewege (E-Mail ändern, Passwort setzen/ändern/entfernen; später Konto löschen) | **Ist-Stand (R-023), nicht `freshAge`:** eigener Marker pro Sitzung (`src/server/auth/reauth.ts`, Verification-Zeile `reauth-<sessionId>`), **10 Min. gültig**. Bestätigung per Code an die aktuelle Adresse oder aktuelles Passwort (`reauth-step.tsx`, gleicher Schritt auf `/account/email` und `/account/password`); Code- und Passwort-Bestätigung unterliegen denselben Fehlversuchs-Limits pro Adresse. Server Actions prüfen den Marker (`reauthExpired` → Schritt erscheint erneut). **Ausnahme nur für die Passwortseite:** eine Anmeldung per **Code oder Magic-Link** (Postfach-Beweis) gilt 10 Min. als Bestätigung (Hook `databaseHooks.session.create.after`) – so braucht das optionale Passwort im Registrierungs-Namensschritt keinen Extra-Code; eine **Passwort-Anmeldung zählt nicht**. E-Mail-Änderung: Bestätigung → Code an die **neue** Adresse (`emailOTP.changeEmail`) → Info-Mail an die alte; danach wird der Marker gelöscht. Offen (optional): andere Sitzungen nach Passwortänderung beenden. |
| Rate-Limiting | **Pro IP und Pfad** (Better Auth `rateLimit: { enabled: RATE_LIMIT_ENABLED, storage: "database", customRules }`, Schlüssel = von `handleAuthRequest` ermittelte Client-IP, R-005): u. a. Code-/Passwort-Anmeldung 10/Min. Beitritt (F-003): 20/Std. pro Reise und IP (App-Logik). **Pro E-Mail-Adresse – immer aktiv, unabhängig von `RATE_LIMIT_ENABLED`** (`src/lib/email-limits.ts` Regeln, `src/server/auth/email-limit-store.ts` Speicher `auth_attempt`), gleitende Fenster, für bestehende und unbekannte Adressen gleich (keine Enumeration): **Mail-Budget** (Code-/Link-Mails) **5/Std. und 20/Tag pro exakter Adresse** sowie für **Varianten** (Adresse weicht von ihrem Postfach ab: `+tag`, Gmail-Punkte, googlemail.com) zusätzlich **10/Std. und 30/Tag pro Postfach** (R-027 gegen Mail-Bombing über Plus-Adressen; R-033: die kanonische Adresse zählt nicht ins Postfach-Budget und wird davon nie begrenzt – Varianten können sie nicht blockieren). **„Passwort vergessen“** (R-032): für unbekannte Adressen legt ein After-Hook einen nie versendeten Platzhalter-Code an – Restversuche, 5er-Grenze und Sperre verhalten sich wie bei bestehenden Konten. **Fehlversuche:** **10/Std. pro exakter Adresse** (Codes und Passwörter zusammen); ein falscher Code zählt **nur, wenn für die Adresse ein nicht abgelaufener Code aussteht** (R-021), falsche Passwörter zählen für alle Adressen gleich. Bei 10 Fehlversuchen ist die Adresse gesperrt, bis der älteste davon 1 Std. alt ist (keine feste 15-Min.-Sperre). **Die Sperre blockiert nur Code-Eingabe und Passwort-Login – Mails (im Budget) und der Magic-Link bleiben möglich;** der Magic-Link meldet an und hebt die Sperre auf (R-021: ein Dritter kann den Zugang verzögern, nicht verhindern). **Atomar** (R-022): Prüfen und Zählen in einer Transaktion mit `pg_advisory_xact_lock` pro Schlüssel; Fehlversuche werden vor der Prüfung reserviert. **Datensparsam** (R-028): gespeichert wird nur ein HMAC-SHA-256 der Adresse; Schlüssel per **HKDF aus `BETTER_AUTH_SECRET`** (`info = "ww:email-limit:v1"`, `src/server/auth/email-limit-key.ts`); **ohne Secret Startfehler** (`instrumentation.ts`) – fester lokaler Ersatzschlüssel nur bei `APP_ENV` `development`/`ci`. |
| Echte Client-IP hinter Proxy | Caddy setzt `X-Forwarded-For`; Better Auth `advanced.ipAddress.ipAddressHeaders` nur auf diesen Header; Port 3000 nicht öffentlich erreichbar |
| Social Login v1 (F-045) | `socialProviders.google`, `socialProviders.apple`; Account-Linking nur nach Bestätigung (kein automatisches Verknüpfen über E-Mail) |

Brute-Force-Rechnung (Ist-Stand): 6 Ziffern = 10⁶ Kombinationen; harte Grenze sind **10 Fehlversuche/Std. pro Adresse** (das Limit von 5 Versuchen pro Code ist unter Parallelität nur „weich“, R-022) → max. 240 Versuche/Tag → Trefferwahrscheinlichkeit ≤ 0,024 % pro Tag und Konto (1 : 100 000 pro Stunde). Zusammen mit IP-Limits ausreichend; Monitoring auf auffällige Fehlversuchsraten (siehe deployment.md §6).

### 3.3 Sessions im In-App-Browser (WhatsApp, Instagram, Facebook)

- In-App-Browser haben je nach App einen **eigenen Cookie-Speicher** (eingebettete WebViews bei Instagram/Facebook; Custom Tabs auf Android teilen Cookies mit Chrome; iOS-Safari-Ansichten teilen seit iOS 11 keine Cookies mit Safari). Ein Magic-Link aus der Mail-App öffnet deshalb meist einen **anderen** Browser → Code-Eingabe im selben Fenster ist der Primärweg (PRD-Entscheidung).
- Cookies: nur First-Party, `HttpOnly`, `Secure`, Präfix `__Secure-`, **`SameSite=Lax`**. **`Secure`/`__Secure-` aus dem Protokoll von `BETTER_AUTH_URL` ableiten (Better-Auth-Standard), nicht fest erzwingen:** In der Offline-Demo läuft die App auf dem Handy über `http://<LAN-IP>` – Browser verwerfen dort `Secure`-Cookies, Login wäre unmöglich. Mit HTTPS (Tunnel, Staging, Prod) sind sie automatisch aktiv. **Nicht `Strict`**: Der Aufruf aus WhatsApp oder einer Mail ist eine Cross-Site-Navigation; mit `Strict` würde das Session-Cookie beim ersten Seitenaufruf nicht mitgesendet → Nutzer erscheint abgemeldet.
- Keine iframes, keine Third-Party-Cookies, keine Weiterleitung auf fremde Login-Domains (würde in WebViews oft blockiert).
- WebViews löschen Cookies teils beim Schließen → erneuter Login per Code ist der akzeptierte Normalfall; optionaler Hinweis „Im Browser öffnen“ (UX entscheidet).

### 3.4 Einladungs-Token über die Registrierung erhalten (F-003)

1. Einladungslink `https://<domain>/i/<token>` (ohne Sprachpräfix, kurz für Chats) – **die Seite selbst** ist Vorschau + Beitritt, keine Weiterleitung (Sprache pro Request: Konto > Cookie `lang` > `Accept-Language` > `en`, §4).
2. Die Join-Seite zeigt die Vorschau und das Registrierungs-/Login-Formular **auf derselben Seite**. Code anfordern und Code prüfen laufen per `fetch` ohne Seitenwechsel → der Token bleibt in der URL und im Seitenzustand; nach Erfolg Server Action `joinTrip(token)` → Weiterleitung zur Verfügbarkeit (F-005).
3. Magic-Link: führt auf `/auth/magic?token=…&next=/i/<token>` (Bestätigungsseite – Token wird erst per Tipp eingelöst, Link-Scanner verbrennen ihn nicht; [spike-auth.md](spike-auth.md)); `next` nur relativ/intern → funktioniert auch im Standardbrowser.
4. Rückfallebene: beim Öffnen der Vorschau signiertes `HttpOnly`-Cookie `pending_invite` (30 Min.) – wird nach jedem Login im selben Browser ausgewertet.
5. Gleiches Prinzip für „Reise anlegen ohne Konto“ (F-001): Formulardaten bleiben im Client-Zustand (bzw. `sessionStorage`, technisch notwendig) bis nach dem Login.

---

## 4. i18n (F-046)

**next-intl 4** – ICU MessageFormat (Plurale, `select`), Server- und Client-Komponenten, Formatierung über `Intl`, typsichere Schlüssel.

- **Routing (nach [sitemap.md §4](../ux/sitemap.md), umgesetzt im Scaffold):** App-Routen **ohne Sprachpräfix** – `/login`, `/i/[token]`, `/trips`, `/auth/magic`, später `/account` (Route-Gruppe `src/app/(app)/`). Nur **öffentliche Inhaltsseiten** tragen ein Präfix – `/de`, `/en`, später Rechtstexte/Hilfe (`src/app/[locale]/`, `setRequestLocale`, `hreflang`/`alternate`). Zwei Root-Layouts (`(app)/layout.tsx`, `[locale]/layout.tsx`), **kein `proxy.ts`**, kein `localePrefix`-Routing von next-intl. Sprachwahl für App-Routen pro Request (`src/i18n/request.ts`, `negotiate.ts`): Kontoeinstellung (ab Inkrement 1) > Cookie **`lang`** (bei expliziter Wahl, 12 Monate, technisch notwendig) > `Accept-Language` (`de-*` → `de`, jede andere Sprache → `en`) > Fallback `en`. `/` leitet weiter: angemeldet → `/trips`, sonst `/de` bzw. `/en`.
- **Bekannte Einschränkung:** next-intl 4.14 markiert `requestLocale`/`setRequestLocale` als veraltet zugunsten `next/root-params`; mit zwei Root-Layouts erkennt Next 16.4 die Root-Params noch nicht → Migration verfolgt in [spike-auth.md §6](spike-auth.md).
- **Pfadnamen** englisch, sprachneutral (`/trips/...`), keine übersetzten Slugs (vereinfacht Routing und Tests); Ausnahme: Rechtstext-Slugs je Präfix-Sprache laut sitemap.md.
- **Sprache ≠ Region:** Konto speichert `locale` (`de`|`en`) und `region` (z. B. `DE-BY`, `AT-9`, `CH-ZH`, `GB-SCT`, `US`). Formatierungs-Locale = `<locale>-<Land>` (z. B. `en-DE`, `de-CH`) → korrekte Datumsformate auch für Englischsprachige in Deutschland. Wochenstart aus eigener Tabelle (Mo für DE/AT/CH/GB, So für US), im Konto überschreibbar – nicht von `Intl.Locale.getWeekInfo` abhängig (Browserunterstützung uneinheitlich).
- **Plurale:** `"{count, plural, one {# Person kann} other {# Personen können}}"`; keine String-Verkettung.
- **Datum:** `format.dateTime(date, { dateStyle: "medium" })` bzw. benannte Formate in `src/i18n/formats.ts`; ganztägige Daten ohne Zeitzonenumrechnung (als `CalendarDate`).
- **Typsicherheit & Vollständigkeit:** Schlüssel-Typen aus `messages/en.json` (`AppConfig`-Augmentation) → unbekannte Schlüssel = Typecheck-Fehler; `pnpm i18n:check` vergleicht `de`/`en` (CI); ESLint-Regel gegen Literal-Strings in JSX.
- **Mails mehrsprachig:** React-Email-Vorlagen erhalten einen Übersetzer über `createTranslator({ locale: user.locale, messages })` (funktioniert außerhalb von Requests, z. B. in Lösch-Jobs). Betreff, Absendername und Text in Kontosprache; HTML **und** Text-Version; keine Tracking-Pixel/-Links.
- **Rechtstexte:** als eigene MDX-/Markdown-Seiten pro Sprache (nicht in JSON), DE verbindlich, EN mit Hinweis „Übersetzung“.

Alternativen: **Paraglide** (sehr klein, compile-time, gut bei SvelteKit) – mit Next.js weniger verbreitet; **i18next/react-i18next** – ausgereift, aber ICU nur per Plugin und mehr Konfiguration für RSC.

---

## 5. Feiertage & Schulferien (F-016)

**`date-holidays` 3.37.0** – Lizenz **ISC (Code) + CC-BY-3.0 (Daten)** → Namensnennung auf einer „Lizenzen/Credits“-Seite (Impressum-Umfeld) nötig.

Lokal geprüft (2026-10-08):

| Land | Unterregionen in der Bibliothek | Freigabe im MVP |
|---|---|---|
| DE | 16 Bundesländer (`BW`, `BY`, … `TH`) | bundesweit + alle 16 |
| AT | 9 Bundesländer (Codes `1`–`9`) | bundesweit (+ Länder, wo abweichend) |
| CH | 26 Kantone (`ZH` … `JU`) | bundesweit + Kantone (Stichproben-Tests je Kanton) |
| GB | `ENG`, `WLS`, `SCT`, `NIR` (+ `ALD` Alderney) | ENG, WLS, SCT, NIR (ohne ALD) |
| US | 50 Staaten + DC | nur Federal Holidays (Bundesstaaten per Konfiguration später) |

Vorgaben:
- **Nur `type === "public"`** verwenden – die Bibliothek liefert z. B. für die USA auch „observance“ (Valentinstag, Halloween) und „optional“; Ersatz-Feiertage („substitute day“) sind `public` und gehören dazu (z. B. GB 2027-12-27/28).
- Namen über `languages: [locale]` (de/en).
- **Serverseitig** berechnen und als Liste `{date, name}` je Region/Jahr cachen (Bibliothek enthält Daten aller Länder → nicht ins Client-Bundle).
- Freigegebene Regionen als Konfiguration (`src/config/holiday-regions.ts`), weitere ohne Code-Änderung zuschaltbar (F-016-Kriterium).
- Snapshot-Tests je Region für 2026–2028 schützen vor stillen Datenänderungen bei Updates.

**Schulferien:** **nicht im MVP** (kein Akzeptanzkriterium in F-016) – Empfehlung an PM als Idee für v1 (Persona Jonas, Familien). Datenquelle wäre z. B. die OpenHolidays API (öffentliche + Schulferien für mehrere europäische Länder inkl. DE); Daten dann per Job in eigene DB importieren (keine Laufzeitaufrufe aus dem Browser), Lizenz vorab prüfen (Open-Data-Lizenz mit Namensnennung/ggf. Share-Alike), Anzeige „ohne Gewähr“. Keine Schulferien für UK/US (regional/schulspezifisch). Offizielle DE-Quelle sind die Ländertermine der KMK.

---

## 6. Transaktionsmails (Anbieterwahl)

| Anbieter | Sitz / Daten | Preis (Stand 2026, netto) | AVV | Zustellbarkeit / Funktionen | Bewertung |
|---|---|---|---|---|---|
| **Lettermint** | Niederlande, Infrastruktur nur EU, keine US-Mutter | Free (Dev): 300 Mails/Monat, 1 Domain; Starter ab **10 €/Monat (10 000 Mails)** | ja (DPA) | auf Transaktionsmails spezialisiert, API + SMTP, Webhooks (Bounces) | **Empfehlung** |
| Scaleway TEM | Frankreich (Iliad), EU | **0,25 € / 1 000 Mails**, 300/Monat frei; Scale-Plan 80 €/Monat mit dedizierter IP | ja (in AGB) | solide, API + SMTP, Standardkontingent 10 000/Monat, weniger Komfort | **Ausweich-/Sparoption** |
| Brevo | Frankreich, EU | Free 300 Mails/Tag; Bezahlpläne ab ca. 9 $/Monat | ja | Fokus Marketing, geteilte IPs, Branding im Free-Plan | nur bedingt |
| Mailjet | Frankreich (Sinch-Gruppe, Schweden) | Free ca. 6 000/Monat (200/Tag), Bezahlpläne ab ca. 15 $/Monat¹ | ja | ordentlich | möglich |
| Postmark | USA | ab ca. 15 $/Monat¹ | DPA/SCC | sehr gute Zustellbarkeit | nein – Drittland |
| Resend | USA (EU-Sende-Region wählbar) | Free ca. 3 000/Monat¹ | DPA/SCC | gute DX | nein – US-Unternehmen |

¹ Preis aus Vorwissen, am 2026-10-08 nicht erneut geprüft – für die Entscheidung unerheblich, da Anbieter nicht empfohlen.

**Empfehlung: Lettermint** (EU-only, AVV, auf Transaktionsmails fokussiert; im Beta-Betrieb reicht ggf. noch der Free-Plan, zum Launch Starter 10 €/Monat). **Scaleway TEM** als vorbereitete Ausweichlösung: Versand läuft über **SMTP mit Nodemailer** und Umgebungsvariablen → Anbieterwechsel ohne Code-Änderung.
Mengenschätzung MVP: 1–3 Mails pro Login/Registrierung, < 3 000 Mails/Monat in der Beta.
Zustellbarkeit: eigene Absender-Subdomain, SPF/DKIM/DMARC, Custom Return-Path (siehe [deployment.md §7](deployment.md#7-domain-dns--mail-authentifizierung)), reine Textlinks auf die eigene Domain, kein Link-Tracking, Bounce-Webhook → Monitoring.
Demo/Dev/Test (und später Staging): **Mailpit** (lokaler SMTP-Fänger mit Web-UI und API) – E2E-Tests lesen den Code darüber aus; in der Offline-Demo lesen Testpersonen Codes und Magic-Links in der Mailpit-Web-UI. **Bis Go-Live wird keine echte Mail versendet**; Lettermint, Absender-Domain und SPF/DKIM/DMARC folgen mit dem [Go-Live-Gate](go-live.md).

---

## 7. Ordnerstruktur (Vorgabe für das Scaffold durch den Developer)

```
/
├─ .github/                 CI (ci.yml), Dependabot
├─ docs/                    Produkt, Design, UX, Ops, Review (Deutsch)
├─ docker/                  Dockerfile, compose.dev.yml (DB + Mailpit), compose.demo.yml (Offline-Demo),
│                           ab Go-Live: compose.yml (prod/staging), Caddyfile
├─ drizzle/                 generierte SQL-Migrationen (committet)
├─ messages/                de.json, en.json (UI-Texte, ICU)
├─ public/                  statische Assets (Icons, OG-Bild)
├─ scripts/                 i18n-check, seed-demo (deployment.md §0.4), claude-session-start.sh, später Backup-Hilfen
├─ src/
│  ├─ app/
│  │  ├─ (app)/             Root-Layout 1: App-Routen ohne Sprachpräfix (Sprache per Request, §4)
│  │  │  ├─ page.tsx        `/` → /trips bzw. /de|/en
│  │  │  ├─ login/          Anmeldung (Code + Magic-Link)
│  │  │  ├─ auth/magic/     Magic-Link-Bestätigung (Token erst per Tipp einlösen)
│  │  │  ├─ i/[token]/      Einladung: Vorschau + Beitritt (F-002, F-003)
│  │  │  ├─ trips/          Meine Reisen (F-044), new (F-001), [tripId]/… (F-005–F-012)
│  │  │  └─ account/        Einstellungen, Löschen (F-042, F-043) – ab Inkrement 1
│  │  ├─ [locale]/          Root-Layout 2: öffentliche Seiten /de, /en (Landing, später Rechtstexte, Hilfe)
│  │  └─ api/               auth/[...all]/ (Better Auth), health/ (Health-Check inkl. DB-Ping)
│  ├─ components/           geteilte UI-Bausteine (Button, Dialog, CodeInput …)
│  ├─ features/             fachliche Module: trips, membership, availability, heatmap, voting, account
│  │                        (je: components/, actions.ts, queries.ts)
│  ├─ lib/                  reine, getestete Logik ohne I/O: candidates (F-009), holidays (F-016),
│  │                        vacation-days, ics (F-012), dates, permissions
│  ├─ server/               db/ (schema.ts, client.ts), auth.ts, mail/ (Transport + Vorlagen-Render),
│  │                        jobs/ (Retention F-013/F-043), rate-limit.ts
│  ├─ emails/               React-Email-Vorlagen
│  ├─ i18n/                 config.ts (Locales, Cookie `lang`), negotiate.ts (+ Test), request.ts; später formats.ts, regions.ts
│  ├─ config/               holiday-regions.ts, limits.ts (30 Mitglieder etc.)
│  └─ styles/               globals.css (`@import "../../docs/design/tokens.css"` – keine Kopie, T3)
├─ tests/
│  ├─ e2e/                  Playwright-Specs + Helfer (Mailpit-Client)
│  └─ fixtures/
├─ .env.example             nur Variablennamen + Platzhalter (siehe deployment.md §4)
├─ .nvmrc                   24
└─ package.json             Skripte siehe §9
```

## 8. Code-Konventionen

- **Sprache:** Code, Bezeichner, Kommentare, Commit-Messages, Branch-Namen **Englisch**; Dokumente in `docs/` Deutsch; UI-Texte nur in `messages/*.json`.
- **TypeScript:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`; kein `any` ohne Begründungskommentar.
- **Dateinamen:** `kebab-case.ts(x)`; React-Komponenten `PascalCase` als Export; ein Modul = eine Verantwortung.
- **Server first:** Server Components als Standard, `"use client"` nur für Interaktion (Kalender-Pinsel, Code-Eingabe). Jede Server Action: (1) Session prüfen, (2) Rolle/Mitgliedschaft prüfen (`src/lib/permissions.ts`), (3) Eingabe mit Zod validieren – niemals nur im UI ausblenden (F-004).
- **Fachlogik** (F-009, F-016, F-012) als reine Funktionen in `src/lib/` ohne DB-/Framework-Abhängigkeit.
- **Fehler:** Nutzerfehler als übersetzbare Fehlercodes (`errors.trip.tooManyMembers`), keine rohen Exceptions an den Client.
- **Logging:** strukturiert (JSON), **nie** E-Mail-Adressen, Codes, Tokens, Passwörter, Kalenderdaten loggen; IP nur in Rate-Limit-/Security-Kontext.
- **Sicherheit:** Security-Header in `next.config.ts` (`X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `X-Frame-Options: DENY`; CSP mit Nonces und HSTS folgen – HSTS ab Go-Live über Caddy); private Routen (`/trips`, `/i`, `/login`, `/auth`, `/account`) `noindex, nofollow` (F-002), außerhalb `APP_ENV=production` alles `noindex`. **Token-Routen `/i/*` und `/auth/*`: `Referrer-Policy: same-origin`** (nicht `no-referrer` wie in sitemap.md §4: damit senden Browser bei Formular-POSTs `Origin: null`, und die CSRF-/Origin-Prüfung von Server Actions und Better Auth schlägt fehl – [spike-auth.md](spike-auth.md); Tokens gelangen trotzdem nicht an fremde Seiten).
- **Commits:** Conventional Commits auf Englisch mit Feature-/Finding-ID, z. B. `feat(F-005): add brush selection to availability calendar`, `fix(R-012): prevent duplicate display names`. Branches: `feat/F-005-availability`, `fix/R-012-…`.
- **Pull Requests:** klein, ein Inkrement/Feature; CI muss grün sein; Reviewer-Freigabe vor Merge (CLAUDE.md).

## 9. Skript-Vertrag `package.json` (von CI genutzt)

Die CI ruft diese Skripte auf (fehlende werden übersprungen – `--if-present`). Der Developer legt sie beim Scaffold an:

| Skript | Zweck |
|---|---|
| `lint` | `next typegen && eslint .` (Typegen für `PageProps`/Routen-Typen) |
| `format:check` | `prettier --check .` |
| `typecheck` | `next typegen && tsc --noEmit` |
| `i18n:check` | Schlüsselgleichheit `de`/`en` |
| `test` | `vitest run` (Unit + Komponenten) |
| `build` | `next build` |
| `start` | `next start` (lokal/CI); im Docker-Image `node server.js` aus dem Standalone-Build (`NEXT_OUTPUT_STANDALONE=1`) |
| `db:migrate` | Drizzle-Migrationen anwenden (`drizzle-kit migrate`) |
| `db:generate` | Migration aus `schema.ts` erzeugen – nicht von CI genutzt |
| `db:seed:demo` | Demo-Daten einspielen (nur `APP_ENV=demo`/`development`, deployment.md §0.4) – nicht von CI genutzt |
| `test:e2e` | `playwright test` (startet die App über `webServer` in `playwright.config.ts`) |
| `demo:up` / `demo:migrate` / `demo:seed` / `demo:down` / `demo:reset` | Offline-Demo per Docker Compose (deployment.md §0.2); Migration/Seed laufen im Service `tools` – nicht von CI genutzt |

## 10. CI-Pipeline (`.github/workflows/ci.yml`)

Trigger: Push auf `main`, alle Pull Requests, manuell. Läuft mit minimalen Rechten (`contents: read`), bricht veraltete Läufe desselben Branches ab.

1. **detect** – prüft, ob `package.json` existiert. Ohne App-Code (aktueller Stand: nur Doku) werden alle folgenden Jobs **übersprungen** – übersprungene Jobs gelten bei GitHub als erfolgreich, der PR bleibt grün. (`hashFiles()` ist in Job-Bedingungen nicht verfügbar, daher dieser vorgelagerte Job.)
2. **quality** – pnpm-Install (`--frozen-lockfile`), `format:check`, `lint`, `typecheck`, `i18n:check`, `test`.
3. **build** – `next build` mit Dummy-Umgebungswerten (keine echten Secrets).
4. **e2e** – PostgreSQL 18 und Mailpit als Service-Container, `db:migrate`, Playwright-Browser (Chromium, WebKit) installieren, `test:e2e`; Report als Artefakt (7 Tage). Läuft nur, wenn eine `playwright.config.*` existiert.

Test-Secrets (z. B. `BETTER_AUTH_SECRET`) werden im Job zufällig erzeugt – nichts davon ist ein echtes Geheimnis. Deployment ist **nicht** Teil dieser Pipeline (eigener Workflow `deploy.yml` erst ab Go-Live, siehe deployment.md §5 und [go-live.md](go-live.md)). In der Offline-Demo-Phase ist CI die einzige Online-Komponente – sie verarbeitet nur synthetische Testdaten.

**Dependabot** (`.github/dependabot.yml`): wöchentlich npm (gruppiert: Minor/Patch zusammen, Next.js/React separat) und GitHub Actions; Security-Updates sofort. Solange keine `package.json` existiert, meldet Dependabot für npm lediglich „keine Manifestdatei“ – ohne Einfluss auf PRs.

**Claude-Code-SessionStart-Hook (Empfehlung, Umsetzung durch CEO/Developer):** Sobald das Scaffold existiert, in `.claude/settings.json` einen `SessionStart`-Hook ergänzen, der in Cloud-Sessions `corepack enable && pnpm install --frozen-lockfile` ausführt, wenn `package.json` vorhanden ist – damit Lint/Tests sofort laufen. (Operations ändert `.claude/` nicht selbst.)

---

## 11. Offene technische Punkte / Spikes

| # | Thema | Wann | Wer |
|---|---|---|---|
| T1 | Kombi-Mail Code + Magic-Link mit Better Auth; „Angemeldet bleiben“ für OTP – **lokal mit Mailpit** (Code + Link in Mailpit-UI prüfen, Magic-Link auch auf dem Handy im WLAN, deployment.md §0.3) | Inkrement 1, vor Feature-Code (in Arbeit) | Developer |
| T2 | Code-Eingabe & Session in WhatsApp-/Instagram-WebView (iOS + Android) auf echten Geräten testen – braucht öffentlich erreichbare HTTPS-URL: **optional per temporärem Tunnel ohne Konto** (deployment.md §0.5, OPS-10), sonst spätestens auf Staging (Go-Live-Gate). Bis dahin Risiko offen; lokaler Ersatz: Playwright `mobile-webkit`/`mobile-chromium` + grober WLAN-Vortest | Ende Inkrement 1 (optional) / spätestens vor Beta | Developer + Reviewer |
| T3 | ~~Import von `docs/design/tokens.css` außerhalb `src/` im Next-Build~~ – **gelöst** (Scaffold 2026-10-08): `@import` in `src/styles/globals.css` funktioniert mit Turbopack (dev + build), kein Sync-Skript ([spike-auth.md](spike-auth.md)) | Scaffold | Developer |
| T4 | Wechsel auf Node 26 LTS | nach 28.10.2026, eigenes Ticket | Operations |
| T6 | Platzhalter-Startschutz (`APP_ENV=production` + `[PLATZHALTER`-Marker → Start abbrechen) und `APP_ENV=demo` (Demo-Banner, Mail nur Mailpit) | Scaffold P1-0 | Developer |
| T5 | v1: Verschlüsselung gespeicherter Kalender-URLs/CalDAV-Passwörter (F-019, F-048): AES-256-GCM, Schlüssel nur als Env-Variable (`DATA_ENCRYPTION_KEYS`, Key-Rotation), Security-Review | v1.1 | Operations + Reviewer |

---

## Quellen (Abruf 2026-10-08)

- Paketversionen: `npm view <paket> version` (next 16.4.0, better-auth 1.7.7, next-intl 4.14.9, drizzle-orm 0.45.4, drizzle-kit 0.31.11, date-holidays 3.37.0, @playwright/test 1.64.0, vitest 5.0.3, pnpm 12.10.1, eslint 10.12.0 – eingesetzt 9.39.x, siehe §2.1; typescript 6.0.3, prettier 3.9.9, @node-rs/argon2 2.2.2 – ersetzt in Inkrement 1 durch Node `crypto.argon2` / `@noble/hashes`, §3.2)
- Better-Auth-Optionen: Typdefinitionen `better-auth@1.7.7/dist/plugins/email-otp/types.d.mts`; [Better Auth Email-OTP-Doku](https://better-auth.com/docs/plugins/email-otp); [Release-Notiz 1.7.0-beta.10 (Rate-Limit vor Plugins)](https://releases.sh/release/rel_rLmOW5Eb65NNHpcPFpNqK)
- date-holidays-Regionen: lokal mit 3.37.0 geprüft; Lizenz laut npm `(ISC AND CC-BY-3.0)`; [README](https://cdn.jsdelivr.net/npm/date-holidays@3.28.0/README.md)
- Next.js: [nextjs.org/blog](https://nextjs.org/blog?page=1) (16.3 Aug. 2026, Security-Releases)
- Node.js: [InfoQ – Node.js release changes](https://infoq.com/news/2026/06/nodejs-release-changes), [Node.js v26 released](https://www.inmotionhosting.com/support/news/nodejs-v26-released/)
- Mail: [Lettermint (european-alternatives.eu)](https://european-alternatives.eu/product/lettermint), [lettermint.co/pricing](https://lettermint.co/pricing) (direkt nicht abrufbar, Angaben über Sekundärquellen), [Scaleway TEM](https://www.scaleway.com/fr/transactional-email-tem/), [Brevo-Preise 2026](https://dreamlit.ai/blog/brevo-review)
- Schulferien: [openholidaysR (CRAN)](https://cran.r-project.org/web/packages/openholidaysR/refman/openholidaysR.html)
- Fehler-Tracking: [Bugsink vs. GlitchTip](https://www.bugsink.com/blog/bugsink-vs-glitchtip/), [Sentry Datenstandort Deutschland](https://sentry.io/changelog/data-storage-location-in-germany-is-generally-available/)
