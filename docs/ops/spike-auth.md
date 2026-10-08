# Spike P1-0a – Login per Code + Magic-Link (T1), Sessions, Einladungs-Token

Stand: 2026-10-08 · Verantwortlich: Developer · Bezug: [tech-stack.md](tech-stack.md) §3, §11 (T1–T3) · [user-flows.md](../ux/user-flows.md) Flow A/H · [ux-spec.md](../ux/ux-spec.md) §4.4, §10.5 · Status: **Spike abgeschlossen (lokal), Gerätetest T2 offen**

---

## 1. Ergebnis auf einen Blick

| Frage (tech-stack.md §3.2/§11) | Ergebnis | Nachweis |
|---|---|---|
| T1: Code **und** Magic-Link in **einer** Mail mit Better Auth | ✅ funktioniert – eigenes Plugin `email-access` orchestriert `emailOTP` + `magicLink`, Verifizierung bleibt 100 % Better Auth | E2E `auth.spec.ts` (Code aus Mailpit-API, Link aus derselben Mail) |
| 6-stellig, 15 Min., 5 Versuche, gehasht, Rotation bei Neuanforderung | ✅ `otpLength: 6`, `expiresIn: 900`, `allowedAttempts: 5`, `storeOTP: "hashed"`, `resendStrategy: "rotate"`; Magic-Link-Token gehasht, 15 Min., einmalig | Konfiguration `src/server/auth/email-access-plugin.ts`; E2E „link is single-use“ |
| „Angemeldet bleiben“ Standard **an** | ✅ Session-Cookie mit `Max-Age` 90 Tage, rollierend (`updateAge` 1 Tag) | E2E prüft Ablauf > 89 Tage |
| „Angemeldet bleiben“ **aus** bei Code-Login | ✅ eigener After-Hook: Cookie ohne `Max-Age` (endet mit Browser) + serverseitig 1 Tag (gleiche Semantik wie Better-Auth-Passwortlogin) | E2E „unticked → browser-session cookie“ |
| Cookies `SameSite=Lax`, `HttpOnly`, First-Party | ✅ `advanced.defaultCookieAttributes`; `Secure`/`__Secure-` automatisch bei `https://`-`BETTER_AUTH_URL` (Offline-Demo über `http://<LAN-IP>` bleibt möglich) | E2E prüft `sameSite === "Lax"`, `httpOnly` |
| Einladungs-Token überlebt die Registrierung | ✅ E-Mail → Code → Name/Beitritt laufen per `fetch` auf **derselben URL** `/i/<token>`; Magic-Link trägt den Rücksprung `/i/<token>` und funktioniert in einem **anderen Browser** | E2E „invite → code → name → joined“ und „magic link … in another browser“ |
| T3: `docs/design/tokens.css` außerhalb `src/` importierbar | ✅ `@import "../../docs/design/tokens.css"` in `src/styles/globals.css` funktioniert mit Turbopack (dev + build) – **kein Sync-Skript, keine Kopie** | `pnpm build` grün |
| T2: Code-Eingabe & Session in WhatsApp-/Instagram-WebView auf echten Geräten | ⏳ **offen** – braucht eine öffentlich erreichbare HTTPS-URL (Tunnel, deployment.md §0.5) und echte Geräte | – |

**Empfehlung:** Better Auth bleibt die Login-Lösung (Hanko als Ausweichlösung nicht nötig). Der Ansatz „Plugin ruft die beiden Standard-Endpunkte in-process auf und sammelt Code + Link“ ist schlank (~150 Zeilen), nutzt keine eigene Kryptografie und keine internen Speicherformate von Better Auth.

## 2. Wie es funktioniert

