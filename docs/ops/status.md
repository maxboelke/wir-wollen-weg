# Status-Board – Wir wollen weg

Stand: 2026-10-09 · Gepflegt von: Operations Manager (Aktualisierung durch CEO nach jedem Agent-Bericht) · Bezug: [roadmap.md](../product/roadmap.md), [features.md](../product/features.md)

Status: **geplant** · **in Arbeit** · **im Review** · **fertig** (Reviewer ✅ bzw. CEO-Abnahme bei Konzeptdokumenten) · **blockiert** · **zurückgestellt** (bewusst bis Go-Live verschoben, nicht blockierend)

**Betriebsmodus:** Offline-Demo (lokal, Docker Compose + Mailpit, keine Konten/Abos) – [deployment.md §0](deployment.md). Übergang in den Echtbetrieb nur über das [Go-Live-Gate](go-live.md); **der CEO erinnert den Auftraggeber spätestens 6 Wochen vor dem gewünschten Beta-Start** (bzw. bei Beginn P1-5).

## Aktuelle Phase

**Phase 1 – MVP, Inkrement 1 im Review** (M0 abgenommen 2026-10-08; Schritt 0a „UI-Fundament“ fertig, PR #5 gemergt; Review-Fixes R-021–R-031 in Nachprüfung). Entwicklung und Abnahme laufen lokal als Offline-Demo.

## Übersicht

| ID | Aufgabe | Agent | Feature-IDs | Status | Abhängig von | Ergebnis / Ablage |
|---|---|---|---|---|---|---|
| P0-1 | Produktkonzept (PRD, Features, Roadmap) inkl. Entscheidungen Q1–Q6 | product-manager | alle | **fertig** (2026-10-08) | – | `docs/product/` |
| P0-2 | Sitemap, Flows, Wireframes (mobil zuerst, In-App-Browser-Fall, Code-Eingabe, Sprachumschalter, Wochenstart) | ui-ux | F-001–F-017, F-040–F-046 | **fertig** (2026-10-08, CEO-Abnahme Konzept; W01–W15, Flows A–K) | P0-1 | `docs/ux/` |
| P0-3 | Design-System, Tokens (`tokens.css`), barrierefreie Heatmap-Skala, Feiertags-/Wochenend-Darstellung | designer | F-008, F-005, F-016, F-046 | **fertig** (2026-10-08, CEO-Abnahme Konzept; design-system v0.4) | P0-1 | `docs/design/` |
| P0-4 | Tech-Stack, Auth-Konzept, i18n, Feiertage, Mail-Anbieter, Hosting, CI, Compliance-Checkliste, Status-Board | operations-manager | F-040–F-043, F-046, F-016, F-013 | **fertig** (2026-10-08, CEO-Empfehlung an Auftraggeber; Stack-Freigabe Teil von M0) | P0-1 | `docs/ops/`, `.github/` |
| P0-5 | Abstimmung Designer ↔ UI/UX | designer, ui-ux | – | **fertig** (2026-10-08; D-1–D-18, U-1–U-14 geklärt, D-16 durch CEO entschieden) | P0-2, P0-3 | `docs/design/abstimmung-ux.md`, `docs/ux/abstimmung-design.md` |
| P0-6 | Entscheidungen Auftraggeber: Betreiber/Impressum, Domain, Hosting-/Mail-Accounts, Rechtstexte-Weg | CEO → Auftraggeber | – | **fertig** (2026-10-08: Offline-Demo, Platzhalter-Rechtstexte; echte Angaben/Konten zurückgestellt bis Go-Live, Q14–Q16) | P0-4 | PRD §12, [go-live.md](go-live.md) |
| P0-7 | Abnahme M0 | CEO | – | **fertig** (2026-10-08, Auftraggeber; Konzept-PR gemergt, Stack freigegeben) | P0-2 … P0-6 | – |

### Phase 1 – MVP (Inkremente laut Roadmap)

| ID | Inkrement | Agent | Feature-IDs | Status | Abhängig von |
|---|---|---|---|---|---|
| P1-0 | Projekt-Scaffold nach `docs/ops/tech-stack.md` (Next.js, pnpm, Drizzle, next-intl, ESLint/Prettier, Vitest, Playwright, Docker-Compose dev mit PostgreSQL + Mailpit, `compose.demo.yml` + Platzhalter-Startschutz (deployment.md §0), Skript-Vertrag für CI) | developer → reviewer | – | **fertig** (PR #4 gemergt 2026-10-08; T2-Gerätetest offen → OPS-10) | M0 ✅ |
| P1-0a | Spike Auth: Kombi-Mail Code + Magic-Link, „angemeldet bleiben“ bei OTP (tech-stack.md §11, T1) – **lokal mit Mailpit, ohne In-App-Browser-Gerätetest**; T2 (WhatsApp/Instagram) später per Tunnel oder Staging | developer → reviewer | F-040, F-041 | **fertig** (PR #4 gemergt 2026-10-08; T2-Gerätetest offen → OPS-10) | P1-0 |
| P1-0c | Schritt 0a „UI-Fundament“ (Look & Feel 2.0: Design-System v1.0 „Reise-Cockpit“, Indigo & Minze, Motion-System) | designer, motion-designer, developer → reviewer | F-046 (Basis) | **fertig** (PR #5 gemergt; Reviewer ⚠️ mit Anmerkungen, R-016–R-019 → Inkrement 1) | P1-0 |
| P1-0b | Demo-Seed `db:seed:demo` (synthetische Personen `@demo.test`, Reisen in allen Phasen, relative Daten) – wächst mit jedem Inkrement | developer | – | **geplant** | P1-0; Ausbau mit P1-2 … P1-5 |
| P1-1 | Inkrement 1: i18n-Gerüst (DE/EN) + Konto-Basis: Registrierung, Login/Logout, Zugangswiederherstellung, Konto (E-Mail/Passwort mit Re-Auth, „Bewegung reduzieren“), Hilfelinks F-051, Limits pro E-Mail | developer → reviewer | F-046, F-040, F-041, F-042, F-051 | **im Review** – Fixes R-021–R-031 in Nachprüfung durch den Reviewer (`docs/review/findings.md`); tech-stack.md §3.2 auf Ist-Stand (v1.2) | P1-0, P1-0a, P1-0c |
| P1-2 | Reise anlegen, einladen, Beitritt im Einladungsflow, Rollen, „Meine Reisen“ | developer → reviewer | F-001, F-002, F-003, F-004, F-044 | **geplant** | P1-1 |
| P1-3 | Verfügbarkeit manuell + Status + Feiertage/Wochenenden | developer → reviewer | F-005, F-007, F-016 | **geplant** | P1-2 |
| P1-4 | Heatmap + Kandidaten-Berechnung | developer → reviewer | F-008, F-009 | **geplant** | P1-3 |
| P1-5 | Abstimmung & Festlegung (inkl. ICS) | developer → reviewer | F-010, F-011, F-012 | **geplant** | P1-4 |
| P1-6 | Datenschutz-Funktionen & Konto löschen (inkl. Retention-Job) | developer → reviewer | F-013, F-043 | **geplant** – **Notiz (Review Inkrement 2):** `trip_member.user_id` kaskadiert; löscht eine Orga ihr Konto, bliebe eine Reise ohne Orga → beim Konto-Löschen (F-043) **vorher Übergabe der Orga-Rolle oder Löschen der Reise erzwingen** (Retention-Job bei Inaktivität ebenso) | P1-2 (Konto/Reise), vor M2 Pflicht |
| P1-7 | Should-Features nach Kapazität | developer → reviewer | F-015, F-017 | **geplant** | P1-5 |

### Betrieb & Recht (Operations, parallel zu Phase 1)

| ID | Aufgabe | Agent | Bezug | Status | Abhängig von | Fällig |
|---|---|---|---|---|---|---|
| OPS-1 | Hosting-Account, AVV, VM, Compose, Caddy, DNS, Staging (deployment.md §5.1) | operations-manager | – | **zurückgestellt bis Go-Live** (Auftraggeber 2026-10-08) | Go-Live-Gate Stufe 1 | mit Go-Live-Planung |
| OPS-2 | Mail-Anbieter einrichten, SPF/DKIM/DMARC, Bounce-Webhook | operations-manager | F-040–F-043 | **zurückgestellt bis Go-Live** (Auftraggeber 2026-10-08); bis dahin Mailpit | Go-Live-Gate Stufe 1 | ≥ 4 Wochen vor Beta (DMARC-Vorlauf) |
| OPS-3 | `deploy.yml` (Image → GHCR → Staging automatisch, Prod mit Freigabe) | operations-manager | – | **zurückgestellt bis Go-Live** | P1-0, OPS-1 | vor M1 |
| OPS-4 | Backups + Restore-Test, Uptime- und Fehler-Monitoring (Bugsink) | operations-manager | – | **zurückgestellt bis Go-Live** | OPS-1 | vor M1 |
| OPS-5 | Impressum + Datenschutzerklärung DE (M1), EN + Nutzungsbedingungen (M2) | operations-manager (Entwurf) → Rechtsprüfung | F-013, F-046 | **zurückgestellt bis Go-Live** (Auftraggeber 2026-10-08); für die Demo nur Platzhalterseiten nach compliance-checklist.md §0a (Developer) | Go-Live-Gate Stufe 2a (Betreiber, Rechtstexte-Weg) | M1 / M2 |
| OPS-6 | VVT, AVV-Liste, Löschkonzept final, Datenpannen-Prozess | operations-manager | F-013, F-043 | **geplant** (Vorarbeit ohne Betreiberangaben möglich; Abschluss mit Go-Live-Gate) | Go-Live-Gate Stufe 2a | M1 / M2 |
| OPS-7 | Claude-Code-SessionStart-Hook (`pnpm install`) in `.claude/settings.json` | CEO / developer | – | **geplant** | P1-0 | mit Scaffold |
| OPS-9 | Go-Live-Gate vorbereiten: Markenrecherche „Wir wollen weg“ + „When do we go?“, Domain-Verfügbarkeit, Angebotscheck Hetzner/Lettermint – **Erinnerung an Auftraggeber durch CEO** | operations-manager → CEO | Q11, Q14–Q16 | **geplant** | Auslöser lt. [go-live.md](go-live.md) | ≥ 6 Wochen vor Beta |
| OPS-10 | Optional: In-App-Browser-Test T2 per temporärem Tunnel (ohne Konto, nur Demo-Daten, deployment.md §0.5) | developer + reviewer | F-040, F-041, F-003 | **geplant** (optional) | P1-1 | vor Ende Inkrement 1, falls gewünscht |
| OPS-8 | Node 26 LTS evaluieren und umstellen | operations-manager | – | **geplant** | LTS-Start 28.10.2026 | Q1 2027 |

## Abhängigkeiten (Kurzfassung)

```
P0-1 Produktkonzept ──┬─> P0-2 UX ──┐
                      ├─> P0-3 Design ┴─> P0-5 Abstimmung ─┐
                      └─> P0-4 Ops ──> P0-6 Entscheidungen ─┼─> P0-7 M0
                                                            │
M0 ─> P1-0 Scaffold ─> P1-0a Auth-Spike ─> P1-0c UI-Fundament ─> P1-1 ─> P1-2 ─> P1-3 ─> P1-4 ─> P1-5 ─> P1-7
                                                     └──────────> P1-6 (vor M2)
Offline-Demo (lokal) ─> … ─> Go-Live-Gate (go-live.md, Auftraggeber) ─> OPS-1/OPS-2 (Staging + Mail) ─> OPS-3/OPS-4 ─> Beta M1
P1-1 ─> optional OPS-10 (Tunnel-Gerätetest T2)
```

## Blocker & offene Entscheidungen

Aktuell **keine aktiven Blocker**. B1–B4 sind **zurückgestellt bis Go-Live (Auftraggeber 2026-10-08)** und blockieren die Entwicklung nicht mehr; sie sind Pflichtpunkte im [Go-Live-Gate](go-live.md).

| # | Thema | Status | Betrifft (ab Go-Live) | Verantwortlich | Seit |
|---|---|---|---|---|---|
| B1 | Betreiber (Person/Gesellschaft) + Impressumsadresse | **zurückgestellt bis Go-Live** – Demo nutzt Platzhalter (Privatperson), Q14 | OPS-5, OPS-6, AVV-Abschlüsse | Auftraggeber | 2026-10-08 |
| B2 | Domain (+ Markenprüfung beider Namen „Wir wollen weg“ / „When do we go?“, Q11) | **zurückgestellt bis Go-Live** – Q15 | OPS-1, OPS-2 | Auftraggeber | 2026-10-08 |
| B3 | Accounts Hosting (Hetzner) + Mail (Lettermint) + Postfach | **zurückgestellt bis Go-Live** – Q15, bis dahin Mailpit | OPS-1, OPS-2 | Auftraggeber | 2026-10-08 |
| B4 | Weg für Rechtstexte (Generator-Abo vs. Anwalt) | **zurückgestellt bis Go-Live** – Platzhalter-Rechtstexte, Q16 | OPS-5 | Auftraggeber | 2026-10-08 |

Offene Produktfragen: siehe PRD §12 (Q11–Q16 am 2026-10-08 entschieden bzw. bis Go-Live zurückgestellt).

## Releases

| Version | Datum | Umgebung | Inhalt |
|---|---|---|---|
| – | – | – | noch kein Release |

## Änderungsprotokoll

- 2026-10-08 – Board angelegt (Operations). P0-1 fertig; P0-2, P0-3 in Arbeit; P0-4 Entwurf geliefert (in Arbeit bis CEO-Abnahme); MVP-Inkremente 1–7 geplant; Blocker B1–B4 erfasst.
- 2026-10-08 (CEO): Konzeptphase abgeschlossen – P0-2, P0-3, P0-4, P0-5 fertig; M0 wartet auf Freigabe durch den Auftraggeber.
- 2026-10-08 (Operations, nach Auftraggeber-Entscheidung Q11/Q14–Q16): M0 abgenommen – P0-6, P0-7 fertig. Betriebsmodus **Offline-Demo** (deployment.md §0). B1–B4 sowie OPS-1–OPS-5 zurückgestellt bis Go-Live, nicht mehr blockierend; Go-Live-Gate neu ([go-live.md](go-live.md)). P1-0 und P1-0a in Arbeit (developer, lokal ohne In-App-Browser-Gerätetest). Neu: P1-0b (Demo-Seed), OPS-9 (Go-Live-Vorbereitung inkl. Markenrecherche beider Namen), OPS-10 (optionaler Tunnel-Test T2).
- 2026-10-08 (Operations, nach Review P1-0/P1-0a): P1-0 und P1-0a **im Review** (Reviewer ⚠️ mit Anmerkungen; R-001–R-004 behoben, R-005/R-009 in Arbeit, R-006/R-007 → Inkrement 1). R-008 erledigt: deployment.md §0.2/§5 – Migration/Seed über Service `tools` statt `app` (Standalone-Image ohne Skripte), `pnpm demo:*`-Kurzbefehle dokumentiert. tech-stack.md v1.1: Routing nach sitemap.md §4 (App-Routen ohne Präfix, `/de`/`/en` öffentlich, Cookie `lang`, zwei Root-Layouts, kein `proxy.ts`), ESLint 9.39 / TypeScript 6.0.x, T3 gelöst, `standalone` nur mit `NEXT_OUTPUT_STANDALONE=1`, `Referrer-Policy: same-origin` auf `/i/*` + `/auth/*`. compliance-checklist.md §4: Sprach-Cookie `lang` statt `NEXT_LOCALE`.
- 2026-10-09 (Operations, nach Review Inkrement 2): **R-037** dokumentiert – deployment.md v0.3 §5.4 (Caddy-Log-Filter für `/i/*`, `/auth/*`, Query, `Referer`; Demo-Hinweis zu `docker/Caddyfile.demo` für den Developer), §6.2 Bugsink-Scrubbing; compliance-checklist.md v0.3 §7a (Ausnahme Einladungs-Token im Klartext); go-live.md v1.2 (R-037 als Pflichtpunkt Stufe 1 + 2b). Notiz zu F-043 bei P1-6 (Orga-Übergabe/Löschung vor Konto-Löschung).
- 2026-10-09 (Operations): P1-0c Schritt 0a „UI-Fundament“ **fertig** (PR #5 gemergt). P1-1 (Inkrement 1) **im Review** – Fixes R-021–R-031 in Nachprüfung. tech-stack.md v1.2 (§3.2 Ist-Stand: Mail-Budget pro Adresse/Postfach, Fehlversuche nur bei ausstehendem Code, Sperre ohne Mail-Sperre, HKDF-Schlüssel, Re-Auth, Argon2id, `PASSWORD_BREACH_CHECK`); go-live.md v1.1: Entscheidungspunkt „HIBP-Check einschalten?“ (Stufe 2a).
