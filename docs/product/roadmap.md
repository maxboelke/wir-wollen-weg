# Roadmap – Wir wollen weg

Stand: 2026-10-08 · Verantwortlich: Product Manager · Bezug: [PRD.md](PRD.md), [features.md](features.md)

Phasen sind ergebnis-, nicht datumsgetrieben. Jede Phase endet mit einem Meilenstein, der vom Reviewer freigegeben und von echten Gruppen getestet wird.

## Phase 0 – Konzept & Setup
**Ziel:** Entscheidungsgrundlage und Projektgerüst.
- Offene Fragen Q1–Q6 (PRD §12) durch Auftraggeber klären.
- UI/UX: Flows „Reise anlegen → Einladen → Verfügbarkeit → Heatmap/Vorschläge → Abstimmung → Ergebnis“, Wireframes mobil zuerst.
- Designer: Design-System inkl. barrierefreier Heatmap-Farbskala (3 Zustände + Intensität).
- Operations: Tech-Stack, EU-Hosting, E-Mail-Versand, Datenschutzerklärung/Impressum.
- Optional: 5 Kurzinterviews mit Organisatoren zur Validierung von A1, A3, A4.

**Meilenstein M0:** Wireframes und Stack abgenommen.

## Phase 1 – MVP „Termin finden & festlegen“
**Ziel:** Eine Gruppe kommt ohne Konto vom Link zum festen Reisezeitraum.

| Reihenfolge | Inkrement | Feature-IDs |
|---|---|---|
| 1 | Reise anlegen, einladen, beitreten, Rollen | F-001, F-002, F-003, F-004 |
| 2 | Verfügbarkeit manuell + Status | F-005, F-007 |
| 3 | Heatmap + Kandidaten-Berechnung | F-008, F-009 |
| 4 | Abstimmung & Festlegung | F-010, F-011, F-012 |
| 5 | ICS-Import | F-006 |
| 6 | Datenschutz-Funktionen | F-013 |
| 7 | Should-Features nach Kapazität (Reihenfolge) | F-015, F-016, F-014, F-017 |

Begründung der Reihenfolge: Inkremente 1–4 ergeben bereits einen durchgängig nutzbaren Fluss (manuell), der früh mit Testgruppen erprobt werden kann. Der ICS-Import (5) ist technisch der riskanteste Teil (RRULE, Zeitzonen, SSRF) und wird darauf aufgesetzt, ohne den Kernfluss zu blockieren. F-013 muss vor öffentlichem Launch fertig sein.

**Meilenstein M1 (Beta):** Inkremente 1–4 mit 3–5 befreundeten Testgruppen.
**Meilenstein M2 (öffentlicher MVP-Launch):** alle Must-Features + F-015 freigegeben; Datenschutzerklärung live.

## Phase 2 – v1 „Weniger Aufwand, mehr Bindung“
**Ziel:** Kalender-Anbindung ohne Fummelei, Wiederkehr der Organisatoren.

| Thema | Feature-IDs |
|---|---|
| Restliche Should-Features (falls nicht im MVP) | F-014, F-016, F-017 |
| Konto & Reiseübersicht | F-018 |
| Kalender automatisch aktuell halten | F-019 |
| One-Click-Kalender | F-020 (Google), F-021 (Microsoft) |
| Bessere Gruppenlogik | F-022, F-023, F-024 |

Voraussetzungen: Google-App-Verifizierung frühzeitig beantragen (Vorlauf mehrere Wochen); Auswertung der MVP-Kennzahlen (PRD §4) entscheidet die Reihenfolge innerhalb von v1.

**Meilenstein M3:** v1-Release.

## Phase 3 – später „Die ganze Reise“
**Ziel:** Von der Terminfindung bis zur Abrechnung in einer App.

| Stufe | Inhalt | Feature-IDs |
|---|---|---|
| 3a Planung | Zielfindung, Unterkünfte, Aufgaben, Infoseite, Budget | F-030, F-031, F-032, F-033, F-034 |
| 3b Kosten | Ausgaben, Verrechnung, Währungen (Tricount-ähnlich) | F-035, F-036, F-037 |
| 3c Plattform | PWA/Push | F-038 |

Hinweis: 3b ist ein eigenständiger Markt mit starken Wettbewerbern (Tricount, Splitwise). Lohnend nur als nahtlose Fortsetzung der geplanten Reise (Mitglieder sind schon da, kein erneutes Einladen) – das ist unser Differenzierungsargument. Entscheidung über 3a/3b nach Auswertung von v1.
