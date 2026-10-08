# Review-Findings

Stand: 2026-10-08 · Reviewer (abgelegt durch CEO mit Freigabe des Auftraggebers) · Bezug: P1-0 (Scaffold) + P1-0a (Auth-Spike), PR #4 (gemergt)

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
| R-007 | niedrig | Ungültige Einladung ohne `h1` | behoben – bitte prüfen |
| R-008 | niedrig | Doku-Abweichungen (sitemap §4, deployment §0.2) | verifiziert |
| R-009 | niedrig | CI nutzt `pnpm/action-setup@v4` mit pnpm 12 | verifiziert (bewusst gepinnt) |
| R-010 | niedrig | Client konnte Session-IP über `x-ww-client-ip` fälschen | verifiziert |
| R-011 | hoch | `handleAuthRequest` stürzt auf Node 24 ab (CI rot) | verifiziert |
| R-012 | niedrig | Magic-Link-Fehlerseite ohne Seitenrahmen | verifiziert |
| R-013 | niedrig | Netzwerkfehler weicht von Flow H.5 Schritt 3e ab | behoben – bitte prüfen |
| R-014 | niedrig | Eigene IP-Auflösung doppelt zu Better Auth | offen (später entscheiden) |
| R-015 | niedrig | Hydration-Warnung auf `/auth/magic` (`method="POST"` am Formular mit Action) | behoben – bitte prüfen |

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
- Status: behoben – bitte prüfen

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
- Status: behoben – bitte prüfen

### R-014: Eigene IP-Auflösung doppelt zu Better Auth
- Schwere: niedrig (Codequalität) · Datei: `src/server/auth/client-ip.ts`
- Hinweis: Better Auth 1.7.7 bietet `advanced.ipAddress.trustedProxies`/`ipv6Subnet` und `disabledPaths`. Eigene Lösung ist korrekt (400 statt Sammeltopf) und darf bleiben.
- Status: offen (später entscheiden)

### R-015: Hydration-Warnung auf /auth/magic
- Schwere: niedrig · Datei: `src/features/auth/components/magic-link-form.tsx`
- Problem (CEO beim manuellen Durchklicken, `pnpm dev`): React meldet „Cannot specify a encType or method for a form that specifies a function as the action“ und einen Hydration-Mismatch (`method="post"` vs. `"POST"`). Für Nutzer ohne Auswirkung, erzeugt aber das Next-Dev-„Issue“.
- Erwartet: keine Hydration-Warnungen; Funktion ohne JS bleibt erhalten (React setzt Methode bei Function-Actions selbst).
- Umsetzung (Schritt 0a): `method="post"` entfernt; Browser-Konsole auf `/auth/magic` ohne Hydration-Warnung geprüft; E2E „POST signs in without JavaScript“ weiter grün.
- Status: behoben – bitte prüfen
