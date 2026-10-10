# Projekt: Wir wollen weg – Web-App-Entwicklung mit Agent-Team

## Rolle des Hauptchats: CEO
Der Hauptchat ist der **CEO**. Er spricht mit dem Nutzer (Auftraggeber), trifft Entscheidungen, verteilt Aufträge an die Subagents, sammelt deren Berichte und hält den Nutzer auf dem Laufenden. Alle Agents berichten an den CEO; Agents beauftragen sich nicht gegenseitig.

Der CEO:
- zerlegt Vorhaben in klare Aufträge und gibt jedem Agent genug Kontext (Ziel, relevante Dateien, Feature-IDs, erwartetes Ergebnis),
- lässt unabhängige Aufgaben parallel laufen (z. B. Designer + UI/UX + Operations),
- legt offene Fragen, die nur der Nutzer entscheiden kann, gebündelt vor,
- erklärt erst dann etwas für fertig, wenn der Reviewer es freigegeben hat.

## Das Team (`.claude/agents/`)
| Agent | Verantwortung | Ablage |
|---|---|---|
| `product-manager` | Vision, Features, User Stories, Roadmap | `docs/product/` |
| `designer` | Optik, Design-System, Tokens, Grafik-Elemente | `docs/design/` |
| `ui-ux` | Struktur, Flows, Wireframes, Usability, Barrierefreiheit | `docs/ux/` |
| `developer` | Umsetzung in Code, Tests | Quellcode |
| `reviewer` | Code-Review, Tests, Bugs, Fix-Aufträge | `docs/review/` |
| `operations-manager` | Stack, Tooling, CI/CD, Hosting, Recht, Status-Board | `docs/ops/` |
| `motion-designer` | Animationen, Übergänge, Micro-Interactions, Scroll-/Klick-Effekte, Motion-Tokens | `docs/motion/` |

## Standard-Ablauf
1. **Planung** – `product-manager` erstellt PRD, Features und Roadmap. CEO klärt offene Fragen mit dem Nutzer.
2. **Konzept (parallel)** – `ui-ux` (Sitemap, Flows, Wireframes), `designer` (Design-System, Tokens, Assets), `motion-designer` (Bewegung, Übergänge, Prototypen), `operations-manager` (Tech-Stack, Setup, Hosting).
3. **Abstimmung** – Designer und UI/UX gleichen sich über `docs/design/abstimmung-ux.md` und `docs/ux/abstimmung-design.md` ab, der Motion Designer über `docs/motion/abstimmung.md`; der CEO löst verbleibende Konflikte.
4. **Umsetzung** – `developer` baut Feature für Feature (nach Feature-IDs).
5. **Review** – `reviewer` prüft und testet. Bei ❌ gehen Fix-Aufträge (`docs/review/findings.md`) zurück an `developer`; Schleife bis ✅.
6. **Release** – `operations-manager` bereitet Deployment vor; CEO berichtet dem Nutzer.

## Konventionen
- Sprache der Dokumente: Deutsch. Code, Bezeichner und Commit-Messages: Englisch.
- Feature-IDs `F-xxx`, Review-Findings `R-xxx` – überall gleich referenzieren.
- Agents lesen bestehende Dokumente zuerst und aktualisieren sie statt sie zu überschreiben.
- Keine Secrets im Repository.

## Projektstand (für neue Sitzungen)
Der CEO liest zu Beginn jeder Sitzung diesen Abschnitt, `docs/product/PRD.md` (insb. §12 „Offene Fragen / Entscheidungen“) und – falls vorhanden – `docs/ops/status.md`.

- **Produkt:** Web-App, mit der Freundesgruppen einen gemeinsamen Urlaubszeitraum finden – Verfügbarkeiten eintragen, gemeinsamer Kalender (Heatmap) mit automatischen Vorschlägen, Abstimmung, Festlegung. Einladung per Link.
- **Erledigt:**
  - Phase 0 – Produktkonzept (PRD, Featureliste, Roadmap) inkl. Entscheidungen des Auftraggebers vom 2026-10-08 (Q1–Q6).
  - Konzeptphase (2026-10-08): UX (`docs/ux/` – Sitemap, Flows A–K, UX-Spec, Wireframes W01–W15), Design (`docs/design/` – Design-System v0.4, `tokens.css`, Logo/Icons/Illustrationen/Heatmap-SVGs), Operations (`docs/ops/` – Tech-Stack, Deployment, Compliance-Checkliste, Status-Board; `.github/workflows/ci.yml`, Dependabot). Abstimmung Designer ↔ UI/UX abgeschlossen (D-1–D-18, U-1–U-14; CEO-Entscheidungen zu U-1, U-2, U-4, U-14, D-16).
