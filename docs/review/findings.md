# Review-Findings

Stand: 2026-10-10 (Reviewer: Review Inkrement 4, Commit d31c977 – R-050–R-054, R-049 verifiziert; Reviewer: Review Inkrement 3, Commit 2c9f373 – R-045–R-049; Reviewer: Review Inkrement 1, Commit d2fc096; Developer: Fixes R-021–R-023, R-027, R-028, R-031; Reviewer: Nachprüfung Commit 2e02b3d, neue Findings R-032–R-034; Developer: Fixes R-032, R-033; Reviewer: Nachprüfung Commit 9baea12 – R-032, R-033 verifiziert) · Reviewer · Bezug: P1-0 (Scaffold) + P1-0a (Auth-Spike), PR #4 (gemergt); Schritt 0a „UI-Fundament“ (Commit a6063e9)

Status: **offen** · **behoben – bitte prüfen** · **verifiziert** (vom Reviewer bestätigt)

## Übersicht

| ID | Schwere | Kurztitel | Status |
|---|---|---|---|
| R-001 | hoch | Open Redirect in `toSafeInternalPath` über Punkt-Segmente | verifiziert |
| R-002 | niedrig | Einzel-Sende-Endpunkte für Passwort-Reset/E-Mail-Änderung offen | verifiziert |
| R-003 | mittel | Fokus geht nach „Code senden“ verloren | verifiziert |
| R-004 | niedrig | Landingpage in Demo/Dev indexierbar | verifiziert |
| R-005 | mittel | Rate-Limit-IP per `X-Forwarded-For` umgehbar / gemeinsamer Topf | verifiziert |
| R-006 | niedrig | Magic-Link-Landeseite verbraucht Token per GET-Link | verifiziert |
| R-007 | niedrig | Ungültige Einladung ohne `h1` | verifiziert |
| R-008 | niedrig | Doku-Abweichungen (sitemap §4, deployment §0.2) | verifiziert |
| R-009 | niedrig | CI nutzt `pnpm/action-setup@v4` mit pnpm 12 | verifiziert (bewusst gepinnt) |
| R-010 | niedrig | Client konnte Session-IP über `x-ww-client-ip` fälschen | verifiziert |
| R-011 | hoch | `handleAuthRequest` stürzt auf Node 24 ab (CI rot) | verifiziert |
| R-012 | niedrig | Magic-Link-Fehlerseite ohne Seitenrahmen | verifiziert |
| R-013 | niedrig | Netzwerkfehler weicht von Flow H.5 Schritt 3e ab | verifiziert |
| R-014 | niedrig | Eigene IP-Auflösung doppelt zu Better Auth | offen (später entscheiden) |
| R-015 | niedrig | Hydration-Warnung auf `/auth/magic` (`method="POST"` am Formular mit Action) | verifiziert |
| R-016 | mittel | Code-Feld: kein sichtbarer Fokus, wenn alle 6 Ziffern stehen | verifiziert |
| R-017 | mittel | Eintritts-Animationen laufen bei Hydration – Inhalt blinkt weg und blendet neu ein | verifiziert |
| R-018 | niedrig | Schritt 0a unvollständig: Footer mit Hilfe-Link und Radio-Komponente fehlen | verifiziert |
| R-019 | niedrig | Bottom-Sheet: Fokus kehrt erst nach der Austritts-Animation zurück, Seite bis dahin inert | verifiziert |
| R-020 | niedrig | Fokus-Ringe im Kontrastmodus (forced colors) unsichtbar | verifiziert (vom Reviewer behoben) |
| R-021 | hoch | Lockout-DoS: fremde Adresse mit 10 Anfragen ohne Code komplett sperrbar | verifiziert |
| R-022 | mittel | Limits pro E-Mail nicht atomar – parallele Anfragen überschreiten 5/Std. und 10 Fehlversuche | verifiziert |
| R-023 | hoch | Passwort setzen/entfernen ohne Re-Authentifizierung – umgeht Re-Auth der E-Mail-Änderung | verifiziert |
| R-024 | hoch | Konto-Enumeration über Antwortzeit bei „Passwort vergessen“ | verifiziert (vom Reviewer behoben) |
| R-025 | niedrig | Manipuliertes Cookie `ww-lang-at` → 500 bei Anmeldung/Registrierung | verifiziert (vom Reviewer behoben) |
| R-026 | niedrig | `pendingAuth.origin` schwächer geprüft als `toSafeInternalPath` | verifiziert (vom Reviewer behoben) |
| R-027 | niedrig | Mail-Budget pro Adresse über Plus-Adressen umgehbar | verifiziert |
| R-028 | niedrig | HMAC-Schlüssel der Limits = `BETTER_AUTH_SECRET` ohne Ableitung, fester Rückfallschlüssel | verifiziert |
| R-029 | niedrig | axe-Tests messen mitten in Überblendungen (CI rot/flaky, PR #6) | verifiziert (vom Reviewer behoben) |
| R-030 | niedrig | Argon2id-Test ohne Known-Answer – Node-22-Pfad ungeprüft | verifiziert (vom Reviewer behoben) |
| R-031 | niedrig | Avatar-Menü bleibt offen, wenn der Tastaturfokus es verlässt | verifiziert |
| R-032 | hoch | Konto-Enumeration über „Passwort vergessen“: `remainingAttempts` und Sperre nur für bestehende Konten | verifiziert |
| R-033 | hoch | Postfach-Budget (R-027) sperrt die echte Adresse – Mail-Anmeldung über Plus-Adressen dauerhaft blockierbar | verifiziert |
| R-034 | niedrig | Text-Button «Mit Passwort/Code bestätigen» mit nativem Button-Look (Dark Mode: Kontrast 3,4:1) | verifiziert (vom Reviewer behoben) |
| R-035 | mittel | Restrisiko R-033: Konto-Adresse ist selbst eine Variante (vor Go-Live) | offen |

## Details

### R-001: Open Redirect in toSafeInternalPath über Punkt-Segmente
- Schwere: hoch · Datei: `src/lib/safe-path.ts`
- Problem: `new URL("/..//evil.example", base).pathname` ergab `//evil.example` (protokoll-relativ). Angemeldet führte `/login?next=/..//evil.example` auf die fremde Seite; ebenso über den Namensschritt und `router.push(returnTo)`.
- Umsetzung: nach der Normalisierung erneut auf `//` prüfen, sonst Fallback; 4 Unit-Tests. Live: 307 → `/trips`.
- Status: verifiziert

### R-002: Einzel-Sende-Endpunkte für Passwort-Reset/E-Mail-Änderung offen
- Schwere: niedrig · Datei: `src/server/auth/email-access-plugin.ts`
- Problem: `/email-otp/request-password-reset`, `/forget-password/email-otp`, `/email-otp/request-email-change` legten für existierende Konten eine `verification`-Zeile an und loggten einen Fehler (Seitenkanal, Log-Spam).
- Umsetzung: in `BLOCKED_PATHS` (404). In Inkrement 1 mit eigenen Mails wieder freigeben.
- Status: verifiziert

### R-003: Fokus geht nach „Code senden“ verloren
- Schwere: mittel · Datei: `src/features/auth/components/email-access-form.tsx`
- Problem: Fokus landete auf `<body>` (rAF-`focus()` vor dem Rendern des Code-Schritts).
- Umsetzung: `useEffect` auf den Schritt; E2E-Assertion `toBeFocused()`.
- Status: verifiziert

### R-004: Landingpage in Demo/Dev indexierbar
- Schwere: niedrig · Datei: `next.config.ts`
- Umsetzung: `X-Robots-Tag: noindex, nofollow` global, solange `APP_ENV !== "production"`.
- Status: verifiziert

### R-005: Rate-Limit-IP-Ermittlung nicht an Betrieb angepasst
- Schwere: mittel (vor jedem öffentlichen Zugriff zu beheben)
- Problem: Gefälschtes `X-Forwarded-For` umging das Limit; mehrwertige Header landeten in einem gemeinsamen Topf (Login-DoS).
- Umsetzung: `src/server/auth/client-ip.ts` (`AUTH_IP_HEADER`, `AUTH_TRUSTED_PROXIES`, rechts-nach-links), interner Header `x-ww-client-ip`, 400 ohne auflösbare IP (außer development/ci). Demo bekommt Caddy-Proxy davor (`docker/Caddyfile.demo`).
- Grenze: Direkt erreichbares `next start` bleibt per Header täuschbar (Next setzt XFF nur, wenn er fehlt) – nur hinter Proxy betreiben.
- Offen für Inkrement 1 (hoch priorisiert): Limits pro E-Mail-Adresse. → Umsetzung Inkrement 1: 5 Code-Mails/Std., 20/Tag, Sperre nach 10 Fehlversuchen/Std. (Code + Passwort) pro Adresse, immer aktiv, Adresse nur als HMAC gespeichert (`src/lib/email-limits.ts`, `src/server/auth/email-limit-store.ts`, Tabelle `auth_attempt`); E2E „rate limits per e-mail address“. Prüfung (Reviewer, Inkrement 1): Werte und Verhalten korrekt, gleiche Antworten für bekannte/unbekannte Adressen; Restprobleme als R-021, R-022, R-027, R-028.
- Status: verifiziert (Caddy real getestet: 429 ab der 11. Anfrage)

### R-006: Magic-Link-Landeseite verbraucht Token per GET-Link
- Schwere: niedrig · Dateien: `src/app/(app)/auth/magic/page.tsx`, `src/features/auth/actions.ts`
- Umsetzung (UX-Entscheidung, Flow H.5): GET zeigt nur die Seite; Einlösen per `<form method="post">` + Server Action; GET `/api/auth/magic-link/verify` gesperrt (404). Open Redirect und CSRF geprüft.
- Status: verifiziert

### R-007: Ungültige Einladung ohne Überschrift
- Schwere: niedrig · Datei: `src/app/(app)/i/[token]/page.tsx`
- Problem: `/i/doesnotexist` → axe `page-has-heading-one`.
- Erwartet: jede Seite mit `h1`; axe-Tests für `/i/<token>` und `/auth/magic` aufnehmen.
- Umsetzung (Schritt 0a UI-Fundament): ungültige Einladung zeigt `h1` „Dieser Link funktioniert nicht mehr“ + gemeinsamen Hinweistext + Taste (`src/app/(app)/i/[token]/page.tsx`); axe hell/dunkel für `/i/<token>`, `/i/<ungültig>`, `/auth/magic` in `tests/e2e/ui-foundation.spec.ts`, eigener Test „R-007“.
- Prüfung (Reviewer, 0a): E2E „R-007“ + axe hell/dunkel grün (desktop + mobile Chromium, Node 24, Produktions-Build); Screenshot 390 px bestätigt h1, Text, Taste.
- Status: verifiziert

### R-008: Doku-Abweichungen nachziehen
- Schwere: niedrig · Dateien: `docs/ux/sitemap.md` §4, `docs/ops/deployment.md` §0.2
- Umsetzung: Referrer-Policy `same-origin` dokumentiert; Migration/Seed über Service `tools`.
- Status: verifiziert

### R-009: CI nutzt pnpm/action-setup@v4 mit pnpm 12
- Schwere: niedrig · Datei: `.github/workflows/ci.yml`
- Ergebnis: Action unterstützt pnpm bis v12, bewusst gepinnt (Kommentar in der Datei). Dependabot-Bump auf v6 zeitnah mergen (Node-20-Warnung).
- Status: verifiziert

### R-010: Client konnte Session-IP fälschen
- Schwere: niedrig · Dateien: `src/server/auth/index.ts`, `src/features/auth/actions.ts`
- Problem: `redeemMagicLink` übergab rohe Header; ein gesetztes `x-ww-client-ip` landete in `session.ip_address`.
- Umsetzung: `withTrustedClientIp(headers)` für HTTP-Weg und Server Actions.
- Status: verifiziert

### R-011: Absturz in handleAuthRequest auf Node 24
- Schwere: hoch · Datei: `src/server/auth/index.ts`
- Problem: `new Request(request, { headers })` wirft auf Node 24 („Cannot read private member #state …“) → jeder `/api/auth/*`-Aufruf 500, keine Mails, CI-E2E rot. Lokal unentdeckt, weil Node 22 lief.
- Umsetzung: Request aus seinen Teilen neu bauen (`duplex: "half"`).
- Prozess-Hinweis: lokal Node ≥ 24 verwenden (`.nvmrc`, ggf. `engine-strict`).
- Status: verifiziert

### R-012: Magic-Link-Fehlerseite ohne Seitenrahmen
- Schwere: niedrig · Datei: `src/app/(app)/auth/magic/layout.tsx` (neu)
- Umsetzung: PageShell ins Layout, damit auch `error.tsx` Header und `<main>` hat.
- Status: verifiziert

### R-013: Netzwerkfehler weicht von Flow H.5 Schritt 3e ab
- Schwere: niedrig · Datei: `src/app/(app)/auth/magic/error.tsx`
- Problem: Abgebrochener POST ersetzt die ganze Karte durch die Fehlerseite (Extra-Tipp, Fokus auf `body`).
- Erwartet: Inline-Fehler über dem aktiven Button; `error.tsx` nur als Rückfall.
- Umsetzung (Schritt 0a): `MagicLinkForm` fängt den Submit mit JS ab und ruft die Server Action in einer Transition auf; Netzwerkfehler → Fehlertext (Icon + Text) über der Taste „Nochmal versuchen“, Fokus auf die Taste; Redirects laufen über `unstable_rethrow` weiter. Ohne JS bleibt das echte Formular. `error.tsx` nur noch Rückfall. E2E „R-013“ (POST abgebrochen → Inline-Fehler → Retry meldet an).
- Prüfung (Reviewer, 0a): E2E „R-013“ grün; zusätzlich geprüft, dass der Fokus nach dem Fehler auf „Nochmal versuchen“ liegt; E2E „POST signs in without JavaScript“ grün.
- Status: verifiziert

### R-014: Eigene IP-Auflösung doppelt zu Better Auth
- Schwere: niedrig (Codequalität) · Datei: `src/server/auth/client-ip.ts`
- Hinweis: Better Auth 1.7.7 bietet `advanced.ipAddress.trustedProxies`/`ipv6Subnet` und `disabledPaths`. Eigene Lösung ist korrekt (400 statt Sammeltopf) und darf bleiben.
- Status: offen (später entscheiden)

### R-015: Hydration-Warnung auf /auth/magic
- Schwere: niedrig · Datei: `src/features/auth/components/magic-link-form.tsx`
- Problem (CEO beim manuellen Durchklicken, `pnpm dev`): React meldet „Cannot specify a encType or method for a form that specifies a function as the action“ und einen Hydration-Mismatch (`method="post"` vs. `"POST"`). Für Nutzer ohne Auswirkung, erzeugt aber das Next-Dev-„Issue“.
- Erwartet: keine Hydration-Warnungen; Funktion ohne JS bleibt erhalten (React setzt Methode bei Function-Actions selbst).
- Umsetzung (Schritt 0a): `method="post"` entfernt; Browser-Konsole auf `/auth/magic` ohne Hydration-Warnung geprüft; E2E „POST signs in without JavaScript“ weiter grün.
- Prüfung (Reviewer, 0a): `pnpm dev` (Node 24), Browser-Konsole auf `/auth/magic?token=…`, `/login`, `/i/x`, `/dev/ui`, `/de` ohne Fehler/Warnungen.
- Status: verifiziert

---

## Review Schritt 0a „UI-Fundament“ (Commit a6063e9, Reviewer 2026-10-08)

### R-016: Code-Feld: kein sichtbarer Fokus, wenn alle 6 Ziffern stehen
- Schwere: mittel (WCAG 2.4.7 Fokus sichtbar, AA)
- Datei: `src/components/ui/code-field.tsx:121` (`activeIndex`), `src/components/ui/code-field.module.css:150`
- Problem / Reproduktion: Fokus wird nur am „aktiven“ Kästchen gezeigt (`activeIndex = focused && !busy && value.length < 6 ? value.length : -1`), das Eingabefeld selbst hat keinen Ring. Sobald 6 Ziffern im Feld stehen, gibt es keinen Fokus-Indikator mehr. Szenario: `/login` → Code-Schritt → falschen Code „111111“ tippen → Fehler, Fokus bleibt laut ux-spec §4.4 im Feld und der Wert ist markiert → alle Kästchen nur roter Rahmen + Tönung, **kein** Fokusring (Screenshot im Review, Playwright: kein Kästchen mit `box-shadow`). Gleiches beim Zurück-Tabben in ein volles Feld und in den Zuständen „Prüfen“/„Erfolg“ (readOnly, aber fokussiert).
- Erwartetes Verhalten: Solange das Eingabefeld den Fokus hat, ist immer ein Fokus-Indikator sichtbar (≥ 3:1, design-system §9 „Fokus überall“).
- Vorschlag: Bei vollem Wert den Fokusring um die ganze Kästchen-Gruppe (z. B. `.group:has(.input:focus-visible)` mit `--ww-focus-ring`) oder am letzten Kästchen zeigen – ohne Caret. Optik kurz mit Designer abstimmen (§9.7 definiert den Fall nicht). E2E: nach falschem Code ist ein Fokus-Indikator vorhanden.
- Umsetzung (Inkrement 1): Ohne „aktives“ Kästchen (6 Ziffern, Prüfen, Erfolg) liegt derselbe Fokusring (`--ww-focus-ring`, im Kontrastmodus transparente Outline) um die ganze Kästchen-Gruppe (`.groupFocus::after`, `src/components/ui/code-field.*`); im gesperrten Zustand kein Ring, der Fokus springt auf die Primär-Taste „Neuen Code senden“. E2E „R-016“ (`tests/e2e/increment-1-findings.spec.ts`). Optik-Annahme: Ring = Gruppenumriss mit 4 px Abstand (§9.7 definiert den Fall nicht) – Designer bitte kurz bestätigen.
- Prüfung (Reviewer, Inkrement 1): E2E „R-016“ grün (desktop + mobile Chromium, Node 24, Produktions-Build); Gruppenring bei 6 Ziffern/Prüfen sichtbar, im Kontrastmodus über die transparente Outline. Designer-Bestätigung der Optik (Gruppenumriss, 4 px) steht noch aus – kein Blocker.
- Status: verifiziert

### R-017: Eintritts-Animationen laufen bei Hydration – Inhalt blinkt weg und blendet neu ein
- Schwere: mittel (sichtbarer Fehler beim ersten Eindruck, W03 Einladung)
- Dateien: `src/components/enter.tsx` (genutzt in `src/app/(app)/i/[token]/page.tsx:40,62`), `src/components/stagger-enter.tsx` (`/trips`)
- Problem / Reproduktion: Die Seite ist serverseitig gerendert und sofort sichtbar; `Enter`/`StaggerEnter` starten ihre Animation erst in `useLayoutEffect` nach der Hydration mit `opacity: 0` (`fill: backwards`). Gemessen (Playwright, `/i/<token>`, Reisekarte-h1, Opazität pro Frame): ohne Drosselung sichtbar ab 26 ms → **0 bei 142 ms** → Einblenden bis 406 ms; bei CPU ×6 (Mittelklasse-Handy) sichtbar ab 112 ms → **0 bei 813 ms** → Einblenden bis 1077 ms. Nutzer sehen die Einladungskarte ~0,7 s, dann verschwindet sie und kommt neu. Gilt auch mit reduzierter Bewegung (Überblenden bleibt). Widerspricht interaktionen.md §4 „Texte/CTA ohne Warten auf Animation lesbar“ und motion-system §6.1 (Zustand zuerst).
- Erwartetes Verhalten: Beim ersten Laden (SSR) keine erneute Eintritts-Animation für bereits gemalte Inhalte; Eintritt nur bei clientseitiger Navigation (G-01) bzw. wenn der Inhalt vor dem ersten Paint verborgen war.
- Vorschlag: Eintritt nur abspielen, wenn das Element nicht schon gemalt wurde – z. B. Modul-Flag „erste Hydration“ (beim Hard-Load überspringen, bei Client-Navigation abspielen) oder CSS-Startzustand nur unter einem im Head-Skript gesetzten Attribut (`html[data-js]`), damit ohne JS weiterhin alles sichtbar bleibt. E2E: Opazität der Reisekarte fällt nach dem ersten Paint nie auf 0.
- Umsetzung (Inkrement 1): `useWasServerPainted()` (`src/lib/use-hydration.ts`, `useSyncExternalStore`-Server-Snapshot) – `Enter`/`StaggerEnter` spielen nur noch für Inhalte, die clientseitig erscheinen (Navigation, neuer Schritt), nie für schon gemalte SSR-Inhalte. Illustrationen (`IllustrationMotion`): Ebenen sind VOR dem ersten Paint verborgen (`html[data-js]` aus dem Head-Skript + `data-intro="pending"`, nur bei voller Bewegung), CSS-Failsafe nach 2,4 s; ohne JS/reduziert sofort sichtbar. E2E „R-017“: Opazität der Reisekarten-h1 fällt nach dem ersten Paint nie unter 0,99 (CPU ×6) und Schrittwechsel animieren weiter.
- Prüfung (Reviewer, Inkrement 1): E2E „R-017“ grün (Opazität der Reisekarten-h1 bleibt ≥ 0,99 bei CPU ×6); Code-Review `useWasServerPainted` (Server-Snapshot nur während der Hydration) und Illustrations-Failsafe (2,4 s, nur mit JS und voller Bewegung) schlüssig.
- Status: verifiziert

### R-018: Schritt 0a unvollständig: Footer mit Hilfe-Link und Radio-Komponente fehlen
- Schwere: niedrig
- Dateien: `src/components/page-shell.tsx`, `src/components/ui/`
- Problem / Reproduktion: Roadmap 0a nennt „Schalter/Checkbox/**Radio**“ und „Seitenrahmen (Header, **Footer mit Hilfe-Link**, Sprachumschalter)“. `PageShell` rendert nur Header + `main` (kein `<footer>` auf `/login`, `/i/…`, `/auth/magic`, `/trips`); eine Radio-Komponente gibt es nicht (auch nicht in `/dev/ui`). ux-spec 3.2.6: «Hilfe» im Footer auf allen Seiten; design-system §9 (Sprachumschalter): Footer-Segment „Deutsch | English“.
- Erwartetes Verhalten: Footer-Gerüst im Seitenrahmen (Hilfe-Link, Sprach-Segment), Radio(-Gruppe) als Basis-Komponente – oder bewusste Verschiebung durch CEO/PM in die Roadmap (Hilfe-Seite F-051 existiert noch nicht, Ziel `/de/hilfe`).
- Vorschlag: Mit Inkrement 1 (Code-Schritt, F-051-Hilfelinks) nachziehen; Radio spätestens mit W08-Werkzeugleiste/Abstimmung.
- Umsetzung (Inkrement 1): Footer im Seitenrahmen und auf der Landing (`src/components/shell/site-footer.tsx`): „Hilfe“ (→ `/de/hilfe` bzw. `/en/help`) + Segment „Deutsch | English“ (App-Routen per Cookie/Konto, Präfix-Seiten per Link; Fokus bleibt nach dem Umschalten auf dem Segment). Datenschutz/Impressum folgen mit den Rechtstexten (Q14/Q16). Radio-Gruppe `src/components/ui/radio-group.tsx` (native Radios, 24 px, Zeile ≥ 44 px, G-12-Pop), genutzt im Konto, Demo in `/dev/ui`. E2E „footer (R-018)“.
- Prüfung (Reviewer, Inkrement 1): Footer auf App-, Präfix- und Landing-Seiten mit Hilfe-Link und Segment „Deutsch | English“ (`aria-current`, Fokus bleibt), Radio-Gruppe im Konto und in `/dev/ui`; E2E „footer (R-018)“ grün.
- Status: verifiziert

### R-019: Bottom-Sheet: Fokus kehrt erst nach der Austritts-Animation zurück, Seite bis dahin inert
- Schwere: niedrig
- Datei: `src/components/ui/bottom-sheet.tsx:60-76`
- Problem / Reproduktion: Beim Schließen läuft die Austritts-Animation am noch **modal offenen** `<dialog>`; `returnFocus.current?.focus()` wird währenddessen aufgerufen und scheitert (Seite ist inert). `/dev/ui` → „Bottom-Sheet öffnen“ → Esc: Fokus direkt danach weiter auf der Sheet-Überschrift, erst nach `dialog.close()` (~220 ms, nativer Fokus-Rückgabe) auf dem Auslöser. Bis dahin sind Tipps auf die Seite wirkungslos. interaktionen.md G-05b: „Fokus zurück auf Auslöser (sofort)“; §4: keine Animation blockiert Eingaben.
- Erwartetes Verhalten: Fokus sofort auf dem Auslöser, Seite sofort bedienbar.
- Vorschlag: Beim Schließen sofort `dialog.close()` und den Austritt über ein Klon-/Overlay-Element bzw. `@starting-style`/`transition-behavior: allow-discrete` (`overlay`, `display`) per CSS animieren; oder vor der Animation `inert`-Wirkung aufheben (z. B. Dialog per `close()` schließen und nicht-modal (`show()`) bis Animationsende halten).
- Umsetzung (Inkrement 1): Beim Schließen wird der modale Dialog sofort geschlossen (`close()`), Fokus geht im selben Ereignis an den Auslöser; die Austritts-Animation läuft auf demselben Element nicht-modal, `inert` und mit `pointer-events: none`; erneutes Öffnen während des Austritts bricht ihn ab. E2E „R-019“ (Fokus < 100 ms zurück, nicht mehr `:modal`, Auslöser sofort treffbar).
- Prüfung (Reviewer, Inkrement 1): E2E „R-019“ grün (Fokus < 100 ms zurück, Dialog nicht mehr `:modal`, Auslöser sofort treffbar). Doppelte Zeile `dialog.style.pointerEvents = ""` vom Reviewer entfernt.
- Status: verifiziert

### R-020: Fokus-Ringe im Kontrastmodus (forced colors) unsichtbar
- Schwere: niedrig (vom Reviewer behoben)
- Dateien: `src/components/ui/button.module.css`, `cockpit.module.css`, `switch.module.css`, `field.module.css`, `code-field.module.css`, `language-switch.module.css`, `src/components/page-shell.module.css`
- Problem: `outline: none` + Ring über `box-shadow`; im Kontrastmodus entfernt der Browser `box-shadow` → kein Fokus an Minze-Taste „Reise planen“, „Anmelden“ im Hero, Marke/Sprachumschalter auf Indigo, Cockpit-Tabs/-Tasten, Schalter, Textfeld, Code-Feld (Playwright `forcedColors: 'active'`, Screenshot).
- Umsetzung: `outline: var(--ww-focus-width) solid transparent` statt `none` – im Normalmodus unsichtbar, im Kontrastmodus vom System eingefärbt. Geprüft: Fokus in forced colors sichtbar, Normalmodus unverändert.
- Status: verifiziert

---

## Review Inkrement 1 (Commit d2fc096, Reviewer 2026-10-09)

Geprüft mit Node 24.21 im CI-Modus (Produktions-Build, Postgres 18, Mailpit), `RATE_LIMIT_ENABLED=true` für die Sicherheits-Proben (Skripte gegen `/api/auth/*` mit wechselnden `X-Forwarded-For`).

### R-021: Lockout-DoS – fremde Adresse mit 10 Anfragen ohne Code komplett sperrbar
- Schwere: hoch (vor jedem öffentlichen Zugriff zu beheben; Offline-Demo nicht betroffen)
- Datei: `src/server/auth/email-access-plugin.ts` (`afterVerification`), `src/lib/email-limits.ts:15-22,62-68`
- Problem / Reproduktion: Better Auth antwortet auch dann mit `INVALID_OTP`, wenn für die Adresse **gar kein Code aussteht** (`atomicVerifyOTP`: kein Datensatz → `INVALID_OTP`). Jeder dieser Aufrufe zählt als Fehlversuch. Probe: Konto `victim@…` anlegen, dann 10 × `POST /api/auth/sign-in/email-otp {email: victim, otp: "000000"}` (ohne vorher einen Code anzufordern; eine IP reicht, IP-Limit 10/Min.) → 10. Antwort 429 `EMAIL_LOCKED`; danach für das Opfer: Code anfordern → 429 `EMAIL_LOCKED` (`retryAfter: 3600`), Passwort-Login → 429. Wiederholt der Angreifer das stündlich (10 Anfragen/Std.), kann sich das Opfer **dauerhaft** nicht mehr anmelden – weder per Code, Link noch Passwort. Bestehende Sitzungen laufen weiter. Der Code-Kommentar „mitigated by the code also arriving by mail“ stimmt nicht: die Sperre blockiert auch die Code-Mail (`decideCodeRequest`).
- Erwartetes Verhalten: Ein Dritter, der nur die Adresse kennt, kann den Zugang per Mail (Postfach-Besitz) nicht verhindern; die Sperre bremst nur das Raten.
- Vorschlag: (1) Während der Sperre weiterhin Mails im 5/Std.-Budget zulassen; gesperrt bleibt nur die Code-**Eingabe** und das Passwort, der **Magic-Link** (Postfach-Beweis, nicht ratbar) funktioniert immer – Text im Code-Schritt: „Zu viele Versuche. Nutze den Link in der Mail.“ (Texte mit UI/UX abstimmen). (2) Fehlversuche beim Code nur zählen, wenn ein Code ausstand (vor dem Verify `findVerificationValue` prüfen) – ohne ausstehenden Code ist Raten sinnlos. Beim Passwort für alle Adressen gleich weiterzählen (sonst Enumeration über das Sperrverhalten). (3) E2E: 10 Fehlversuche ohne Code → Code-Anforderung bleibt möglich, Magic-Link meldet an.
- Umsetzung (Developer, 2026-10-09): (1) Ein falscher Code zählt nur, wenn für die Adresse ein **nicht abgelaufener Code aussteht** (Before-Hook prüft `findVerificationValue` für `sign-in`/`forget-password`/`change-email`; ohne Code nur Sperr-Prüfung, kein Zählen). Falsche Passwörter zählen weiter für alle Adressen gleich. (2) Die Sperre blockiert **keine Mails** mehr (`decideCodeRequest` prüft nur das Mail-Budget); gesperrt sind nur Code-Eingabe und Passwort. (3) Der **Magic-Link** ist nie gesperrt und hebt die Sperre beim Anmelden auf (After-Hook `/magic-link/verify` → `clearVerificationFailures`). UI: Code-Schritt zeigt bei Sperre «Zu viele Versuche. Nutze den Link in der Mail.» (`auth.errors.lockedUseLink`), Passwort-Anmeldung «… Melde dich mit Code an und nutze den Link in der Mail – oder versuch es in {minutes} Min. nochmal.» (`lockedPassword`) – Texte bitte mit UI/UX gegenlesen. Dateien: `src/server/auth/email-access-plugin.ts`, `src/lib/email-limits.ts`, `src/features/auth/components/email-access-form.tsx`, `src/features/account/actions.ts` (Re-Auth-Code ebenso). Tests: `tests/e2e/increment-1-security.spec.ts` (12 Rateversuche ohne Code → nie 429, Code-Anmeldung danach ok; gesperrte Adresse bekommt Mail, Link meldet an und hebt Sperre auf; Passwort-Sperre verweist auf Code-Link), `increment-1-auth.spec.ts` angepasst.
- Prüfung (Reviewer, Commit 2e02b3d, `RATE_LIMIT_ENABLED=true`, direkt gegen `/api/auth/*`, wechselnde IPs): 15 × falscher Code ohne ausstehenden Code (auch Varianten `VICTIM@…`, ` victim@… `) → immer 400, nie 429. Mit 2 vom Angreifer angeforderten Codes: 10. Fehlversuch → 429 `EMAIL_LOCKED`; danach bekommt das Opfer weiter eine Mail (200), richtiger Code → 429, Passwort → 429, **Magic-Link meldet an und hebt die Sperre auf** (E2E, 8 × grün inkl. `--repeat-each=3`). Sperr-Antworten (`EMAIL_LOCKED`) für bekannte/unbekannte Adressen byte-gleich, Antwortzeit gleich (Median 17,7 / 17,3 ms). **Restproblem durch R-027:** siehe R-033.
- Status: verifiziert

### R-022: Limits pro E-Mail nicht atomar – parallele Anfragen überschreiten die Grenzen
- Schwere: mittel
- Datei: `src/server/auth/email-limit-store.ts:69-88` (`takeCodeRequest`, `assertVerificationAllowed`/`recordVerificationFailure`)
- Problem / Reproduktion: Prüfen (SELECT) und Zählen (INSERT) sind getrennt; parallele Anfragen sehen alle denselben Stand. Probe (a): 20 parallele `POST /email-access/request` für eine neue Adresse (verschiedene IPs) → **18 angenommen, 18 Mails** zugestellt (Grenze 5/Std.). Probe (b): 40 parallele falsche Passwörter auf ein Konto mit Passwort → **18 Fehlversuche ausgewertet und gezählt** (Grenze 10/Std.); Argon2 (19 MiB, Threadpool) macht das Zeitfenster breit. Gleiches gilt für die Re-Auth per Code (`verifyReauthCode` nutzt das nicht-atomare `checkVerificationOTP` von Better Auth).
- Erwartetes Verhalten: Grenzen halten auch unter Parallelität (Mailbombing ≤ 5/Std., Raten ≤ 10/Std.).
- Vorschlag: Pro Schlüssel serialisieren – z. B. Transaktion mit `pg_advisory_xact_lock(hashtextextended(key, 0))`, darin zählen und einfügen; für Fehlversuche einen „Versuch“ **vor** der Prüfung reservieren (Zeile `attempt` einfügen, bei Erfolg löschen) statt nachträglich zu zählen. Unit-/Integrationstest mit `Promise.all`.
- Umsetzung (Developer, 2026-10-09): `email-limit-store.ts` – Prüfen und Zählen in **einer Transaktion mit `pg_advisory_xact_lock(hashtextextended(key, 0))`** pro Schlüssel (Mail-Budget: Sperre pro Postfach; Fehlversuche: pro Adresse). Fehlversuche werden **vor** der Prüfung reserviert (`reserveVerificationAttempt` → Zeile `failure`), bei nicht zählendem Ausgang wieder freigegeben (`releaseVerificationAttempt`), bei Erfolg alle gelöscht. Die Reservierung liefert gleich mit, ob ein Fehlschlag die Sperre auslöst. Gilt auch für Re-Auth per Code/Passwort (`actions.ts`). Hinweis: Das Limit pro **Code** (5 Versuche, Better Auth) bleibt unter Parallelität „weich“; die harte Grenze ist jetzt 10/Std. pro Adresse. Tests (E2E, parallel): 20 parallele Code-Anforderungen → genau 5 × 200; 25 parallele falsche Passwörter → genau 9 × 401 + 16 × 429 (10. Prüfung meldet Sperre).
- Prüfung (Reviewer): parallel, jede Anfrage eigene IP – 30 Code-Anforderungen → genau 5 × 200 / 5 Mails; 30 gemischt `email-access/request` + `request-password-reset` auf ein Konto → 4 × 200 + 1 Registrierung = 5; 30 Plus-Adressen parallel → genau 10 × 200; 40 falsche Passwörter → 9 × 401 + 31 × 429; 30 falsche Codes parallel auf einen ausstehenden Code → 7 × 400 + 2 × 403 + 21 × 429 (= 10 Prüfungen), richtiger Code danach 429.
- Status: verifiziert

### R-023: Passwort setzen/entfernen ohne Re-Authentifizierung – umgeht die Re-Auth der E-Mail-Änderung
- Schwere: hoch
- Datei: `src/features/account/actions.ts:209-224` (`savePassword`, `deletePassword`), `:263-278` (`verifyReauthPassword`)
- Problem / Reproduktion: Wer eine Sitzung hat (entsperrtes Handy, fremder Rechner, 90-Tage-Session), kann ohne jede Bestätigung ein Passwort setzen oder ändern. Damit ist die Re-Authentifizierung der E-Mail-Änderung (Flow I.2, F-042) wertlos: `/account/password` → Passwort „X“ festlegen → `/account/email` → „Mit Passwort bestätigen“ mit „X“ → neue Adresse des Angreifers → Code an die eigene Adresse → **Konto übernommen**; das Opfer bekommt nur die Info-Mail und kommt nicht mehr hinein (H.4: kein Self-Service). Ebenso kann ein Angreifer ein bestehendes Passwort ändern/entfernen.
- Erwartetes Verhalten: Ändern der Anmeldewege (Passwort setzen/ändern/entfernen, E-Mail) verlangt eine frische Bestätigung des Besitzes (Code an die Adresse oder bisheriges Passwort).
- Vorschlag: `savePassword`/`deletePassword` nur mit `isReauthenticated(session.id)` (gleiche Code/Passwort-Komponente wie `/account/email`); Ausnahme ohne zusätzlichen Schritt: Sitzung ist gerade per Code entstanden (z. B. `session.createdAt` < 10 Min. → beim Login `markReauthenticated` setzen), damit das optionale Passwort im Registrierungsschritt ohne Extra-Code bleibt. Optional: nach Passwort-Änderung andere Sitzungen beenden. UX (Flow I.1 #4) kurz abstimmen; E2E „Passwort festlegen nach > 10 Min. verlangt Bestätigung“.
- Umsetzung (Developer, 2026-10-09): `savePassword`/`deletePassword` verlangen `isReauthenticated(session.id)` (sonst `reauthExpired`). Eine **Code- oder Magic-Link-Anmeldung** setzt die Bestätigung beim Anlegen der Sitzung für 10 Min. (`databaseHooks.session.create.after`, Pfade `/sign-in/email-otp`, `/magic-link/verify`; Passwort-Login zählt bewusst nicht) – das optionale Passwort im Namensschritt bleibt ohne Extra-Schritt. `/account/password` zeigt sonst zuerst denselben Bestätigungsschritt wie `/account/email` (neue Komponente `reauth-step.tsx`: Code an die Adresse oder aktuelles Passwort); läuft die Bestätigung bei offenem Formular ab, kommt der Schritt mit Hinweis «Bitte bestätige noch einmal, dass du es bist.» zurück. Nicht umgesetzt (optional im Vorschlag): andere Sitzungen nach Passwortänderung beenden. Tests: Unit `reauth.test.ts`; E2E „> 10 Min. nach Code-Anmeldung → erst Code“, „Server lehnt ab, wenn die Bestätigung bei offenem Formular abläuft“, „Passwort-Login ist keine Bestätigung – aktuelles Passwort schon“ (inkl. Entfernen).
- Prüfung (Reviewer): Sitzung > 10 Min. (Re-Auth-Marker abgelaufen) → `/account/password` zeigt nur den Bestätigungsschritt, Server lehnt `savePassword`/`deletePassword` mit `reauthExpired` ab (auch bei offenem Formular und offenem Entfernen-Dialog). Missbrauch der 10-Min.-Ausnahme geprüft: Marker hängt an der **neu** angelegten Sitzung (`reauth-<sessionId>`) und entsteht nur bei `/sign-in/email-otp` bzw. `/magic-link/verify` – beides verlangt Code/Token aus dem Postfach; eine gestohlene Sitzung kann sich so nicht selbst „auffrischen“, Code-Anmeldung mit eigenem Konto erzeugt nur eine Sitzung für dieses Konto; `/email-otp/send-verification-otp`/`check-verification-otp` sind per HTTP gesperrt. Andere Sitzungen bleiben nach Passwortänderung bestehen (geprüft) – **vertretbar**: Sitzungen hängen hier nicht am Passwort (Hauptweg Code), ein Angreifer mit Sitzung kann das Passwort ohne Bestätigung nicht mehr ändern, und „Auf allen Geräten abmelden“ ist vorhanden (ASVS verlangt nur die Option). Empfehlung UX (nicht blockierend): nach dem Speichern Hinweis/Link „Auf anderen Geräten abmelden“. Fokus/axe des neuen `reauth-step.tsx`: siehe R-034.
- Status: verifiziert

### R-024: Konto-Enumeration über die Antwortzeit bei „Passwort vergessen“
- Schwere: hoch (F-041: „gleiche Antwortzeiten/Texte unabhängig von der Existenz des Kontos“) · vom Reviewer behoben
- Datei: `src/server/auth/email-access-plugin.ts` (`sendVerificationOTP`)
- Problem / Reproduktion: Better Auth ruft `sendVerificationOTP` nur für **existierende** Konten auf und wartet darauf (`runInBackgroundOrAwait` ohne `backgroundTasks.handler` = `await`). `POST /email-otp/request-password-reset`: unbekannte Adressen Median **24 ms**, bekannte **74 ms** (8 + 8 Messungen, lokales Mailpit; mit echtem SMTP noch deutlicher). Text und Status sind gleich, die Zeit verrät das Konto. Gleiches Muster bei `request-email-change` (vergebene neue Adresse = keine Mail = schneller; nur angemeldet).
- Umsetzung (Reviewer): Reset- und Änderungs-Mail werden nicht mehr abgewartet (Fehler werden ohne Adresse/Code geloggt) – wie schon bei `/email-access/request`.
- Prüfung: siehe Bericht Inkrement 1 (Nachmessung).
- Status: verifiziert (vom Reviewer behoben)

### R-025: Manipuliertes Cookie `ww-lang-at` → 500 bei Anmeldung/Registrierung
- Schwere: niedrig (wirkt nur im eigenen Browser) · vom Reviewer behoben
- Datei: `src/server/auth/index.ts` (`browserLanguageChoice`)
- Problem / Reproduktion: `ww-lang-at=100000000000000000` + `lang=de` → `POST /sign-in/email-otp` mit gültigem Code → **500** (`Invalid Date` beim Schreiben von `locale_chosen_at`). Ein Zeitstempel in der Zukunft würde außerdem jede spätere ausdrückliche Wahl „überholen“.
- Umsetzung: nur Zeitstempel `> 0` und `≤ jetzt + 60 s` werden akzeptiert. `ww-motion` geprüft: nur der exakte Wert `reduce` wirkt, Manipulation harmlos.
- Status: verifiziert (vom Reviewer behoben)

### R-026: `pendingAuth.origin` schwächer geprüft als `toSafeInternalPath`
- Schwere: niedrig (Defense in depth – Ausnutzen setzt Schreibzugriff auf den Storage dieses Origins voraus) · vom Reviewer behoben
- Datei: `src/lib/pending-auth.ts` (`parse`), genutzt als `href` im Banner „Weiter“
- Problem: Prüfung nur `startsWith("/") && !startsWith("//")`; `"/\evil.example"` (Browser: `//evil.example`) und `"/..//evil.example"` wurden akzeptiert.
- Umsetzung: `origin` muss unverändert durch `toSafeInternalPath` gehen; Unit-Test um `/\…`, `/..//…`, absolute URL ergänzt.
- Status: verifiziert (vom Reviewer behoben)

### R-027: Mail-Budget pro Adresse über Plus-Adressen umgehbar
- Schwere: niedrig
- Datei: `src/server/auth/email-limit-store.ts:19-22` (`emailLimitKey`)
- Problem / Reproduktion: Normalisierung nur `trim().toLowerCase()` – richtig für Konten (Better Auth unterscheidet `a+x@` und `a@`), aber für Mailbombing landen `opfer+1@…`, `opfer+2@…` … alle im selben Postfach mit je eigenem 5/Std.-Budget; Grenze ist dann nur das IP-Limit (3/Min./IP).
- Vorschlag: Für das **Mail-Budget** zusätzlich einen Postfach-Schlüssel zählen (Plus-Tag entfernen; bei gmail.com/googlemail.com auch Punkte), z. B. 10/Std. und 30/Tag pro Postfach. Fehlversuche bleiben pro exakter Adresse (sonst sperrt man fremde Plus-Konten mit).
- Umsetzung (Developer, 2026-10-09): Zusätzlicher Budget-Schlüssel pro **Postfach** (`mailboxOf`: Kleinbuchstaben, `+tag` entfernt, Gmail/Googlemail ohne Punkte) – **10/Std., 30/Tag**, nur für das Mail-Budget; Fehlversuche bleiben pro exakter Adresse. Tests: Unit (`email-limits.test.ts`), E2E 12 parallele Plus-Adressen → genau 10 angenommen, danach auch die Grundadresse 429.
- Prüfung (Reviewer): `RV…@googlemail.com`, `r.v.m…@GMail.com`, `…+t7@gmail.com` → ein Postfach (10 × 200, dann 429, auch die Grundadresse); Punkte bei anderen Domains bleiben getrennte Postfächer. Fehlversuche weiter pro exakter Adresse. **Nebenwirkung:** das Postfach-Budget sperrt auch die echte Adresse → R-033.
- Status: verifiziert

### R-028: HMAC-Schlüssel der Limits = `BETTER_AUTH_SECRET` ohne Ableitung, fester Rückfallschlüssel
- Schwere: niedrig
- Datei: `src/server/auth/email-limit-store.ts:20`
- Problem: Das Session-/Verschlüsselungs-Secret wird direkt als HMAC-Schlüssel für einen anderen Zweck verwendet (keine Domänentrennung); fehlt es, gilt der im Code stehende Schlüssel `"dev-only-email-limit-key"` – dann sind die gespeicherten HMACs mit bekannten Adressen nachrechenbar (Datensparsamkeit verfehlt). `BETTER_AUTH_SECRET` ist im Env-Schema optional.
- Vorschlag: Schlüssel ableiten (`hkdfSync("sha256", secret, "", "ww:email-limit:v1", 32)`) und außerhalb von development/ci ohne Secret hart abbrechen statt Rückfall.
- Umsetzung (Developer, 2026-10-09): Schlüssel per `hkdfSync("sha256", secret, "", "ww:email-limit:v1", 32)` (`src/server/auth/email-limit-key.ts`). Fester Ersatzschlüssel nur bei `APP_ENV` development/ci; sonst Fehler – beim Serverstart (`src/instrumentation.ts`) und spätestens bei der ersten Nutzung. Hinweis: Bestehende Zähler (alte HMACs) verfallen dadurch einmalig (max. 24 h, unkritisch). Tests: `email-limit-key.test.ts`.
- Prüfung (Reviewer): `next start` mit `APP_ENV=production|staging|demo` und leerem `BETTER_AUTH_SECRET` → „An error occurred while loading instrumentation hook: BETTER_AUTH_SECRET is required …“; der Prozess läuft weiter (Next-Verhalten), beantwortet aber **jede** Anfrage mit 500 (auch `/api/health` → Healthcheck schlägt fehl) – fail closed. Ohne `APP_ENV` lehnt Better Auth das Standard-Secret in Produktion selbst ab (500). Demo-Compose verlangt das Secret ohnehin.
- Status: verifiziert

### R-029: axe-Tests messen mitten in Überblendungen (CI rot/flaky, PR #6)
- Schwere: niedrig (Test-Stabilität) · vom Reviewer behoben
- Dateien: `tests/e2e/helpers/axe.ts` (neu), `tests/e2e/increment-1-help.spec.ts`, `tests/e2e/ui-foundation.spec.ts`, `tests/e2e/smoke.spec.ts`
- Problem: CI meldete `color-contrast` 2,04 (`#514c76` auf `#1f1a45`, z. B. `#code > .answer > p`). `#514c76` ist kein Token, sondern die Mischung aus gedämpftem Text (dunkel) und Hintergrund bei Zwischendeckkraft: Überblendungen bleiben auch bei reduzierter Bewegung (M-D2: G-01 `Enter`, G-14 `ww-help-in`, Avatar-Menü). Keine echte Kontrastverletzung – im Ruhezustand erfüllen die Farben AA.
- Umsetzung: gemeinsamer Helfer `expectNoSeriousAxeViolations` wartet vor `analyze()` auf alle endlichen Animationen/Transitions (`document.getAnimations()`, unendliche wie Spinner ausgenommen, bis zu 5 Runden); alle drei Specs nutzen ihn. Regeln unverändert (keine abgeschwächte Prüfung).
- Status: verifiziert (vom Reviewer behoben) – WebKit lokal nicht installiert, dort bitte CI beobachten

### R-030: Argon2id-Test ohne Known-Answer – Node-22-Pfad ungeprüft
- Schwere: niedrig · vom Reviewer behoben
- Datei: `src/server/auth/password-hash.test.ts`
- Problem: Der Test „RFC 9106 style reference output“ prüfte nur die Länge; ohne natives `crypto.argon2` (Node 22) gab es keinen Abgleich.
- Umsetzung: Known-Answer (`password`, Salz 16 × 0x07, m=19456/t=2/p=1/32 Byte) aus Node 24 nativ; unter Node 22 (@noble/hashes) identisch – beide Implementierungen erzeugen dieselben Hashes. Testtitel korrigiert.
- Status: verifiziert (vom Reviewer behoben)

### R-031: Avatar-Menü bleibt offen, wenn der Tastaturfokus es verlässt
- Schwere: niedrig (WCAG 2.4.11 Fokus nicht verdeckt, AA)
- Datei: `src/components/shell/account-menu.tsx:34-56`
- Problem / Reproduktion: `/trips` → Avatar-Taste fokussieren → Enter (Menü offen) → 7 × Tab: Fokus liegt im Footer („Deutsch“), `aria-expanded` bleibt `true`, das Panel schwebt weiter über dem Inhalt und kann fokussierte Elemente darunter verdecken. Geschlossen wird nur per Esc, Zeiger außerhalb oder Auslöser.
- Erwartetes Verhalten: Verlässt der Fokus Auslöser und Panel, schließt das Menü (ohne Fokus zu verschieben). Esc und „Fokus zurück auf Auslöser“ sind bereits korrekt (geprüft).
- Vorschlag: `focusout` auf dem Menü-Container: wenn `relatedTarget` außerhalb von Auslöser/Panel liegt → `setOpen(false)`; E2E ergänzen.
- Umsetzung (Developer, 2026-10-09): `onBlur` (focusout) am Menü-Container – liegt `relatedTarget` außerhalb von Auslöser/Panel, schließt das Menü ohne Fokus zu verschieben (`null` = Fenster-/Tab-Wechsel bleibt unberührt, Klick außerhalb deckt der Pointer-Handler ab). E2E: Menü per Tastatur öffnen, 6 × Tab → `aria-expanded="false"`, Panel verborgen, Fokus bleibt beim Ziel.
- Prüfung (Reviewer, Tastatur): Avatar fokussieren → Enter → Tab durch Meine Reisen, Konto, Deutsch, Hilfe, Abmelden (Menü bleibt offen) → 6. Tab in den Footer: `aria-expanded="false"`, Panel verborgen, Fokus bleibt dort; Shift+Tab aus dem offenen Menü → geschlossen; Esc → zu, Fokus auf Avatar; Leertaste öffnet; Enter auf „Konto“ navigiert. Nebenbefund behoben: E2E „a password sign-in is no confirmation“ öffnete das Menü noch während der Weiterleitung nach `/account` (Kopfzeile wird neu gemountet → Menü zu, Test-Timeout, 1 von 6 Läufen) – Test wartet jetzt auf `/account`.
- Status: verifiziert

#### Hinweise ohne Finding (Inkrement 1)
- 200 % Textgröße: WCAG 1.4.4 (1280/640 px) und 1.4.10 (320 px, 100 %) ohne Überlauf auf `/account`, `/account/email`, `/de/hilfe`, `/login`, `/trips`; auch eine 80-Zeichen-Adresse bricht um. Nur über WCAG hinaus (360 px **und** 200 %) laufen Footer-Segment (+3 px) und auf `/account/email` der fett gesetzte Satz mit der Adresse (+94 px) über – bei Gelegenheit `overflow-wrap: anywhere` am `<strong>`.
- Bewegungs-Schalter (ux-spec §7.5): Gerät reduziert → Schalter „an“, `aria-disabled`, Grund sichtbar, Klick ohne Wirkung; Einschalten wirkt sofort (`data-motion`), Snackbar „Gespeichert“; zweites Gerät bekommt `data-motion="reduce"` schon im Server-HTML, Ausschalten wirkt dort nach Neuladen. Abweichung zur Spec: Speicherung im Cookie `ww-motion` statt `localStorage` – gleichwertig (erster Frame korrekt, auch nach Abmelden), Spec bei Gelegenheit nachziehen. → Spec (ux-spec §7.5) nachgezogen 2026-10-09 (Developer, Freigabe CEO).
- Hilfetext „es gilt immer nur der neueste Code“ geprüft: alter Code nach erneutem Senden → `INVALID_OTP`, neuer Code → angemeldet.
- `remainingAttempts` verrät nur, ob für eine Adresse gerade ein Code aussteht (auch für unbekannte Adressen möglich) – keine Konto-Enumeration.

## Nachprüfung Commit 2e02b3d (Reviewer 2026-10-09)

Node 24.21, Produktions-Build im CI-Modus (`APP_ENV=ci`, Postgres 18, Mailpit), Proben mit `RATE_LIMIT_ENABLED=true` direkt gegen `/api/auth/*` mit wechselnden `X-Forwarded-For`.

### R-032: Konto-Enumeration über „Passwort vergessen“ – `remainingAttempts` und Sperre nur für bestehende Konten
- Schwere: hoch (F-041/H.3: „neutrale Antwort, keine Enumeration“) – bestand schon vor 2e02b3d, durch R-021 (Zählen nur bei ausstehendem Code) um ein zweites Merkmal ergänzt
- Datei: `src/server/auth/email-access-plugin.ts` (`OTP_TYPES` mit `/email-otp/reset-password`, `beforeVerification`, `afterVerification`); Ursache in Better Auth `requestPasswordResetEmailOTP`: für **unbekannte** Adressen wird der Code sofort wieder gelöscht (`deleteVerificationByIdentifier`), für bekannte bleibt er stehen.
- Problem / Reproduktion: `POST /email-otp/request-password-reset {email}` (200 für beide), dann `POST /email-otp/reset-password {email, otp:"000000", password:"Totally new pass 2040"}`:
  - bekanntes Konto → `400 {"code":"INVALID_OTP","remainingAttempts":4}`, nach 10 Versuchen `429 EMAIL_LOCKED`;
  - unbekannte Adresse → `400 {"code":"INVALID_OTP"}` **ohne** `remainingAttempts`, nie 429.
  Zwei Anfragen genügen, um für jede Adresse festzustellen, ob ein Konto existiert (und der echte Inhaber bekommt dabei nur eine Reset-Mail). Die Anzeige im Reset-Formular verrät es ebenso („Noch 4 Versuche“).
- Erwartetes Verhalten: Antworten auf `reset-password` (Status, Body, Restversuche, Sperrverhalten, Zeit) sind für bekannte und unbekannte Adressen gleich.
- Vorschlag: Für unbekannte Adressen denselben Zustand herstellen: After-Hook auf `/email-otp/request-password-reset` – fehlt danach `forget-password-otp-<email>`, einen Platzhalter mit zufälligem (nie versendetem) Code im selben Format anlegen (`storeOTP: "hashed"` → `<hash>:0`, gleiche `expiresAt`). Dann laufen Zählen, `remainingAttempts`, 5er-Grenze und Sperre identisch; `reset-password` scheitert für Unbekannte ohnehin an `INVALID_OTP`. Alternative: für `reset-password` nie `remainingAttempts` liefern **und** Fehlversuche dort immer zählen (wie beim Passwort) – schlechter für echte Nutzer. E2E: bekannte/unbekannte Adresse → identische Antwortfolge über 11 Versuche.
- Umsetzung (Developer, 2026-10-09): After-Hook auf `/email-otp/request-password-reset` (`src/server/auth/email-access-plugin.ts`): fehlt nach erfolgreicher Anfrage der Datensatz `forget-password-otp-<email>` (unbekannte Adresse), wird ein **Platzhalter** angelegt – Format wie ein gehashter Code (`<base64url-SHA-256>:0`, aber Hash aus 32 Zufallsbytes, also nie eingebbar), gleiche Gültigkeit (15 Min.). Bei bestehenden Konten macht der Hook einen gleichartigen Schreibzugriff (Ablaufzeit unverändert gesetzt) – gleiche Antwortzeit. Damit laufen Reservierung/Zählen, `remainingAttempts`, 5er-Grenze (`TOO_MANY_ATTEMPTS`) und Sperre (`EMAIL_LOCKED`) für beide Fälle identisch. Tests: E2E „R-032“ (`tests/e2e/increment-1-security.spec.ts`) vergleicht die komplette Antwortfolge (2 Reset-Anforderungen + 11 falsche Codes: Status und Body, `retryAfter` normalisiert) für bekannte und unbekannte Adresse → identisch (`200, 400×4 (Rest 4…1), 403, 200, 400×4, 429, 429`). Messung (Produktions-Build, je 10, Median bekannt/unbekannt): `request-password-reset` 35,6/34,0 ms, `reset-password` mit falschem Code 44,0/42,8 ms; Body der ersten Fehlantwort byte-gleich (`{"code":"INVALID_OTP","message":"Invalid OTP","remainingAttempts":4}`).
- Nachprüfung (Reviewer 2026-10-09, Commit 9baea12, Node 24.21, Produktions-Build `APP_ENV=ci`, `RATE_LIMIT_ENABLED=true`, direkt gegen `/api/auth/*`):
  - Antwortfolge bekannt/unbekannt identisch: `200, 400 INVALID_OTP/4…/1, 403 TOO_MANY_ATTEMPTS, req 200, 400/4…/1, 429 EMAIL_LOCKED ×2` – auch mit GROSS geschriebener Adresse (Better Auth und Hook normalisieren beide auf Kleinschreibung) und mit führendem Leerzeichen (beide gleich: Rest bleibt 5, Sperre nach 10; keine Mail, kein Unterschied).
  - 7 parallele Reset-Anforderungen: Budget der exakten Adresse greift gleich (bekannt 4 × 200 + 3 × 429, weil die Registrierung 1 Mail verbraucht hat; unbekannt 5 × 200 + 2 × 429); danach gleiche Fehlversuchsfolge. 8 parallele falsche Codes: Restversuche-Verteilung bei beiden gleichartig (Race-Rauschen, kein Merkmal).
  - Antwortzeiten (Median, je 30 bzw. 120, zwei Läufe): `request-password-reset` 32,1/32,8 und 29,1/32,3 ms, falscher Code 36,8/36,1 und 35,0/34,8 ms (bekannt/unbekannt) – kein verwertbarer Unterschied.
  - Platzhalter nie nutzbar: Wert = SHA-256 von 32 Zufallsbytes (`storeOTP: "hashed"` vergleicht Hash des eingegebenen Codes), nie versendet; leerer Code → `INVALID_OTP`. Selbst bei Treffer würde `reset-password` für Unbekannte an `findUserByEmail` scheitern (kein Konto-Anlegen); `sign-in/email-otp` nutzt einen anderen Identifier (`sign-in-otp-…`) → `INVALID_OTP`, Passwort-Anmeldung → 401; `check-verification-otp` u. a. per Allow-List gesperrt (404). Echter Nutzer nach Platzhalter (Leerzeichen-Trick legt Platzhalter unter seinem Identifier an): Reset anfordern → Mail → Code → 200, Anmeldung mit neuem Passwort 200.
  - E2E „R-032“ in `--repeat-each=3` grün.
- Status: verifiziert

### R-033: Postfach-Budget (R-027) sperrt die echte Adresse – Mail-Anmeldung über Plus-Adressen dauerhaft blockierbar
- Schwere: hoch (wie R-021 vor jedem öffentlichen Zugriff zu beheben; Offline-Demo nicht betroffen)
- Datei: `src/lib/email-limits.ts` (`decideCodeRequest`), `src/server/auth/email-limit-store.ts` (`takeCodeRequest`)
- Problem / Reproduktion: Konto `victimb-…@example.org` (passwortlos, Standard). Angreifer: 10 × `POST /email-access/request` für `victimb-…+x1@…` … `+x10@…` (eine IP genügt bei 3/Min.) → Postfach-Budget voll. Danach für das Opfer: `email-access/request` → `429 EMAIL_RATE_LIMITED, retryAfter 3600`, `request-password-reset` → 429. Die 10 Mails landen zwar im Postfach des Opfers, ihre Links/Codes gelten aber für **andere** (neue) Konten `+x1…` – keiner meldet das Opfer an. Wiederholt der Angreifer das stündlich (10 Anfragen/Std.), kann sich das Opfer auf keinem neuen Gerät mehr anmelden; mit 2 Code-Anforderungen + 10 Fehlversuchen (R-021-Sperre) zusätzlich nicht per Passwort. Genau das sollte R-021 ausschließen („ein Dritter kann den Zugang verzögern, nicht verhindern“). Unterschied zum Budget der exakten Adresse (5/Std.): dort bekommt das Opfer die Mails mit gültigem Link für **sein** Konto.
- Erwartetes Verhalten: Anfragen für andere Adressen desselben Postfachs dürfen die Mail-Anmeldung der exakten Adresse nicht vollständig blockieren; Mail-Bombing pro Postfach bleibt begrenzt.
- Vorschlag (mit CEO/UX abwägen): (a) Mindestkontingent pro exakter Adresse, das das Postfach-Budget nicht verbrauchen kann – z. B. die ersten 2 Mails/Std. einer exakten Adresse zählen nur gegen ihr eigenes Budget (Obergrenze pro Postfach dann 10 + 2 × Varianten, praktisch weiter durch IP-Limit begrenzt); oder (b) Postfach-Budget nur für Adressen anwenden, die von ihrem Postfach abweichen (`email !== mailboxOf(email)`) – die Grundadresse ist nie blockierbar, Plus-/Punkt-Konten bleiben dann aber angreifbar. **Nicht** nach Konto-Existenz unterscheiden (Enumeration). E2E: 10 Plus-Adressen → Grundadresse bekommt weiter eine Mail.
- Umsetzung (Developer, 2026-10-09, CEO-Entscheidung): Die **exakte Adresse** (nur Groß/Klein und Leerzeichen normalisiert) hat immer ihr eigenes Budget (5/Std., 20/Tag). Das **Postfach-Budget** (10/Std., 30/Tag) zählt und begrenzt **nur Varianten** (`isMailboxVariant`: Adresse ≠ `mailboxOf(Adresse)`, also `+tag`, Gmail-Punkte, googlemail.com); die kanonische Adresse zählt nicht hinein und wird davon nie begrenzt. Keine Unterscheidung nach Konto-Existenz. Dateien: `src/lib/email-limits.ts` (`decideCodeRequest(…, isVariant, …)`, `isMailboxVariant`, `normalizeEmail`), `src/server/auth/email-limit-store.ts` (`takeCodeRequest`), Doku `docs/ops/tech-stack.md`. Tests: Unit (`email-limits.test.ts`: Varianten 10/30, kanonische Adresse trotz vollem Postfach-Budget erlaubt, nur eigenes 5er-Budget; Varianten-Erkennung); E2E „R-027/R-033“ für bekannte **und** unbekannte Grundadresse: 12 parallele Plus-Varianten → genau 10 × 200, weitere Variante 429 `EMAIL_RATE_LIMITED`, die Grundadresse bekommt danach weiter Code-Mail (200 + Mail) und Reset (200); Grundadresse allein: 7 parallele → 5 × 200, eine Variante danach weiter 200. **Restrisiko (bewusst, CEO-Abwägung):** Steht im Konto selbst eine Variante (z. B. `max.mustermann@gmail.com` oder `anna+reisen@…`), unterliegt diese Adresse dem Postfach-Budget und kann über andere Varianten blockiert werden; ohne Konto-Abfrage (Enumeration) lässt sich das nicht unterscheiden. Mail-Obergrenze pro Postfach: 5 (kanonisch) + 10 (Varianten) pro Stunde.
- Nachprüfung (Reviewer 2026-10-09, Commit 9baea12, wie R-032): je 12 parallele Varianten-Anfragen an `/email-access/request`, danach die Grundadresse:
  - `anna…+xN@example.org` gemischt mit `Anna…+xN@Example.ORG` (Konto vorhanden): 10 × 200, 2 × 429; Grundadresse 200 + Mail (Code + Link), Reset 200; `ANNA…@EXAMPLE.ORG` 200 (gleiche exakte Adresse); `a.nna…@example.org` 200 und `a.nna…+q@example.org` 200 (Punkte außerhalb Gmail = eigenes Postfach, korrekt); weitere Plus-Variante 429.
  - Gmail (ohne Konto): Varianten über Punkte, `googlemail.com` (auch GROSS), `+tag` gemischt → 10 × 200, 2 × 429; `bert…@gmail.com` 200 + Mail, Reset 200; `BERT…@Gmail.com` 200; `b.ert…@gmail.com` 429 (Variante, erwartet).
  - Sonderfälle: `carl+@…` (leerer Tag) zählt als Variante; `+carl@…` (Plus an Position 0) ist eigene Adresse (200). Adresse mit Leerzeichen am Rand → 400 `VALIDATION_ERROR` (z.email).
  - Unit-Tests (153) und E2E „R-027/R-033“ (`--repeat-each=3`) grün. Restrisiko → R-035.
- Status: verifiziert

### R-034: Text-Button «Mit Passwort/Code bestätigen» mit nativem Button-Look
- Schwere: niedrig · vom Reviewer behoben
- Datei: `src/features/account/components/account.module.css` (`.textLink`), genutzt als `<button>` in `reauth-step.tsx` (und vorher in `email-change-flow.tsx`)
- Problem / Reproduktion: Konto mit Passwort, Bestätigung abgelaufen → `/account/password` (bzw. `/account/email`): der Umschalter erschien als volle Breite, grauer UA-Button mit Rahmen (`background: ButtonFace`); im Dark Mode Minze auf `#6b6b6b` → axe `color-contrast` serious (3,4:1, Text 14 px fett). Kein bestehender axe-Test erreichte den Zustand „Passwort gesetzt + Re-Auth“.
- Umsetzung: `button.textLink` ohne Hintergrund/Rahmen/Innenabstand, `cursor: pointer`, `align-self: flex-start`. axe (hell/dunkel) im Re-Auth-Schritt in allen Zuständen (initial, Code gesendet, falscher Code, Passwort, falsches Passwort, Ablauf-Hinweis) ohne Verstöße; E2E „a password sign-in is no confirmation“ prüft jetzt axe im Dark Mode.
- Status: verifiziert (vom Reviewer behoben)

#### Hinweise ohne Finding (Nachprüfung)
- Fokusführung `reauth-step.tsx` / `password-settings.tsx` geprüft: „Code senden“ → Code-Feld; falscher Code → Code-Feld (markiert); falsches Passwort → Passwortfeld; Bestätigung → Feld „Neues Passwort“; Ablauf bei offenem Formular oder Entfernen-Dialog → Container des Bestätigungsschritts (`tabIndex=-1`, Fokus bleibt dort, auch nach der Austritts-Animation des Bottom-Sheets). Beim Wechsel „Mit Passwort bestätigen“ bleibt der Fokus auf dem Umschalter (Text wechselt) – nicht verloren; schöner wäre Fokus aufs Passwortfeld (bei Gelegenheit, auch in `email-change-flow.tsx`).
- Konto-Existenz über Antwortzeit (je 10 Messungen, Median bekannt/unbekannt): `email-access/request` 34,0/34,9 ms, `request-password-reset` 31,7/34,6 ms, falsches Passwort 85,3/83,7 ms, gesperrt 17,7/17,3 ms – kein verwertbarer Unterschied. Texte `lockedUseLink`/`lockedPassword` werden rein clientseitig aus `EMAIL_LOCKED` abgeleitet; Sperre per Passwort für alle Adressen gleich, per Code nur bei ausstehendem Code (jede Adresse kann einen bekommen) – keine Enumeration, **außer** beim Reset (R-032).

### R-035: Restrisiko R-033 – Konto-Adresse ist selbst eine Variante
- Schwere: mittel (nur bei öffentlichem Zugriff relevant) · Dateien: `src/lib/email-limits.ts`, `src/server/auth/email-limit-store.ts`
- Problem: Steht im Konto eine Variante (z. B. `max.mustermann@gmail.com`, `anna+reisen@…`), gilt für sie das Postfach-Budget; Dritte können sie über weitere Varianten bis zu 1 h blockieren (Magic-Link-Mail/Reset betroffen).
- CEO-Entscheidung (2026-10-09): für die Offline-Demo akzeptiert; **vor Go-Live beheben** (Go-Live-Checkliste).
- Lösungsskizze: Konto-Lookup serverseitig immer durchführen (gleiche Laufzeit), Konto-Adresse vom Postfach-Budget ausnehmen; Überschreitung des Postfach-Budgets **still** behandeln (gleiche 200-Antwort, nur keine Mail), damit kein 429-Unterschied Konten verrät.
- Reviewer-Einschätzung zur Lösungsskizze (2026-10-09): plausibel. Beim Umsetzen beachten: (1) „still“ heißt auch gleiche Antwortzeit – Mailversand in beiden Fällen gleich (z. B. im Hintergrund) oder fehlende Mail durch gleich lange Arbeit ausgleichen, sonst wird aus dem 429-Unterschied ein Zeit-Unterschied; (2) gilt für alle Mail-Endpunkte (`email-access/request`, `request-password-reset`, `request-email-change` mit `newEmail`); (3) Nutzer ohne Konto auf einer Varianten-Adresse bekommen bei Überschreitung kommentarlos keine Mail – Hilfetext „Keine Mail bekommen?“ (F-051) reicht vermutlich; (4) E2E: Konto auf `max.mustermann@gmail.com` + 10 andere Varianten → Konto-Adresse bekommt weiter Mail, Antworten für Konto/Nicht-Konto gleich.
- Status: offen (vor Go-Live)

#### Nachprüfung Commit 9baea12 – vom Reviewer behoben (2026-10-09)
- `tests/e2e/increment-1-security.spec.ts`, `tests/e2e/increment-1-auth.spec.ts`: `Origin`-Header war fest `http://localhost:3000`; mit anderem `PORT`/`E2E_BASE_URL` scheiterten alle API-Proben mit 403 (Origin-Prüfung). Jetzt wie `baseURL` in `playwright.config.ts` abgeleitet. Beide Specs auf Port 3200 grün (50/50).

## Review Inkrement 2 (Reviewer 2026-10-09, Commit fcef4f9)

Geprüft: F-001, F-002, F-003, F-004, F-044 gegen Flows A/E/G/J, Sitemap §4, W03 B–W07, W12, Design-System v1.0, Motion-Katalog. Checks unter Node 24.21: format, lint, typecheck, i18n, Unit (193 nach Reviewer-Tests), Build, Migration 0002 frisch + auf Inkrement-1-DB mit Altdaten, Seed (2×, idempotent), `drizzle-kit generate` ohne Drift, E2E im CI-Modus (Chromium desktop + mobile; WebKit hier nicht installierbar).

Zusätzliche Reviewer-Proben (temporäres Spec, nicht eingecheckt):
- **Replay aller Orga-Server-Actions** (Link erneuern, Mitglied entfernen, Orga übergeben, Reise löschen, Reise bearbeiten) – Requests der Orga abgefangen (abgebrochen, nie ausgeführt) und mit der Session eines Mitglieds **und** eines Nicht-Mitglieds wiederholt: jeweils `{"error":"notAllowed"}`, Reisezeile unverändert.
- Nicht-Mitglied auf `/trips/<id>`, `/trips/<id>/settings` und unbekannter ID: HTTP **404**, identische Seite; abgemeldet 307 → `/login?next=…` für existierende wie unbekannte IDs.
- Einladungsvorschau-HTML (inkl. RSC-Payload): keine weiteren Mitgliedernamen, keine E-Mails, keine `publicId`; OG nur `og:title` «Reise · Produktname» (Sprache der Anlage), `og:site_name`, kein `og:description`; `Referrer-Policy: same-origin`, `X-Robots-Tag: noindex`, `Cache-Control: private, no-store`. Fund: interne Trip-UUID als React-Key → R-042.
- axe hell/dunkel (Chromium desktop + mobile) zusätzlich für: Übersicht mit Mitgliedern (Orga- und Mitgliedssicht), Mitglieder-Sheet, Dialog „Orga übergeben“, Dialog „Reise löschen“, Einladen-Seite (Orga + Mitglied), Formular mit Fehlern – keine serious/critical. Fokus springt beim Schrittwechsel im Sheet auf die neue Überschrift; Escape gibt den Fokus an „⋯“ zurück.

### R-036: Einladungs-Fehlversuchs-Limit sperrt geteilte IPs – auch für gültige Links
- Schwere: mittel
- Datei: `src/app/(app)/i/[token]/page.tsx:35` (`lookup`), `src/lib/invite-limits.ts:24` (`INVITE_MISS_LIMIT`), `src/server/rate-limit.ts:31` (`requestIp`)
- Problem / Reproduktion: 20 Aufrufe von `/i/<beliebige 43 Zeichen>` aus einer IP in 15 Min. → **jeder** gültige Einladungslink zeigt von dieser IP 15 Min. lang „Kurz durchatmen“ (so auch im E2E „after 20 unknown tokens the IP pauses – even for a valid link“ festgeschrieben). Hinter Mobilfunk-CGNAT, Firmen-/Uni-WLAN oder Hotel-NAT teilen sich viele Personen eine IP: ein Einzelner (oder ein Link-Vorschau-Crawler, der alte/erneuerte Links abruft) sperrt den Beitritt für alle anderen – genau im Kernflow (Beitrittsquote ≥ 65 %). Bei IPv6 umgekehrt: ein Angreifer wechselt innerhalb seines /64 beliebig die Adresse. Zusätzlich: kann die IP in Produktion nicht ermittelt werden (Proxy-Fehlkonfiguration), landen **alle** Aufrufe im gemeinsamen Bucket `"unknown"` – 20 Fehlversuche sperren dann die Einladungsseite für alle Nutzer (die Auth-Route antwortet in diesem Fall dagegen mit 400 + Warnung).
- Erwartetes Verhalten: Scanning wird gebremst, ohne legitime Einladungen von Nachbarn derselben IP zu blockieren. Bei 256-Bit-Tokens ist Raten aussichtslos; das Limit dient nur der DB-Ruhe/Erkennung.
- Vorschlag: (a) gültige Tokens nie sperren – bei überschrittenem Limit nur unbekannte Tokens ohne DB-Abfrage ablehnen geht nicht (man weiß es erst nach der Abfrage), daher stattdessen gültige Treffer immer ausliefern und nur die Fehlermeldung für Fehlversuche drosseln (gleiche „ungültig“-Seite, ggf. künstliche Verzögerung); oder (b) Limit deutlich anheben (z. B. 200/15 Min.) und IPv6 auf /64 aggregieren; (c) `"unknown"` nicht als gemeinsamen Bucket verwenden (wie Auth: Warnung loggen, Limit für diese Anfrage aussetzen oder fail-closed nur in `APP_ENV=production` mit klarer Ops-Meldung). E2E entsprechend anpassen. Entscheidung (a)/(b) ggf. mit CEO.
- CEO-Entscheidung: (a) – gültige Tokens werden nie gesperrt.
- Umsetzung (Developer 2026-10-09): `lookup` in `src/app/(app)/i/[token]/page.tsx` fragt zuerst den Token ab – ein gültiger Link wird **immer** ausgeliefert. Das Fehlversuchs-Limit (`INVITE_MISS_LIMIT`, 20/15 Min.) greift nur noch bei unbekannten Tokens und schützt die DB: über dem Limit werden keine weiteren Fehlversuche geschrieben, nur eine Log-Zeile (ohne IP/Token); angezeigt wird dieselbe „Link ungültig“-Seite (A.3), die eigene „Kurz durchatmen“-Seite für Einladungen entfällt (Texte `invite.rateLimited*` entfernt). IPv6 wird für alle App-Limits auf /64 zusammengefasst (`rateLimitSubject` in `src/server/auth/client-ip.ts`, genutzt von `requestLimitSubject` in `src/server/rate-limit.ts`; Better Auth: `ipv6Subnet: 64` explizit). Kein Sammeltopf `"unknown"` mehr: ohne ermittelbare IP (nur außerhalb development/ci möglich) werden Fehlversuche nicht gezählt, ein Beitritt wird abgelehnt (`generic`, analog 400 der Auth-Route, R-005) – jeweils mit Warnung im Log. Beitrittslimit pro Reise/Std./IP (bzw. /64) unverändert. Tests: Unit `client-ip.test.ts` (/64-Bildung); E2E `increment-2-invite.spec.ts` „a shared IP with 20+ unknown tokens still opens a valid link“ (22 Fehlversuche, genau 20 gezählt, gültiger Link öffnet), „IPv6: misses count per /64 …“, „join limit for IPv6 counts the whole /64 network“.
- Nachprüfung (Reviewer 2026-10-09, Commit db032fe, Node 24.21, Produktions-Build `APP_ENV=ci`): Gültiger Token wird vor jeder Limit-Prüfung abgefragt und immer ausgeliefert (E2E: 22 Fehlversuche, 20 gezählt, gültiger Link öffnet; IPv6-/64-Variante grün). Ohne ermittelbare IP: Fehlversuche ungezählt, Beitritt `generic` + Warnung – kein Sammeltopf mehr; in development/ci nicht erreichbar (Loopback). /64-Bildung geprüft für „::“, „::1“, „2001:db8::“, „1:2:3:4:5:6:7::“, eingebettete IPv4 („2001:db8:1:2:3:4:192.0.2.33“, „64:ff9b::1.2.3.4“), Zonen-ID, Klammer/Port, „::ffff:1.2.3.4“ → IPv4.
- Vom Reviewer behoben: IPv4-mapped in Hex-Schreibweise („::ffff:cb00:7107“) landete im gemeinsamen Bucket „0:0:0:0::/64“ – alle so gelieferten IPv4-Clients hätten sich ein Limit geteilt. `rateLimitSubject` wandelt sie jetzt in die IPv4 um; Unit-Tests ergänzt (`client-ip.test.ts`, auch „::“ und eingebettete IPv4).
- Einschätzung DB-Last: Über dem Limit bleibt pro Fehlversuch der Token-Lookup (Index auf `invite_token`) plus `checkLimit` (Index-Read) – zwei Lesezugriffe, aber keine Schreibzugriffe mehr. Bei 256-Bit-Tokens und indexierten Reads vertretbar; ein echter Schutz gegen Last-Fluten gehört an den Proxy (Caddy-Rate-Limit für `/i/*`, vor Go-Live mit Operations). Kleinigkeit: über dem Limit schreibt **jeder** weitere Fehlversuch eine Warnzeile (nicht „eine“ wie dokumentiert) – Log-Flut bei Scans möglich; ggf. später drosseln.
- Einschätzung „Link ungültig“ statt Rate-Limit-Hinweis: vertretbar – der Inhalt ist wahr (der Token ist ungültig), legitime Nutzer mit gültigem Link sind nie betroffen, und Scanner erhalten kein Signal, dass sie erkannt wurden.
- Status: verifiziert

### R-037: Einladungs-Token in Zugriffslogs (Pfad, nicht Query) und im Klartext in der DB – Ops-Doku passt nicht
- Schwere: mittel (vor Go-Live; Offline-Demo unkritisch)
- Datei: `docs/ops/deployment.md:215`, `docs/ops/compliance-checklist.md:141,163`, `next.config.ts:36`, `src/server/db/schema.ts` (`trip.invite_token`)
- Problem / Reproduktion: deployment.md fordert „Zugriffslogs ohne Query-Strings (Tokens!)“ – der Einladungs-Token steht aber im **Pfad** (`/i/<token>`) und würde in Caddy-Zugriffslogs (7 Tage) landen. Die Ausnahme in `next.config.ts` (`logging.incomingRequests.ignore`) wirkt nur für `next dev`. Wer Logs liest, kann jeder Reise beitreten. Außerdem steht in der Compliance-Checkliste „Codes/Tokens gehasht“ – Einladungs-Tokens liegen (bewusst) im Klartext in `trip.invite_token`.
- Einschätzung Klartext: vertretbar – der Link muss allen Mitgliedern jederzeit wieder angezeigt werden (F-002/Q13 b), Hashing scheidet damit aus; Schaden bei DB-Leck = Beitritt zu Reisen (Orga kann Link erneuern); Backups sind `age`-verschlüsselt. Muss aber dokumentiert sein.
- Erwartetes Verhalten: Keine Einladungs-Tokens in Zugriffs-/Fehler-Logs (Caddy, Bugsink); dokumentierte Ausnahme „Einladungs-Token im Klartext“.
- Vorschlag (Operations): Caddy-Log-Filter für `/i/*` (Pfad maskieren, z. B. `format filter` → `request>uri` ersetzen durch `/i/[redacted]`) bzw. `/i/*` und `/auth/magic*` gar nicht loggen; Bugsink-`beforeSend` URL-Scrubbing für `/i/`; Compliance-Checkliste: Ausnahme Einladungs-Token (Klartext, Begründung, Schutz: Erneuern, verschlüsselte Backups). Optional später: Token at-rest mit App-Schlüssel verschlüsseln.
- Status: offen (vor Go-Live)

### R-038: Stepper verliert den Tastaturfokus an der Grenze
- Schwere: mittel · vom Reviewer behoben
- Datei: `src/components/ui/stepper.tsx:72-119`, `stepper.module.css`
- Problem / Reproduktion: W05, „mindestens“ = 29, Tab auf „+“ (Eine Nacht mehr), Enter → Wert 30, der Button wird `disabled` → Fokus fällt auf `<body>` (gemessen: `document.activeElement` = BODY). Tastatur-/Screenreader-Nutzer verlieren die Position (WCAG 2.4.3); gleiches bei „−“ am Minimum und beim optionalen „am liebsten“ (−-Taste leert den Wert und wird disabled).
- Umsetzung: `aria-disabled` statt `disabled`, Klick wird an der Grenze ignoriert, Stil über `[aria-disabled="true"]`. E2E `increment-2-trips.spec.ts` „stepper: the button at the limit keeps keyboard focus (R-038)“. axe (Formular hell/dunkel) weiter ohne Verstoß.
- Hinweis (offen, niedrig): Beim Drücken von „+/−“ liest der Screenreader den neuen Wert nicht vor (Fokus bleibt auf dem Button, das Zahlenfeld ändert sich still). Vorschlag: kurzer `aria-live="polite"`-Text „5 Nächte“ oder `aria-describedby` am Button – mit UI/UX abstimmen.
- Umsetzung Hinweis (Developer 2026-10-09): unsichtbare Live-Region (`aria-live="polite"`, `aria-atomic`) im Stepper liest nach „+/−“ den neuen Wert mit Einheit („5 Nächte“), beim Leeren des optionalen „am liebsten“ „Am liebsten: nicht festgelegt“ (`tripForm.preferredCleared`). Tippen im Zahlenfeld löst keine Ansage aus (wird nativ vorgelesen). Unit `src/lib/stepper-announcement.test.ts`, E2E `increment-2-trips.spec.ts` „stepper: «−»/«+» announce the new value politely“; axe (Formular hell/dunkel) weiter ohne Verstoß. Hinweis-Status: behoben – bitte prüfen.
- Nachprüfung Hinweis (Reviewer 2026-10-09): Live-Region existiert ab dem ersten Render (leer) und ist pro Stepper eigen; Ansage nur nach „+/−“, Tippen setzt sie zurück. Keine Doppelansagen: an der Grenze (`aria-disabled`) wird `step` nicht aufgerufen, der Text ändert sich nicht; die Stepper klemmen sich nicht gegenseitig (kein Fremd-Update eines bereits angesagten Steppers); `aria-atomic` liest „5 nights“ als Ganzes. Hinweis verifiziert.
- Status: verifiziert (vom Reviewer behoben)

### R-039: Namens-Eindeutigkeit und Reise-Anlage nicht atomar
- Schwere: niedrig
- Datei: `src/server/trips.ts:226` (`renameMember`), `src/server/trips.ts:126` (`createTrip`)
- Problem / Reproduktion: `renameMember` prüft „Name frei?“ und schreibt danach ohne Sperre/Transaktion. Zwei gleichzeitige Umbenennungen (oder Umbenennung + Beitritt, der die Reisezeile sperrt – `renameMember` tut das nicht) auf „Kemal“ → beide erfolgreich, doppelter Name in der Reise (F-003 verlangt Eindeutigkeit). `createTrip` legt Reise und Orga-Mitgliedschaft in zwei Statements an (Kompensation per DELETE); bricht der Prozess dazwischen ab, bleibt eine Reise ohne Mitglied/Orga zurück (für niemanden sichtbar, aber Datenleiche).
- Erwartetes Verhalten: Namen pro Reise garantiert eindeutig; Reise nie ohne Orga.
- Vorschlag: `renameMember` in eine Transaktion mit `SELECT … FOR UPDATE` auf die Reisezeile (wie `joinByToken`) oder eindeutiger Index `(trip_id, lower(display_name))` + Fehlerbehandlung; `createTrip` in `db().transaction(…)`.
- Umsetzung (Developer 2026-10-09): Migration `drizzle/0003_trip_member_name_unique.sql` – eindeutiger Index `trip_member_trip_name_idx` auf `(trip_id, lower(display_name))`; vorhandene Dubletten werden vorher umbenannt (Orga bzw. früheste Mitgliedschaft behält den Namen, sonst erster freier „Name 2/3/…“, max. 40 Zeichen; auf Bestands-DB mit „Kemal/KEMAL/Kemal 2“ geprüft → „KEMAL 3“). `renameMember` läuft in einer Transaktion mit `FOR UPDATE` auf der Reisezeile (serialisiert mit `joinByToken`); trifft trotzdem der Index (z. B. abweichende Groß-/Kleinschreibung JS vs. PostgreSQL), gibt es „Name schon vergeben“ + Vorschlag statt Fehler – ebenso beim Beitritt. `createTrip` legt Reise und Orga-Mitgliedschaft in einer Transaktion an (ID-Kollisions-Retry per Savepoint). Tests (E2E, `increment-2-manage.spec.ts`): parallele Umbenennung zweier Mitglieder auf „Kemal“/„kemal“ über die UI → genau ein Treffer, genau eine Erfolgsmeldung; zwei parallele DB-Transaktionen ohne App-Prüfung → eine erfolgreich, eine `23505`.
- Nachprüfung (Reviewer 2026-10-09, Commit db032fe, Node 24.21, Postgres 18): Migration 0003 auf Bestands-DB mit Dubletten geprüft (eigene Test-DB, 0000–0002 + Altdaten): „Kemal 2/Kemal/KEMAL/kemal (Orga, spätester Beitritt)“ → Orga behält „kemal“, „Kemal 3“, „KEMAL 4“; 11 × 40-Zeichen-Namen „a…/A…“ → „… 2“ bis „… 11“, alle genau 40 Zeichen; „Anna/anna/Anna 2/anna 2“ → „anna 3“, „anna 2 2“; 40 Emojis → 38 + „ 2“; „Ärger/ärger“ → „ärger 2“; gleicher Name in anderer Reise unberührt; Index danach angelegt. Dev-DB mit Altdaten per `pnpm db:migrate` ohne Fehler, `drizzle-kit generate` ohne Drift. `renameMember`: `FOR UPDATE` auf der Reisezeile serialisiert mit `joinByToken`; Index-Verletzung wird über `cause`-Kette (node-postgres `code`/`constraint`) erkannt → „vergeben“ + Vorschlag. `createTrip`: eine Transaktion, ID-Retry per Savepoint (`tx.transaction`) – Kollision bricht die äußere Transaktion nicht ab. E2E (parallele Umbenennung, 23505) grün.
- Vom Reviewer ergänzt: Fallback beim Beitritt (Index schlägt trotz App-Prüfung an) schlug bisher `suggestName(clean, [clean])` vor – ohne die übrigen Namen der Reise, also ggf. „Kemal 2“, obwohl „Kemal 2“ schon Mitglied ist. Jetzt werden die Namen der Reise nachgeladen (`joinByToken`, `src/server/trips.ts`).
- Status: verifiziert

### R-040: Abgelaufene Frist blockiert das Speichern von „Reise bearbeiten“
- Schwere: mittel · vom Reviewer behoben
- Datei: `src/lib/trip-input.ts` (`validateTrip`), `src/features/trips/actions.ts` (`updateTripAction`), `trip-form.tsx`, `settings/page.tsx`
- Problem / Reproduktion: Reise mit Frist 23.10., heute 24.10. → Orga öffnet W12, ändert nur die Beschreibung → „Frist liegt in der Vergangenheit“ am Feld Frist, Speichern unmöglich, bis die Frist gelöscht/verschoben wird. Für den Startdatum-Fall gab es die Ausnahme `originalStart` bereits, für die Frist nicht.
- Umsetzung: `originalDeadline` analog zu `originalStart` (Client und Server): eine **unveränderte** abgelaufene Frist bleibt erlaubt, ein neues Datum in der Vergangenheit wird weiter abgelehnt. Unit-Test in `trip-input.test.ts`.
- Status: verifiziert (vom Reviewer behoben)

### R-041: Reise-Entwurf bleibt nach Ablauf dauerhaft im localStorage
- Schwere: niedrig (Datenschutz, geteilte Geräte) · vom Reviewer behoben
- Datei: `src/lib/trip-draft-storage.ts` (`loadTripDraft`)
- Problem / Reproduktion: Flow G – Formular ausfüllen (auch angemeldet wird jede Änderung gespeichert), Seite verlassen. Nach 30 Min. wird der Entwurf zwar ignoriert, aber nie gelöscht: Reisename und Beschreibung liegen unbegrenzt in `localStorage` (`ww.tripDraft`). `pendingAuth` räumt abgelaufene Einträge dagegen auf.
- Umsetzung: abgelaufene und kaputte Einträge werden beim Laden entfernt (gleiches Muster wie `loadPendingAuth`); Unit-Test ergänzt. Manipulation: Einträge werden weiterhin feldweise geprüft (`parseStoredDraft`, max. 1000 Zeichen) und landen nur als Formularwerte, die Client und Server erneut validieren – kein Risiko gefunden.
- Status: verifiziert (vom Reviewer behoben)

### R-042: Interne Reise-UUID im HTML der öffentlichen Einladungsvorschau
- Schwere: niedrig · vom Reviewer behoben
- Datei: `src/features/invite/trip-card.tsx` (Avatar-Punkte), `src/app/(app)/i/[token]/page.tsx`
- Problem / Reproduktion: `curl /i/<token>` → die RSC-Payload enthält `"<trip.id>:0"` … als React-Keys der anonymen Avatar-Punkte. Die interne UUIDv7 verrät den Anlagezeitpunkt (ms) und ist eine weitere Kennung, die die Vorschau (F-003: nur Name, Zeitraum, Dauer, Beschreibung, Orga-Vorname, Anzahl) nicht braucht.
- Umsetzung: neutrale Keys `dot:<n>`, Prop `tripId` entfernt. Nachgeprüft: UUID nicht mehr im HTML.
- Status: verifiziert (vom Reviewer behoben)

### R-043: Aufräumen von `rate_limit_event` nur bei Fehlversuchen
- Schwere: niedrig · vom Reviewer behoben
- Datei: `src/server/rate-limit.ts`
- Problem: Alte Einträge wurden nur in `recordEvent` (Fehlversuche) mit 5 % Wahrscheinlichkeit gelöscht; `takeLimit` (Beitritte) räumte nie auf. Ohne Fehlversuche wachsen pseudonyme IP-Schlüssel (HMAC) unbegrenzt – Widerspruch zu „IP-Adressen max. 7 Tage“ (deployment.md).
- Umsetzung: gemeinsame `housekeeping()` nach `recordEvent` **und** `takeLimit`. Langfristig besser im täglichen Lösch-Job (F-013/F-043, Operations).
- Status: verifiziert (vom Reviewer behoben)

### R-044: axe-Test Inkrement 2 läuft an der 30-s-Grenze (flaky)
- Schwere: niedrig · vom Reviewer behoben
- Datei: `tests/e2e/increment-2-ui.spec.ts:128`
- Problem / Reproduktion: Zweiter voller E2E-Lauf (CI-Modus, 2 Worker): „axe – light › increment 2 pages …“ auf desktop-chromium nach 32,3 s mit „Test timeout of 30000ms exceeded“, im Retry grün. Der Test meldet sich an, legt eine Reise an und prüft neun Seiten mit axe – im ersten Lauf knapp darunter.
- Umsetzung: `test.slow()` (Timeout ×3). Inhaltlich unverändert.
- Status: verifiziert (vom Reviewer behoben)

#### Hinweise ohne Finding (Inkrement 2)
- **Reise-ID** (`publicId`): 10 Zeichen aus 32 → 50 Bit, kryptografischer Zufall (`randomInt`). Kein Geheimnis; jeder Zugriff läuft über `findMembership` (JOIN auf eigene Mitgliedschaft), Nicht-Mitglied = unbekannte ID (404). Erratbarkeit damit irrelevant. Kollisionen: Retry ×5 vorhanden.
- **Einladungs-Token** 256 Bit (`randomBytes(32)`), Formprüfung vor DB-Zugriff, Erneuern ersetzt ihn sofort; gesperrt/voll werden in `joinByToken` unter `FOR UPDATE` auf der Reisezeile geprüft (30er-Grenze und Namensprüfung beim Beitritt damit wettlauffest). Orga-Übergabe: Transaktion, erst degradieren, dann befördern; Partial Unique Index `trip_member_one_organizer_idx` sichert „genau eine Orga“. Löschen per `ON DELETE CASCADE` (Mitgliedschaften; Migration geprüft).
- **IP-Ermittlung** der App-Limits nutzt `withTrustedClientIp` – dieselbe Auflösung wie R-005 (rechts nach links, vertrauenswürdige Proxys übersprungen, Client-Header `x-ww-client-ip` wird verworfen). `takeLimit` atomar (Advisory-Lock + Transaktion); `checkLimit`/`recordEvent` (Fehlversuche) bewusst nicht atomar – bei Parallelanfragen kann die 20er-Grenze leicht überschritten werden, bei 256-Bit-Tokens unkritisch.
- **Namen ausprobieren:** Wer den Link hat, kann vor dem Beitritt Namen testen („Name vergeben → Vorschlag“) und so erfahren, ob z. B. „Kemal“ Mitglied ist (max. 20 Versuche/Std./IP, nur bei offenem Beitritt). Vertretbar, da derselbe Personenkreis durch Beitreten ohnehin alle Namen sieht.
- **Link-Vorschau/Messenger:** Server-seitige Vorschau-Crawler (Telegram, Slack, Facebook Messenger, iMessage-Fallback; WhatsApp/Signal erzeugen Vorschauen meist auf dem Gerät) laden die **ganze** Seite, also auch Zeitraum, Dauer, Beschreibung, Orga-Vorname und Anzahl – angezeigt wird nur `og:title`. Das ist dieselbe Information, die jeder Link-Besitzer sieht; vertretbar. Optional später: für bekannte Crawler-User-Agents nur Meta-Daten ausliefern.
- **Konto löschen (F-043, später):** `trip_member.user_id` kaskadiert – löscht eine Orga ihr Konto, bliebe eine Reise ohne Orga. Bei F-043 Übergabe/Löschung erzwingen.
- **Flow G / Magic-Link in anderem Browser:** Der Entwurf liegt nur im Ursprungsbrowser; wer den Magic-Link woanders öffnet, landet angemeldet auf einem leeren Formular. Bekannte Grenze der lokalen Speicherung; ggf. Hilfetext.
- **Tippflächen:** gemessen (Pixel 7): alle Bedienelemente ≥ 44 px bis auf den Skip-Link (39 px Höhe, nur bei Fokus sichtbar, Altbestand) und den Direktlink „Email“ (40 px breit) → vom Reviewer `min-width: 44px` ergänzt (`share-panel.module.css`). Schalter „Neue Mitglieder können beitreten“: ganze Zeile tippbar.
- **Screenshots** (`scratchpad/inkrement-2/`, hell/dunkel) grob gegen design-system §9 und W04–W07/W12 abgeglichen: Cockpit (Indigo-Kopf, Pillen-Tabs, KPI-Ring), Reisekarte mit Abendsonne, Minz-CTA, Chips mit Text + Symbol, Statuszeilen „✓ abgegeben / ◷ noch offen“ – stimmig. Datumsfelder zeigen in den Screenshots `mm/dd/yyyy` (Browser-Locale en-US von Playwright, nicht die App) – bei echten DE-Browsern `TT.MM.JJJJ`.
- **Teilen-Texte:** Wortlaut DE/EN entspricht ux-spec §10.3 (Produktname der Textsprache, mit/ohne Frist, Datumsformat der Textsprache über `shareTextIntl`), Glossar „Orga“/„Organizer“ eingehalten. Kleinigkeit: der Betreff des E-Mail-Direktlinks („Einladung: …“) folgt der Oberflächensprache, nicht der gewählten Textsprache. Kopieren ohne HTTPS: Clipboard-API nur im Secure Context → `execCommand` → Text markieren + Hinweis (E2E abgedeckt); Web Share nur nach Fähigkeitsprüfung, Abbruch ohne Folgeaktion.

## Review Inkrement 3 (Reviewer 2026-10-09, Commit 2c9f373)

Geprüft: F-005, F-007, F-016 und Motion „Tage malen“ (W08-01 ff.) gegen W08, Flow A.3/B/J, ux-spec §7.3, Motion-Katalog. Checks unter Node 24.21: format, lint, typecheck, i18n, Unit (229), Build, Migration 0004, E2E im CI-Modus (Chromium desktop + mobile; WebKit hier nicht installierbar).

| ID | Schwere | Kurztitel | Status |
|---|---|---|---|
| R-045 | hoch | Jedes Speichern löscht die Markierung von gestern | verifiziert (vom Reviewer behoben) |
| R-046 | mittel | Skip-Links auf „Meine Tage“ dauerhaft sichtbar (verdecken den Willkommens-Hinweis) | verifiziert (vom Reviewer behoben) |
| R-047 | niedrig | Termin inzwischen festgelegt → irreführender Hinweis „Zeitraum geändert“ | verifiziert (vom Reviewer behoben) |
| R-048 | mittel | Jeder Besuch von „Meine Tage“ speichert und setzt „zuletzt geändert“ | verifiziert (vom Reviewer behoben) |
| R-049 | niedrig | 360 × 640: beim ersten Besuch kein Kalendertag ohne Scrollen sichtbar | verifiziert |

### R-045: Jedes Speichern löscht die Markierung von gestern
- Schwere: hoch · vom Reviewer behoben
- Datei: `src/features/days/components/days-editor.tsx` (`snapshot`), `src/features/days/actions.ts` (`serverToday`)
- Problem / Reproduktion: Der Server ersetzt beim Speichern alle Tage ab **seinem „heute − 1“** (Zeitzonen-Puffer), der Client schickte aber nur Tage ab **„heute“** (`isEditable`). Reise 5 Tage in der Vergangenheit begonnen, gespeichert `{vorgestern: no, gestern: no}` → einen beliebigen Tag antippen → DB danach `{vorgestern: no, heute: no}` – **gestern ist weg**. Passiert bei jedem Autosave, für alle Mitglieder, täglich; verfälscht später Heatmap/Vorschläge für laufende Zeiträume.
- Umsetzung: Snapshot enthält alle eigenen Markierungen **im Suchzeitraum** (vergangene unverändert); der Server schreibt weiterhin nur sein Fenster. Regressionstest `increment-3-days.spec.ts` „R-045 …“.
- Status: verifiziert (vom Reviewer behoben)

### R-046: Skip-Links auf „Meine Tage“ dauerhaft sichtbar
- Schwere: mittel · vom Reviewer behoben
- Datei: `src/features/days/components/days.module.css` (`.skipLink`)
- Problem / Reproduktion: Die Links „Zum Kalender / Zu den Werkzeugen“ wurden nur um 128 px nach oben verschoben statt versteckt. Nach dem Beitritt (`?welcome=1`, 360 px) lagen beide übereinander **auf der Überschrift des Willkommens-Hinweises** – sichtbar für alle, ohne Fokus (Screenshot geprüft).
- Umsetzung: visuell versteckt (`clip-path`, 1 × 1 px) bis `:focus`, dann oben links eingeblendet. Regressionstest „R-046 …“.
- Status: verifiziert (vom Reviewer behoben)

### R-047: Termin inzwischen festgelegt → Hinweis „Zeitraum geändert“
- Schwere: niedrig · vom Reviewer behoben
- Datei: `src/features/days/components/days-editor.tsx` (`onRejected`)
- Problem / Reproduktion: „Meine Tage“ offen, Orga legt den Termin fest, Mitglied tippt einen Tag → Server lehnt korrekt ab (`readOnly`, DB unverändert), angezeigt wurde aber „Der Zeitraum der Reise wurde geändert …“.
- Umsetzung: `readOnly` zeigt „Der Termin steht fest – deine Tage sind gesperrt.“ + „Neu laden“. Regressionstest „R-047 …“.
- Status: verifiziert (vom Reviewer behoben)

### R-048: Jeder Besuch von „Meine Tage“ speichert und setzt „zuletzt geändert“
- Schwere: mittel · vom Reviewer behoben
- Datei: `src/features/days/components/days-editor.tsx` (Online-Effekt), `src/features/days/use-autosave.ts`
- Problem / Reproduktion: Der Online-Effekt rief beim Mount `retry()` auf, das `dirty = true` setzt → bei **jedem** Seitenaufruf ein `saveDaysAction` mit unverändertem Snapshot. Folgen: `availability_updated_at` = Zeitpunkt des letzten **Besuchs** (F-007 verlangt „Datum der letzten Änderung“), unnötige Schreibzugriffe; in Phase 3 erschien dadurch beim Öffnen zusätzlich ein Fehler-Banner (bestehender E2E „fixed dates …“ auf mobile-chromium rot: Text doppelt). Gemessen: 1 POST pro Besuch ohne Änderung, `availability_updated_at` gesetzt.
- Umsetzung: neues `resume()` im Hook – speichert nach „wieder online“ nur, wenn wirklich etwas offen ist; `retry()` bleibt für „Erneut versuchen“. Regressionstest „R-048 …“ (0 POSTs).
- Status: verifiziert (vom Reviewer behoben)

### R-049: 360 × 640 – beim ersten Besuch kein Kalendertag ohne Scrollen sichtbar
- Schwere: niedrig
- Datei: `src/features/days/components/days-editor.tsx` (Hinweise über dem Kalender), `days.module.css`
- Problem / Reproduktion: Pixel-Viewport 360 × 640, erster Besuch (noch nicht abgegeben): Cockpit-Kopf, Entwurfs-Hinweis, „Feiertage für …“ und die offene Legende „So funktioniert's“ füllen den Bereich über der Werkzeugleiste komplett – der erste Kalendertag liegt unterhalb der Falz (mit Willkommens-Hinweis noch weiter). W08 rechnet mit ~380 px sichtbarem Kalender; F-005 betont Eingabe-Geschwindigkeit.
- Erwartetes Verhalten: Mindestens die erste Kalenderwoche ohne Scrollen sichtbar.
- Vorschlag: Legende kompakter (Schlüssel einzeilig, Erklärtext kürzer) oder auf < 600 px eingeklappt mit Chip-Zeile; Entwurfs-Hinweis und „Feiertage für“ in eine Zeile; „Feiertage für“ laut W08 nur zeigen, wenn die Region geraten ist (Annahme 6 des Developers). Mit UI/UX abstimmen.
- Umsetzung (Inkrement 4, Developer – Entscheidung, bitte von UI/UX bestätigen): (1) Legende „So funktioniert's“ startet **immer eingeklappt** (Abweichung von Flow B.1 „aufgeklappt bis zur ersten Abgabe“); die Kernregel steht stattdessen im Entwurfs-Hinweis: «Entwurf – zählt erst, wenn du abgibst. Nicht markierte Tage zählen als „Geht“.» (2) Die Zeile «Feiertage für: … Ändern» steht jetzt **in der Legende** statt darüber (ob die Region geraten ist, wird nicht gespeichert; die Feiertage selbst bleiben an Eselsohr und Monatsliste sichtbar). Gemessen 360 × 640 (Lissabon-Demo, erster Besuch ohne Willkommens-Hinweis): erste Kalenderwoche vorher bei y ≈ 830, jetzt vollständig über der Werkzeugleiste (y ≈ 430–480 < 483). Mit Willkommens-Hinweis (`?welcome=1`) liegt die erste Woche weiterhin unter der Falz – der Hinweis ist schließbar. Regressionstest `increment-4-group.spec.ts` „R-049 …“; `increment-3-days.spec.ts` (Feiertags-Region) öffnet die Legende jetzt zuerst.
- Status: verifiziert (Reviewer 2026-10-10, Commit d31c977: E2E „R-049 …“ grün auf desktop/mobile-chromium; UI/UX hat die Abweichung in ux-spec §12 A1 bestätigt)

#### Hinweise ohne Finding (Inkrement 3)
- **IDOR/Replay:** alle Tage-Actions lösen die Reise über `findMembership(publicId, session.user.id)` auf; Replay eines abgefangenen `saveDaysAction` mit fremder Session → `notAllowed`, DB unverändert (E2E). Platzhalter-Actions über `organizer()` + `userIdSchema` (UUID) + `trip_id`-Bedingung im WHERE. Phase 3/vergangen serverseitig gesperrt (live geprüft: Termin während offener Seite festgelegt → DB bleibt leer).
- **`checkEntries`:** Array ≤ 400, Paare, echte Kalenderdaten (`isIsoDate` mit Round-Trip), nur `maybe`/`no`, nur Suchzeitraum, keine Duplikate; DB zusätzlich mit CHECK-Constraint und PK (trip, user, day). Kommentar: Code-Points ≤ 200 + DB-CHECK `char_length`.
- **Platzhalter-Übernahme:** `joinLocked` sperrt die Reisezeile (`FOR UPDATE`) und liest den Platzhalter **nach** dem Lock – zwei parallele Übernahmen: eine übernimmt, die zweite wird normaler Beitritt (falls Platz) bzw. erhält einen Namensvorschlag. Grenze 30 zählt offene Platzhalter, Übernahme braucht keinen freien Platz. Namen eindeutig über Mitglieder + offene Platzhalter (App-Prüfung unter Lock + Partial Unique Index für Platzhalter). Entfernen vs. Übernahme parallel: `claimed_at is null` im DELETE verhindert Löschen eines gerade übernommenen Platzhalters.
- **Platzhalter-Tokens:** 256 Bit, Formprüfung vor DB, Erneuern ersetzt Reise- **und** Platzhalter-Links in einer Transaktion. Live geprüft: Token erscheint für ein normales Mitglied weder im HTML noch in der RSC-Payload von Übersicht, Meine Tage, Einladen, Einstellungen, Gruppe; für die Orga nur auf `/invite`. Ein bereits übernommener Platzhalter-Link bleibt ein normaler Einladungslink (Flow A.3 so vorgesehen). Rate-Limits /i/* unverändert (Fehlversuche nur für ungültige Tokens, R-036-konform).
- **Barrierefreiheit:** ein Grid pro Monat, Roving Tabindex über alle Monate, Tastatur laut §7.3 (E2E), Live-Region für Ansagen, Zustände mit Symbol + Muster, Bereichsmodus als Alternative zum Ziehen (WCAG 2.5.7), axe hell/dunkel ohne serious/critical, 360 px ohne horizontales Scrollen, keine Hydration-Fehler in der Konsole (R-017). Im gesperrten Zustand (Phase 3) hat das Grid keinen fokussierbaren Tag – Screenreader lesen die Tage im Lesemodus, für Tastatur ist nichts zu tun; vertretbar.
- **Touch-Ziehen (Code-Review):** `touch-action: pan-y` auf den Zellen, horizontal > 10 px (< 30°) oder 300 ms Halten startet das Malen, vertikal = Scrollen (`pointercancel` wird sauber behandelt), nicht-passiver `touchmove`-Blocker nur während aktivem Ziehen, Auto-Scroll an den Rändern. Reduced Motion: keine Transform-Animationen (E2E), keine Vibration.
- **Datum „abgegeben · geändert am“** wird als UTC-Tag formatiert (Annahme 7): Änderung um 00:30 MESZ zeigt den Vortag. Für die Demo vertretbar; mit Zeitzone des Kontos später korrigieren.

## Review Inkrement 4 (Reviewer 2026-10-10, Commit d31c977 gegen 5f8f5d4)

Geprüft: F-008 (Heatmap, Zählregel U-4), F-009 (Vorschläge, Gruppen U-14), Weiterleitung nach Abgabe → `/group`, Q20 (offene Platzhalter im Fortschritt), R-049, Motion W09 (Welle, Band, Karten) gegen features.md, W09 (md + HTML-Skizze), ux-spec §4.9–§4.11/§7.3/§12, Motion-Katalog. Checks unter Node 24.21 (lokal zusätzlich Node 22 für Lint/Typecheck/Unit): format, lint, typecheck, i18n, Unit (265), Build, E2E im CI-Modus (Chromium desktop + mobile; WebKit hier nicht installierbar). Fixes des Reviewers liegen uncommittet im Working Tree.

| ID | Schwere | Kurztitel | Status |
|---|---|---|---|
| R-050 | mittel | Heatmap-Zelle: ✓-Siegel verdeckt „5/5“ (360 px); bei 200 % Text ragen Zahlen in Nachbarzellen | verifiziert (vom Reviewer behoben) |
| R-051 | mittel | Vorschlag-Leiste bei großer Schrift: Inhalt quillt aus der Leiste (über den Kalender und unter den Bildschirmrand) | verifiziert (vom Reviewer behoben) |
| R-052 | mittel | Desktop ≥ 960 px: zwei Monate nebeneinander → Zellen 37 px, ✓ verdeckt „5/5“, „◐1“ läuft in den Pegel | verifiziert (vom Reviewer behoben) – UI/UX bitte Layout bestätigen |
| R-053 | niedrig | „Fast alle dabei“ schlägt Zeiträume vor, die niemand kann („0 können · ohne Tim“) | verifiziert (vom Reviewer behoben) |
| R-054 | niedrig | Filter „Dauer“ unter dem Reise-Minimum ohne Hinweis (ux-spec §12 A3) | verifiziert |

### R-050: Heatmap-Zelle – Siegel verdeckt den Zählwert, große Schrift sprengt die Zelle
- Schwere: mittel · vom Reviewer behoben
- Datei: `src/features/group/components/group.module.css` (`.dayCell`, `.cell`, `.num`, `.count`, neue Container-Queries `heatmap`)
- Problem / Reproduktion: (1) 360 × 640, Kalender, Tag mit x = n: Zelle 45,7 × 46 px, Zählwert ab 17 px Oberkante, Siegel Ø 15 px unten rechts → das Siegel deckt die untere rechte Hälfte der letzten Ziffer von „5/5“ ab (Screenshot; auch 320/412 px). W09 erlaubt 46 px nur, „wenn die Anatomie ohne Überlappung passt“; die HTML-Skizze rechnet mit 45,7 × 52. (2) Schriftgröße 200 % (Root 200 %), 360 px: Datum und „x/n“ überlappen sich und „5/5“ ragt ~7 px links und rechts in die Nachbarzellen (183 Kollisionen gemessen) – Verstoß gegen den Mindest-Fallback ux-spec §12 A2.
- Umsetzung: Zellhöhe mobil `3.25rem` (= 52 px, wächst mit der Schrift); Datum-Box und Zählwert-Oberkante in `rem` statt `px` (≥ 600 px: Zählwert 1,375 rem) → sichtbarer Abstand Zahl ↔ Siegel bei 100–150 %. Kalender ist Size-Container `heatmap`: unter 26 em Nebeninfos aus (◐-Zahl, Pegel), unter 15,5 em (≈ 140 % Text bei 360 px) nur Datum + Stufe + ✓/◐, die Zählung bleibt im zugänglichen Namen und im Tagesdetail. Messmatrix 320/360/412/600/1280 px × 100–200 %: keine Kollision von Datum/Zahl/◐/✓, nichts außerhalb der Zelle. Regressionstest `increment-4-group.spec.ts` „R-050/R-052 … 200 % text at 360 px“. Die Wellen-Animation rechnet die Zeilenhöhe jetzt aus der Zelle statt fest 55 px.
- Hinweis an UI/UX/Designer: design-system §6.1 („Zählwert Oberkante 20 px“, Siegel Ø 16, Höhe 46) überlappt rechnerisch selbst; bitte §6.1 auf 52 px bzw. die jetzt gebauten Werte nachziehen.
- Status: verifiziert (vom Reviewer behoben)

### R-051: Vorschlag-Leiste bei großer Schrift
- Schwere: mittel · vom Reviewer behoben
- Datei: `src/features/group/components/group.module.css` (`.bar`)
- Problem / Reproduktion: 360 px, Text 150–200 %, Kalender-Ansicht: die Leiste ist auf 120 px begrenzt, der Inhalt wird aber zentriert und läuft nach oben aus der weißen Fläche (Eyebrow „Everyone's in · 1 of 2“ liegt ohne Hintergrund über Kennzahl-Box/Kalender) und nach unten aus dem Bildschirm (Zeitraum, Nächte unerreichbar) – WCAG 1.4.4.
- Umsetzung: `align-items: safe center` + `overflow-y: auto` (Inhalt bleibt in der Leiste und ist scrollbar, 120-px-Budget aus W09 bleibt). Regressionstest im selben E2E-Fall.
- Status: verifiziert (vom Reviewer behoben)

### R-052: Desktop – zwei Monate nebeneinander, Zellen zu schmal
- Schwere: mittel · vom Reviewer behoben (Layout-Entscheidung bitte bestätigen)
- Datei: `src/features/group/components/group.module.css` (`@media (min-width: 960px) .calendar`)
- Problem / Reproduktion: 1280 × 800, Kalender: Inhaltsbreite 1040 px − 340 px Vorschlagsspalte → zwei Monatsraster à ~300 px → Zellen **37 px** breit (W09 Desktop nennt 64 px). Mit der ≥ 600-px-Anatomie (Zahl 15 px, Siegel 18 px, „◐1“, Pegel) verdeckt das Siegel bei jedem „alle“-Tag „5/5“, „◐1“ läuft in den Pegel (Screenshot, 41 Kollisionen). Zwei Monate + Spalte + 64-px-Zellen passen in 1040 px grundsätzlich nicht.
- Umsetzung: ab 960 px ein Monat pro Zeile (Zellen ~81 px bei 1280 px, keine Kollision bis 200 % Text). Regressionstest „desktop: one month per row …“.
- Erwartetes Verhalten / offen für UI/UX: W09-Desktop-Skizze („Mai | Juni | Vorschläge“) entsprechend anpassen oder eine Alternative vorgeben (z. B. zwei Monate erst ab breiterem Inhalt). Kein Blocker.
- Status: verifiziert (vom Reviewer behoben) – UI/UX bitte Layout bestätigen

### R-053: „Fast alle dabei“ mit 0 Personen
- Schwere: niedrig · vom Reviewer behoben
- Datei: `src/lib/suggestions.ts` (`computeSuggestions`)
- Problem / Reproduktion: 2 Personen haben abgegeben (Toleranz-Standard 1), der Betrachter blendet eine aus („Personen ausblenden“) → 1 Teilnehmer, Toleranz bleibt 1 → Karte „0 können · ohne Tim · bis zu 60 Nächte“. Unit-Reproduktion: 1 Teilnehmer mit einem „Geht nicht“, Toleranz 1 → `almost = [{missing: ["a"], nights: 9}]`.
- Umsetzung: Toleranz wird in der reinen Funktion auf n − 1 begrenzt (mind. eine Person muss können). Unit-Test „never suggests a span nobody can make …“.
- Status: verifiziert (vom Reviewer behoben)

### R-054: Filter „Dauer“ unter dem Reise-Minimum ohne Hinweis
- Schwere: niedrig
- Datei: `src/features/group/components/group-view.tsx` (Filterzeile)
- Problem / Reproduktion: Reise mit Mindestdauer 4, Filter „Dauer“ = 2 Nächte → Vorschläge mit 2 Nächten erscheinen ohne Hinweis, dass die Orga mindestens 4 vorgegeben hat. UI/UX fordert (ux-spec §12 A3, nicht blockierend) unter dem Filter: «Kürzer als die Orga-Vorgabe (mind. n Nächte).»
- Erwartetes Verhalten: Hinweiszeile in der Filterzeile (kein Dialog), DE/EN.
- Vorschlag: neben/unter `filters.onlyYou` eine zweite Zeile, solange `duration < minNights`.
- Umsetzung (Developer 2026-10-11, Inkrement 6): Hinweiszeile in der Filterzeile (`role="status"`, Info-Icon) «Kürzer als die Orga-Vorgabe (mind. n Nächte).» / «Shorter than the organizer's minimum (at least n nights).» (`group.filters.belowMin`), solange `duration < minNights`; zusammen mit B5 (Hinweis auf „Abstimmung erstellen“, wenn gewählte Vorschläge zu kurz sind). E2E `increment-6-trips.spec.ts` › „short picks … (B5) … (A3)“.
- Status: verifiziert (Reviewer 2026-10-11, Commit 94dfdef): Hinweiszeile erscheint nur bei `duration < minNights`, DE/EN; zusammen mit B5-Banner auf „Abstimmung erstellen“; E2E Desktop/Pixel/393 × 659 grün.

#### Hinweise ohne Finding (Inkrement 4)
- **Zählregel/Algorithmus:** gegen F-008/F-009 geprüft – x zählt nur „Geht“, n nur Abgegebene (Entwürfe/Platzhalter nie), ✓ ⇔ x = n ≥ 1, ◐ und ✓ schließen sich aus, „Zur Not“ blockiert nie. Vorschläge: maximale Spannen, Ränder des Suchzeitraums, Minimum = Suchzeitraum − 1, niemand abgegeben, einer blockiert alles, Sortierung (Fehlende → ◐-Personentage → Abstand zur Wunschlänge → Start → Ende → Ids, deterministisch), überlappende „Fast alle“-Spannen verschiedener Personensets (gewollt, „ohne Tim: 1.–19. Juni“). Abweichung 1 (Dauer = Wunsch, Minimum = min(Reise, Dauer)) logisch und von UI/UX bestätigt. Laufzeit: 30 × 365 × Toleranz 3 deutlich < 500 ms; `noMatchHints` im ungünstigsten Fall (Minimum 21, nichts passt) 40–150 ms.
- **Datenschutz/IDOR:** `listSubmittedAvailability` joint auf `submitted_at is not null`, wird nur nach `loadTripView` (Mitgliedschaft) aufgerufen; Nicht-Mitglied → 404 ohne Namen/Zellen (E2E). Live geprüft: Entwurf „Draft“ (blockiert alles) erscheint im HTML/RSC nur als `{"name":"Draft","placeholder":false}` in „Noch offen“, nie mit Tagen; Kommentare nur von Abgegebenen; Platzhalter nur mit Id + Name (kein Token). Mitglieder-Ids (UUID) gehen als Schlüssel in die Payload – nur an Mitglieder, vertretbar.
- **Barrierefreiheit:** Roving Tabindex, Pfeile/Pos1/Ende/Bild, Enter öffnet Tagesdetail, ←/→ blättern, Esc **und** „Schließen“-Taste geben den Fokus an den zuletzt gezeigten Tag zurück (beides geprüft). Zugängliche Namen nach W09 („… 4 von 5 Geht, 1 Zur Not, Teil von Vorschlag 1“). Kontraste gemessen (Zahl auf Fläche): hell einige 6,7 · viele 6,5 · alle 13,8; dunkel einige 6,5 · viele 7,4 · alle 11,5; Band hell `#2B2266` auf Weiß, dunkel `#52E5B8` auf `#1F1A45` (beide ≫ 3:1); axe hell/dunkel ohne serious/critical (E2E). 320 px ohne horizontales Scrollen im Gruppen-Inhalt. Bei 150–200 % Text läuft die Tab-Leiste des Cockpits horizontal (bestehende, scrollbare Leiste aus Inkrement 2, nicht W09-spezifisch).
- **Große Schrift (Abweichung 6 / U-5):** Tagesliste bewusst nicht gebaut (ux-spec §12 A2, vor Go-Live). Mindest-Fallback jetzt erfüllt (R-050). In Stufe 2 unterscheiden sich „wenige/einige/viele“ nur über die Fläche – von UI/UX so akzeptiert, Werte im Namen und im Tagesdetail.
- **Motion:** Server-gemalte Heatmap animiert nicht (R-017, E2E), Welle nur beim ersten Öffnen per Segment (sessionStorage), Band zeichnet sich per `scaleX`, reduzierte Bewegung → keine Welle/kein Zeichnen, Leiste ohne Einflug am Desktop.
- **Cookie `ww-hm-legend` (Abweichung 4):** nur Wert `closed`, 12 Monate, `SameSite=Lax`, Aufklappen löscht es; reine UI-Einstellung (§ 25 Abs. 2 Nr. 2 TDDDG). In `docs/ops/compliance-checklist.md` §4 nachgetragen – zusammen mit den bisher fehlenden Einträgen `ww-motion` und `sessionStorage` `ww-anim:*`/`ww-tab-from`.
- **Kleinigkeit:** EN-Zeiträume mischen das Format: „Thu 10 December – Fri, 8 January 2027“ (Intl setzt mit Jahr ein Komma nach dem Wochentag). Kosmetisch, bei Gelegenheit einheitliches Muster.


## Review Inkrement 5 (Reviewer 2026-10-10, Commit e8f645f gegen 0502b2d)

Geprüft: F-010, F-011 (W10), F-012 inkl. Ergebnis-Karte, ICS/Google-Link und Feier „Es geht los!“ (W11-02), F-017 (Frist), Migration `0005_increment5_vote.sql`, Phasen 2/3 in Übersicht/Meine Reisen/Gruppe – gegen features.md, PRD §12 (Q13 a, Q17), W10/W11, ux-spec (inkl. §13 B1–B9), Motion-Katalog. Checks lokal unter Node 22: lint, typecheck, i18n, format, Unit (290), Build, E2E im CI-Modus (Chromium desktop + mobile, 296 bestanden, 1 flaky aus Inkrement 2, 3 übersprungen); zusätzlich `increment-5-poll.spec.ts` auf 393 × 659 (iPhone-15-Viewport, Chromium) – 15/15. WebKit hier nicht installierbar. Fixes des Reviewers liegen uncommittet im Working Tree.

| ID | Schwere | Kurztitel | Status |
|---|---|---|---|
| R-055 | mittel | Suchzeitraum-Änderung in Phase 2 kann die Abstimmung in „Vergangen“ kippen (Festlegen unmöglich, alle sehen alle Ergebnisse); Optionen außerhalb zeigen ISO-Datum | verifiziert |
| R-056 | niedrig | „Wer hat wie gestimmt?“ ohne Zähler je Gruppe (ux-spec §13 B3) | verifiziert (vom Reviewer behoben) |
| R-057 | niedrig | Vorfreude-Ring: Glow-Scheibe oben gerade abgeschnitten, wirkt im Cockpit als graubraune Scheibe | verifiziert |

### R-055: Suchzeitraum-Änderung in Phase 2 kippt die Abstimmung in „Vergangen“
- Schwere: mittel
- Datei: `src/features/trips/actions.ts` (`updateTripAction`) / `src/lib/trip-input.ts:187–199` (`validateTrip`); Folge in `src/lib/trip-status.ts` (`uiPhase`), `src/features/poll/load.ts` (`seeAll`), `src/features/poll/actions.ts` (`fixDatesAction`)
- Problem / Reproduktion: Reise mit Suchzeitraum 01.09.–31.12.2026, Abstimmung läuft (Optionen im November). Am 10.10. ändert die Orga in „Reise bearbeiten“ das Ende auf 08.10. → `validateTrip` akzeptiert (Start = ursprünglicher Start darf in der Vergangenheit liegen, Ende muss nur > Start sein; per Unit-Reproduktion bestätigt) → `uiPhase` = „past“. Folgen: (1) „Termin festlegen“ und „Option hinzufügen“ antworten `phase`, die Abstimmung ist eine Sackgasse; (2) `loadPoll` setzt `seeAll` für „past“ → **alle Mitglieder sehen alle Zahlen und Namen**, auch ohne eigene Stimme (Q13 a umgangen); (3) Reise verschwindet aus „Meine Reisen → Aktuell“. Unabhängig davon: Optionen außerhalb eines verkleinerten Zeitraums zeigen in den Karten das Rohdatum „2026-11-05 – 2026-11-10“, weil `shortLabels` nur Tage des Suchzeitraums enthält.
- Erwartetes Verhalten (ux-spec §13.1 b): Zeitraum in Phase 2/3 änderbar, bestehende Optionen und Stimmen bleiben; eine Änderung darf die laufende Abstimmung aber nie beenden.
- Vorschlag (minimale Regel): in `validateTrip` bei Phase ≠ „collecting“ zusätzlich `rangeEnd ≥ today` (Fehler am Feld „Ende liegt in der Vergangenheit“) – damit wird „past“ nur noch durch Zeitablauf erreicht. Zusätzlich `seeAll` in `loadPoll` nur bei `trip.phase === "fixed"` (nicht bei „past“ einer nie festgelegten Abstimmung) und Optionsdaten unabhängig vom Suchzeitraum formatieren (Formatter statt Lookup, Hinweis „Liegt außerhalb des aktuellen Suchzeitraums“ laut §13.1 b). Unit-Test für die Regel.
- Umsetzung (Developer 2026-10-10):
  - `validateTrip` (`src/lib/trip-input.ts`): neue Optionen `endNotBefore` + `originalEnd`, Fehler `endInPast` am Feld „Bis“ (DE „Sobald abgestimmt wird, muss das Ende heute oder später liegen.“ / EN „Once the vote has started, the end has to be today or later.“). Ein **unverändertes** Ende bleibt ausgenommen (sonst ließe sich eine durch Zeitablauf vergangene Reise nicht mehr umbenennen). Formular: `endNotPast` bei Phase ≠ „collecting“ (Einstellungsseite), Prüfung gegen das lokale Heute.
  - `updateTripAction`: Prüfung gegen das echte Server-Heute (ohne die 1-Tages-Toleranz des Starts – `uiPhase` nutzt dasselbe Heute). Race-Schutz: verschiebt die Änderung das Ende in die Vergangenheit (nur in Phase „collecting“ erlaubt), speichert `updateTrip` mit `WHERE phase = 'collecting'` in derselben Anweisung; wurde die Abstimmung inzwischen gestartet, antwortet die Action mit dem Feldfehler.
  - `loadPoll`: `seeAll` über `seesAllResults()` (`src/lib/poll.ts`) = Orga oder gespeicherte Phase „fixed“ – nie die abgeleitete Phase „past“.
  - Optionskarten: Datum über `shortLabelFormatter()` (unabhängig vom Suchzeitraum, kein ISO-Rohdatum mehr); `periodInRange()` → `inRange` je Karte; außerhalb/teilweise außerhalb Info-Hinweis „Liegt außerhalb des aktuellen Suchzeitraums“ / „Outside the current search range“ (Lavendel `info-*`), Verfügbarkeitszeile nur, solange Tage im Zeitraum liegen. Urlaubstage der Karten über Suchzeitraum ∪ Optionen berechnet. Neue Optionen weiterhin nur im Zeitraum (`checkOption` unverändert).
  - Tests: Unit `trip-input.test.ts` (R-055-Regel inkl. unverändertem Ende), `poll.test.ts` (`seesAllResults`, `periodInRange`); E2E `increment-5-poll.spec.ts` › „R-055 …“: Client-Fehler am Feld, Server-Ablehnung per Formular-Post ohne JavaScript (+ Kontroll-Post), Ende = heute erlaubt → Phase bleibt „voting“, Karten ohne ISO-Datum mit Hinweis, Mitglied ohne Stimme sieht keine Ergebnisse (HTML/RSC ohne `tally`); zweiter Test: abgelaufener Zeitraum (abgeleitet „past“) → weiterhin keine Ergebnisse für Mitglieder, Umbenennen weiter möglich.
- Status: verifiziert (Reviewer 2026-10-10, Commit 056778b): `endInPast` nur bei Phase ≠ „collecting“ und geändertem Ende (Unit + E2E inkl. Formular-Post ohne JS); Race-Schutz per `UPDATE … WHERE phase = 'collecting'` bei Ende in der Vergangenheit, sonst Feldfehler der neuen Phase; `seesAllResults` nach gespeicherter Phase (Mitglied ohne Stimme im abgeleiteten „past“: kein `tally`/`names` im HTML/RSC, E2E); Karten mit echtem Datum, Hinweis „außerhalb“ Kontrast hell 5,67:1 / dunkel 7,39:1 (gemessen, 393 × 659).

### R-056: „Wer hat wie gestimmt?“ ohne Zähler je Gruppe
- Schwere: niedrig · vom Reviewer behoben
- Datei: `src/features/poll/components/option-card.tsx` (Liste in `<details>`)
- Problem / Reproduktion: ux-spec §13 B3 verlangt Gruppen Ja/Vielleicht/Nein mit Text-Label **und Zähler**; gebaut war „Ja: Zora, Uli“.
- Umsetzung: „Ja (2): Zora, Uli“ (Zahl aus derselben, bereits freigegebenen Namensliste). `aria-expanded`: natives `<summary>` – im Chromium-Accessibility-Baum geprüft (`DisclosureTriangle`, `expanded: false/true`), daher kein zusätzliches Attribut.
- Status: verifiziert (vom Reviewer behoben)

### R-057: Vorfreude-Ring – Glow-Scheibe abgeschnitten
- Schwere: niedrig
- Datei: `src/features/poll/components/countdown-ring.tsx` (`g[data-anim="glow"]`, `viewBox="0 140 390 192"`)
- Problem / Reproduktion: 393 × 659, Phase 3, Übersicht (hell und dunkel, statischer Endzustand): Die Glow-Kreise (r = 150 bzw. 112, #FFCF4A 8 %/12 %) ragen über die obere viewBox-Kante (Mittelpunkt y = 236, viewBox beginnt bei 140) und werden direkt unter der Tab-Leiste waagerecht abgeschnitten; auf dem Indigo-Cockpit wirkt die Scheibe graubraun statt als warmes Leuchten.
- Erwartetes Verhalten: weicher Glow ohne harte Kante (design-system §9.12).
- Vorschlag: Designer entscheidet – z. B. radialer Verlauf, der vor der viewBox-Kante auf 0 ausläuft, oder Radius ≤ 96.
- Umsetzung (Developer 2026-10-10, im Auftrag des CEO; Designer-Abnahme der Feinabstimmung offen): beide Sonnen-Kreise ersetzt durch **einen** Kreis r = 96 (= Abstand Mittelpunkt → obere viewBox-Kante) mit radialem Verlauf in Minze (`--ww-ring-start`): Deckkraft 8 % innen → 22 % auf Höhe des Rings → 7 % → **0 % am Rand**, daher keine harte Kante und keine graubraune Scheibe auf Indigo. Animation unverändert (nur `opacity`/`transform: scale(0.7 → 1)`; ein Feder-Überschwinger bleibt unsichtbar, weil der Rand transparent ist). Geprüft per Screenshot 393 × 659 hell/dunkel (statischer Endzustand). Das Design-Asset `docs/design/assets/illustrations/countdown-ring.svg` (mit eigenem Hintergrund) ist unverändert.
- Status: verifiziert (Reviewer 2026-10-10, Commit 056778b): radialer Minze-Glow r 96 läuft vor der viewBox-Kante aus – keine harte Kante unter der Tab-Leiste, kein Braunton (Screenshots 393 × 659 hell/dunkel).

#### Hinweise ohne Finding (Inkrement 5)
- **Q13 a serverseitig:** `pollForViewer` liefert `result: null` für unbeantwortete Optionen, `top`/`order` nur wenn alles sichtbar ist; einziger Ausgang für Stimmen sind `loadPoll`/`voteAction` (beide über `pollForViewer`). Übersicht, Meine Reisen, Gruppe, Teilen-Texte (nur Anzahl Optionen + Frist) und `event.ics` (nur Phase „fixed“) enthalten keine Stimmen. „Wer hat abgestimmt?“ zeigt nur den Status (F-007). E2E prüft HTML/RSC auf `tally`/`names`. Ausnahme siehe R-055 (2).
- **Locking:** Start/Hinzufügen/Festlegen/Aufheben sperren die Reisezeile `FOR UPDATE`, Abstimmen `FOR SHARE` → Abstimmen ↔ Festlegen/Hinzufügen serialisiert; doppelte Stimme durch PK + Upsert ausgeschlossen; Optionsdubletten durch Unique-Index (`duplicate`). Kein Deadlock-Pfad gefunden (FK-Prüfungen nehmen nur `KEY SHARE`, `voted_at`-Updates sind No-Key-Updates).
- **Migration 0005:** auf frischer DB mit Altzeilen geprüft (fixed ohne Daten, collecting mit Daten, fixed mit halbem Datum, voting mit Enddatum) → bereinigt, `trip_fixed_check` greift.
- **IDOR/Replay:** alle Actions über eigene Mitgliedschaft, Orga-Rolle serverseitig, Options-Ids müssen zur Reise gehören (zusammengesetzter FK + Prüfung), Antworten nur yes/maybe/no (zod), Zeiträume im Suchzeitraum, ≥ Mindestnächte, ≤ 60 Nächte, nicht vergangen; Frist ≥ heute − 1. `event.ics`: Nicht-Mitglied/entfernt/nicht festgelegt → gleiche 404, `no-store`, Dateiname ASCII-Slug.
- **„Option hinzufügen“ setzt „abgestimmt“ aller zurück:** fachlich richtig (D.2 #4), von UI/UX bestätigt (§13 B9) – Copy-Hinweis im Sheet + Snackbar sind UX-Anpassung vor Go-Live.
- **Feier:** Marker `celebrated_for` je Mitgliedschaft und Zeitraum (gleicher Zeitraum erneut → keine Feier, wie F-012), Abbruch bei Tippen/Scrollen/Taste/verstecktem Tab, harter Schluss 2,6 s (Konfetti endet spätestens nach ~2,54 s), Vibration nur im Bewegungs-Pfad und nur per `navigator.vibrate` (iOS hat keine API), reduzierte Bewegung = 140-ms-Überblendung. R-017: der CSS-Versteck betrifft nur die `aria-hidden`-Deko-Ebenen des Rings (`[data-anim]`), Countdown-Text, Karte, Datum und Buttons sind nie versteckt; Failsafe 2,4 s. Zahlen zählen nicht hoch (G-16).
- **Fokus nach Festlegen (§13 B2):** per rAF-Protokoll geprüft: Sheet-Überschrift → „Lock in dates“ (busy) → h1 „It's on!“ – nie `body`/Kopf; `?fixed=1` wird entfernt, Reload fokussiert nicht erneut, Titel „Overview · …“.
- **„Wer hat abgestimmt?“:** kein deaktivierter „Erinnern“-Button (§13 B4 erfüllt).
- **Kosmetik (bekannt aus Inkrement 4):** EN-Zeiträume mischen das Format („Tue 29 December – Sun, 3 January 2027“).

## Review Inkrement 6 (Reviewer 2026-10-11, Commit 94dfdef gegen 23b3b58)

Geprüft: F-043 Konto löschen (W13 /account/delete, /goodbye, Orga-Pflicht, Re-Auth, Bestätigungsmail, Inaktivität 24 Monate), F-013 (automatische Reise-Löschung + Hinweismails, `POST /api/internal/retention`, Datenexport `GET /account/export`, Datenschutz/Impressum mit Platzhaltern, Startschutz `src/instrumentation.ts`), F-051 (Hilfe-Themen, Lizenzhinweise), Q21 `cancelPoll`, Q22-Hinweis, B5/B9/A3 (R-054), Migration `0006_increment6_privacy.sql`. Checks lokal unter Node 22: format, lint, typecheck, i18n, Unit (325), Build, E2E im CI-Modus (Chromium desktop + mobile: 324 bestanden, 1 flaky aus Inkrement 3 – `increment-3-days` „comment is saved …“, im Retry grün –, 3 übersprungen); nach den Reviewer-Fixes Neubau + Inkrement-2/5/6-Specs erneut (74/74) und Inkrement-4/5/6-Specs auf 393 × 659 (Chromium, 45 bestanden, 1 übersprungen). WebKit lokal nicht verfügbar (nur CI). Startschutz live geprüft: `APP_ENV=production pnpm start` → „placeholder texts left (legal.privacy.updated, …)“, jede Anfrage inkl. `/api/health` → 500; `APP_ENV=demo` startet normal. Fixes des Reviewers liegen uncommittet im Working Tree.

| ID | Schwere | Titel | Status |
|---|---|---|---|
| R-058 | mittel | Inaktivitäts-Löschung prüft nicht erneut, ob das Konto inzwischen genutzt wurde | verifiziert (vom Reviewer behoben) |
| R-059 | niedrig | Automatische Reise-Löschung ohne Neuprüfung der Aktivität | verifiziert (vom Reviewer behoben) |
| R-060 | niedrig | Konto-Löschung entfernt fremde Codes mit gleichem Adress-Präfix | verifiziert (vom Reviewer behoben) |
| R-061 | niedrig | Rechtsseiten: Demo-Banner und `noindex` bleiben auch nach Ersetzen der Platzhalter | verifiziert (vom Reviewer behoben) |
| R-062 | niedrig | `GET /api/internal/retention` antwortet 405 statt 404 | verifiziert (vom Reviewer behoben) |

### R-058: Inaktivitäts-Löschung prüft nicht erneut, ob das Konto inzwischen genutzt wurde
- Schwere: mittel · vom Reviewer behoben
- Datei: `src/server/retention.ts` (`accountPass`), `src/server/account-deletion.ts` (`deleteAccount`)
- Problem / Reproduktion: `accountPass` liest zuerst alle Kandidaten und arbeitet sie danach nacheinander ab (inkl. Mailversand an andere Konten – je Mail Sekunden). Meldet sich eine Person mit fälligem Konto (Hinweis vor ≥ 30 Tagen, 24 Monate inaktiv) in diesem Fenster an, setzt `touchActivity`/der Session-Hook `last_active_at = now()` und löscht den Hinweis – `deleteAccount(row.id, "auto")` löscht das Konto trotzdem, weil die Transaktion nur den Plan, nicht die Inaktivität neu prüft. Ergebnis: ein gerade aktiv genutztes Konto wird mit allen Reisen/Stimmen gelöscht – widerspricht F-043 („nach Hinweis … automatisch gelöscht“, Anmelden verhindert die Löschung).
- Erwartetes Verhalten: Gelöscht wird nur, wenn das Konto unter Sperre immer noch inaktiv und der Hinweis noch offen ist.
- Umsetzung (Reviewer): `deleteAccount(userId, choices, { inactiveSince })` sperrt die User-Zeile (`FOR UPDATE`) und bricht mit `reason: "active"` ab, wenn `inactivity_notice_sent_at` inzwischen `null` ist oder `last_active_at` nicht mehr vor dem gelesenen Wert (+1 ms wegen µs-Genauigkeit) liegt; `accountPass` übergibt den gelesenen `lastActiveAt`. Sperr-Reihenfolge jetzt User-Zeile → Reisezeilen (nach Id); kein Pfad gefunden, der umgekehrt sperrt (Beitritt/Übergabe/Abstimmen/Entfernen sperren nur die Reise und nehmen auf `user` höchstens `KEY SHARE` per FK der eigenen Person). E2E „inactive accounts …“ weiterhin grün.
- Status: verifiziert (vom Reviewer behoben)

### R-059: Automatische Reise-Löschung ohne Neuprüfung der Aktivität
- Schwere: niedrig · vom Reviewer behoben
- Datei: `src/server/retention.ts` (`tripPass`)
- Problem / Reproduktion: wie R-058 für Reisen – die Reiseliste wird einmal gelesen; trägt jemand nach dem Lesen Tage ein oder ändert die Orga die Reise (12-Monats-Regel), löscht das spätere `DELETE … WHERE id AND deletion_notice_sent_at IS NOT NULL` die Reise trotzdem.
- Umsetzung (Reviewer): `DELETE` zusätzlich nur, wenn `tripLastActivity` nicht nach dem gelesenen Wert liegt (eine Anweisung, daher atomar). E2E „old trips …“ grün.
- Status: verifiziert (vom Reviewer behoben)

### R-060: Konto-Löschung entfernt fremde Codes mit gleichem Adress-Präfix
- Schwere: niedrig · vom Reviewer behoben
- Datei: `src/server/account-deletion.ts` (Löschen in `verification`)
- Problem / Reproduktion: `strpos(identifier, '-otp-a@b.de') > 0` trifft auch `sign-in-otp-a@b.dev` – löscht `a@b.de` sein Konto, wird der gerade angeforderte Code einer anderen Person (`a@b.dev`) ungültig.
- Umsetzung (Reviewer): verankert – Identifier endet auf `-otp-<adresse>` oder beginnt mit `change-email-otp-<adresse>-` (Format aus Better Auth `toOTPIdentifier`). Magic-Links bleiben über den JSON-quotierten Wert (`"a@b.de"`) beidseitig verankert.
- Status: verifiziert (vom Reviewer behoben)

### R-061: Rechtsseiten – Demo-Banner und `noindex` bleiben auch nach Ersetzen der Platzhalter
- Schwere: niedrig · vom Reviewer behoben
- Datei: `src/features/legal/legal-page.tsx`
- Problem / Reproduktion: `legal.demoNotice` („Demo-Version – Platzhaltertext, keine gültigen Rechtsangaben“) enthält selbst keinen `[PLATZHALTER`-Marker und wurde unbedingt gerendert; ebenso `robots: noindex`. Nach Ersetzen aller Platzhalter startet die App mit `APP_ENV=production`, zeigt auf echten Rechtstexten aber weiter „keine gültigen Rechtsangaben“.
- Umsetzung (Reviewer): Banner und `noindex`-Metadaten nur, solange `findPlaceholderMarkers(messages.legal[kind])` etwas findet (gleiche Funktion wie der Startschutz). Globales `X-Robots-Tag` aus `next.config.ts` (Demo) unverändert.
- Status: verifiziert (vom Reviewer behoben)

### R-062: `GET /api/internal/retention` antwortet 405 statt 404
- Schwere: niedrig · vom Reviewer behoben
- Datei: `src/app/api/internal/retention/route.ts`
- Problem / Reproduktion: `curl -X GET …/api/internal/retention` → 405 (verrät den Endpunkt), POST ohne/mit falschem Token → 404.
- Umsetzung (Reviewer): `GET` antwortet ebenfalls 404.
- Status: verifiziert (vom Reviewer behoben)

#### Hinweise ohne Finding (Inkrement 6)
- **deleteAccount – Sperren/Wettläufe:** Reisezeilen `FOR UPDATE` nach Id (zwei Löschungen mit gemeinsamen Reisen deadlockfrei), Plan unter Sperre neu berechnet; Übergabe (`transferOrganizer`) und Entfernen (`removeMember`) sperren jetzt dieselbe Reisezeile → Übergabe an eine Person, die gerade löscht, scheitert sauber (Ziel weg) bzw. macht deren Plan `planOutdated`. Beitritt in eine Solo-Reise → `planOutdated` (E2E). Ein im selben Moment angelegte Reise wird als Waise mitgelöscht; die Aufräum-Anweisung ist global (`updated_at > now() − 1 h` und ohne Mitglieder) – vertretbar, da Reisen ohne Mitglieder sonst nicht vorkommen.
- **Vollständigkeit:** User, Sessions, Credential, Mitgliedschaften (Name, Kommentar), Tage, Stimmen per Cascade; übernommene Platzhalter-Zeilen, Codes/Magic-Links, Re-Auth-Marker, `auth_attempt` (Adress-Schlüssel) explizit; `poll_canceled_by` → `null`. Nicht gelöscht, aber nicht personenbezogen zuordenbar bzw. kurzlebig: `auth_attempt` mit Postfach-Schlüssel (HMAC, Varianten-Budget, ≤ 24 h), Better-Auth-`rate_limit` (IP-basiert), Mailpit-Postfach (nur Demo). Logs enthalten nur Zähler. Platzhalter, die vor Inkrement 6 per „Reise verlassen“ verwaist sind, behalten ihren (von der Orga vergebenen) Namen – nur Altbestand.
- **Re-Auth:** `deleteAccountAction` prüft den Marker serverseitig (10 min, je Session), Server-Actions mit Next-Origin-Prüfung; Replay nach Erfolg ins Leere (User weg), abgelaufene Bestätigung → `reauthExpired` (E2E). Kein Cookie-Cache in Better Auth → andere Geräte sind sofort abgemeldet.
- **Export:** alle Abfragen an `session.user.id` gebunden, aus Reisen nur Reisefakten + eigene Einträge (keine Namen/Tage/Stimmen/Kommentare anderer, E2E), `no-store`, `nosniff`, Dateiname fest; abgemeldet → 303 auf Login.
- **Retention-Endpunkt:** `timingSafeEqual` nach Längenprüfung (Länge des Tokens ≥ 32 leakt nichts Verwertbares), ohne `RETENTION_TOKEN` 404; Hinweis wird per bedingtem UPDATE beansprucht und bei Mailfehler zurückgegeben → idempotent; Löschung frühestens Hinweis + 14/30 Tage. Der Reisen-Durchlauf liest täglich alle Reisen mit korrelierten Unterabfragen – für die Demo unkritisch, vor Go-Live auf Kandidaten (Fälligkeit nahe) einschränken.
- **Aktivität:** `touchActivity` = höchstens ein Schreibzugriff pro Konto und Tag (bedingtes UPDATE auf PK, sonst kein Row-Lock), fire-and-forget; Anmeldung setzt zusätzlich im Session-Hook.
- **Startschutz:** Prozess bleibt bei fehlgeschlagenem Instrumentation-Hook am Leben, beantwortet aber alles mit 500 (auch Health-Check) – wie beim Secret-Schutz R-028; Deployment-Health-Check schlägt damit fehl.
- **cancelPoll (Q21):** Phase + Rolle unter `FOR UPDATE` neu geprüft, Replay → `phase`; Hinweis einmal je Mitgliedschaft (nicht für Abbrechende, nicht für später Beigetretene, neuer Start löscht den Marker); Dialog-Fokus auf „Abstimmung behalten“, Esc schließt (E2E).
- **Destruktiver Konto-Dialog:** Fokus auf „Abbrechen“, „Endgültig löschen“ vor Bestätigung `aria-disabled` (Klick öffnet nichts), axe hell/dunkel ohne serious/critical; Layout 393 × 659 geprüft (Screenshot, lange Reisenamen umbrechen).
- **Kosmetik:** In „Daten & Datenschutz“ (Konto) steht zwischen „Datenschutzerklärung“ und „Meine Daten herunterladen“ ein auffallend großer Abstand.

## Review Demo-Paket M0.5 (Reviewer 2026-10-16, Commit a2d3364 gegen 330ccf9)

Selbst ausgeführt (Linux, Docker; Build-Schritt wegen fehlendem Proxy-Zertifikat dieser Umgebung mit den vorhandenen Images – betrifft das Repo nicht): `start` (Erststart: `.env.demo` mit Rechten 600, gitignored, Migration, Seed, URL-Kasten), zweiter `start` (kein Re-Seed), `status`, `seed`, `unlock`, `stop`, `start` nach gelöschter `.env.demo` (DB-Passwort-Abgleich greift, Login danach ok), `DEMO_BIND_ADDRESS=127.0.0.1` (Ports nur an 127.0.0.1, LAN-IP nicht erreichbar, `APP_URL=localhost`), belegter Port 3000 (verständlicher Abbruch), `unlock` mit `APP_ENV≠demo` (Abbruch), `reset`. Code-Login per Playwright über `http://localhost:3000` und `http://<LAN-IP>:3000` (iPhone-Profil): Cookie `ww.session_token` `secure=false`, `httpOnly`, `SameSite=Lax`; Magic-Link und Einladungslinks zeigen auf die LAN-IP. Secrets erscheinen weder in der Skript-Ausgabe noch im App-Log. Syntax unter bash 3.2 (macOS-Version) geprüft. Seed-Abgleich mit Anleitung/Drehbuch: Personen, Rollen, Reisen, „5 von 9“, „Zu tun (3)“, „Vergangene Reisen (2)“, „Wird am … gelöscht“, „Fast alle dabei“ ohne Ben/David/Greta, Abbruch-Hinweis Skiurlaub, UI-Texte stimmen.

### R-063: Demo-Skript – Hilfe, `logs` und Fehlermeldungen; Befehl im Anleitungs-Kasten
- Schwere: niedrig
- Datei: scripts/demo.sh:270, scripts/demo.sh:256, scripts/demo.sh:191/194; docs/ops/demo-anleitung.md:83
- Problem / Reproduktion: (a) `bash scripts/demo.sh help` gibt als letzte Zeile `set -euo pipefail` aus (Zeilenbereich `2,16p` eine Zeile zu lang). (b) `bash scripts/demo.sh logs` ohne `.env.demo` → rohe Compose-Meldung `couldn't find env file: …/.env.demo` statt deutschem Hinweis (bei `status` vorhanden). (c) Schlägt Bauen/Starten oder die Migration fehl (z. B. kein Internet), endet das Skript ohne deutschen Hinweis nur mit der Docker-Ausgabe. (d) Beispiel-Kasten in der Anleitung zeigt `./scripts/demo.sh stop`, das Skript gibt `bash scripts/demo.sh stop` aus (ZIP-Download hat kein Ausführungsrecht – `./` würde scheitern).
- Umsetzung (Reviewer): (a) `2,15p`; (b) gleiche Prüfung wie bei `status`; (c) `|| fail "…"` mit Verweis auf Anleitung 4.7; (d) Kasten auf `bash scripts/demo.sh stop`.
- Status: verifiziert (vom Reviewer behoben)

### R-064: Kein Startschutz gegen `http://`-Basis-URL in production (Cookies ohne `Secure`)
- Schwere: niedrig (vor Go-Live)
- Datei: src/instrumentation.ts:15
- Problem / Reproduktion: Better Auth leitet `Secure` aus `BETTER_AUTH_URL`/`APP_URL` ab (`node_modules/better-auth/dist/cookies/index.mjs`: `baseURL.startsWith("https://")`). Das Demo-Paket nutzt das bewusst (HTTP im LAN) und ändert keinen Code – production ist mit `https://`-URL nicht aufgeweicht. Wird in production aber versehentlich `APP_URL=http://…` gesetzt (Tippfehler, Kopie aus `.env.demo`), startet die App ohne Warnung mit Session-Cookies ohne `Secure`.
- Erwartetes Verhalten: `APP_ENV=production` (und `staging`) startet nur mit `https://`-Basis-URL.
- Vorschlag: im Startschutz von `instrumentation.ts` neben dem Platzhalter-Check `BETTER_AUTH_URL ?? APP_URL` auf `https://` prüfen und sonst mit Verweis auf deployment.md abbrechen; Unit-Test.
- Umsetzung (Developer 2026-10-20, mit der Live-Vorschau PRD Q25): Startregeln in `src/lib/app-env.ts` (`startupProblems`), aufgerufen von `src/instrumentation.ts`: `APP_ENV` `preview`, `staging` und `production` starten nur mit `https://`-Basis-URL (`BETTER_AUTH_URL`, sonst `APP_URL`, auf Vercel ohne Wert `https://$VERCEL_PROJECT_PRODUCTION_URL`); Meldung nennt R-064 und deployment.md §4. Unit `src/lib/app-env.test.ts` („R-064: preview, staging and production need https“); E2E `preview.spec.ts` prüft `__Secure-ww.session_token` mit `Secure`. Doku deployment.md §0.6.
- Prüfung (Reviewer 2026-10-20): `pnpm start` mit `APP_ENV=production`/`staging`/`preview` und `http://`-Basis-URL → „Start refused: … needs an https:// base URL (R-064 …)“, jede Anfrage (auch statische `/de`) 500 – fail closed. Hinweis: `next start` lädt `.env.local`; ein dort gesetztes `BETTER_AUTH_URL=http://…` gewinnt gegen `APP_URL` und löst den Schutz korrekt aus. Unit-Test grün, E2E-Cookie `__Secure-ww.session_token` mit `Secure` grün.
- Status: verifiziert

#### Hinweise ohne Finding (Demo-Paket)
- **Sicherheit:** `unlock`/`seed` wirken nur über `docker/compose.demo.yml` (Projekt `wir-wollen-weg-demo`, eigene DB) und prüfen zusätzlich `APP_ENV=demo` in `.env.demo`; die Demo-Compose-Datei setzt `APP_ENV: demo` ohnehin fest. WLAN-Risiko (App **und** Mailpit mit Login-Codes für alle Geräte im WLAN) ist in Anleitung §3.4 benannt, Abschalten per `DEMO_BIND_ADDRESS=127.0.0.1` dokumentiert und getestet.
- **ZIP-Download:** „Download ZIP“ liefert den Standard-Branch – das Demo-Paket muss vor dem Termin auf `main` gemergt sein.
- **macOS:** keine GNU-Spezialitäten (kein `sed -i`, `ipconfig getifaddr`/`route -n get default`, `openssl rand`, `seq`, `lsof` vorhanden); `hostname -I` (Linux-Fallback) scheitert auf macOS still. Auf echtem Mac nicht ausgeführt.

## Review private Live-Vorschau PRD Q25 (Reviewer 2026-10-20, Commit 8464556 gegen cab9dff)

Selbst ausgeführt (Node 24.22, Docker-Postgres 18): format:check, lint, typecheck, i18n:check, Unit 352/352, `next build`, `drizzle-kit check` + `generate` (keine Schema-Abweichung zu 0007), E2E CI-Modus (`CI=1`, zwei `next start`-Server 3000/3100) Projekte desktop-chromium, mobile-chromium, preview-chromium: 332 bestanden, 3 übersprungen, 0 flaky (WebKit lokal nicht installiert – läuft nur in der CI). Nach den Reviewer-Fixes Preview-Projekt erneut: 6/6 (inkl. neuem Dark-Mode-axe-Test).

Proxy manuell gegen `next start` mit `APP_ENV=preview` geprüft (`curl --path-as-is`): `/`, `/de` (SSG), `/trips`, `/demo/postfach`, `/Demo/postfach`, `/%64emo/postfach`, `/demo/%70ostfach`, `/./demo/postfach`, `/_next/static/../../demo/postfach`, `/fonts/%2e%2e/demo/postfach`, `/icon-x/../demo/postfach`, `/_next/data/…`, `?_rsc=1`, `/api/auth/get-session`, `/API/health`, `/api/health/..%2f..%2fdemo/postfach`, `/robots.txt/..%2fdemo/postfach`, `/dev/ui` → 401. Varianten über ausgenommene Präfixe mit `%2f` (`/_next/static/..%2f…`, `/fonts/..%2f…`, `/favicon.ico/..%2F…`, `/icon-%2f..%2f…`) → 404 ohne Inhalt (Next dekodiert `%2f` nicht zu Pfadtrennern). Trailing Slash/Doppel-Slash → 308 auf kanonischen Pfad, dort 401. Server Action `resetDemoData` per POST mit `Next-Action`-Header an ausgenommene Pfade (`/fonts/x`, `/icon-x`, `/favicon.x`, `/_next/static/x`) → nicht ausgeführt (Demo-Daten unverändert). Basic Auth zeitkonstant (SHA-256 + XOR), kein Passwort in Logs.

### R-065: „Demo zurücksetzen“ löscht auch selbst angelegte `@demo.test`-Konten und deren Reisen
- Schwere: mittel (nur Vorschau-/Demo-Daten, aber Datenverlust bei Testpersonen und Widerspruch zum UI-Text)
- Datei: src/server/demo/seed.ts:409-415 (`delete … where email like '%@demo.test'`)
- Problem / Reproduktion: Postfach-Hinweis und Anleitung empfehlen ausgedachte Adressen wie `anna@demo.test`; `docs/ops/vorschau-anleitung.md` Z. 210 schlägt ausdrücklich ein neues Konto `lisa@demo.test` vor. Konto `lisa@demo.test` angelegt → `seedDemo` (gleiche Funktion wie „Demo zurücksetzen“) → Konto gelöscht (`select count(*) … 'lisa@demo.test'` = 0), mitsamt jeder Reise, in der lisa oder ein anderes `@demo.test`-Konto Mitglied ist. Der Reset-Text sagt „Legt Anna, Ben & Co. … neu an … Konten mit anderen Adressen bleiben“ – Testpersonen erwarten, dass nur Anna & Co. betroffen sind. Ein Tester kann so mit einem Klick die Arbeit aller anderen Tester mit `@demo.test`-Adressen löschen.
- Erwartetes Verhalten: Reset entfernt nur die Seed-Personen (`PEOPLE`, z. B. `anna@demo.test` … `ida@demo.test`) und die Seed-Reisen; selbst angelegte Konten bleiben (oder der Text sagt klar, dass **alle** `@demo.test`-Konten gelöscht werden).
- Vorschlag: Löschen auf `email = any($1)` mit den Seed-Adressen beschränken und Reisen nur löschen, wenn sie von einer Seed-Person organisiert werden (bzw. per Seed-Markierung); `hasDemoData` analog. Alternativ (kleiner): UI-Text DE/EN + Anleitung anpassen („löscht alle Konten mit @demo.test …“) und in der Anleitung für eigene Konten eine andere ausgedachte Domain empfehlen (z. B. `@beispiel.test`). Unit-/E2E-Test: fremdes `@demo.test`-Konto übersteht den Reset (oder Text entsprechend).
- Status: **behoben – Doku/Texte (CEO-Entscheidung 2026-10-20):** Verhalten bleibt (alle `@demo.test`-Konten werden zurückgesetzt); UI-Text DE/EN und vorschau-anleitung.md sagen das jetzt klar und empfehlen für eigene Konten eine andere ausgedachte Domain (z. B. `@freunde.test`).

### R-066: Demo-Postfach in `staging` (ohne Basic Auth) und bei unbekanntem `APP_ENV` möglich
- Schwere: hoch (Kontoübernahme – vom Reviewer behoben)
- Datei: src/lib/app-env.ts (`inboxEnabled`, `startupProblems`), src/proxy.ts:27
- Problem / Reproduktion: `inboxEnabled()` sperrte nur `production`. `APP_ENV=staging` (laut §0.6 internetseitig, https, aber **ohne** Basic Auth) + `MAIL_TRANSPORT=inbox` startete ohne Einwand → `/demo/postfach` öffentlich mit allen Login-Codes/Magic-Links. Ebenso ein vertipptes `APP_ENV=Preview`: Proxy aus (`!== "preview"`), Postfach an (`!== "production"`) – nur der Startschutz („unknown“) hielt es auf.
- Umsetzung (Reviewer): Allowlist `INBOX_ENVS = development, ci, demo, preview` für `inboxEnabled` und Startschutz (`MAIL_TRANSPORT=inbox` außerhalb → „Start refused“); Proxy schützt zusätzlich jedes unbekannte `APP_ENV` wie `preview` (ohne Passwort 503). Unit-Tests ergänzt (`staging`, `Preview`); manuell: `APP_ENV=staging MAIL_TRANSPORT=inbox` → „Start refused … MAIL_TRANSPORT=inbox is only for the local demo and the password-protected preview“, alle Anfragen 500. deployment.md §0.6/§0.7 nachgezogen.
- Status: verifiziert (vom Reviewer behoben)

#### Hinweise ohne Finding (Live-Vorschau)
- **Neon-URL mit `?sslmode=require&channel_binding=require`:** funktioniert mit `pg` 8.23.1 und `drizzle-kit migrate` (nutzt denselben `pg`-Treiber). `pg-connection-string` 2.14 reicht `channel_binding` nur als unbekannten Schlüssel durch, `pg` wertet ihn nicht aus (`enableChannelBinding` bleibt `false`) → Authentifizierung per SCRAM-SHA-256 ohne Channel Binding (GS2-Header `n`), was Neon akzeptiert; lokal mit `?channel_binding=require` geprüft. Kein Code-Fix nötig. `sslmode=require` behandelt `pg` 8.x wie `verify-full` (Zertifikat + Hostname werden geprüft, mit Neons öffentlichem Zertifikat ok) und schreibt eine Deprecation-Warnung ins Log; ab `pg` 9 bedeutet `require` libpq-konform „ohne Zertifikatsprüfung“. Empfehlung: in Vercel `sslmode=verify-full` setzen (oder die Warnung hinnehmen); optional später `enableChannelBinding: true` im Pool für echtes SCRAM-SHA-256-PLUS.
- **Client-IP auf Vercel:** Vercel überschreibt `X-Forwarded-For` am Edge (externe Werte nur mit Enterprise-„Trusted Proxy“) – Annahme in deployment.md §0.7 stimmt; `resolveClientIp` liest von rechts, Rate-Limits greifen pro Client-IP.
- **PgBouncer (Neon-Pooler, Transaction-Mode):** nur `pg_advisory_xact_lock`, keine Session-Locks, kein `SET`/`LISTEN`, keine benannten Prepared Statements (node-postgres nutzt unbenannte) – verträglich. Seed/Reset halten eine Verbindung für `begin … commit` – ok.
- **Playwright zweiter Server:** Port 3100 mit `next start`, Env wird mit der Prozess-Umgebung gemischt; in der CI startet er nach `pnpm build` sauber (lokal reproduziert). Fallstrick lokal: ein noch laufender Server auf 3100 lässt den CI-Lauf sofort scheitern (`reuseExistingServer: false`) – gewollt.
- **Startschutz-Verhalten:** Ein Fehler in `register()` beendet `next start` nicht, sondern jede Anfrage antwortet 500 (auch statische Seiten) – fail closed; auf Vercel entsprechend pro Instanz.
- **Postfach:** nur Textteil (React-escaped `<pre>`), HTML wird gespeichert, aber nie gerendert; `?to=` normalisiert und parametrisiert; Löschung > 24 h beim Schreiben/Lesen/Löschjob. Reset nur `preview` + Häkchen serverseitig; CSRF über Server Actions (Origin-Prüfung von Next).
- **axe dunkel:** neuer E2E-Test „inbox with mails passes axe in dark mode too“ (Reviewer) – grün.

### Hintergrund-Aufgaben auf Vercel (Commit 8705e86, 2026-10-20)

### R-067: Aktivitäts-Stempel (`touchActivity`) ging auf Vercel verloren
- Schwere: niedrig
- Datei: src/server/session.ts:28
- Problem / Reproduktion: `touchActivity` schrieb `lastActiveAt` fire-and-forget ohne `after()`. Auf Vercel (APP_ENV=preview) wird die Function nach der Antwort eingefroren → das Update kann unterbleiben; `lastActiveAt` veraltet, Inaktivitäts-Hinweis/-Löschung (F-043) rechnet mit falschem Datum. Gleiche Ursache wie die verlorenen Login-Codes.
- Erwartetes Verhalten: Schreibvorgang läuft nach der Antwort zuverlässig zu Ende, ohne die Seite zu verzögern.
- Umsetzung (Reviewer): über `runAfterResponse` (`after()`) geführt; Unit-Test `src/server/background.test.ts` (Übergabe an `after()`, Fehler nie als Rejection, kein Wurf außerhalb Request-Scope).
- Status: verifiziert (vom Reviewer behoben)

#### Hinweise ohne Finding
- `advanced.backgroundTasks.handler` ändert auch `runInBackgroundOrAwait` in Better Auth: bisher awaited, jetzt per `after()` (betrifft Rate-Limiter-Aufräumen `deleteMany` und `sendVerificationOTP`). Unkritisch: der Collector im kombinierten Flow setzt `otp` synchron, bevor das Promise zurückkommt; Fehler unbekannter OTP-Typen werden nun geloggt statt als 500 geworfen (HTTP-Allow-List lässt diese Pfade ohnehin nicht zu).
- Weitere Sends geprüft: Konto-Mails (`features/account/actions.ts`) und Löschjob (`retention.ts`) werden awaited – nicht betroffen.

### Vertrauenswürdige Origins in der Vercel-Vorschau (Commit aa94c3d, 2026-10-20)

### R-068: Magic-Link (und Einladungslinks) zeigen in der Vorschau immer auf die Basis-URL, nicht auf den aufgerufenen Host
- Schwere: niedrig
- Datei: src/server/auth/email-access-plugin.ts:352
- Problem / Reproduktion: Server lokal wie Vercel gestartet (`VERCEL=1 APP_ENV=preview APP_URL=https://wir-wollen-weg.vercel.app …`), Code angefordert mit `Host`/`Origin` `wir-wollen-dzdp-max.vercel.app` → 200; Login per Code auf diesem Host funktioniert (Cookie `__Secure-ww.session_token`, host-only, `Secure`, `SameSite=Lax`). Der Magic-Link in derselben Mail lautet aber `https://wir-wollen-weg.vercel.app/auth/magic?token=…` (statische `baseURL`). Wer die App über einen anderen `*.vercel.app`-Host nutzt, landet beim Klick auf dem Produktions-Alias: erneute Basic-Auth-Abfrage, Session nur dort, der ursprüngliche Tab bleibt abgemeldet; bei einem Branch-/Deployment-Host ggf. sogar auf einem anderen Deployment (anderer Code-Stand).
- Erwartetes Verhalten: In der Vorschau führt der Link auf den Host, über den der Code angefordert wurde – oder die Doku nennt eindeutig eine URL, über die die Vorschau zu öffnen ist.
- Vorschlag: (a) kurzfristig in `docs/ops/vorschau-anleitung.md` festhalten: Vorschau nur über `https://<VERCEL_PROJECT_PRODUCTION_URL>` öffnen (bzw. `APP_URL` auf genau den genutzten Host setzen); Code-Eingabe funktioniert auf jedem Host. (b) optional: Landing-URL nur in der Vorschau aus dem Request-Host bauen, wenn `previewTrustedOrigins(process.env, host)` ihn enthält – sonst `baseURL`. Keine dynamische `baseURL` mit `allowedHosts: ["*.vercel.app"]` verwenden (würde fremde vercel.app-Origins vertrauen).
- Status: offen

## Review Feedback-Runde 1 (Reviewer 2026-10-20, Commit 60fc7cd gegen 10a8c4e)

Geprüft: ux-spec §14.1–14.5, W06/W07/W09/W10/W11, Sicherheit (Platzhalter-Token, `?fix=1`, Q13 a, IDOR), Phase-3-Weiterleitungen, Wieder-geöffnet-Hinweis, Fokus im RemindSheet, 360 px / 200 % Text, R-017.

**Vom Reviewer behoben (ohne eigene Finding-Nummer):**
- `person-row`: Bei 200 % Text drückten [Erinnern]/[Tage eintragen] den Namen auf Breite 0 (Name in Liste und Sheet unsichtbar, nur Avatar + Button). Zeile ist jetzt Container; unter 14 em rutschen die Buttons unter den Namen (§14.2 „bricht … unter den Namen um“). `src/features/trips/components/person-row.tsx`, `person-row.module.css`.
- `remind-sheet` Schritt `single`: Kontextzeile war `ul > div > li` (ungültige Liste); jetzt `ul > li`.
- `messages/en.json` `trip.membersTitlePlaceholders`: «(9 + 1 placeholders)» → ICU-Plural «1 placeholder»; E2E `increment-3-placeholders.spec.ts` angepasst.
- E2E `increment-3-days.spec.ts` „R-047“ schlug fehl (desktop + mobile): Nach der abgelehnten Speicherung lädt die Seite neu und `/days` leitet in Phase 3 jetzt auf die Übersicht (§14.4) – der Sperr-Hinweis kann nicht mehr erscheinen. Test auf das neue Verhalten umgestellt (Übersicht, nichts gespeichert).
- `src/server/poll.ts`: JSDoc von `markPollCancelSeen` stand über `markReopenSeen`.

**Geprüft, ohne Befund:** Persönliche Platzhalter-Links erreichen Mitglieder nicht – HTML und RSC-Payload (`RSC: 1`) von Übersicht, `/group`, `/group?view=calendar`, `/poll`, `/days`, `/settings` in Phase 1 und 2 gegen das Token geprüft (temporärer E2E-Test). `?fix=1` als Mitglied öffnet nichts; Festlegen bleibt serverseitig rollengeprüft. `reopenSeenAction` prüft Mitgliedschaft (kein IDOR). Q13 a unverändert (`loadPoll`). nextStep()-Matrix und alle Texte DE/EN wortgleich mit §14.1/§14.2. Keine neuen Eintritts-Animationen auf server-gerenderten Inhalten (R-017): neue Animationen nur nach Nutzeraktion (Schrittwechsel, Sprachumschalter) bzw. Tab-Leiste nach „Festlegung aufheben“ (Client-Mount).

**Bekannte Abweichungen (Entwickler) – Bewertung:** Kacheln ab 30 em nebeneinander, Platzhalter in Phase 2 unter „Noch nicht beigetreten“, zusätzliche Texte, kein Überblenden der Nächster-Schritt-Karte, Kalender-Unterseite Phase 3 mit Vorschlägen (lt. §14.4 zulässig), WhatsApp-Taste mit share-Icon: alle vertretbar, keine Nacharbeit nötig (Überblenden ggf. mit Motion-Runde).

### R-069: Wieder-geöffnet-Hinweis über Präfix `~seen:` – falscher bzw. fehlender Hinweis in Folgerunden
- Schwere: mittel
- Datei: src/lib/poll.ts:408 (`reopenNoticeDue`), src/server/poll.ts (`cancelPoll`, `unfixDates`, `startPoll`)
- Problem / Reproduktion: Der Zustand hängt nur an `celebrated_for`, das außer durch `markCelebrated`/`markReopenSeen` nie zurückgesetzt wird.
  (a) Falscher Hinweis: Termin A festgelegt, Mitglied Kai feiert (`celebrated_for = A`). Orga hebt auf → Phase 2; Kai öffnet die Reise in dieser Zeit nicht. Orga bricht die Abstimmung ab (Q21) und startet später eine neue → Phase 2. Kai öffnet die Übersicht → «Lena hat den Termin wieder geöffnet. Die Abstimmung läuft wieder.» – obwohl gerade eine neue Abstimmung läuft und nichts „wieder geöffnet“ wurde (der vorhandene E2E-Test „members see … reopened“ zeigt genau diesen Mechanismus: frische Abstimmung + `celebrated_for` gesetzt → Hinweis).
  (b) Fehlender Hinweis: Kai sieht den Hinweis (`~seen:A`), Orga legt wieder A fest (korrekt keine zweite Feier), hebt erneut auf → `reopenNoticeDue` = false, Kai erfährt nicht, dass der Termin, den er im Kalender hat, wieder offen ist.
- Erwartetes Verhalten: Hinweis genau einmal je „Festlegung aufheben“, nur für Mitglieder, die den aufgehobenen Termin gefeiert haben; kein Hinweis nach Abbruch/Neustart.
- Vorschlag: In `unfixDates` (unter dem Lock) für alle Mitglieder das Präfix entfernen (`celebrated_for = regexp_replace(celebrated_for, '^~seen:', '')`), in `cancelPoll` das Präfix für alle setzen, die noch keines haben (nach Abbruch kein Reopen-Hinweis mehr). Alternativ sauberer: Spalte `trip.unfixed_at` + `trip_member.reopen_seen_at`. Unit-/E2E-Test für (a) und (b).
- Status: verifiziert (Reviewer 2026-10-20, Commit 65d3685): Migration 0008 lokal angewendet, Datenübernahme geprüft (danach 0 Zeilen mit `~seen:`, Flag für offene Fälle gesetzt); Flag-Schreibvorgänge in `startPoll`/`fixDates`/`unfixDates`/`cancelPoll` jeweils in der Transaktion unter `FOR UPDATE` der Reisezeile; zusätzlich echter UI-Durchlauf (temporärer E2E, zwei Konten): Festlegung aufheben → Flag nur beim Mitglied, das gefeiert hat (nicht bei der Orga), Abstimmung abbrechen → Flag gelöscht, kein Hinweis. Restrisiko vernachlässigbar: `markReopenSeen` läuft ohne Sperre – zeigt ein alter Tab den Hinweis, während die Orga fest-/wieder aufhebt, kann die zweite Meldung verloren gehen. — Entwickler: Präfix `~seen:` entfernt; eigene Spalte `trip_member.reopen_notice_due` (Migration `drizzle/0008_feedback1_reopen_notice.sql`, übernimmt bestehende Daten und entfernt das Präfix). `unfixDates` setzt das Flag unter dem Lock genau für Nicht-Orga-Mitglieder, deren `celebrated_for` dem aufgehobenen Zeitraum entspricht (`reopenNoticeAfterUnfix`), `startPoll`/`fixDates`/`cancelPoll` löschen es, `markReopenSeen` löscht es für die Person. `celebrated_for` bleibt reiner Zeitraum (keine doppelte Feier). Unit-Tests `src/lib/poll.test.ts` „reopen notice and celebration across rounds (R-069)“ (a), (b), doppeltes Aufheben, anderer Zeitraum, erneutes Festlegen; E2E `feedback-1.spec.ts` prüft (a) (neue Abstimmung ohne Flag → kein Hinweis). Demo-Seed setzt das Flag für „Silvester Prag“/Anna.

### R-070: RemindSheet bei 200 % Text – Liste praktisch nicht sichtbar
- Schwere: mittel
- Datei: src/components/ui/bottom-sheet.module.css:76 (`.bounded`), src/features/trips/components/remind-sheet.tsx:205
- Problem / Reproduktion: 360 × 640, Schrift 200 %, Phase 1 mit 10 Personen, Kennzahl-Box antippen → Kopf (3 Zeilen Titel), Fortschrittszeile und die fixierte Fußleiste «Remind all (8)» belegen fast die ganze Höhe; für die Liste bleibt ein Streifen von ca. einer halben Zeile (Name „Lena Berg“ abgeschnitten), der innen scrollt. Bedienbar, aber kaum nutzbar.
- Erwartetes Verhalten: Bei großer Schrift / niedriger Höhe scrollt das ganze Panel (Fußleiste darf mitscrollen) oder die Fußleiste wird kompakter, sodass mindestens 2–3 Zeilen sichtbar sind.
- Vorschlag: `.bounded` nur bei ausreichender Höhe anwenden, z. B. `@media (min-height: 36em)` bzw. Fußleiste unter einer Höhen-Schwelle nicht sticky; mit 200 % (Browser-Schriftgröße, nicht nur Seiten-CSS) prüfen.
- Status: verifiziert (Reviewer 2026-10-20, Commit 65d3685): echte Browser-Schriftgröße 32 px per CDP – 360 × 640: ganzes Sheet scrollt, Zeilen vollständig, Fußleiste erreichbar; 640 × 360 (quer) ebenso; 100 % hochkant unverändert (innen scrollende Liste + fixierte Fußleiste). Hinweis: Unter 36 em Höhe gilt der kompakte Modus für ALLE Sheets, also auch ohne Fußleiste bei normaler Schrift im Querformat (Titel `text-lg`, ganzes Panel scrollt, × scrollt mit) – vertretbar, Escape/Scrim schließen weiter. — Entwickler: `src/components/ui/bottom-sheet.module.css`: `.bounded` (innen scrollender Körper + fixierte Fußleiste) nur noch bei `@media (min-height: 36em)` – `em` folgt der Browser-Schriftgröße; darunter scrollt das ganze Sheet, die Fußleiste scrollt mit, Kopf kompakter (Titel `--ww-text-lg`, kleinerer Griff-Abstand). E2E `feedback-1.spec.ts` „R-070“ setzt die Browser-Schriftgröße per CDP (`Page.setFontSizes`, 32 px) auf 360 × 640: zwei ganze Zeilen gleichzeitig sichtbar (Zeilen sind bei 200 % ~200 px hoch – drei passen physisch nicht in 589 px), „Alle erinnern“ erreichbar. Hinweis: Seiten-CSS `html { font-size: 200% }` löst die Media-Query nicht aus (keine echte Nutzereinstellung).

### R-071: Phase 3 „Wer ist dabei?“ – Platzhalter stehen mitten in der eingeklappten Liste
- Schwere: niedrig
- Datei: src/features/trips/components/member-list.tsx:226
- Problem / Reproduktion: Festgelegte Reise mit 9 Mitgliedern + 1 Platzhalter: Liste zeigt 5 Mitglieder, dann «Mia · hasn't joined yet», dann «Show all 9». Nach dem Aufklappen stehen Mitglieder 6–9 hinter Mia; die Zahl «9» passt nicht zur Zeilenzahl. Außerdem ist in Phase 3 fraglich, ob offene Platzhalter überhaupt noch gelistet werden sollen (Kopf sagt «9 going»).
- Erwartetes Verhalten: Platzhalter nach allen Mitgliedern (auch eingeklappt erst nach dem Umschalter) bzw. in Phase 3 ausgeblendet – UX entscheiden lassen.
- Vorschlag: Platzhalter-Zeilen außerhalb der eingeklappten `ul` hinter den Umschalter setzen oder in Phase 3 weglassen.
- Status: verifiziert (Reviewer 2026-10-20, Commit 65d3685): «Not joined (n)» als eigene `section` mit h3 nach dem Umschalter, ohne Status/Erinnern; E2E inkl. axe grün. — Entwickler (CEO-Entscheidung): Phase 3/vergangen: Platzhalter nicht mehr in der Hauptliste, sondern ganz am Ende nach dem Umschalter unter der kleinen Zeile «Nicht beigetreten (n)» / «Not joined (n)» (neuer Key `trip.groupNotJoined`), ohne Status und ohne Erinnern-Taste. `src/features/trips/components/member-list.tsx` (+ `.module.css`). E2E `feedback-1.spec.ts` „R-071“.

#### Hinweise ohne Finding
- `/group` bei 200 % Text: Segment «Suggestions | Calendar» läuft 70 px über (horizontales Scrollen) – vorbestehend, nicht Teil dieser Runde; mit U-5/D-15 (große Schrift) vor Go-Live erledigen.
- „Gesucht wurde: … · 4–5 Nächte“ bricht am Halbgeviertstrich um („4–“/„5 nights“) – kosmetisch, ggf. `nightsRangeFact` mit geschütztem Strich.
- `withVoted` (Abstimmen, Live-Abgleich) vergleicht über Anzeigenamen – ok, da Namen je Reise eindeutig.
- WebKit (iPhone 15) lokal nicht installiert; neue Tests nutzen `expect.poll`/sichtbare Elemente – CI-Lauf abwarten.

## Review Inkrement 8 – Cockpit „Reiseverlauf“, Infos F-033, UX-8/UX-9, Pflege-Paket (Reviewer 2026-10-22, Commits a290c3d + 410ef7a)

### R-072: „Heute“ wird in der Server-Zeitzone bestimmt, nicht in der Zeitzone der Reise
- Schwere: mittel (vor Go-Live; für Demo/Vorschau vertretbar)
- Datei: src/lib/dates.ts:51 (`todayIso`), src/features/trips/load.ts:50, src/features/cockpit/actions.ts:83, src/features/poll/actions.ts:211
- Problem / Reproduktion: `todayIso()` nutzt die lokale Zeit des Servers; Vercel und Hetzner (deployment.md: „Zeitzone UTC“) laufen in UTC, eine Reise-Zeitzone gibt es im Schema nicht. Reise mit Anreise 23.10., Nutzerin in Berlin öffnet am 23.10. um 00:30 MESZ (= 22.10. 22:30 UTC) → Phasenzeile «Steht fest · noch 1 Tag», kein H-7, keine kleine Feier (UX-8); `departureCelebratedAction` lehnt mit `phase` ab. Erst ab 02:00 Ortszeit erscheint „Unterwegs · Tag 1“. Genauso verschieben sich Teilphase Danach, A2 (≤ 21 Tage), V1 (7 Tage) und alle Teilphasen-Grenzen um 1–2 Stunden. R.6 I8-05/I8-06/I8-07 und PRD §7 („Zeitzone der Reise, Standard: Zeitzone des Organisators“) verlangen das ausdrücklich; die Grenztag-Tests in `trip-route.test.ts` prüfen nur ISO-Datumsvergleiche. Vorbestehend seit Inkrement 3 (vgl. Hinweis „Datum abgegeben · geändert am als UTC-Tag“ weiter oben), mit Inkrement 8 aber sichtbar (Feier, Heute-Satz).
- Erwartetes Verhalten: „heute“ einer Reise = Kalendertag in der Zeitzone der Reise (Standard: Zeitzone der Orga).
- Vorschlag: Spalte `trip.time_zone` (IANA, beim Anlegen aus dem Browser der Orga, Fallback `Europe/Berlin`), `todayIso(now, timeZone)` über `Intl.DateTimeFormat(..., { timeZone })`; in `loadTripView`, den Cockpit-/Poll-Actions und im Löschjob verwenden; Unit-Test mit 22:30 UTC / Europe/Berlin. Alternativ (kleiner) feste App-Zeitzone `Europe/Berlin` per Konfiguration.
- Status: verifiziert (Reviewer 2026-10-22, Commit 62baa9e + Reviewer-Nachbesserung): Aufrufer geprüft – kein `getDate()`/`toISOString().slice(0, 10)` für „heute“ mehr in `src`, kein `current_date` in SQL. **Selbst nachgebessert:** `src/features/cockpit/load.ts` rechnete den Festlege-Tag (`fixedOn`: «festgelegt am …», Ring-Start, V1-7-Tage-Fenster) noch per `fromUtcDate` als UTC-Tag – jetzt `isoDateInZone`. Tests: lint/typecheck/i18n/format, 463 Unit-Tests, Build grün; E2E increment-3/4/5/6/8 + feedback-1 (desktop+mobile Chromium, `pnpm start`) 183 bestanden/3 übersprungen – **zusätzlich als Stresstest mit `APP_TIME_ZONE=Pacific/Kiritimati`** (App-Tag = UTC-Tag + 1, entspricht Berlin 22–24 Uhr UTC; Build + Testprozess mit derselben Variable) ebenfalls 183/3 grün → CI-E2E sind auch zwischen 22 und 24 Uhr UTC stabil, solange Build und Testprozess dieselbe `APP_TIME_ZONE` sehen (CI setzt keine → beide Berlin). Rest: `deletionDate` bleibt UTC-Datum (Datums-basiert, in Berlin ohne Abweichung). — Developer 2026-10-22: Umsetzung nach CEO-Entscheidung als **App-Zeitzone** statt Spalte pro Reise: `APP_TIME_ZONE` (IANA, leer/ungültig = `Europe/Berlin`, per `next.config.ts` `env` zur Build-Zeit auch in den Browser übernommen), zentral `todayIso(now, timeZone = appTimeZone())` und `isoDateInZone(at, timeZone)` in `src/lib/dates.ts` (Intl.DateTimeFormat mit `timeZone`, tz austauschbar für eine spätere Reise-Zeitzone). Da alle Stellen (`loadTripView`, Cockpit-/Poll-/Days-/Trips-Actions, „Meine Reisen“, Einladung, Formulare) `todayIso()` ohne Argument nutzen, gilt dort jetzt Berliner Zeit. Zusätzlich auf App-Zeitzone umgestellt: „geändert am“ (`remind.ts`, `trips/[id]/page.tsx`), „Zuletzt geändert“ (`info-view.tsx`), „beigetreten am“ (`trip-sheet.tsx`, `delete-account-flow.tsx`), Lösch-Datum in „Meine Reisen“ und in Mails (`templates.ts` `longDate`), Dateiname des Datenexports, Demo-Seed (`day()`) und E2E-Helfer `isoDay()`. Löschjob-Berechnungen bleiben zeitstempelbasiert (UTC) – Abweichung höchstens Stunden bei 90 Tagen/12 Monaten, nicht sinnvoll umzustellen. Tests: `src/lib/dates.test.ts` (23:30/00:30 MEZ und MESZ, Jahreswechsel, Sommerzeit-Beginn/-Ende, andere Zeitzonen, Env + Fallback), `src/lib/trip-route.test.ts` (Anreisetag 00:30 MESZ = „during“, Abreisetag 23:30/00:30). Doku: `.env.example`, `docs/ops/deployment.md` §4.

#### Hinweise ohne Finding (Inkrement 8)
- Selbst behoben: Zugängliche Namen «Ziel: Es geht los!. Noch 10 Tage» (doppelte Satzzeichen) – `src/features/cockpit/view.ts` setzt nach Titeln mit `.!?…` keinen zusätzlichen Punkt mehr.
- `saveTripInfo`: Beim allerersten Speichern (noch keine Zeile) sperrt `FOR UPDATE` nichts – zwei parallele Erst-Speicherungen mit Version 0 überschreiben sich still. Praktisch nur eine Orga mit zwei Tabs; billig zu schließen mit `onConflictDoUpdate({ …, where: eq(tripInfo.version, expected) })` und Auswertung der zurückgegebenen Zeilen. → **behoben – bitte prüfen** (Developer 2026-10-22): `src/server/cockpit.ts` – `onConflictDoUpdate` mit `where: eq(tripInfo.version, expectedVersion)` + `returning`; keine Zeile zurück → Konflikt (Version/Editor neu gelesen). E2E „two parallel FIRST saves …“ in `tests/e2e/increment-8-cockpit.spec.ts`. **Verifiziert** (Reviewer 2026-10-22).
- «Zuletzt geändert …» formatiert `updatedAt` als UTC-Tag (wie bisher bei „geändert am“) – Änderung um 00:30 MESZ zeigt den Vortag; mit R-072 mitlösen. → **behoben – bitte prüfen** (mit R-072, `isoDateInZone`). **Verifiziert** (Reviewer 2026-10-22).
- `telHref` macht aus «+49 (0) 30 1234» `tel:+49030…` (falsch gewählt) – entspricht W22 C („nur + und Ziffern“); ggf. „(0)“ nach Ländervorwahl entfernen. → **behoben – bitte prüfen** (Developer 2026-10-22): `src/lib/trip-info.ts` entfernt „(0)“ direkt nach `+`/`00` + Ländervorwahl (sonst unverändert), Tests in `src/lib/trip-info.test.ts`. **Verifiziert** (Reviewer 2026-10-22).
- Reisebeschreibung ist in Phase 3 für Mitglieder nirgends mehr sichtbar (W16 v2 sieht sie nicht vor) – UX entscheiden lassen, z. B. im Sheet „So habt ihr entschieden“. → **behoben – bitte prüfen** (CEO-Entscheidung 2026-10-22): Beschreibung als Zitatzeile oben im Sheet „So habt ihr entschieden“ (`DecidedView.description`, `cockpit-provider.tsx`, Stil `.quote` aus ux-spec §14.4 nach `sheets.module.css` verschoben), E2E-Prüfung im Sheet-Test. **Verifiziert** (Reviewer 2026-10-22).

## Review Inkrement 9 – Unterkünfte F-031 (Reviewer 2026-10-23, Commit f292f76)

### R-073: Swipen – schnelles «Rückgängig» lässt die Karte als «entfernt» verschwinden
- Schwere: mittel
- Datei: src/features/stays/components/swipe-deck.tsx:176 (`save` → `mergeOpen`)
- Problem / Reproduktion: Stapel Villa Mare / Casa Azul / Haus Galeb. → (♥), ← (✕ Casa Azul), sofort Strg+Z. Die Antwort der ✕-Bewertung kommt erst NACH dem lokalen Rückgängig an und enthält den Stapel von damals (ohne Casa Azul) → `mergeOpen` zählt Casa Azul als «removed»: Banner/Live-Region «A suggestion was removed.», Zähler «Place 2 of 2», Casa Azul ist bis zum Neuladen nicht mehr bewertbar (Server-Stand korrekt: unbewertet). Gefunden als E2E-Fehlschlag `increment-9-swipe.spec.ts:59` (mobile-chromium, Snapshot zeigt genau diesen Zustand); auf langsamen Mobilnetzen der Normalfall.
- Erwartetes Verhalten: Nur die Antwort der zuletzt abgeschickten Bewertung gleicht den Stapel ab; die zurückgeholte Karte bleibt.
- Vorschlag: Laufende Nummer je Bewertung, Abgleich nur bei `seq === lastSeq` (auch bei Retries die ursprüngliche Nummer).
- Status: verifiziert (Reviewer 2026-10-23, selbst behoben): `lastSeq`-Ref in `swipe-deck.tsx`, Retries tragen ihre Nummer weiter. `increment-9-swipe.spec.ts` 5× wiederholt (desktop + mobile) grün.

### R-074: Cockpit liefert gesperrten Mitgliedern die Bewertungs-Fortschritte pro Person (Q33)
- Schwere: mittel
- Datei: src/features/cockpit/view.ts:452 (`stayRemind`)
- Problem / Reproduktion: Kai (Mitglied, 0 von 2 bewertet, Rangliste gesperrt) lädt `/trips/{id}` (HTML und `RSC: 1`). Der Payload enthält `stayRemind` mit `"done":[{"name":"Lena Berg",…,"left":0}]`, `"open":[{"name":"Member 1",…,"left":2}]` – wer fertig ist und wie viel jede Person noch offen hat. `/stays` hält genau diese Namen bewusst zurück (`openNames: null`); R.7 I9-06 erlaubt gesperrten Mitgliedern nur die eigenen Bewertungen und die Fortschrittszahl. Der Test `increment-9-stays.spec.ts` „member with open suggestions …“ prüfte im Cockpit nur den Favoriten.
- Erwartetes Verhalten: Erinnern-Daten (Namen/Restzahlen) erst, wenn die Rangliste für die Person frei ist (Orga, alles bewertet oder festgelegt) – V3 bietet gesperrten Mitgliedern ohnehin kein `[Erinnern]` an.
- Vorschlag: `stayRemind` nur bei `rankingVisible(...)` berechnen.
- Status: verifiziert (Reviewer 2026-10-23, selbst behoben): Bedingung in `view.ts` (gleiche Regel wie `staysModel`), Regressions-Assertion `expect(cockpit).not.toMatch(/\\?"left\\?":\d/)` im genannten E2E-Test; increment-8/9 + feedback-1 grün.

### R-075: Next.js 16.4.0 mit bekannten Sicherheitslücken (2 kritisch, 1 hoch) – Patch 16.4.2 verfügbar
- Schwere: hoch (vor jedem weiteren Vorschau-Deploy)
- Datei: package.json (`"next": "16.4.0"`), pnpm-lock.yaml
- Problem / Reproduktion: `pnpm audit --prod`: GHSA-2464-fhr4-w9xw (kritisch, RCE im Image-Optimizer mit SVG), GHSA-673q-mjm6-r5xr (kritisch, RCE in `use cache` mit Typed Arrays), GHSA-p3m5-59mp-jv5r (hoch, DoS über Server Actions im App Router) – alle `>=16.0.0 <=16.4.0`, behoben ab 16.4.1. Für uns relevant ist sicher der Server-Actions-DoS (die App nutzt Server Actions überall, die Vorschau ist öffentlich erreichbar); `/_next/image` ist standardmäßig aktiv; `use cache` wird nicht verwendet. `next build` bricht in Agenten-Sitzungen zusätzlich einmalig mit `SecurityFatalError` ab (Upgrade-Hinweis, zweiter Lauf geht durch) – in CI nicht beobachtet, aber ein weiterer Grund für das Update. Außerdem (nur dev, kein Handlungsbedarf jetzt): `braces` über eslint-config-next, `esbuild` über drizzle-kit.
- Erwartetes Verhalten: `pnpm audit --prod` ohne kritische/hohe Treffer.
- Vorschlag: Patch-Upgrade `next` 16.4.0 → **16.4.2** (gleiche Minor-Version; `eslint-config-next` mitziehen), danach volle Prüfkette inkl. E2E. Zusätzlich `images: { unoptimized: true }` erwägen, da `next/image` nicht verwendet wird (kleinere Angriffsfläche).
- Status: verifiziert (Reviewer 2026-10-23, Commit 230e000): `next` 16.4.2 installiert (`pnpm install --frozen-lockfile`), Lockfile-Diff nur Next-Pakete (`@next/*`, `eslint-config-next`, Peer-Auflösungen), `pnpm audit --prod`: „No known vulnerabilities found“; `/_next/image` antwortet 404 (auch für vorhandene `/demo/stays/*.svg`); Build ohne `SecurityFatalError` im ersten Anlauf; volle E2E-Suite 428/3 übersprungen/1 vorbestehender Flake (R-078). — Developer 2026-10-23: `next` und `eslint-config-next` 16.4.0 → **16.4.2** (per pnpm, Lockfile aktualisiert; 16.4.1 wäre die erste gefixte Version, 16.4.2 ist der aktuelle Patch derselben Minor). Zusätzlich `images: { unoptimized: true }` in `next.config.ts` (next/image wird nicht genutzt). `pnpm audit --prod`: keine Treffer. `pnpm audit` (inkl. dev) meldet weiterhin nur `braces` (hoch, über eslint-config-next → fast-glob, kein Patch verfügbar) und `esbuild` (mittel, über drizzle-kit) – beide nur Dev-Werkzeuge. Volle Prüfkette inkl. E2E siehe Bericht.

### R-076: Vorschau-Token im Bild-URL legt Link und Bild-URL in Zugriffs-Logs offen
- Schwere: niedrig (vor Go-Live, wie R-037)
- Datei: src/app/api/stays/preview/route.ts:78, src/server/stays/preview-token.ts:37
- Problem / Reproduktion: Vor dem Speichern lädt der Browser `/api/stays/image?t=<token>`. Das Token ist nur signiert, nicht verschlüsselt: `base64url(JSON)` mit normalisierter Unterkunfts-URL, Bild-URL und Site-Name. Jeder Proxy-/Plattform-Zugriffslog (Vercel Request-Logs, Caddy/Nginx auf Hetzner) speichert damit Link und Bild-URL im Klartext (Base64). R.7 I9-10: „Titel, Links und Bild-URLs erscheinen nie in Logs“.
- Erwartetes Verhalten: Keine Inhalte der Vorschau in URLs.
- Vorschlag: Token-Inhalt mit AES-256-GCM verschlüsseln (Schlüssel per HKDF wie bisher, eigenes Label) – oder für das Bild nur einen kurzen HMAC der Bild-URL + Trip-ID in der URL und die Bild-URL serverseitig aus dem verschlüsselten Token holen. Alternativ mit R-037 gemeinsam über Log-Maskierung von `?t=` lösen.
- Status: verifiziert (Reviewer 2026-10-23, Commit 230e000): AES-256-GCM mit zufälligem 12-Byte-IV, AAD, `authTagLength` 16 auch beim Entschlüsseln (keine gekürzten Tags), Base64url-Prüfung, Ablauf/Reise-Bindung unverändert; Unit-Tests (kein Klartext, Manipulation, alte Tokens) und E2E (manipuliertes `?t=` → 404) grün. — Developer 2026-10-23: `src/server/stays/preview-token.ts` versiegelt die Claims jetzt mit AES-256-GCM (Schlüssel per HKDF aus BETTER_AUTH_SECRET, eigener Info-String `ww:stay-preview-token:v2:aes-256-gcm`, auch als AAD; zufälliger 12-Byte-IV; Format base64url(IV ‖ Chiffrat ‖ Tag)). Ablauf (≤ 30 min + 1 min) und Reise-Bindung unverändert (`actions.ts` vergleicht `trip`/`url`, Bild-Proxy prüft Mitgliedschaft in `claims.trip`). Alte signierte Klartext-Tokens werden abgelehnt (offene Vorschauen beim Deploy einfach neu laden). Tests `preview-parts.test.ts`: Round-Trip + Reise, kein Klartext im Token, frischer IV, Manipulation an IV/Chiffrat/Tag/Kürzung, fremder Schlüssel, Ablauf, Garbage; E2E: manipuliertes `?t=` → 404.

### R-077: Link-Vorschau auch nach Festlegung der Unterkunft / bei 30 Vorschlägen abrufbar
- Schwere: niedrig
- Datei: src/app/api/stays/preview/route.ts:46
- Problem / Reproduktion: Reise mit festgelegter Unterkunft; Mitglied sendet `POST /api/stays/preview {trip, url}` (gleiche Origin) → der Server ruft die fremde Seite ab und liefert Titel/Token. Rechte-Tabelle R.7: „Unterkunft vorschlagen, Link-Vorschau abrufen – keine Unterkunft festgelegt; < 30 Vorschläge“. Speichern lehnt `createStay` korrekt ab, der ausgehende Abruf passiert trotzdem (Rate-Limit begrenzt ihn).
- Erwartetes Verhalten: Neutrale Antwort `{ ok: false }` ohne Abruf, wenn festgelegt oder Limit erreicht.
- Vorschlag: Vor dem Abruf `chosen`/Anzahl prüfen (z. B. kleine `stayGate(tripId)`-Abfrage in `db.ts`), E2E-/Unit-Fall ergänzen.
- Status: verifiziert (Reviewer 2026-10-23, Commit 230e000): Gate direkt nach Mitgliedschaft, vor Duplikat, Rate-Limit und Abruf; E2E „R-077 …“ grün. Selbst nachgebessert: JSDoc von `rankingVisible` war durch das Einfügen von `canSuggestStay` vor die falsche Funktion gerutscht (`src/lib/stays.ts`). — Developer 2026-10-23: `stayGate(tripId)` in `src/server/stays/db.ts` + reine Regel `canSuggestStay()` in `src/lib/stays.ts`; `/api/stays/preview` prüft sie direkt nach der Mitgliedschaft – vor Duplikatprüfung, Rate-Limit und Fremdabruf – und antwortet neutral `{ ok: false }`. Tests: Unit `stays.test.ts` (Phase, festgelegt, 29/30), E2E `increment-9-stays.spec.ts` „R-077: no link preview once a place is picked or 30 suggestions exist“ (Duplikat wird vor dem Gate gemeldet, danach nicht mehr – belegt, dass die Route vorher endet).

#### Hinweise ohne Finding (Inkrement 9)
- **SSRF-Prüfung (adversarial) bestanden:** zusätzlich geprüft (temporäre Unit-Tests, wieder entfernt): `0:0:0:0:0:ffff:7f00:1`, `::ffff:0.0.0.0`, `::127.0.0.1`, `64:ff9b::169.254.169.254`, `64:ff9b:1::a00:1`, 6to4 `2002:7f00:1::`, Teredo, `fd12::`, `100.100.100.200`, `fe80::1%eth0` → gesperrt; Ziel-URLs `https://0x7f.1/`, `127.1`, `%31%32%37.0.0.1`, Vollbreiten-Ziffern `１２７.０.０.１`, `[::1]:443`, `localhost.`, `foo.localhost`, `0`, `router.home.arpa` → abgewiesen; DNS-Antwort mit einer öffentlichen + einer privaten Adresse → `unsafe` bei genau einer Auflösung. Pinning (undici `connect.lookup`), Redirect-Neuprüfung, Gesamt-Zeitlimit per `AbortSignal` (deckt Slowloris im Body ab), Größenlimit nach Dekompression, keine Cookies/Header-Weitergabe sind durch `safe-fetch.test.ts` belegt. Produktion: `defaultSafeFetcher()` ohne Optionen, keine Env-Hintertür.
- Nicht gesperrt (unkritisch, nicht global geroutet): IPv6-Dokumentationspräfix `3fff::/20` (RFC 9637) und `5f00::/16` (SRv6) – bei Gelegenheit in `V6_BLOCKED` ergänzen. → Erledigt (Developer 2026-10-23): beide in `V6_BLOCKED`, Tests in `address.test.ts` (inkl. Grenzen `3fff:1000::1`, `5f01::1` erlaubt) – bitte prüfen.
- `readLimited`: Ein Timeout während der Dekompression wird als `bad_type` statt `timeout` geloggt – nur Log-Kategorie. → Erledigt (Developer 2026-10-23): `readLimited` bekommt das `AbortSignal`; bei Abbruch/Body-Timeout bleibt der Fehler ein Timeout, nur ein kaputter Datenstrom ist `bad_type`. Test „timeout while decompressing …“ in `safe-fetch.test.ts` (schlägt ohne Fix fehl) – bitte prüfen.
- Bild-Proxy: HMAC-Vergleich `timingSafeEqual` nach Längenprüfung, Ablauf ≤ 30 min (+1 min Toleranz), Token an Reise gebunden + Mitgliedschaft geprüft; `?s=` per Join auf `trip_member` (keine IDOR); Magic Bytes, kein SVG, `nosniff`, `default-src 'none'; sandbox`, CORP same-origin, `private, max-age=86400`. Globale CSP Stufe 1 aktiv (Seiten, Vorschau-Basic-Auth-401, Proxy ausgenommen) – E2E inkl. Vorschau grün.
- `safe-fetch.test.ts` braucht `openssl` (≥ 1.1.1 wegen `-addext`) – in GitHub-Runnern vorhanden; unter Windows ohne Git-Bash/OpenSSL schlägt `pnpm test` lokal fehl → ggf. in `docs/UEBERGABE.md` erwähnen oder Zertifikat als Test-Fixture einchecken.
- Selbst behoben (Test-Robustheit): `increment-9-swipe.spec.ts` „pointer gesture“ – der Wisch-Flick über drei CDP-Mausbewegungen war unter Last flaky (2 von 8 Läufen: Freigabe außerhalb des 80-ms-Geschwindigkeitsfensters → Rückfedern). Flick jetzt als zeitlich gesteuerte Pointer-Events im Browser (8 ms Abstand), 20/20 grün. Der Test läuft weiterhin nur in Chromium (WebKit-Weg über Tasten/Tastatur).
- WebKit (iPhone 15) lokal nicht installiert – die neuen Specs nutzen sichtbare Elemente und `expect.poll`; CI-Lauf abwarten.

### R-078: E2E „dragging over days paints the range …“ (Inkrement 3) flaky auf mobile-chromium
- Schwere: niedrig (Test-Robustheit, vorbestehend)
- Datei: tests/e2e/increment-3-days.spec.ts:73
- Problem / Reproduktion: Im vollen Lauf nach R-075 einmal rot; gezielt 10× wiederholt: 3/10 rot – **ebenso 3/10 mit dem Stand vor dem Upgrade (9587ee8, Next 16.4.0)**, also nicht durch das Upgrade verursacht. Symptom: Ziehen von Tag 1 bis Tag 4 malt **5** Tage («23–27 October: 5 days set …» statt «4 days»); der Zeitraum geht hier über einen Wochen-Zeilenumbruch (Fr → Mo), der Endpunkt der Mausbewegung landet offenbar auf der Nachbarzelle (Scrollen/Layout-Verschiebung während des Ziehens auf Pixel 7). In früheren Läufen desselben Tages grün → datums-/lageabhängig.
- Erwartetes Verhalten: Deterministischer Test (CI hat zwar 1 Retry, 30 % Fehlerquote ist trotzdem zu hoch).
- Vorschlag: Endpunkt erst nach dem Ziehen-Beginn neu messen (`boundingBox()` von Zelle d nach `mouse.down()`), bzw. Daten so wählen, dass sie in einer Zeile liegen; alternativ prüfen, ob beim Malen ein Auto-Scroll die Zelle unter dem Zeiger verschiebt (dann ggf. echter Produktfehler – Malen endet nicht auf der Zelle unter dem Finger).
- Status: verifiziert (Reviewer 2026-10-23, Review Inkrement 10): `--repeat-each=10` mit 4 Workern gegen `pnpm build && pnpm start` – desktop- und mobile-chromium 20/20 grün; voller Lauf ebenfalls grün. — Developer 2026-10-23: **Ursache Testaufbau, kein Produktfehler.** Reproduziert mit Instrumentierung (Pointer-Events, `elementFromPoint`, `scrollY`, Lage von Tag d protokolliert): Unter Last (4 Worker, 20× wiederholt) 4/20 rot. `scrollIntoViewIfNeeded` ließ Tag d (Mo 26.10.) auf Pixel 7 direkt über der unteren Leiste liegen – der Endpunkt (y ≈ 659 px) lag in der Auto-Scroll-Zone (48 px über der Leiste). Die Seite scrollte also wie vorgesehen (Flow B.2) schon während der 8 Zwischenschritte unter dem Zeiger weg. Die diagonale Bahn Fr → Mo streift Di 27.10.; je nach Timing (rAF-Auto-Scroll gegen CDP-Mausschritte) war d beim letzten `pointermove` bereits um ~35 px nach oben gewandert, der Zeiger traf die Lücke unter d (`TABLE`), und die Auswahl behielt korrekt die zuletzt berührte Zelle (27.) → 5 Tage. In grünen Läufen kam der letzte Schritt einen Frame früher noch auf d an. Die Produktlogik (Lücke = letzte Zelle behalten, Auto-Scroll erweitert die Auswahl unter dem ruhenden Finger) verhält sich wie spezifiziert. Fix in `tests/e2e/increment-3-days.spec.ts`: Tag d per `scrollIntoView({ block: "center" })` mittig platzieren (außerhalb beider Auto-Scroll-Zonen), Boxen erst danach messen und zusätzlich prüfen, dass `window.scrollY` während der Geste unverändert bleibt (Voraussetzung des Tests jetzt explizit – fällt künftig klar statt zufällig um). Keine Annahme abgeschwächt: weiterhin 4 Tage, Snackbar, DB, Undo. Nachweis gegen `pnpm build && pnpm start`: mobile-chromium 20/20, desktop-chromium 20/20 (je 4 Worker parallel), ganze Datei 3× auf beiden Projekten 96/96.

## Review Inkrement 10 – Kosten teilen F-035/F-036 (Reviewer 2026-10-23, Commit 6f2924a)

Geprüft gegen features.md R.8, W19 D, W16 v2.15, design-system §9.22, Motion W19 (MVP), deployment §0.10, compliance §2b/§4/§7. Lint, Typecheck, i18n, Format, 771 Unit-Tests, Build, `pnpm audit --prod --audit-level=high` und volle E2E-Suite (desktop-, mobile-, preview-chromium: 473 grün, 3 übersprungen, 16,8 min, ohne Retry) grün. Migration 0011 auf frischer DB und auf einer DB mit Stand `main` + Daten gelaufen; per SQL geprüft: Summen-Trigger (Insert mit falscher Summe, Betrag ändern ohne Anteile, Anteil löschen → jeweils `23514` beim Commit), reiseübergreifende Partei (zusammengesetzter FK lehnt ab), benutzte Partei einzeln löschen (abgelehnt), Reise mit Ausgaben/Anteilen/Ausgleich löschen (Kaskade vollständig, DEFERRABLE greift). Demo-Seed zweimal hintereinander (= „Demo zurücksetzen“) mit Kosten fehlerfrei.

### R-079: Salden-Berechnung quadratisch – 10 000 Ausgaben ≈ 34 s (unter Reise-Sperre)
- Schwere: hoch
- Datei: src/server/costs/db.ts:441 (`balancesIn`), :853 (`balancesOf`), src/features/costs/load.ts:223 (`costsModel`), src/server/data-export.ts (`myShares`)
- Problem / Reproduktion: Anteile wurden je Ausgabe per `shares.filter(s => s.expenseId === e.id)` gesucht – O(Ausgaben × Anteile). Messung mit 10 000 Ausgaben à 30 Personen (technische Obergrenze, R.8 Regel 6f): 34 294 ms statt < 100 ms; bei 2 000 Ausgaben à 10 Personen ≈ 0,5 s je Aufruf. Pro Seitenaufruf läuft das mehrfach (Modell, Vorschlag, Erinnern, Teilen-Text, Cockpit), `markSettlement` hält dabei die Zeilensperre der Reise. Der vorhandene Unit-Test maß nur `computeBalances` mit bereits gruppierten Anteilen.
- Erwartetes Verhalten: Server-Pfad < 100 ms.
- Vorschlag: Anteile einmal gruppieren.
- Status: verifiziert (Reviewer selbst behoben): reine Funktion `sharesByExpense()` in `src/lib/costs.ts`, genutzt in `balancesIn`, `balancesOf`, `costsModel`; Export nutzt eine Map. Neuer Unit-Test „groups stored share rows in one pass …“ (300 000 Zeilen wie aus der DB, < 100 ms, Summe 0). Messung danach: 45 ms.

### R-080: Maskierte IBAN bricht bei 200 % nicht um (ragt aus der Karte)
- Schwere: niedrig
- Datei: src/features/costs/components/iban.tsx:52–69
- Problem / Reproduktion: 360 px, 200 % Schrift, Empfänger mit IBAN → `/costs/balances`: Zeile «IBAN DE89 •••• •••• •••• •••• 3000» ragt rechts heraus (1.4.10). Ursache: die Leerzeichen lagen innerhalb der `white-space: nowrap`-Gruppen, es gab keine Umbruchstelle. Die vorhandene E2E-Prüfung (200 %) lief ohne IBAN.
- Erwartetes Verhalten: Umbruch zwischen den Vierergruppen.
- Status: verifiziert (Reviewer selbst behoben): Leerzeichen außerhalb der Gruppen (`Fragment`), Anzeige unverändert; `increment-10-balances` grün, Überlauf-Prüfung bei 360 px/200 % für `/costs/balances` grün.

### R-081: Liste „Kosten“ bei 360 px + 200 % – «dein Anteil …» und «Du schuldest» ragen heraus
- Schwere: niedrig
- Datei: src/features/costs/components/costs.module.css:462 (`.rowShare` `white-space: nowrap`), Karte „Dein Stand“
- Problem / Reproduktion: Reise mit Ausgabe 1 840,50 € auf 4 → `/trips/{id}/costs`, 360 × 640, `html { font-size: 200% }`: `.rowShare` «dein Anteil 460,12 €» liegt rechts außerhalb von `main` (Element-`right` > 361 px); in „Dein Stand“ stößt «schuldest» an den Kartenrand. Die E2E „no horizontal scrolling …“ prüft 200 % nur auf `/costs/balances` und `/costs/new`, nicht auf der Liste. (Bei 320 px + 200 % zusätzlich: Platzhalter-Name „Lotte“ wird buchstabenweise umbrochen, Chip daneben – außerhalb der Abnahme-Kombination, nur Hinweis.)
- Erwartetes Verhalten: Kein Inhalt außerhalb des Viewports bei 360 px/200 % (I10-11, WCAG 1.4.10).
- Vorschlag: `.rowShare` umbrechen lassen (Betrag selbst bleibt per NBSP zusammen) bzw. Betragsspalte unter den Titel stellen, wenn der Container schmal ist; Saldo-Überschrift mit `overflow-wrap: anywhere`/kleinerer `clamp()`-Größe; die 200 %-Schleife der E2E um `costs` erweitern.
- Status: verifiziert (Reviewer 2026-10-23, Commit d8cbfe4): eigene Überlauf-Prüfung (`main *` mit `right` > 361 px) bei 360 px/200 % für `costs`, `costs/balances`, `costs/new` in DE **und** EN auf desktop- und mobile-chromium leer; Screenshots: bei 100 % „Dein Stand“ unverändert (Kachel neben dem Satz), bei 200 % Kachel über dem Satz, nichts abgeschnitten. Restbeobachtung ohne Finding (vorbestehende Bausteine, außerhalb der Kosten-Bereichs-CSS): Segment „Expenses | Settle up“ bricht bei 200 % mitten im Wort („Expens-es“), im Kopf überlappt „Expenses“ die Teilen-Taste leicht – bei der Designer-Abnahme 200 % mit ansehen. — Developer: `.rowShare` ohne `nowrap` (Umbruch zwischen Wörtern, Betrag bleibt per NBSP zusammen, `text-align: end`/im gestapelten Layout `start`), `.rowRight` `min-width: 0`; Saldo-Satz mit `overflow-wrap: break-word` + `hyphens: auto`; bei sehr großer Schrift (`@container (max-width: 15em)`, ≈ 200 % auf dem Handy) steht die Kachel in „Dein Stand“ über dem Text (normale Schriftgrößen unverändert). E2E: 200 %-Schleife jetzt auch für `costs`, gemeinsame Hilfsfunktion `expectNothingSticksOut` (listet überstehende Elemente), neuer Fall „R-081: German list at 360 px / 200 %“ (1 840,50 € auf 4, Konto-Sprache DE, «dein Anteil 460,12 €», «Du schuldest 460,12 €»). Gegenprobe: mit dem alten `nowrap` schlägt der Fall fehl (`rowShare: dein Anteil 460,12 €`). Dateien: `src/features/costs/components/costs.module.css`, `tests/e2e/increment-10-costs.spec.ts`, `tests/e2e/helpers/db.ts` (`setAccountLocale`).

### R-082: Mitglied erinnert Platzhalter per `settle` mit dem allgemeinen Einladungslink – Saldo geht beim Beitritt verloren
- Schwere: mittel
- Datei: src/features/costs/remind.ts:48–54 (`linkFor`)
- Problem / Reproduktion: Platzhalter „Lotte“ schuldet Mitglied Kai 30 €. Kai öffnet „Lotte erinnern“ → Text enthält `inviteLink(trip.inviteToken)` (allgemeiner Link; persönliche Links sieht nur die Orga, F-007). Lotte tritt über diesen Link bei → `joinLocked` übernimmt keinen Platzhalter, der Name „Lotte“ ist durch den offenen Platzhalter belegt → Vorschlag „Lotte 2“; sie wird **neue** Person, die 30 € bleiben beim Platzhalter „Lotte“, die Gruppe hat zwei Lotten. R.8 I10-09 und W16 v2.15 verlangen für Platzhalter den persönlichen Link. Bekannte Abweichung des Developers – Auswirkung ist aber eine falsche Abrechnung, nicht nur ein anderer Link.
- Erwartetes Verhalten: Erinnerung an einen Platzhalter führt nie zu einem Doppel-Beitritt; der Saldo bleibt bei der Person.
- Vorschlag (CEO/PM entscheiden): (a) Mitglieder bekommen für Platzhalter-Schuldner einen Text **ohne** Link («… melde dich bei {orga} für deinen Link») oder (b) der persönliche Link wird in genau diesem Erinnern-Text auch Mitgliedern gegeben (Abweichung von F-007 bewusst entscheiden) oder (c) nur die Orga kann Platzhalter erinnern (Taste für Mitglieder ausblenden, Hinweis «Die Orga hat Lottes Link»). E2E-Fall ergänzen.
- Status: verifiziert (Reviewer 2026-10-23, Commit d8cbfe4): Code geprüft – Mitglieder erhalten für Platzhalter-Schuldner weder persönlichen noch allgemeinen Link (`texts: null`), `orgaTexts` ohne Betrag/IBAN; Orga behält den persönlichen Link; D1-Beschriftung passt. Gegengeprüft: Personen-Status/Erinnern (`trips/remind.ts`) und Cockpit „Wer ist dabei?“ (`cockpit/view.ts`) geben persönliche Links nur der Orga, Mitgliedern `nudgePlaceholder`; Unterkünfte-Erinnerungen (`stays/remind.ts`) adressieren nur Mitglieder mit Konto, kein Einladungslink. Neue E2E (HTML + RSC ohne `/i/`/Tokens, Text ohne €/IBAN/PayPal; Orga mit persönlichem Link) grün. — Developer (CEO-Entscheidung Option a): Neue reine Regel `costReminderChannel()` (`src/lib/costs.ts`): Mitglied mit Konto → Abrechnungs-Link; Platzhalter → persönlicher Link nur für die Orga, sonst „orga“; ehemalige/ich → keine Erinnerung. `costRemindData` (`src/features/costs/remind.ts`) rendert für Nicht-Orga bei Platzhalter-Schuldnern **keinen** Text mit Link (`texts: null`), sondern `orgaTexts` = `share.remind.nudgePlaceholder` (wie §14.2/Cockpit: „Hey {orga}, {name} fehlt noch bei {trip} – schickst du {name} den persönlichen Link? {Übersicht}“ – ohne Betrag/IBAN); der allgemeine Einladungslink kommt in Kosten-Erinnerungen nicht mehr vor. UI: Zeile in „Ausgleichen“ und Liste „Wer schuldet dir noch?“ zeigen „{Orga} Bescheid geben“ (aria „{Orga} Bescheid geben, dass {name} noch nicht dabei ist“), Sheet-Titel „{name} ist noch nicht dabei“, Hinweis „Den persönlichen Link für {name} hat nur {orga} …“ (`remind.placeholderText`); Cockpit D1 bei genau einem Platzhalter-Schuldner: Taste „{Orga} Bescheid geben“ statt „{name} erinnern“ (`d1Station`, neuer Schlüssel `route.costs.nudgeOrgaName`). Orga unverändert mit persönlichem Link. Weitere Stellen geprüft: Personen-Status/Erinnern (`trips/remind.ts`), Cockpit „Wer ist dabei?“ (`cockpit/view.ts`) geben Mitgliedern bereits nur „{Orga} Bescheid geben“; Unterkünfte-Erinnerungen betreffen nur Mitglieder mit Konto; Einladen-Seite zeigt Mitgliedern nur den allgemeinen Link zum Einladen neuer Personen (gewollt), persönliche Links nur der Orga. Tests: Unit `costReminderChannel` + D1-Fall in `trip-route-costs.test.ts`; E2E `increment-10-cockpit` „R-082: member owed by a placeholder …“ (kein `/i/`, kein persönlicher und kein allgemeiner Token in HTML/RSC von Cockpit und `/costs/balances`; Text ohne €/IBAN) und „R-082: organiser reminds a placeholder with the personal link“.

#### Hinweise ohne Finding (Inkrement 10)
- **Rechte/IDOR:** Alle Aktionen lösen die Reise über die eigene Mitgliedschaft auf; Ausgabe-, Ausgleichs- und Partei-IDs werden in `db.ts` gegen `trip_id` geprüft (zusätzlich zusammengesetzte FKs); Sperre, Phase, Abschluss, Version, Idempotenz (Schlüssel eindeutig je Reise, Wiederholung unter Sperre liefert dieselbe Ausgabe), Salden-Prüfung beim Markieren unter Sperre – je Zeile der Tabelle nachvollzogen. Orga markiert nicht zwischen zwei Konto-Mitgliedern (Server + E2E).
- Markieren akzeptiert jeden Betrag ≤ min(|A|, B) zwischen einem Schuldner und einem Gläubiger, nicht nur die Vorschlagszeile (per API ein „Teilbetrag“ möglich). Durch R.8 I10-06 so gedeckt, Berechtigte können es rückgängig machen – ok.
- `trip_settlement.amount_cents` ≤ 2 000 000 000 (int4), Salden können theoretisch darüber liegen (10 000 × 1 Mio.) → Markieren schlüge mit DB-Fehler fehl. Rein theoretisch, kein Finding.
- Summen-Trigger prüft bei `UPDATE … SET expense_id` nur die neue Ausgabe; die App ändert `expense_id` nie – ok.
- **Volle IBAN im Payload** der Kosten-Seiten für alle Mitglieder: durch Q35/R.8 („kein Zugriffsschutz“) gedeckt; nicht im Cockpit-Client-Payload, nicht in Teilen-/Erinnern-Texten, Mails, Logs, URLs, Storage (`localStorage` nur gesehene Ausgleichs-IDs). Lösch-Hinweismail nennt nur die Anzahl.
- Datenexport: selbst ergänzt – Notiz eigener (angelegter/bezahlter) Ausgaben fehlte (Notizfeld CEO-Entscheidung), jetzt `note` in `expensesAddedOrPaidByMe`.
- Bewertete Abweichungen: Parteien für alle aktiven Personen beim ersten Schreibvorgang – unkritisch (ungenutzte Parteien erscheinen nicht, Platzhalter-Löschung räumt sie weg, Nummern ehemaliger Mitglieder werden über `formerNumbers` lückenlos vergeben). Neue Ausgabe mit gerade gegangener Person → Feldfehler, kein Datenschaden – ok. Nicht umgesetzte Motion (FLIP, Ankerausgleich, Häkchen-Pop, Siegel) und Could „Als Ausgabe eintragen“ → für „Politur vor der Beta“ vormerken. Allgemeiner Link beim Platzhalter-Erinnern → R-082.
- CI: Audit-Schritt läuft lokal grün („No known vulnerabilities“). E2E-Laufzeit lokal 16,8 min für 3 Projekte; mit WebKit in CI bisher ≈ 21–25 min Gesamtlauf – Puffer zu 45 min ausreichend. WebKit lokal nicht installiert – CI-Lauf abwarten.


## Review Inkrement 11 – „Bucht“ + persönliche Reisedaten F-056/F-054, Security-Review G1b (Reviewer 2026-10-23, Commit 09bf2c2)

Geprüft gegen features.md R.9 (Rechte-Tabelle, Feldliste, Verschlüsselung Nr. 1–6, Löschtabelle I11-10, Sicherheit Nr. 1–7, Rate-Limits, Datenhaltung, I11-01–I11-13), W20 H, W16 v2.16, deployment.md §0.11, compliance-checklist §12. Lint, Typecheck, i18n, Format, 866 Unit-Tests, 27 DB-Tests (`pnpm test:db`), Build und volle E2E-Suite gegen `pnpm build && pnpm start` (desktop-, mobile-, preview-chromium: 488 grün, 3 übersprungen, 1 Flake – s. u.). Client-Bundle (`.next/static`) ohne `aes-256-gcm`, HKDF-Label, `TRAVEL_DATA_KEYS`. Zusätzlich eigener Lauf 360 px + 200 % Schrift (Bereich, Schritt 1/2, Freigabe, „Bucht“-Sicht maskiert/angezeigt, Orga-Status, Cockpit): kein Element in `main` außerhalb des Viewports; axe (200 %, Dark Mode) ohne ernste Verstöße; «Anzeigen» per Tastatur (Enter), Fokus bleibt auf der Taste («Hide Max's details»).

### R-083: „Bucht“ ohne Orga-Rolle erhält persönliche Platzhalter-Links (F-007)
- Schwere: mittel
- Datei: src/features/travel-data/remind.ts:55–70 (`pending`), Anzeige src/features/travel-data/components/travel-remind.tsx
- Problem / Reproduktion: Sara („Bucht“, nicht Orga) fragt an alle inkl. Platzhalter Mia an → `/travel-data` und Cockpit liefern im RSC-Payload für „Erinnern“ den Text `travelDataJoin` mit `inviteLink(placeholder.inviteToken)` – den **persönlichen** Link von Mia. Persönliche Links sind laut F-007/R-082 nur für die Orga (wer den Link hat, kann als Mia beitreten). CEO-Entscheidung 2026-10-23: Bucher ohne Orga-Rolle bekommen „{Orga} Bescheid geben“.
- Erwartetes Verhalten: Kein `/i/…`-Token im HTML/RSC für Nicht-Orga; Erinnern an Platzhalter geht an die Orga.
- Status: verifiziert (Reviewer selbst behoben, Commit 09bf2c2): Nicht-Orga erhält je Platzhalter `viaOrga` + Text `share.remind.nudgePlaceholder` (Link auf die Übersicht); Zeile zeigt «{Orga} Bescheid geben» (aria `travelData.remind.nudgeOrgaName`), Sheet-Titel/Hinweis wie R-082 (`remind.placeholderTitle`/`placeholderText`). Orga (mit Markierung) behält den persönlichen Link. Neue E2E „R-083 – personal placeholder links only for the organiser“ (HTML + `RSC: 1` von `/travel-data` und Cockpit ohne `/i/`, persönlichen und allgemeinen Token; Text an Lena; Orga-Gegenprobe mit `/i/<token>`) – grün auf desktop- und mobile-chromium. Zusätzlich im Haupt-Flow: Orga ohne Markierung – RSC-Payload von `/travel-data` und Cockpit ohne Werte und ohne Masken.

### R-084: Datenschutzerklärung ohne Abschnitt „Persönliche Reisedaten“
- Schwere: niedrig (Demo/Vorschau), Pflicht vor G1b
- Datei: messages/de.json, messages/en.json `legal.privacy.sections`, src/features/legal (PRIVACY_SECTIONS)
- Problem / Reproduktion: `/datenschutz` bzw. `/en/privacy` → keine Angaben zu Reisedaten (Zweck, Felder, Einwilligung Art. 6 Abs. 1 lit. a, Empfänger nur die anfragende Person, Zugriffsprotokoll, Löschregel 7 Tage/Widerruf, Export). Der Einwilligungstext (W20 C) verlinkt «Datenschutzhinweis» – dort steht nichts dazu. compliance-checklist §12.3 sieht den Platzhalter-Abschnitt „mit Inkrement 11“ vor (Text-Entwurf dort vorhanden).
- Erwartetes Verhalten: Abschnitt `travelData` (DE verbindlich + EN) nach dem Entwurf §12.3; Platzhalter-Marker nur so, dass der Produktions-Startschutz (§0a) bewusst greift (CEO/Operations entscheiden, ob der Abschnitt bis G1b nur bei `travelDataOn()` gezeigt wird).
- Vorschlag: Abschnitt in `PRIVACY_SECTIONS` ergänzen, Anker `#privacy-travelData` aus dem Einwilligungstext verlinken.
- Status: offen

#### Hinweise ohne Finding (Inkrement 11)
- **Krypto:** AES-256-GCM, 12-Byte-Zufallsnonce je Verschlüsselung (auch Ändern/Rotation), Tag 16 Byte erzwungen (`authTagLength`, Längenprüfung + DB-Check `octet_length`), AAD `ww-travel-data|v{schema}|trip|request|user` – vertauschte Zeile/Person/Version schlägt fehl (Unit-Test). Schlüssel-Parsing streng (kid-Format, reserviert `demo`, genau 32 Byte, Duplikate), ungültiger Ring → Start verweigert und **kein** Rückfall auf die Ableitung; Ableitung nur `development/ci/demo/preview`; staging/production ohne eigenen Schlüssel bzw. mit Schlüssel = `BETTER_AUTH_SECRET` → kein Start. Rotation: batchweise, `FOR UPDATE SKIP LOCKED`, idempotent, `--dry-run`, `--purge-unreadable` (Protokoll per Kaskade mitgelöscht), Exit 1 bei Resten, verweigert `demo`-Schlüssel in staging/production.
- **Rechte/IDOR:** Alle Aktionen lösen die Reise über die eigene Mitgliedschaft auf, jede Abfrage ist an `trip_id` gebunden (zusätzlich zusammengesetzte FKs Anfrage↔Reise, Antwort↔Mitgliedschaft). Entschlüsselt wird nur in `readOwnRelease` und `bookerAccess` (Markierung, eigene offene Anfrage, Antwort «freigegeben», Löschdatum, Re-Auth in derselben Transaktion). Orga ohne Markierung: `notBooker` für mask/view/copy auch mit fremder Request-ID; eigene nachträgliche Markierung öffnet bestehende Anfragen nicht; Export ohne fremde Werte – DB-Tests je Zeile. Max. 3 Bucher unter Reise-Sperre; Platzhalter haben keine Mitgliedschaftszeile und sind nie markierbar.
- **Re-Auth:** eigener Marker `travel-reauth-<session>` (12 h), gesetzt nur bei Code-/Magic-Link-Anmeldung bzw. bestätigtem Code; Passwort zählt nicht; Identifier nicht von Nutzern erzeugbar; bei Konto-Löschung mit entfernt.
- **Bewusst toleriert:** Die eigene Dokumentnummer ist für die Person ohne Re-Auth abrufbar (W20 D „Anzeigen“, Formular „Angaben ändern“ vorbelegt) – die Re-Auth-Sperre im Export (I11-11, Should) schützt bei übernommener Sitzung daher nur begrenzt. Für G1b bewerten.
- **Klein, später:** Zugriffsprotokoll > 1 000 Einträge löscht die ältesten statt sie zusammenzufassen (R.9: „zusammengefasst“). D3 «erledigt» erscheint nach Löschdatum erst nach dem nächsten Löschjob-Lauf (Lese-Pfad liefert vorher schon nichts). Runbook A Schritt 5 (UI-Hinweis nach `--purge-unreadable`) fehlt – vor G1b. `readOwnRelease` liefert der Person ihre eigenen Werte bei aufgehobener Festlegung > 30 Tage noch bis zum Job (nur eigene Daten). Bei 200 % Schrift ist das Dokument 3 px breiter als 360 px (außerhalb von `main`, auch im Cockpit – nicht Inkrement 11).
- **E2E-Flake:** `increment-9-stays.spec.ts:242` (axe `document-title` während des Streamings) – 1× rot im Volllauf, 4/4 grün einzeln; vom Entwickler bereits beobachtet, CI-Retry fängt es ab. Laufzeit lokal 25,1 min für 3 Projekte (4 Kerne); CI-Puffer 45 min mit WebKit knapp ausreichend – beobachten.


## Review Inkrement 11a – Kosten v2, Kosten-Leiste, App-Start in der laufenden Reise, Geldformat, M-P4 (Reviewer 2026-10-24, Commit e2a34f9 → c025eec + Nachtrag)

Geprüft gegen W19 E (E.2 Glossar, E.4, E.5, E.6, E.10, E.12), Mockup `kosten-v2`, W16 v2.17 Fassung 2 und v2.18, `src/lib/money.ts`, `tokens.css` (M-P4). Lint, Typecheck, i18n, Format, 906 Unit-Tests, 27 DB-Tests, Build und volle E2E-Suite gegen `pnpm build && pnpm start` (desktop-, mobile-, preview-chromium: **512 grün, 4 übersprungen, kein Flake**); nach den Review-Fixes erneut Build + `increment-10*`/`increment-11a` (79 grün). Eigene Proben (Playwright, 412 px/1280 px, hell/dunkel, DE, Konto AT): Kosten, Ausgleichen, Cockpit-Leiste, 200 % Schrift, App-Start, Login-`next`.

### R-085: Kompaktzeile „Ausgleiche der anderen“ trennt Avatar und Name beim Umbruch
- Schwere: niedrig
- Datei: src/features/costs/components/costs-view.tsx (`CompactPair`), costs.module.css
- Problem / Reproduktion: 412 px, Zeile «Lena Berg → Member 1 · 100,00 € · offen» → Umbruch zwischen Avatar „M1“ und dem Namen „Member 1“ (Avatar am Zeilenende, Name allein in Zeile 2).
- Erwartetes Verhalten: E.10 – Zeile darf zweizeilig werden, Person (Avatar + Name) bleibt zusammen.
- Status: verifiziert (Reviewer selbst behoben): je Person ein `compactPerson`-Span (inline-flex); Screenshot geprüft, E2E grün.

#### Selbst behoben / umgesetzt (Inkrement 11a)
- `src/lib/costs.test.ts` „server path < 100 ms“: auch ohne Last 1 von 3 Läufen rot (267 ms, GC-Pause bei 300 000 Zeilen) → Bestwert aus drei Läufen; 5/5 grün.
- Designer-Nachträge D-81–D-87: Leisten-Taste in der statischen Karte volle Breite (200 %: Taste 298 von 348 px), Leisten-Titel `--ww-text-meta`, „Ausgleiche der anderen“ auf Fläche (`surface`, `radius-card`), `.payCard`-Rahmen 1,5 px `border-subtle`; `illustrations.json` per `sync-design-assets.ts` mit den M-P4-Assets (hero/heatmap) synchronisiert – ohne Sync schlug `scripts/design-assets.test.ts` fehl.

#### Hinweise ohne Finding (Inkrement 11a)
- **Sicherheit E.6:** `costsModel()` gibt Zahlungsinfos nur für die eigene Person und die Empfänger der eigenen offenen Überweisungen heraus, `markiert von/am` nur für eigene bzw. Orga-only-Zeilen; Salden anderer werden nicht als Liste geliefert (aus Ausgaben + Aufteilung ableitbar – laut E.6 sichtbar, also kein Leck). Unit-Tests `load.test.ts` + E2E (HTML/RSC ohne fremde IBAN) grün. Weitere Datenpfade (`sheet-context`, `remind`, `costStatus`) geben keine fremden Zahlungsinfos heraus.
- **Open Redirect:** Neue Start-Weiterleitung nutzt nur `tripPath(publicId)` aus der DB; alle `next`-Werte laufen weiter durch `toSafeInternalPath`. Probe `/login?next=//evil.example` und `?next=https://evil.example` → App-Start (laufende Reise), `next=/trips/{id}/costs` → Ziel.
- **App-Start:** `/` mit 0/1/2 laufenden Reisen, Abreisetag ja/Vortag nein, `/trips` leitet nie weiter, einmaliger Hinweis, `next` hat Vorrang – E2E grün. Wortmarke angemeldet → `/trips`, ← im Cockpit «Meine Reisen».
- **Geld:** ein Formatierer, Sprache statt Region (`de-CH`/`de-AT` → «1.200,00 €», `en-US` → «€1,200.00»); Probe mit AT-Konto ohne «€ 500,00».
- **Kontrast:** Leisten-Stand Minze auf `surface-sunken` 4,64:1 bei 700 (AA erfüllt, Fettung muss bleiben); dunkel deutlich höher. M-P4: Zahl Indigo auf Minze 8,7:1, Rang-Pille eigene Farbe `--ww-hm-suggest-fg` (13,7 / 11,5).
- **Glossar:** keine «bezahlt», «Saldo/Salden», «Ausgaben gesamt», «schuldest», «ausgeglichen» in `de.json`, Mails, Teilen-Texten.
- **Bewertete Abweichungen:** (1) „Erledigt“-Block der Orga enthält auch erledigte Orga-only-Zeilen (Platzhalter ↔ ehemalig) – sinnvoll, sonst wären sie nirgends rücknehmbar; ok. (2) Akkordeons ohne Höhen-Animation (E.11 „Standard-Akkordeon base“) – für „Politur vor der Beta“ vormerken. (3) Leiste erscheint nicht, wenn die Kachel sofort sichtbar ist – entspricht W16 v2.17 („Seite kürzer als ein Bildschirm“), keine Abweichung.
- **Hinweis Arbeitsweise:** Während des Reviews lagen unkommittierte Designer-Änderungen im selben Arbeitsverzeichnis (Assets ohne Sync → Unit-Test rot). Asset-Änderungen künftig immer zusammen mit `node scripts/sync-design-assets.ts` committen.

## Review P1-B0 „Freundes-Beta Stufe B“ (Gate G0) – `APP_ENV=beta`, Beta-Code/Pässe, PWA, Rechtstexte (Reviewer 2026-10-30, Commits 9ced08e → c955dca)

Geprüft: alle Commits seit `origin/main`. Lint, Typecheck, i18n, Format, Unit (947 + neue), test:db (27), Build, E2E komplett gegen Produktions-Build (desktop 252, mobile 254, preview 6, beta 13 → nach Review 16; 4 viewport-bedingte Skips) – alles grün.

### R-086: Feedback-Text enthält auf der Einladungsseite den Reisenamen
- Schwere: mittel
- Datei: src/lib/pwa.ts:84 (`feedbackArea`), src/features/beta/components/feedback.tsx:36
- Problem / Reproduktion: Angemeldet `/i/<token>` einer Reise „Geheimreise Porto“ öffnen → Avatar-Menü → „Feedback geben“. Der Bereich wird aus `document.title` genommen; die Einladungsseite heißt `„<Reisename> · Wir wollen weg“` → vorausgefüllter WhatsApp-/Mail-Text „Bereich: Geheimreise Porto“. Verstößt gegen §0.12.4 Nr. 11 / W23 D.2 / compliance §13.4 Nr. 10 („keine Reisen oder Namen“). Dasselbe gälte für `travelData.answerPageTitle` („Reisedaten für {name} …“, in beta aus).
- Erwartetes Verhalten: Bereich ohne Reisenamen/Personennamen.
- Vorschlag: feste Bezeichnung je Pfad für Seiten, deren Titel mit Nutzerinhalt beginnt.
- Status: verifiziert (Reviewer selbst behoben: `/i/*` → „Einladung“, `/trips/*/travel-data*` → „Reisedaten“, i18n `feedback.areas.*`; Unit-Test `pwa.test.ts`, E2E `beta.spec.ts` „feedback text on an invite page never carries the trip name“)

### R-087: Beta-/Einladungs-Pass fiel ohne `BETTER_AUTH_SECRET` auf einen öffentlich bekannten Schlüssel zurück
- Schwere: niedrig (Startschutz verhindert den Fall bereits, Verteidigung in der Tiefe)
- Datei: src/server/beta/index.ts:52 (`secret()`)
- Problem / Reproduktion: Fehlt `BETTER_AUTH_SECRET` in einer Instanz, in der `instrumentation.ts` nicht lief, signiert `secret()` mit dem im öffentlichen Repo stehenden Wert `dev-only-beta-pass-secret-…` → Pässe mit Zustimmung wären fälschbar → Konto ohne Beta-Code.
- Erwartetes Verhalten: fail closed wie `deriveEmailLimitKey` (R-028).
- Status: verifiziert (Reviewer selbst behoben: fester Schlüssel nur in `development`/`ci`, sonst Fehler)

### R-088: `vercel-ignore.ts` baut Branch-/Preview-Deployments, die `vercel-build.ts` dann rot abbricht
- Schwere: niedrig
- Datei: scripts/vercel-ignore.ts:13
- Problem / Reproduktion: Beta-Projekt, Push auf `main` (Vercel-Preview-Deployment). Ist `APP_ENV` dort nur für „Production“ gesetzt, gilt auf Vercel `preview` → `branchForAppEnv` = `main` = Zweig → „building“ → `vercel-build.ts` bricht mit „only the production deployment“ ab → jeder `main`-Push erzeugt ein rotes Deployment im Beta-Projekt (keine Migration, aber Verwirrung beim Auftraggeber, Fall B der Anleitung).
- Erwartetes Verhalten: Nicht-Production-Deployments werden übersprungen.
- Status: verifiziert (Reviewer selbst behoben: `VERCEL_ENV` ≠ `production` → Exit 0; Unit-Test `scripts/vercel-ignore.test.ts`)

### R-089: E-Mail-Adresse in `sessionStorage` nicht in compliance §13.5 beschrieben
- Schwere: niedrig (Doku, Operations)
- Datei: src/features/auth/components/email-access-form.tsx (Übergabe A.5 → `/beta` → `/login?from=beta`, `BETA_EMAIL_STORAGE_KEY`)
- Problem / Reproduktion: Neue Adresse auf `/login` ohne Pass → Code richtig → „Fast – dir fehlt noch der Beta-Code“ → Taste → Adresse liegt in `sessionStorage`, bis `/login?from=beta` sie liest oder der Tab geschlossen wird. §13.5 nennt `sessionStorage` nur „Formularzustand, nur App-Modus, keine Codes“.
- Erwartetes Verhalten: Zeile in §13.5 ergänzen („E-Mail-Adresse zur Übergabe zwischen Beta-Schritten, endet mit dem Tab bzw. beim Lesen gelöscht“). Code-Änderung nicht nötig.
- Status: behoben (CEO 2026-10-30, compliance §13.5 ergänzt)

#### Bewertete Abweichungen des Developers (alle akzeptiert)
1. **Zustimmung vor „Code senden“ im Einladungsweg** (W23: Z4a beim Namen): technisch zwingend – das Konto entsteht beim Prüfen des Codes, der Hook braucht die Zustimmung vorher; vorher ist ohne Konto-Ermittlung nicht bekannt, ob die Adresse neu ist. Folge: auch Bestandskonten sehen auf `/i/*` den Haken (W23 Z4b „keine Checkbox“) – vertretbar. UX bitte W23 A.8 nachziehen.
2. **E-Mail-Übergabe per `sessionStorage`**: ok, Doku siehe R-089.
3. **`Clear-Site-Data` nur bei HTTP-Abmeldung und `/goodbye`** + clientseitiges Leeren der `ww-*`-Caches bei der Server-Action-Abmeldung: ok – der Cache enthält nachweislich keine personenbezogenen Daten (E2E-Cache-Inspektion).
4. **Kontenlimit ohne Advisory-Lock**: ok für 50 Personen (gleichzeitige Registrierungen bei 49 können 51–52 ergeben).
5. **Landing/Hilfe/Rechtstexte pro Anfrage gerendert** (`connection()`): richtig – Modus ist Laufzeitkonfiguration; Build zeigt nur `/_not-found` und `/offline` statisch (beide modusunabhängig).
6. **Rate-Limit-Ereignisse 25 h**: ok (Tagesfenster + 1 h, Schlüssel pseudonym).
7. **Inline-Script auf `/offline`**: ok (CSP Stufe 1 ohne `script-src`; vor CSP Stufe 2/G1 Hash ergänzen).
8. **Nicht gebaut** (Akkordeon-Animation, Feedback im Reise-Menü, einige Zurück-Wege, Variante-A-UI, Lettermint-HTTP-Fallback): nicht blockierend für G0; Fallback nur bauen, falls der erste SMTP-Versand von Vercel scheitert.
9. **Konto entsteht im Einladungsweg schon beim Code** (§0.12.5 Nr. 9 „Konto nur, wenn der Beitritt gelingt“): Hook prüft Einladung + Platz vorab; bricht die Person beim Namen ab, bleibt ein Konto ohne Reise – unkritisch.

#### Hinweise ohne Finding (P1-B0)
- **Fail closed auf allen Wegen:** Konten entstehen nur über `internalAdapter.createUser` (E-Mail-OTP, Magic Link; `/sign-up/email` ist `disableSignUp`) → `databaseHooks.user.create.before` → `enforceBetaSignup`. Ohne Header/Cookie → `BETA_SIGNUP_REQUIRED`. Neue E2E-Tests: Magic Link ohne Pass → kein Konto, A.5-Zustand; `POST /api/auth/sign-up/email` → abgelehnt, kein Konto.
- **Pässe:** HMAC-SHA-256, Schlüssel per HKDF mit eigenem `info` je Cookie, `timingSafeEqual`, Alter ≤ 24 h (+60 s Uhrversatz), `kid`-Bindung (Rotation beendet offene Pässe), kein Code/keine Adresse/kein Token im Cookie. E2E neu: `httpOnly`, `Secure`, `SameSite=Lax`, Laufzeit 24 h, manipulierte Zustimmung → wertlos. Code-Vergleich über alle Codes ohne frühe Rückkehr.
- **Konto-Ermittlung:** `/beta` adressunabhängig; Code-Anforderung neutral (Versand im Hintergrund, 30/Tag-Kappe still); Ablehnung erst nach bewiesenem Postfach. Logs im E2E-Lauf nur Zähler (`beta_code.*`, `beta_signup.*`) – keine Adressen, Codes, IPs.
- **Kanonischer Host:** Ziel immer `APP_URL`-Origin + Pfad → kein Open Redirect; Ausnahmen nur Löschjob/Health.
- **Service Worker:** nur GET/gleiche Origin, Navigation network-first → `/offline`, Cache nur Precache + `/_next/static`; Notschalter löscht `ww-*` und meldet ab; in preview/dev nicht registriert (E2E).
- **Startschutz:** Regeln Nr. 1–16 mit Unit-Tests; Platzhalter-Prüfung in beta auf `beta`, `legalBeta`, `mail` – die übrigen `[PLATZHALTER`-Texte (`legal.privacy/imprint`) sind in beta nicht erreichbar (`LegalPage` → `BetaLegalPage`).
- **Rechtstexte:** `legalBeta` entspricht compliance §13.4 wörtlich, `beta.privacy.p1–p6` §13.6, Mail-Footer §13.6.
- **Bestehende Modi:** preview weiter Basic Auth + Demo-Postfach (E2E preview grün), Migration 0013 nur nullable Spalten (rückwärtskompatibel), `vercel-build` ohne Seed in beta, beta nur aus Zweig `beta`.
- **Nebenbefund:** im E2E-Log einmal `pg` DeprecationWarning „client.query() when the client is already executing a query“ (vermutlich parallele Abfragen auf einem Client) – nicht beta-spezifisch, beobachten.