```
Browser (/i/<token> oder /login)
  │ POST /api/auth/email-access/request {email, callbackURL:"/i/<token>", locale}
  ▼
Plugin email-access (Rate-Limit 3/Min./IP, Antwort immer {success:true})
  ├─ ruft emailOTP.sendVerificationOTP(type "sign-in") ──► Callback sammelt Code (AsyncLocalStorage)
  ├─ ruft magicLink.signInMagicLink(callbackURL)       ──► Callback sammelt Token
  └─ EINE Mail (DE/EN): Betreff „{code} ist dein Code für Wir wollen weg“ /
     „{code} is your code for When do we go?“; Code in eigener Zeile; Link
     /auth/magic?token=…&next=/i/<token>; im Einladungskontext „Du trittst „Lissabon 2027“ bei.“
     Versand nicht awaited (gleiche Antwortzeit für bekannte/unbekannte Adressen)

Code-Weg (Primärweg, gleicher Tab):  POST /api/auth/sign-in/email-otp {email, otp, rememberMe}
  → neues Konto? Namensschritt (= Beitrittsschritt auf /i/<token>) → Server Action joinTrip → /trips
Link-Weg (anderer Browser):  /auth/magic?token=… → Button „Jetzt anmelden“
  → GET /api/auth/magic-link/verify → Session in DIESEM Browser → zurück auf /i/<token> → Beitreten
```

- Die einzelnen Better-Auth-Sender `/email-otp/send-verification-otp` und `/sign-in/magic-link` sind per Before-Hook gesperrt (404), damit niemand an der Kombi-Mail vorbei Codes/Links anfordert.
- **Magic-Link-Landeseite mit Button** (`/auth/magic`): Der Token wird erst beim Tippen verbraucht. Grund: Mail-Scanner (z. B. Outlook Safe Links) rufen Links vorab auf und würden einen direkten Verify-Link „verbrennen“. Kostet einen Tipp mehr → **UX bitte bestätigen** (Alternative: automatische Weiterleitung per JS, schützt gegen die meisten Scanner ebenfalls).
- Magic-Link-Token: 32 Zeichen `[a-zA-Z]` ≈ 182 Bit (≥ 128 Bit gefordert), gehasht gespeichert.
- Der Rücksprung (`/i/<token>`) steht im Magic-Link als `next`/`callbackURL` (validiert: nur interne relative Pfade, `src/lib/safe-path.ts` + Better-Auth-Origin-Check). Die UX-Vorgabe „zusätzlich serverseitig in der Anforderung speichern“ (Flow A.4) ist damit funktional erfüllt; eine echte Server-Ablage folgt mit `pendingAuth` in Inkrement 1.

## 3. Erkenntnisse & Fallstricke (für Inkrement 1 wichtig)

1. **`Referrer-Policy: no-referrer` bricht Formular-POSTs.** Mit `no-referrer` senden Browser bei Formular-POSTs `Origin: null` → Next.js Server Actions („Invalid Server Actions request“) und der CSRF-Origin-Check von Better Auth lehnen ab. Für Token-Routen (`/i/*`, `/auth/*`) gilt daher **`Referrer-Policy: same-origin`** – Token gelangen weiterhin nicht an fremde Seiten. *Abweichung von sitemap.md §4 (dort `no-referrer`), Ziel unverändert erfüllt → UI/UX bitte im Dokument nachziehen.*
2. **Hydrations-Rennen in In-App-Browsern:** Auf langsamen Geräten wird getippt, bevor React hydriert ist. Kontrollierte Inputs verlieren dann Eingaben. Lösung im Spike: E-Mail-/Namensschritt als Formular-Aktionen mit `FormData` (React blockiert vor der Hydrierung einen nativen Submit – keine E-Mail in der URL), Beitritt als Server Action mit `useActionState` (funktioniert auch ohne JS).
3. **„Angemeldet bleiben = aus“** erzeugt zwei `Set-Cookie`-Header für das Session-Cookie (Better-Auth-Standard + Überschreiben ohne `Max-Age`); Browser übernehmen den letzten. Funktioniert in Chromium; in WebKit im CI zu verifizieren.
4. Better-Auth-Rate-Limit mit `storage: "database"`: Spalte `last_request` muss `bigint` sein (Millisekunden). Bereits im Schema/Migration korrigiert.
5. Better Auth setzt standardmäßig Telemetrie – **abgeschaltet** (`telemetry: { enabled: false }`). Cookie-Präfix `ww.` statt `better-auth.`.
6. next-intl 4.14 markiert `setRequestLocale`/`requestLocale` als veraltet (Ersatz: `next/root-params`). Mit zwei Root-Layouts (öffentliche Seiten mit `[locale]`, App-Routen ohne Präfix) erkennt Next 16.4 noch keine Root-Params → vorerst weiter `setRequestLocale` (lint-Ausnahme dokumentiert). Migration prüfen, sobald Next das unterstützt.
7. Next 16.4 erzeugt beim `next dev` eine `AGENTS.md` – per `agentRules: false` abgeschaltet (Projektregeln stehen in `CLAUDE.md`). Hinweis an CEO: Next liefert aktuelle Doku unter `node_modules/next/dist/docs/` – lohnt sich als Verweis in `CLAUDE.md`.

