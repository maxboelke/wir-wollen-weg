# Status-Board – Wir wollen weg

Stand: 2026-10-08 · Gepflegt von: Operations Manager (Aktualisierung durch CEO nach jedem Agent-Bericht) · Bezug: [roadmap.md](../product/roadmap.md), [features.md](../product/features.md)

Status: **geplant** · **in Arbeit** · **im Review** · **fertig** (Reviewer ✅ bzw. CEO-Abnahme bei Konzeptdokumenten) · **blockiert**

## Aktuelle Phase

**Phase 0 – Konzept & Setup** → Meilenstein **M0**: Wireframes, Auth-Konzept und Stack abgenommen.

## Übersicht

| ID | Aufgabe | Agent | Feature-IDs | Status | Abhängig von | Ergebnis / Ablage |
|---|---|---|---|---|---|---|
| P0-1 | Produktkonzept (PRD, Features, Roadmap) inkl. Entscheidungen Q1–Q6 | product-manager | alle | **fertig** (2026-10-08) | – | `docs/product/` |
| P0-2 | Sitemap, Flows, Wireframes (mobil zuerst, In-App-Browser-Fall, Code-Eingabe, Sprachumschalter, Wochenstart) | ui-ux | F-001–F-017, F-040–F-046 | **fertig** (2026-10-08, CEO-Abnahme Konzept; W01–W15, Flows A–K) | P0-1 | `docs/ux/` |
| P0-3 | Design-System, Tokens (`tokens.css`), barrierefreie Heatmap-Skala, Feiertags-/Wochenend-Darstellung | designer | F-008, F-005, F-016, F-046 | **fertig** (2026-10-08, CEO-Abnahme Konzept; design-system v0.3) | P0-1 | `docs/design/` |
| P0-4 | Tech-Stack, Auth-Konzept, i18n, Feiertage, Mail-Anbieter, Hosting, CI, Compliance-Checkliste, Status-Board | operations-manager | F-040–F-043, F-046, F-016, F-013 | **fertig** (2026-10-08, CEO-Empfehlung an Auftraggeber; Stack-Freigabe Teil von M0) | P0-1 | `docs/ops/`, `.github/` |
| P0-5 | Abstimmung Designer ↔ UI/UX | designer, ui-ux | – | **fertig** (2026-10-08; D-1–D-18, U-1–U-14 geklärt, D-16 durch CEO entschieden) | P0-2, P0-3 | `docs/design/abstimmung-ux.md`, `docs/ux/abstimmung-design.md` |
| P0-6 | Entscheidungen Auftraggeber: Betreiber/Impressum, Domain, Hosting-/Mail-Accounts, Rechtstexte-Weg | CEO → Auftraggeber | – | **blockiert** (wartet auf Auftraggeber) | P0-4 | PRD §12 / Bericht CEO |
| P0-7 | Abnahme M0 | CEO | – | **wartet auf Auftraggeber** (Freigabe PR + Entscheidungen) | P0-2 … P0-6 | – |

### Phase 1 – MVP (Inkremente laut Roadmap)

| ID | Inkrement | Agent | Feature-IDs | Status | Abhängig von |
|---|---|---|---|---|---|
| P1-0 | Projekt-Scaffold nach `docs/ops/tech-stack.md` (Next.js, pnpm, Drizzle, next-intl, ESLint/Prettier, Vitest, Playwright, Docker-Compose dev mit PostgreSQL + Mailpit, Skript-Vertrag für CI) | developer | – | **geplant** | M0 |
| P1-0a | Spike Auth: Kombi-Mail Code + Magic-Link, „angemeldet bleiben“ bei OTP, Test im WhatsApp-/Instagram-In-App-Browser (tech-stack.md §11, T1/T2) | developer | F-040, F-041 | **geplant** | P1-0 |
| P1-1 | i18n-Gerüst (DE/EN) + Konto-Basis: Registrierung, Login/Logout, Zugangswiederherstellung | developer → reviewer | F-046, F-040, F-041, F-042 | **geplant** | P1-0, P1-0a, P0-2, P0-3 |
| P1-2 | Reise anlegen, einladen, Beitritt im Einladungsflow, Rollen, „Meine Reisen“ | developer → reviewer | F-001, F-002, F-003, F-004, F-044 | **geplant** | P1-1 |
| P1-3 | Verfügbarkeit manuell + Status + Feiertage/Wochenenden | developer → reviewer | F-005, F-007, F-016 | **geplant** | P1-2 |
| P1-4 | Heatmap + Kandidaten-Berechnung | developer → reviewer | F-008, F-009 | **geplant** | P1-3 |
| P1-5 | Abstimmung & Festlegung (inkl. ICS) | developer → reviewer | F-010, F-011, F-012 | **geplant** | P1-4 |
| P1-6 | Datenschutz-Funktionen & Konto löschen (inkl. Retention-Job) | developer → reviewer | F-013, F-043 | **geplant** | P1-2 (Konto/Reise), vor M2 Pflicht |
| P1-7 | Should-Features nach Kapazität | developer → reviewer | F-015, F-017 | **geplant** | P1-5 |

