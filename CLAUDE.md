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
- **Arbeitsmodus: Offline-Demo + private Live-Vorschau (Q25).** Kein Go-Live, keine Domain, keine kostenpflichtigen Konten. Lokal: Docker-Demo (Mailpit). Zusätzlich kostenlose private Vorschau auf Vercel + Neon (Zugangspasswort, Demo-Postfach statt echter Mails, nur Demo-Daten).
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
- **Inkrement 4 (2026-10-10):** F-008 Gruppen-Heatmap, F-009 Vorschläge, Weiterleitung nach Abgabe → Gruppe, Q20 umgesetzt, R-049 behoben + Review-Fixes R-050–R-053 – Reviewer ⚠️ freigegeben (offen R-054, niedrig), UX-Bewertung ux-spec §12 (A1–A4), **PR #9 gemergt (2026-10-10)**. Vor Go-Live zusätzlich: Tagesliste bei großer Schrift (U-5 + D-15), Hinweis Dauer-Filter (A3), Link „Platzhalter verwalten“ (A4, spätestens mit F-015); Designer: design-system §6.1 auf gebaute Zellmaße (52 px) anpassen, Desktop „ein Monat pro Zeile“ (R-052) bestätigen.
- **Inkrement 5 (2026-10-10):** F-010 Abstimmung erstellen, F-011 Abstimmen (Q13 a serverseitig), F-012 Termin festlegen + Feier „Es geht los!“ + ICS, Abstimmungsfrist (F-017 teilweise) + Review-Fixes R-055–R-057 – Reviewer ✅/⚠️ freigegeben, UX-Bewertung ux-spec §13 (B1–B9), **PR #10 gemergt (2026-10-11)**. Entscheidungen Q21 (Orga darf Abstimmung abbrechen – Inkrement 6) und Q22 (Suchzeitraum in Phase 2/3 änderbar) = ja. **Meilenstein M0.5 „Demo“ inhaltlich erreicht** (Inkremente 1–5). Vor Go-Live zusätzlich: Hinweise B5 (zu kurze Vorschläge) und B9 (Option hinzugefügt), Designer-Abnahme Ring-Glow (R-057).
- **Inkrement 6 (2026-10-11):** F-043 Konto löschen (Orga-Übergabe-Pflicht, Re-Auth, Bestätigungsmail, inaktive Konten 24 Monate), F-013 Datenschutz (automatische Reise-Löschung + Hinweismails, Löschjob `POST /api/internal/retention` mit `RETENTION_TOKEN`, Datenexport, Datenschutz/Impressum mit Platzhaltern + Startschutz bei `APP_ENV=production`), F-051 Hilfe + Lizenzhinweise, Q21 Abstimmung abbrechen, Q22-Hinweis, R-054 + Review-Fixes R-058–R-062 – Reviewer ⚠️ freigegeben, **PR #11 gemergt (2026-10-16)**. Q23 Datenexport bleibt, Q24 Lösch-Hinweis nur an Orga. Vor Go-Live zusätzlich: täglicher Timer für den Löschjob (Operations), Löschjob-Abfrage auf Kandidaten einschränken; Nutzungsbedingungen (M2). Klein, später: Abbruch-Hinweis auch auf Übersicht zeigen (bisher nur Tab Abstimmen), Abstand „Daten & Datenschutz“.
- **Demo-Paket M0.5 (2026-10-16):** `bash scripts/demo.sh start` (nur Docker nötig, Handy im WLAN), `docs/ops/demo-anleitung.md`, `docs/ops/demo-drehbuch.md` – Reviewer ⚠️ freigegeben (R-063 behoben; R-064 https-Startschutz in production, vor Go-Live). **PR #14 gemergt (2026-10-17)** – Demo-Paket liegt auf `main`.
- **Windows-Demo + Übergabe (2026-10-20):** `scripts/demo.ps1`, `docs/UEBERGABE.md` (Einstieg für neue Entwickler) – **PR #17 gemergt (2026-10-20)**. Auftraggeber testet unter Windows. Repo wurde vom Auftraggeber mit abacus.ai verbunden – bisher keine Änderungen von dort; Weiterentwicklung bleibt hier.
- **Nächster Schritt (in Arbeit seit 2026-10-20):** Private Live-Vorschau (Q25): Developer baut `APP_ENV=preview` (Zugangspasswort, Demo-Postfach, Vercel-Build mit Migration/Seed, Cron für Löschjob), Operations schreibt Klick-Anleitung Vercel + Neon. Danach Demo-Abnahme M0.5 über die Vorschau → Nachbesserung → Inkrement 7 oder Go-Live G1.