## 4. Was der Spike bewusst NICHT enthält (→ Inkrement 1, F-040–F-042, F-046)

- Code-Feld in Segment-Optik, „Code erneut senden“ mit 30-s-Countdown, Restversuche-Anzeige, Hilfebereich nach 60 s (ux-spec §4.4, Flow A.2).
- `pendingAuth` in `sessionStorage`/`localStorage` + Wiederherstellung nach WebView-Reload (Flow A.4 Regeln 1–3), Banner auf anderen Seiten.
- Rate-Limits **pro E-Mail-Adresse** (5/Std., 20/Tag; Sperre nach 10 Fehlversuchen) – nur IP-Limits aktiv.
- Passwort (optional, Argon2id, `haveIBeenPwned`), Passwort vergessen, E-Mail ändern (Code an neue Adresse), Abmelden überall. **Achtung:** Andere OTP-Typen (`forget-password`, `change-email`) werfen im Spike bewusst einen Fehler – sie brauchen eigene Mails.
- Kontosprache/Region speichern und beim Login anwenden (Flow F.3), Mail-Sprache aus Konto.
- React-Email-Vorlage (Spike: schlichte String-Vorlage mit Text- + HTML-Teil, Texte aus `messages/*.json`).
- Vollständige Einladungs-Vorschau (Orga-Name, Zeitraum, Sonderzustände A.3), Reise-Datenmodell (Platzhalter-Tabellen `trip`, `trip_member`).

## 5. T2 – nächster Schritt (Gerätetest)

Voraussetzung: Offline-Demo (`docker/compose.demo.yml`) + kurzlebiger HTTPS-Tunnel (deployment.md §0.5, z. B. Cloudflare Quick Tunnel) mit `APP_URL`/`BETTER_AUTH_URL` = Tunnel-URL; nur `@demo.test`-Adressen. Prüfliste je Gerät (iPhone: WhatsApp, Instagram; Android: WhatsApp, Instagram):

1. Einladungslink im Chat antippen → Vorschau lädt im In-App-Browser.
2. E-Mail eingeben → Code aus Mailpit (Laptop) eintippen bzw. per Autofill → angemeldet, Beitritt.
3. In-App-Browser schließen und Link erneut öffnen → noch angemeldet? (WebView-Cookie-Speicher)
4. App-Wechsel während Schritt Code (Mail-App) → Formular noch da? (sonst `pendingAuth` priorisieren)
5. Magic-Link im Standardbrowser → Session dort, In-App-Fenster bleibt unberührt.

## 6. Dateien

- `src/server/auth/email-access-plugin.ts` – Plugin (Kombi-Mail, Remember-me-Hook, Sperre der Einzel-Sender)
- `src/server/auth/index.ts` – Better-Auth-Konfiguration (Sessions 90 Tage, Cookies, Rate-Limit DB, UUIDv7 aus PostgreSQL)
- `src/server/mail/access-email.ts`, `src/server/mail/transport.ts` – Mail-Vorlage DE/EN, SMTP (Mailpit)
- `src/features/auth/components/email-access-form.tsx`, `src/features/invite/join-form.tsx`, `src/features/auth/actions.ts`
- `src/app/(app)/i/[token]/page.tsx`, `src/app/(app)/login/page.tsx`, `src/app/(app)/auth/magic/page.tsx`, `src/app/(app)/trips/page.tsx`
- `tests/e2e/auth.spec.ts`, `tests/e2e/helpers/mailpit.ts`
