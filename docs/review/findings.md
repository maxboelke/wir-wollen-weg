# Review-Findings

Stand: 2026-10-08 · Reviewer · Bezug: P1-0 (Scaffold) + P1-0a (Auth-Spike), PR #4 (gemergt); Schritt 0a „UI-Fundament“ (Commit a6063e9)

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
| R-016 | mittel | Code-Feld: kein sichtbarer Fokus, wenn alle 6 Ziffern stehen | offen |
| R-017 | mittel | Eintritts-Animationen laufen bei Hydration – Inhalt blinkt weg und blendet neu ein | offen |
| R-018 | niedrig | Schritt 0a unvollständig: Footer mit Hilfe-Link und Radio-Komponente fehlen | offen |
| R-019 | niedrig | Bottom-Sheet: Fokus kehrt erst nach der Austritts-Animation zurück, Seite bis dahin inert | offen |
| R-020 | niedrig | Fokus-Ringe im Kontrastmodus (forced colors) unsichtbar | verifiziert (vom Reviewer behoben) |

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
- Offen für Inkrement 1 (hoch priorisiert): Limits pro E-Mail-Adresse.
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
- Status: offen

### R-017: Eintritts-Animationen laufen bei Hydration – Inhalt blinkt weg und blendet neu ein
- Schwere: mittel (sichtbarer Fehler beim ersten Eindruck, W03 Einladung)
- Dateien: `src/components/enter.tsx` (genutzt in `src/app/(app)/i/[token]/page.tsx:40,62`), `src/components/stagger-enter.tsx` (`/trips`)
- Problem / Reproduktion: Die Seite ist serverseitig gerendert und sofort sichtbar; `Enter`/`StaggerEnter` starten ihre Animation erst in `useLayoutEffect` nach der Hydration mit `opacity: 0` (`fill: backwards`). Gemessen (Playwright, `/i/<token>`, Reisekarte-h1, Opazität pro Frame): ohne Drosselung sichtbar ab 26 ms → **0 bei 142 ms** → Einblenden bis 406 ms; bei CPU ×6 (Mittelklasse-Handy) sichtbar ab 112 ms → **0 bei 813 ms** → Einblenden bis 1077 ms. Nutzer sehen die Einladungskarte ~0,7 s, dann verschwindet sie und kommt neu. Gilt auch mit reduzierter Bewegung (Überblenden bleibt). Widerspricht interaktionen.md §4 „Texte/CTA ohne Warten auf Animation lesbar“ und motion-system §6.1 (Zustand zuerst).
- Erwartetes Verhalten: Beim ersten Laden (SSR) keine erneute Eintritts-Animation für bereits gemalte Inhalte; Eintritt nur bei clientseitiger Navigation (G-01) bzw. wenn der Inhalt vor dem ersten Paint verborgen war.
- Vorschlag: Eintritt nur abspielen, wenn das Element nicht schon gemalt wurde – z. B. Modul-Flag „erste Hydration“ (beim Hard-Load überspringen, bei Client-Navigation abspielen) oder CSS-Startzustand nur unter einem im Head-Skript gesetzten Attribut (`html[data-js]`), damit ohne JS weiterhin alles sichtbar bleibt. E2E: Opazität der Reisekarte fällt nach dem ersten Paint nie auf 0.
- Status: offen

### R-018: Schritt 0a unvollständig: Footer mit Hilfe-Link und Radio-Komponente fehlen
- Schwere: niedrig
- Dateien: `src/components/page-shell.tsx`, `src/components/ui/`
- Problem / Reproduktion: Roadmap 0a nennt „Schalter/Checkbox/**Radio**“ und „Seitenrahmen (Header, **Footer mit Hilfe-Link**, Sprachumschalter)“. `PageShell` rendert nur Header + `main` (kein `<footer>` auf `/login`, `/i/…`, `/auth/magic`, `/trips`); eine Radio-Komponente gibt es nicht (auch nicht in `/dev/ui`). ux-spec 3.2.6: «Hilfe» im Footer auf allen Seiten; design-system §9 (Sprachumschalter): Footer-Segment „Deutsch | English“.
- Erwartetes Verhalten: Footer-Gerüst im Seitenrahmen (Hilfe-Link, Sprach-Segment), Radio(-Gruppe) als Basis-Komponente – oder bewusste Verschiebung durch CEO/PM in die Roadmap (Hilfe-Seite F-051 existiert noch nicht, Ziel `/de/hilfe`).
- Vorschlag: Mit Inkrement 1 (Code-Schritt, F-051-Hilfelinks) nachziehen; Radio spätestens mit W08-Werkzeugleiste/Abstimmung.
- Status: offen

### R-019: Bottom-Sheet: Fokus kehrt erst nach der Austritts-Animation zurück, Seite bis dahin inert
- Schwere: niedrig
- Datei: `src/components/ui/bottom-sheet.tsx:60-76`
- Problem / Reproduktion: Beim Schließen läuft die Austritts-Animation am noch **modal offenen** `<dialog>`; `returnFocus.current?.focus()` wird währenddessen aufgerufen und scheitert (Seite ist inert). `/dev/ui` → „Bottom-Sheet öffnen“ → Esc: Fokus direkt danach weiter auf der Sheet-Überschrift, erst nach `dialog.close()` (~220 ms, nativer Fokus-Rückgabe) auf dem Auslöser. Bis dahin sind Tipps auf die Seite wirkungslos. interaktionen.md G-05b: „Fokus zurück auf Auslöser (sofort)“; §4: keine Animation blockiert Eingaben.
- Erwartetes Verhalten: Fokus sofort auf dem Auslöser, Seite sofort bedienbar.
- Vorschlag: Beim Schließen sofort `dialog.close()` und den Austritt über ein Klon-/Overlay-Element bzw. `@starting-style`/`transition-behavior: allow-discrete` (`overlay`, `display`) per CSS animieren; oder vor der Animation `inert`-Wirkung aufheben (z. B. Dialog per `close()` schließen und nicht-modal (`show()`) bis Animationsende halten).
- Status: offen

### R-020: Fokus-Ringe im Kontrastmodus (forced colors) unsichtbar
- Schwere: niedrig (vom Reviewer behoben)
- Dateien: `src/components/ui/button.module.css`, `cockpit.module.css`, `switch.module.css`, `field.module.css`, `code-field.module.css`, `language-switch.module.css`, `src/components/page-shell.module.css`
- Problem: `outline: none` + Ring über `box-shadow`; im Kontrastmodus entfernt der Browser `box-shadow` → kein Fokus an Minze-Taste „Reise planen“, „Anmelden“ im Hero, Marke/Sprachumschalter auf Indigo, Cockpit-Tabs/-Tasten, Schalter, Textfeld, Code-Feld (Playwright `forcedColors: 'active'`, Screenshot).
- Umsetzung: `outline: var(--ww-focus-width) solid transparent` statt `none` – im Normalmodus unsichtbar, im Kontrastmodus vom System eingefärbt. Geprüft: Fokus in forced colors sichtbar, Normalmodus unverändert.
- Status: verifiziert
