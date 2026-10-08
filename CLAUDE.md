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
- **⚠ Vor Go-Live zwingend mit dem Auftraggeber klären (CEO erinnert daran!):** echte Betreiber-/Impressumsangaben statt Platzhalter (Q14), Rechtstexte-Weg Generator/Anwalt (Q16), Domain + Hosting-/Mail-Konten (Q15). Checkliste: `docs/ops/compliance-checklist.md`, `docs/ops/deployment.md`.
- **Offen beim Auftraggeber (nicht blockierend):** PRD §12 Q7–Q10.
- **P1-0 Scaffold + P1-0a Auth-Spike:** PR #4 gemergt (2026-10-08). Findings in `docs/review/findings.md` (offen: R-007, R-013, R-014, R-015; Rate-Limits pro E-Mail hoch priorisiert). Lokal Node ≥ 24 verwenden.
- **Auftraggeber-Feedback 2026-10-08 zum App-Stand:** Optik „zu spartanisch“ – App soll ansprechend sein und Spaß machen; später Animationen/Motion Graphics. Neuer Agent `motion-designer` angelegt.
- **Nächster Schritt:** Vorgehensvorschlag „Look & Feel 2.0“ (Design-Sprint vor Inkrement 1) liegt beim Auftraggeber zur Freigabe.
