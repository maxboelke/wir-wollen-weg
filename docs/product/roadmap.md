# Roadmap – Wir wollen weg / When do we go?

Stand: 2026-10-20 (v0.5, Planung Ausbaustufe „Reise managen“; Entscheidungen Q1–Q6, Q11–Q18, Q20–Q25 eingearbeitet) · Verantwortlich: Product Manager · Bezug: [PRD.md](PRD.md), [features.md](features.md)

**Änderungen v0.5 (2026-10-20, Planung – Entscheidung Q26/Q27 offen):** Neue **Ausbaustufe R „Reise managen“** (Inkremente 8–12: F-053 Cockpit, F-033 Infoseite, F-031 Unterkünfte, F-035/F-036 Kosten, F-056 + F-054 Reisedaten, F-055 Unterlagen) – empfohlen **nach Inkrement 7 und vor Phase 2 (Kalender-Import)**; neues Sicherheits-/Datenschutz-Gate **G1b** vor echter Nutzung von F-054/F-055. Phase 3a/3b entsprechend verkleinert. Stand Phase 1: Inkremente 0–6 erledigt (CLAUDE.md „Projektstand“), M0.5 inhaltlich erreicht, Demo-Abnahme über die Vorschau offen.

Phasen sind ergebnis-, nicht datumsgetrieben. Jede Phase endet mit einem Meilenstein, der vom Reviewer freigegeben wird; ab M1 testen echte Gruppen.

**Änderungen v0.4:** Neuer Schritt **„UI-Fundament“ (Look & Feel 2.0 + Motion-Basis)** vor Inkrement 1 (Q18). Neues Querschnitts-Feature **F-052** (Bewegung, Animationen & Haptik, Q17) – Bewegungen werden mit dem jeweiligen Inkrement gebaut. Offene Review-Findings **R-007, R-013, R-015** und **Rate-Limits pro E-Mail** Inkrement 1 zugeordnet; R-014 bleibt „später entscheiden“. M0.5 um Look & Feel 2.0 und Motion (Prio „MVP“, Reduced Motion) ergänzt.

**Änderungen v0.3:** **M0 erledigt** (2026-10-08). **Offline-Demo** als Arbeitsmodus bis zur Beta (Q15) mit neuem Meilenstein **M0.5 „Demo“**. **Go-Live-Gate G1** vor M1-Beta (Betreiber, Rechtstexte, Domain/Konten – Q14–Q16), Rechtstext-Endprüfung spätestens vor M2. F-051 Hilfe-Seite in Inkrement 6.

**Änderungen v0.2:** Konto + DE/EN ins MVP (F-040–F-044, F-046), Feiertage Must (F-016); ICS-Import (F-006) und E-Mail-Benachrichtigungen (F-014) nach v1; **neuer Strang Apple-/iOS-Kalender** (F-047, F-048, F-049); Freemium-Vorbereitung in v1, Premium (F-050) später.

## Überblick

| Phase | Ergebnis | Kern-Features | Tarif |
|---|---|---|---|
| 0 – Konzept & Setup ✅ | Wireframes, Stack, Design, Ops-Konzept (M0 abgenommen 2026-10-08) | – | – |
| 1 – MVP | Gruppe kommt mit Konto vom Link zum festen Zeitraum, DE/EN, manuelle Verfügbarkeit; **zuerst als lokale Offline-Demo (M0.5), nach Go-Live-Gate G1 als Beta (M1)** | F-040–F-044, F-046, F-001–F-005, F-007–F-013, F-016, F-051, F-052 (+ F-015, F-017) | komplett kostenlos |
| **R – Reise managen (neu, Einordnung Q26)** | Nach der Festlegung: Reise-Cockpit, Unterkünfte per Swipe, Kosten teilen, Reisedaten, Reiseunterlagen | F-053, F-033, F-031, F-035, F-036, F-056, F-054, F-055 | kostenlos; Premium-Kandidaten markiert (features.md R.3) |
| 2 – v1 | Kalender-Import inkl. **Apple-/iOS-Kalender**, E-Mail-Benachrichtigungen, Social Login, Monetarisierung vorbereitet | F-006, **F-047, F-048**, F-019–F-021, F-014, F-045, F-022–F-024, Spike F-049 | kostenlos; Premium-Kandidaten markiert |
| 3 – später | Rest der Reiseplanung, Premium-Tarif | F-030, F-032, F-034, F-037, F-038, **F-049**, F-050 | Freemium aktiv |

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

