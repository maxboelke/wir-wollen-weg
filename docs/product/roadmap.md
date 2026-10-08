# Roadmap – Wir wollen weg

Stand: 2026-10-08 (v0.2, Entscheidungen Q1–Q6 eingearbeitet) · Verantwortlich: Product Manager · Bezug: [PRD.md](PRD.md), [features.md](features.md)

Phasen sind ergebnis-, nicht datumsgetrieben. Jede Phase endet mit einem Meilenstein, der vom Reviewer freigegeben und von echten Gruppen getestet wird.

**Änderungen v0.2:** Konto + DE/EN ins MVP (F-040–F-044, F-046), Feiertage Must (F-016); ICS-Import (F-006) und E-Mail-Benachrichtigungen (F-014) nach v1; **neuer Strang Apple-/iOS-Kalender** (F-047, F-048, F-049); Freemium-Vorbereitung in v1, Premium (F-050) später.

## Überblick

| Phase | Ergebnis | Kern-Features | Tarif |
|---|---|---|---|
| 0 – Konzept & Setup | Wireframes, Stack, Mailversand, i18n-Gerüst | – | – |
| 1 – MVP | Gruppe kommt mit Konto vom Link zum festen Zeitraum, DE/EN, manuelle Verfügbarkeit | F-040–F-044, F-046, F-001–F-005, F-007–F-013, F-016 (+ F-015, F-017) | komplett kostenlos |
| 2 – v1 | Kalender-Import inkl. **Apple-/iOS-Kalender**, E-Mail-Benachrichtigungen, Social Login, Monetarisierung vorbereitet | F-006, **F-047, F-048**, F-019–F-021, F-014, F-045, F-022–F-024, Spike F-049 | kostenlos; Premium-Kandidaten markiert |
| 3 – später | Die ganze Reise, Premium-Tarif | F-030–F-038, **F-049**, F-050 | Freemium aktiv |

---

## ★ Strang Apple-/iOS-Kalender (Auftraggeber-Priorität)

Apple/iCloud bietet **kein OAuth** für Kalender, und eine Web-App/PWA kann auf iOS **nicht** auf den Gerätekalender zugreifen. Damit iPhone-Nutzer nicht dauerhaft abtippen müssen, gibt es einen eigenen, gestuften Weg – jede Stufe mit eigener Feature-ID und fester Phase:

| Stufe | Feature | Phase | Weg | Stärken | Grenzen |
|---|---|---|---|---|---|
| 0 | F-005, F-012 | **MVP** | Manuelle Eingabe; Ergebnis als ICS-Datei, die der Apple-Kalender direkt übernimmt | Funktioniert sofort | Kein Import |
| 1 | **F-047** iCloud-Kalenderlink & Mac-Export mit iOS-Assistent | **v1.0** (zusammen mit F-006) | iPhone: Kalender → (i) → „Öffentlicher Kalender“ → Link kopieren → einfügen (`webcal://` wird unterstützt); Mac: `.ics`-Export hochladen | Kein Passwort, keine native App, baut auf F-006 auf | Kalender kurzzeitig öffentlich (App fordert zum Deaktivieren auf); nur iCloud-Kalender |
| 2 | **F-048** iCloud-CalDAV-Anbindung | **v1.1** | Apple-ID + app-spezifisches Passwort; einmaliger Abruf oder optional täglicher Sync | Nichts wird öffentlich; Kalenderauswahl; Sync möglich | App-spezifisches Passwort nötig; Speicherung nur verschlüsselt, Security-Review Pflicht |
| 3 | **F-049** On-Device-Weg | **Spike in v1**, Umsetzung **später (Phase 3)** | iOS-Kurzbefehl liest lokal alle Gerätekalender (inkl. Exchange/Google auf dem iPhone) und überträgt nur belegte Tage; Alternative native App/App Clip mit EventKit | Alle Kalender des iPhones, keine Zugangsdaten bei uns | Kurzbefehl-Installation ungewohnt; native App = hoher Aufwand (nur bei Bedarf, A7) |