### Betrieb & Recht (Operations, parallel zu Phase 1)

| ID | Aufgabe | Agent | Bezug | Status | Abhängig von | Fällig |
|---|---|---|---|---|---|---|
| OPS-1 | Hosting-Account, AVV, VM, Compose, Caddy, DNS, Staging (deployment.md §5.1) | operations-manager | – | **blockiert** | P0-6 (Accounts, Domain) | vor Ende P1-1 (Staging für Gerätetests) |
| OPS-2 | Mail-Anbieter einrichten, SPF/DKIM/DMARC, Bounce-Webhook | operations-manager | F-040–F-043 | **blockiert** | P0-6 (Domain, Account) | vor Ende P1-1 |
| OPS-3 | `deploy.yml` (Image → GHCR → Staging automatisch, Prod mit Freigabe) | operations-manager | – | **geplant** | P1-0, OPS-1 | vor M1 |
| OPS-4 | Backups + Restore-Test, Uptime- und Fehler-Monitoring (Bugsink) | operations-manager | – | **geplant** | OPS-1 | vor M1 |
| OPS-5 | Impressum + Datenschutzerklärung DE (M1), EN + Nutzungsbedingungen (M2) | operations-manager (Entwurf) → Rechtsprüfung | F-013, F-046 | **blockiert** | P0-6 (Betreiberangaben, Rechtstexte-Weg) | M1 / M2 |
| OPS-6 | VVT, AVV-Liste, Löschkonzept final, Datenpannen-Prozess | operations-manager | F-013, F-043 | **geplant** | P0-6 | M1 / M2 |
| OPS-7 | Claude-Code-SessionStart-Hook (`pnpm install`) in `.claude/settings.json` | CEO / developer | – | **geplant** | P1-0 | mit Scaffold |
| OPS-8 | Node 26 LTS evaluieren und umstellen | operations-manager | – | **geplant** | LTS-Start 28.10.2026 | Q1 2027 |

## Abhängigkeiten (Kurzfassung)

```
P0-1 Produktkonzept ──┬─> P0-2 UX ──┐
                      ├─> P0-3 Design ┴─> P0-5 Abstimmung ─┐
                      └─> P0-4 Ops ──> P0-6 Entscheidungen ─┼─> P0-7 M0
                                                            │
M0 ─> P1-0 Scaffold ─> P1-0a Auth-Spike ─> P1-1 ─> P1-2 ─> P1-3 ─> P1-4 ─> P1-5 ─> P1-7
                                                     └──────────> P1-6 (vor M2)
P0-6 ─> OPS-1/OPS-2 (Staging + Mail) ─> nötig für Gerätetests in P1-1 und Beta M1
```

## Blocker & offene Entscheidungen

| # | Blocker | Blockiert | Verantwortlich | Seit |
|---|---|---|---|---|
| B1 | Betreiber (Person/Gesellschaft) + Impressumsadresse unklar | OPS-5, OPS-6, AVV-Abschlüsse | Auftraggeber | 2026-10-08 |
| B2 | Domain nicht festgelegt/registriert | OPS-1, OPS-2 (DKIM/SPF/DMARC) | Auftraggeber | 2026-10-08 |
| B3 | Accounts Hosting (Hetzner) + Mail (Lettermint) + Postfach fehlen | OPS-1, OPS-2 | Auftraggeber (Inhaber der Verträge/Zahlung) | 2026-10-08 |
| B4 | Weg für Rechtstexte (Generator-Abo vs. Anwalt) offen | OPS-5 | Auftraggeber | 2026-10-08 |

Offene Produktfragen (PRD §12): Q7–Q10 sowie neue Konzeptfragen Q11–Q16 (CEO-Bericht 2026-10-08) – nicht blockierend für Phase 1, Q11–Q16 aber vor Inkrement 2/4/5 zu bestätigen.

## Releases

| Version | Datum | Umgebung | Inhalt |
|---|---|---|---|
| – | – | – | noch kein Release |

## Änderungsprotokoll

- 2026-10-08 – Board angelegt (Operations). P0-1 fertig; P0-2, P0-3 in Arbeit; P0-4 Entwurf geliefert (in Arbeit bis CEO-Abnahme); MVP-Inkremente 1–7 geplant; Blocker B1–B4 erfasst.
- 2026-10-08 (CEO): Konzeptphase abgeschlossen – P0-2, P0-3, P0-4, P0-5 fertig; M0 wartet auf Freigabe durch den Auftraggeber.