- **Stack (Empfehlung, Freigabe mit M0):** Next.js + TypeScript, pnpm, PostgreSQL + Drizzle, Better Auth (Code/Magic-Link), next-intl, date-holidays, CSS Modules + `tokens.css`, Vitest/Playwright; Hetzner (DE) + Lettermint (EU-Mail).
- **M0 abgenommen (2026-10-08):** Konzept-PR gemergt. Entscheidungen Q11–Q16 siehe PRD §12: Logo A; **EN-Name „When do we go?“** (DE „Wir wollen weg“); Dark Mode nur System + Figtree; Produktregeln Q13 (a)–(e) bestätigt.
- **Arbeitsmodus: Offline-Demo.** Kein Hosting, keine Domain, keine Konten/Abos – alles läuft lokal (Mails über Mailpit).
- **⚠ Vor Go-Live zwingend mit dem Auftraggeber klären (CEO erinnert daran!):** echte Betreiber-/Impressumsangaben statt Platzhalter (Q14), Rechtstexte-Weg Generator/Anwalt (Q16), Domain + Hosting-/Mail-Konten (Q15), HIBP-Passwortprüfung ja/nein, Finding R-035 (Konto-Adresse als Variante) beheben. Checkliste: `docs/ops/compliance-checklist.md`, `docs/ops/deployment.md`.
- **Offen beim Auftraggeber (nicht blockierend):** PRD §12 Q7–Q10.
- **P1-0 Scaffold + P1-0a Auth-Spike:** PR #4 gemergt (2026-10-08). Findings in `docs/review/findings.md` (offen: R-007, R-013, R-014, R-015; Rate-Limits pro E-Mail hoch priorisiert). Lokal Node ≥ 24 verwenden.
- **Auftraggeber-Feedback 2026-10-08 zum App-Stand:** Optik „zu spartanisch“ – App soll ansprechend sein und Spaß machen; später Animationen/Motion Graphics. Neuer Agent `motion-designer` angelegt.
- **Design-Sprint „Look & Feel 2.0“ (freigegeben 2026-10-08):** Designer erstellt zuerst **Richtung A ohne Vorgabe (unbeeinflusst)**, danach **Richtung B mit Inspiration von der App „Finanzguru“** (Wunsch des Auftraggebers – Finanzguru dem Designer erst NACH Fertigstellung von A nennen). Motion Designer parallel (Motion-System, Interaktions-Katalog, Prototypen). Danach Auswahl durch den Auftraggeber → UI-Fundament → Inkremente 1–5 im neuen Look.
- **Richtungswahl (2026-10-08):** Auftraggeber bevorzugt **Richtung B „Reise-Cockpit“** (`docs/design/richtungen/b/`); **Palette entschieden: B0 „Indigo & Minze“** (erste Version; Alternativen B1–B3 verworfen, PRD Q18). Motion-Entscheidungen Q17 (a)–(c): ja.
- **Look & Feel 2.0 umgesetzt (2026-10-08):** Design-System v1.0 (Reise-Cockpit, Indigo & Minze), Motion-System + Prototypen (`docs/motion/`), Schritt 0a „UI-Fundament“ gebaut – Reviewer ⚠️ freigegeben mit Anmerkungen, **PR #5 gemergt (2026-10-09)**. Offen für Inkrement 1: R-016 (Fokus im vollen Code-Feld), R-017 (Eintritts-Animation blinkt bei Hydration), R-018 (Footer/Hilfe-Link, Radio – verschoben nach Inkrement 1, CEO), R-019 (Bottom-Sheet blockiert kurz), R-014; Rate-Limits pro E-Mail.
- **Inkrement 1 (2026-10-09):** Konto-Basis, i18n, Hilfe, Rate-Limits pro E-Mail + Sicherheits-Fixes R-016–R-034 – Reviewer ⚠️ freigegeben (offen nur R-035, vor Go-Live), **PR #6 gemergt (2026-10-09)**.
- **Inkrement 2 (2026-10-09):** Reisen anlegen, einladen, beitreten, Rollen, „Meine Reisen“, Reise-Übersicht + Review-Fixes R-036–R-044 – Reviewer ⚠️ freigegeben, **PR #7 gemergt (2026-10-09)**. Vor Go-Live zusätzlich: R-037 (Token-Pfade in Logs maskieren), Proxy-Rate-Limit für /i/*. CEO-Entscheidungen: nach Beitritt Ziel „Meine Tage“ sobald gebaut; Platzhalter-Personen (F-007) mit Inkrement 3; „Erinnern“ (F-015) Inkrement 7.
- **Inkrement 3 (2026-10-09):** F-005 Meine Tage (Malen per Tippen/Wischen, Zeitraum-Modus, Schnellaktionen, Autosave, Abgabe), F-007 Status + Platzhalter (persönliche Links), F-016 Feiertage/Wochenenden, Motion „Tage malen“ + Review-Fixes R-045–R-048 – Reviewer ⚠️ freigegeben (offen R-049, niedrig), **PR #8 gemergt (2026-10-10)**. Entscheidung Q20: Platzhalter zählen im Fortschritt mit („3 von 9“) – Umsetzung in Inkrement 4. Vor M2: Lizenzhinweis date-holidays (CC-BY-3.0).
- **Inkrement 4 (2026-10-10):** F-008 Gruppen-Heatmap, F-009 Vorschläge, Weiterleitung nach Abgabe → Gruppe, Q20 umgesetzt, R-049 behoben + Review-Fixes R-050–R-053 – Reviewer ⚠️ freigegeben (offen R-054, niedrig), UX-Bewertung ux-spec §12 (A1–A4), PR #9 wartet auf Freigabe des Auftraggebers. Vor Go-Live zusätzlich: Tagesliste bei großer Schrift (U-5 + D-15), Hinweis Dauer-Filter (A3), Link „Platzhalter verwalten“ (A4, spätestens mit F-015); Designer: design-system §6.1 auf gebaute Zellmaße (52 px) anpassen, Desktop „ein Monat pro Zeile“ (R-052) bestätigen.
- **Nächster Schritt:** Nach Merge von PR #9 Inkrement 5 (F-010 Abstimmung erstellen, F-011 Abstimmen, F-012 Termin festlegen + Feier).