## Phase 0 – Konzept & Setup ✅ erledigt
**Ziel:** Entscheidungsgrundlage und Projektgerüst. **Status:** abgeschlossen am 2026-10-08 (Konzept-PR abgenommen, Q11–Q16 entschieden).
- ~~Offene Fragen Q1–Q6 klären~~ – erledigt am 2026-10-08 (PRD §12). Neue offene Fragen Q7–Q10.
- UI/UX: Flows „Einladungslink → Reise-Vorschau → Registrierung im selben Fenster (Code) → Beitritt → Verfügbarkeit → Heatmap/Vorschläge → Abstimmung → Ergebnis“ sowie „Meine Reisen“, Kontoeinstellungen, Konto löschen; Wireframes mobil zuerst, inkl. In-App-Browser-Fall; Sprachumschalter; Wochenstart Mo/So.
- Designer: Design-System inkl. barrierefreier Heatmap-Farbskala (3 Zustände + Intensität), Feiertags-/Wochenend-Darstellung, Layouts robust für längere englische/deutsche Texte.
- Operations: Tech-Stack inkl. Auth-Lösung (passwortlos + Passwort, später Social Login), i18n-Framework, **Transaktionsmail-Anbieter (EU, SPF/DKIM/DMARC)**, EU-Hosting, Feiertagsbibliothek, Datenschutzerklärung DE + EN, Impressum.
- Optional: 5 Kurzinterviews mit Organisatoren zur Validierung von A1, A2 (Kontopflicht), A3, A7.

**Meilenstein M0 ✅ (2026-10-08):** Wireframes, Auth-Konzept und Stack abgenommen; Design und Logo A bestätigt; EN-Produktname „When do we go?“ festgelegt.

## Phase 1 – MVP „Termin finden & festlegen“
**Ziel:** Eine Gruppe kommt mit schlankem Konto vom Link zum festen Reisezeitraum – auf Deutsch oder Englisch, komplett kostenlos.

### Arbeitsmodus bis zur Beta: Offline-Demo (Q15)
- Entwickelt und vorgeführt wird **lokal** – kein Hosting, keine Domain, keine Anbieter-Konten/Abos.
- Transaktionsmails werden lokal abgefangen (Dev-Mailbox/Log); der Code-Flow ist damit vollständig vorführbar.
- Betreiberangaben, Impressum, Datenschutzerklärung sind gekennzeichnete **Platzhalter** (Q14, Q16); nur Test-/Fantasiedaten, keine Personen außerhalb des Teams.
- CI (Tests, Lint, Build) läuft weiter; Staging entfällt bis G1.
- Was die Demo **nicht** beweisen kann: Beitrittsquote mit Kontopflicht (A2), echte In-App-Browser-Fälle auf fremden Geräten, Mail-Zustellbarkeit/Spam. Diese Punkte sind der Grund, die Demo-Phase kurz zu halten und G1 parallel vorzubereiten.