Steuerung: Im MVP wird per Feedback-Frage (F-005) und aggregierter Gerätestatistik gemessen, wie groß der Apple-Anteil ist (Annahme A7: ≥ 40 %). Ergänzend: „Sign in with Apple“ (F-045, v1) senkt die Registrierungshürde für iPhone-Nutzer – ohne Kalenderzugriff.

---

## Phase 0 – Konzept & Setup
**Ziel:** Entscheidungsgrundlage und Projektgerüst.
- ~~Offene Fragen Q1–Q6 klären~~ – erledigt am 2026-10-08 (PRD §12). Neue offene Fragen Q7–Q10.
- UI/UX: Flows „Einladungslink → Reise-Vorschau → Registrierung im selben Fenster (Code) → Beitritt → Verfügbarkeit → Heatmap/Vorschläge → Abstimmung → Ergebnis“ sowie „Meine Reisen“, Kontoeinstellungen, Konto löschen; Wireframes mobil zuerst, inkl. In-App-Browser-Fall; Sprachumschalter; Wochenstart Mo/So.
- Designer: Design-System inkl. barrierefreier Heatmap-Farbskala (3 Zustände + Intensität), Feiertags-/Wochenend-Darstellung, Layouts robust für längere englische/deutsche Texte.
- Operations: Tech-Stack inkl. Auth-Lösung (passwortlos + Passwort, später Social Login), i18n-Framework, **Transaktionsmail-Anbieter (EU, SPF/DKIM/DMARC)**, EU-Hosting, Feiertagsbibliothek, Datenschutzerklärung DE + EN, Impressum.
- Optional: 5 Kurzinterviews mit Organisatoren zur Validierung von A1, A2 (Kontopflicht), A3, A7.

**Meilenstein M0:** Wireframes, Auth-Konzept und Stack abgenommen.

## Phase 1 – MVP „Termin finden & festlegen“
**Ziel:** Eine Gruppe kommt mit schlankem Konto vom Link zum festen Reisezeitraum – auf Deutsch oder Englisch, komplett kostenlos.

| Reihenfolge | Inkrement | Feature-IDs |
|---|---|---|
| 1 | i18n-Gerüst (DE/EN) + Konto-Basis: Registrierung, Login/Logout, Zugangswiederherstellung | F-046, F-040, F-041, F-042 |
| 2 | Reise anlegen, einladen, Beitritt im Einladungsflow, Rollen, „Meine Reisen“ | F-001, F-002, F-003, F-004, F-044 |
| 3 | Verfügbarkeit manuell + Status + Feiertage/Wochenenden | F-005, F-007, F-016 |
| 4 | Heatmap + Kandidaten-Berechnung | F-008, F-009 |
| 5 | Abstimmung & Festlegung | F-010, F-011, F-012 |
| 6 | Datenschutz-Funktionen & Konto löschen | F-013, F-043 |
| 7 | Should-Features nach Kapazität (Reihenfolge) | F-015, F-017 |

Begründung der Reihenfolge: i18n und Konto stehen am Anfang, weil Nachrüsten teuer ist (alle Texte, Mails, Rechte-Prüfungen hängen daran). Inkremente 1–5 ergeben einen durchgängig nutzbaren Fluss, der früh mit Testgruppen erprobt wird – insbesondere die **Beitrittsquote mit Kontopflicht** (Ziel ≥ 65 %, Rückfallplan Q10 bei < 50 %). F-013/F-043 müssen vor öffentlichem Launch fertig sein. Kein Kalender-Import im MVP (Q1); die manuelle Eingabe muss deshalb besonders schnell sein.

**Meilenstein M1 (Beta):** Inkremente 1–5 mit 3–5 befreundeten Testgruppen (mind. eine gemischt DE/EN, mind. eine mit überwiegend iPhone-Nutzern); Auswertung Registrierungs-Funnel und Feedback-Frage zum Kalender-Import.
**Meilenstein M2 (öffentlicher MVP-Launch):** alle Must-Features + F-015 freigegeben (DE und EN vom Reviewer geprüft); Datenschutzerklärung DE/EN und Impressum live; Transaktionsmail-Zustellung überwacht.

