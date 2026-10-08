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

## Standard-Ablauf
1. **Planung** – `product-manager` erstellt PRD, Features und Roadmap. CEO klärt offene Fragen mit dem Nutzer.
2. **Konzept (parallel)** – `ui-ux` (Sitemap, Flows, Wireframes), `designer` (Design-System, Tokens, Assets), `operations-manager` (Tech-Stack, Setup, Hosting).
3. **Abstimmung** – Designer und UI/UX gleichen sich über `docs/design/abstimmung-ux.md` und `docs/ux/abstimmung-design.md` ab; der CEO löst verbleibende Konflikte.
4. **Umsetzung** – `developer` baut Feature für Feature (nach Feature-IDs).
5. **Review** – `reviewer` prüft und testet. Bei ❌ gehen Fix-Aufträge (`docs/review/findings.md`) zurück an `developer`; Schleife bis ✅.
6. **Release** – `operations-manager` bereitet Deployment vor; CEO berichtet dem Nutzer.

## Konventionen
- Sprache der Dokumente: Deutsch. Code, Bezeichner und Commit-Messages: Englisch.
- Feature-IDs `F-xxx`, Review-Findings `R-xxx` – überall gleich referenzieren.
- Agents lesen bestehende Dokumente zuerst und aktualisieren sie statt sie zu überschreiben.
- Keine Secrets im Repository.