| Reihenfolge | Inkrement | Feature-IDs / Findings |
|---|---|---|
| 0 ✅ | P1-0 Projekt-Scaffold + P1-0a Auth-Spike (Reviewer ⚠️ freigegeben, PR #4) | – (R-001–R-006, R-008–R-012 erledigt) |
| **0a (neu)** | **UI-Fundament (Look & Feel 2.0 + Motion-Basis)** – Details unten | F-052 (Basis), Querschnitt für alle UI-Features |
| 1 | i18n-Gerüst (DE/EN) + Konto-Basis: Registrierung, Login/Logout, Zugangswiederherstellung; Kontoeinstellungen inkl. Schalter „Bewegung reduzieren“; Motion W02 (Code-Komponente); **offene Findings** | F-046, F-040, F-041, F-042, F-052 (Schalter, W02-01…08) · **R-007, R-013, R-015, Rate-Limits pro E-Mail (hoch)** |
| 2 | Reise anlegen, einladen, Beitritt im Einladungsflow, Rollen, „Meine Reisen“ (+ Motion W03–W06) | F-001, F-002, F-003, F-004, F-044 |
| 3 | Verfügbarkeit manuell + Status + Feiertage/Wochenenden (+ Motion W07/W08 „Tage malen“) | F-005, F-007, F-016 |
| 4 | Heatmap + Kandidaten-Berechnung (+ Motion W09 Heatmap-Aufbau, Vorschlag-Band) | F-008, F-009 |
| 5 | Abstimmung & Festlegung (+ Motion W10, **Feier „Es geht los!“ für alle**, W11) | F-010, F-011, F-012 |
| 6 | Datenschutz-Funktionen & Konto löschen, Hilfe-/FAQ-Seite | F-013, F-043, F-051 |
| 7 | Should-Features nach Kapazität (Reihenfolge); Motion „MVP+“ inkl. Haptik (G-18) vor der Beta | F-015, F-017, F-052 (MVP+) |

### Schritt 0a – UI-Fundament (Look & Feel 2.0 + Motion-Basis) (neu, Q18)
**Ziel:** Einmal die gemeinsame Grundlage für Optik und Bewegung legen, bevor weitere Ansichten entstehen – damit nichts doppelt gebaut oder später flächig umgestylt werden muss.

Inhalt:
- **Tokens:** `tokens.css` auf Richtung B „Reise-Cockpit“, Palette „Indigo & Minze“ (hell + dunkel nach System, Kontraste WCAG 2.2 AA inkl. Heatmap-Stufen und Fokusring) + **Motion-Tokens** (Dauern, Easings, Distanzen, Reduced-Motion-Werte).
- **Schriften:** gemäß Richtung B, selbst gehostet (kein externer Font-Dienst), mit Ladestrategie ohne Layout-Sprung.
- **Icons:** Icon-Satz der Richtung B als Komponente/Sprite (inkl. Heatmap-Symbole ✓/◐/✕).
- **Basis-Komponenten:** Button (inkl. Druck-/Ladezustand), Formularfelder inkl. Fehlerzustand, Code-Eingabe, Schalter/Checkbox/Radio, Chip, Karte, Snackbar/Toast, Bottom-Sheet/Dialog, Banner, Skelett, Seitenrahmen (Header, Footer mit Hilfe-Link, Sprachumschalter).
- **Motion-Helfer:** kleine eigene Hilfsdatei (motion-system §8), Reduced-Motion-Mechanik (`prefers-reduced-motion` + `data-motion`, lokal gespeicherte Wahl ohne Aufflackern), globale Bewegungen G-01…G-14 der Prio „MVP“.
- **Restyling des bestehenden Logins** (Scaffold/Auth-Spike: Login, Code, Magic-Link-Seite) auf die neuen Komponenten – ohne Funktionsänderung.

Fertig, wenn: Komponenten in DE/EN, hell/dunkel, 360 px und mit reduzierter Bewegung geprüft; Login sieht nach Richtung B aus und verhält sich wie vorher (bestehende Tests grün); Reviewer-Freigabe. Bezug: Designer (`docs/design/richtungen/b/`), Motion (`docs/motion/`), UI/UX (Komponenten-Verhalten).

Begründung der Einordnung **vor** Inkrement 1: Inkrement 1 baut die ersten echten Ansichten (Registrierung, Konto); ohne Fundament würden sie im alten Look entstehen und später erneut angefasst. Der Schritt bleibt bewusst schmal – Ansichts-spezifische Bewegungen (z. B. „Tage malen“, Feier) entstehen mit ihren Features.

**Findings für Inkrement 1** (Quelle: `docs/review/findings.md`): **Rate-Limits pro E-Mail-Adresse** (hoch – Ergänzung zu den IP-Limits, F-041), R-007 (ungültige Einladung ohne `h1`), R-013 (Netzwerkfehler weicht von Flow H.5 Schritt 3e ab), R-015 (Hydration-Warnung auf `/auth/magic`). R-014 (doppelte IP-Auflösung) bleibt „später entscheiden“ und blockiert Inkrement 1 nicht.

Vorgelagert (Phase-1-Start): P1-0 Projekt-Scaffold und P1-0a Auth-Spike im In-App-Browser (→ Developer/Operations) – erledigt, siehe Zeile 0. Hinweis F-051: Die statische Seite ist klein; Footer-/Menü-Link und Anker „Code kommt nicht an“ sollten bereits mit Inkrement 1 (Code-Schritt) angelegt werden, Inhalte wachsen mit den Inkrementen.

Begründung der Reihenfolge: i18n und Konto stehen am Anfang, weil Nachrüsten teuer ist (alle Texte, Mails, Rechte-Prüfungen hängen daran). Inkremente 1–5 ergeben einen durchgängig nutzbaren Fluss, der früh mit Testgruppen erprobt wird – insbesondere die **Beitrittsquote mit Kontopflicht** (Ziel ≥ 65 %, Rückfallplan Q10 bei < 50 %). F-013/F-043 müssen vor öffentlichem Launch fertig sein. Kein Kalender-Import im MVP (Q1); die manuelle Eingabe muss deshalb besonders schnell sein.

**Meilenstein M0.5 (Demo, neu):** Inkremente 1–5 lokal durchgängig vorführbar (DE und EN, mobil 360 px, Dark Mode System, Look & Feel 2.0, alle Bewegungen der Motion-Prio „MVP“ inkl. Feier „Es geht los!“ und reduzierter Bewegung), vom Reviewer freigegeben; Demo beim Auftraggeber mit Testdaten. Zweck: Abnahme des Kernflusses und Entscheidung „Go-Live vorbereiten“ ohne laufende Kosten. *Sinnvoll, weil* der Auftraggeber Hosting/Konten bewusst zurückstellt (Q15) – so gibt es trotzdem einen klaren Prüfpunkt vor dem Geldausgeben.

**Go-Live-Gate G1 (vor M1, Pflicht – Ops-Checkliste):** Sobald echte Personen außerhalb des Teams echte Daten eingeben, gelten DSGVO und Impressumspflicht. Daher **vor der Beta mit echten Testgruppen**:
- echte Betreiber-/Impressumsangaben (Q14),
- Datenschutzerklärung DE/EN und Impressum (Weg gemäß Q16, für die Beta mind. Generator-Stand),
- Domain, EU-Hosting (Staging/Beta), Transaktionsmail-Anbieter mit SPF/DKIM/DMARC, Kontaktadresse für F-051 (Q15),
- Platzhalter-Kennzeichnungen entfernt, Reviewer-Freigabe des Deployments.
Entscheidungen dazu holt der CEO beim Auftraggeber ein, sobald M0.5 erreicht ist (Vorlauf Domain/Mail-Setup ca. 1–2 Wochen).

**Meilenstein M1 (Beta):** G1 bestanden; Inkremente 1–5 mit 3–5 befreundeten Testgruppen (mind. eine gemischt DE/EN, mind. eine mit überwiegend iPhone-Nutzern); Auswertung Registrierungs-Funnel und Feedback-Frage zum Kalender-Import.
**Meilenstein M2 (öffentlicher MVP-Launch):** alle Must-Features inkl. F-051, F-052 + F-015 freigegeben (DE und EN vom Reviewer geprüft, WCAG 2.2 AA geprüft); **Rechtstexte abschließend geprüft (spätestens hier, Weg gemäß Q16)**; Datenschutzerklärung DE/EN und Impressum live; Transaktionsmail-Zustellung überwacht.

*Falls* der Auftraggeber die Beta ausschließlich im eigenen engen Umfeld ohne öffentliche Erreichbarkeit fahren will, kann G1 nicht entfallen, nur schlanker ausfallen (Impressum/Datenschutz sind bei jeder Verarbeitung personenbezogener Daten Dritter nötig) – Bewertung durch Operations.

## Ausbaustufe R – „Reise managen“ (neu 2026-10-20, Planung; Einordnung Q26)
**Ziel:** Nach der Festlegung wird die Übersicht zum **Reise-Cockpit**, aus dem die Gruppe die ganze Reise managt – Unterkunft, Kosten, Reisedaten, Unterlagen. Auftraggeber-Wunsch vom 2026-10-20; beantwortet zugleich Q19 (Unterkünfte) und Q7 (Kosten) – vorbehaltlich Q26/Q27.

**Empfohlene Einordnung (Q26):** nach Inkrement 7 (F-015, F-017, Motion MVP+) und **vor** Phase 2 (Kalender-Import). Begründung: Der Auftraggeber wünscht die Reiseorganisation ausdrücklich als nächste Stufe; sie ist das stärkste Unterscheidungsmerkmal gegenüber Doodle/Rallly/When2meet („von der Terminfindung bis zur Abrechnung“) und schafft Bindung über das Festlegen hinaus. Der Kalender-Import senkt dagegen Aufwand in einem Schritt, der bereits funktioniert. Entwickelt wird weiter im Arbeitsmodus Offline-Demo + private Vorschau (Q25); Go-Live G1 kann parallel vorbereitet werden.

| Inkrement | Inhalt | Feature-IDs | Aufwand | Echte Daten ab |
|---|---|---|---|---|
| 8 | Reise-Cockpit Phase 3 (Teilphasen Vorbereitung/Unterwegs/Danach, „Für dich zu tun“, Kacheln), Phase-3-Navigation, Infoseite (Text/Links) | F-053, F-033 | S–M (≈ 1) | G1 |
| 9 | Unterkünfte Stufe 1: Link + Vorschau (SSRF-sicher, Bild-Proxy), Swipe, Rangliste, Festlegen, „gebucht“ (+ Motion Swipe) | F-031 | M–L (≈ 1–1,5) | G1 |
| 10 | Kosten teilen Stufe 1: Ausgaben (eine Währung, gleich/Beträge, Platzhalter), Salden, Ausgleichsvorschlag, als bezahlt markieren, Abschluss | F-035, F-036 | M–L (≈ 1,5) | G1 |
| 11 | Zuständigkeit „Bucht“ + Reisedaten Stufe 1 (Anfrage → Einwilligung/Freigabe, Feldverschlüsselung, Maskierung, Zugriffsprotokoll, Widerruf, Auto-Löschung) + Security-Review | F-056, F-054 | M (≈ 1) | **G1 + G1b** |
| 12 | Datei-Infrastruktur (EU-Objektspeicher, Virenscan, Header-Härtung) + Reiseunterlagen Stufe 1 + Screenshots für Unterkünfte | F-055, F-031 (Stufe 2) | L (≈ 1,5–2) | **G1 + G1b** |

**Summe ≈ 6–7 Inkremente.** Reihenfolge-Begründung (Details features.md R.2): erst der Rahmen (Cockpit), dann die chronologisch erste und spaßigste Aufgabe nach dem Termin (Unterkunft), dann der größte Dauernutzen ohne sensible Daten (Kosten), zuletzt die beiden Bereiche mit hohem Datenschutz-/Infrastruktur-Aufwand (Reisedaten, Dateien), die mit echten Daten ohnehin erst nach G1b laufen dürfen. Alternative Q27: Inkrement 11 vor 10 ziehen (keine technische Abhängigkeit).

**Je Inkrement:** UI/UX + Designer liefern vorab Mockups (Briefing siehe Bericht PM 2026-10-20), Motion Designer die Bewegungen (Swipe, Kachel-Eintritt, Saldo-Ausgleich), Reviewer prüft DE/EN, 360 px, Dark Mode, reduzierte Bewegung, WCAG 2.2 AA.

**Gate G1b – Sicherheit & Datenschutz für sensible Reisedaten und Dateien (neu, vor echter Nutzung von F-054/F-055, zusätzlich zu G1):**
- Feldverschlüsselung für Reisedaten mit Schlüssel außerhalb der DB, Rotationskonzept, Runbook bei Schlüsselverlust/-leck;
- EU-Objektspeicher (privat, verschlüsselt) mit AVV, Backups/Löschung nach Löschkonzept; Virenscan in Betrieb; Upload-Härtung (Typen, Größen, EXIF, Header);
- DSFA-Schwellwertanalyse (voraussichtlich schlanke DSFA) für F-054/F-055; VVT, TOMs, Löschkonzept (Reisedaten 7 Tage, Unterlagen 30 Tage nach Reiseende – Q31) in `docs/ops/compliance-checklist.md` ergänzt;
- Datenschutzerklärung (Einwilligung F-054, Empfänger, Fristen) und Nutzungsbedingungen (Upload-Regeln, Verantwortung der „Bucht“-Person) ergänzt; Meldeweg für rechtswidrige Inhalte (DSA-Pflichten Hosting-Dienst prüfen);
- rechtliche Kurzprüfung zur Speicherung von Ausweis-/Passnummern (Verwendungsbeschränkungen der Seriennummer);
- Security-Review durch den Reviewer bestanden (Rechteprüfung, keine sensiblen Daten in Logs/Mails/URLs).

**Meilenstein M-R „Reise managen“:** Inkremente 8–12 in Demo/Vorschau durchgängig vorführbar (Fantasiedaten), vom Reviewer freigegeben; Demo beim Auftraggeber. Echte Nutzung von 8–10 ab G1, von 11–12 ab G1b.

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

> **Seit 2026-10-20:** F-031 (Unterkünfte), F-033 (Infoseite), F-035/F-036 (Kosten) sind in die **Ausbaustufe R „Reise managen“** vorgezogen (oben); hier bleiben die späteren Erweiterungen.
**Ziel:** Von der Terminfindung bis zur Abrechnung in einer App; nachhaltiger Betrieb über Freemium.

| Stufe | Inhalt | Feature-IDs |
|---|---|---|
| 3a Planung | Zielfindung, Aufgaben/Packliste, Budget; Erweiterungen von Unterkünften/Infoseite (features.md „später“) | F-030, F-032, F-034 |
| 3b Kosten | Fremdwährungen, Belegfotos, Export (Erweiterung von F-035/F-036) | F-037 |
| 3c Plattform | PWA/Push; **Apple-Weg Stufe 3** (On-Device, gemäß Spike-Ergebnis) | F-038, **F-049** |
| 3d Premium | Premium-Tarif & Bezahlung starten (Kern bleibt kostenlos) | F-050 |

Reihenfolge 3a vs. 3b: Die Kosten-Basis ist mit der Ausbaustufe R vorgezogen (Q7 → Q26/Q27). Historischer PM-Hinweis: 3b ist ein eigenständiger Markt mit starken Wettbewerbern (Tricount, Splitwise). Lohnend nur als nahtlose Fortsetzung der geplanten Reise (Mitglieder und Konten sind schon da, kein erneutes Einladen) – das ist unser Differenzierungsargument und hat zugleich Premium-Potenzial (F-037, Belegfotos). 3d startet frühestens, wenn genügend Premium-Kandidaten aus 2/3a/3b verfügbar sind und Q8 entschieden ist.