## Phase 2 – v1 „Kalender rein, Aufwand raus“
**Ziel:** Kalender-Import für alle großen Anbieter – **Apple zuerst gleichberechtigt** –, E-Mail-Benachrichtigungen, leichtere Anmeldung; Monetarisierung vorbereitet.

| Release | Thema | Feature-IDs |
|---|---|---|
| v1.0 | ICS-Import (Datei/URL) **+ Apple-Weg Stufe 1** (iCloud-Link, Mac-Export, iOS-Assistent) | F-006, **F-047** |
| v1.0 | E-Mail-Benachrichtigungen (opt-in) | F-014 |
| v1.1 | **Apple-Weg Stufe 2: iCloud-CalDAV** | **F-048** |
| v1.1 | Kalender automatisch aktuell halten | F-019 |
| v1.1 | Social Login (Sign in with Apple, Google) | F-045 |
| v1.2 | One-Click-Kalender | F-020 (Google), F-021 (Microsoft) |
| v1.2 | Bessere Gruppenlogik | F-022, F-023, F-024 |
| v1 begleitend | **Spike Apple-Weg Stufe 3** (iOS-Kurzbefehl vs. native App/App Clip) – Ergebnis: Machbarkeit, Aufwand, Empfehlung | F-049 (Spike) |
| v1 begleitend | **Freemium vorbereiten:** Premium-Kandidaten markieren (Spalte „Tarif“ in features.md), Zahlungsbereitschaft befragen (A8), Entscheidung Q8 (Reise-Pass vs. Abo, Preis); Operations prüft Zahlungsanbieter, USt/OSS, AGB | – (Vorbereitung F-050) |

Voraussetzungen: Google-App-Verifizierung frühzeitig beantragen (Vorlauf mehrere Wochen); Security-Review für F-048 (Speicherung app-spezifischer Passwörter); Auswertung der MVP-Kennzahlen (PRD §4) und der Kalender-Feedback-Frage entscheidet die Reihenfolge innerhalb v1.1/v1.2 – F-006 + F-047 bleiben gesetzt an erster Stelle. Alle v1-Features bleiben bis zum Start von F-050 kostenlos.

**Meilenstein M3:** v1-Release (mind. v1.0 + v1.1 inkl. F-047 und F-048).

## Phase 3 – später „Die ganze Reise“ & Premium
**Ziel:** Von der Terminfindung bis zur Abrechnung in einer App; nachhaltiger Betrieb über Freemium.

| Stufe | Inhalt | Feature-IDs |
|---|---|---|
| 3a Planung | Zielfindung, Unterkünfte, Aufgaben, Infoseite, Budget | F-030, F-031, F-032, F-033, F-034 |
| 3b Kosten | Ausgaben, Verrechnung, Währungen (Tricount-ähnlich) | F-035, F-036, F-037 |
| 3c Plattform | PWA/Push; **Apple-Weg Stufe 3** (On-Device, gemäß Spike-Ergebnis) | F-038, **F-049** |
| 3d Premium | Premium-Tarif & Bezahlung starten (Kern bleibt kostenlos) | F-050 |

Reihenfolge 3a vs. 3b: **offen (Q7)** – Auftraggeber hat die Priorität der Ausgabenverrechnung noch nicht entschieden; bis dahin „später“. PM-Hinweis: 3b ist ein eigenständiger Markt mit starken Wettbewerbern (Tricount, Splitwise). Lohnend nur als nahtlose Fortsetzung der geplanten Reise (Mitglieder und Konten sind schon da, kein erneutes Einladen) – das ist unser Differenzierungsargument und hat zugleich Premium-Potenzial (F-037, Belegfotos). 3d startet frühestens, wenn genügend Premium-Kandidaten aus 2/3a/3b verfügbar sind und Q8 entschieden ist.
