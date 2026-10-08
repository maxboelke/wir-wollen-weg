# PRD – Wir wollen weg

Stand: 2026-10-08 · Verantwortlich: Product Manager · Status: Entwurf v0.1 (wartet auf Klärung der offenen Fragen)

Verwandte Dokumente: [features.md](features.md) · [roadmap.md](roadmap.md)

---

## 1. Vision

**„Von ‚Wir müssten mal wieder zusammen weg‘ zum festen Reisedatum – in einer Woche statt in drei Monaten Gruppenchat.“**

„Wir wollen weg“ ist eine Web-App, in der eine Freundesgruppe ohne Registrierungshürde ihre Verfügbarkeit zusammenlegt, sofort sieht, wann ein gemeinsamer Urlaub möglich ist, und per Abstimmung verbindlich einen Zeitraum festlegt. Langfristig begleitet die App die ganze Gruppenreise: Ziel, Unterkunft, Aufgaben und Kostenausgleich.

## 2. Problem

- Gruppenreisen scheitern selten am Wollen, sondern an der Terminfindung: 4–12 Personen mit Job, Schichten, Familie, Hochzeiten, Schulferien.
- Heute läuft das im Gruppenchat: Nachrichten gehen unter, niemand hat den Überblick, die Lauten setzen sich durch, Nachzügler blockieren alles.
- Bestehende Tools passen nicht:
  - **Doodle / Rallly** – man stimmt über *vorgegebene* Termine ab. Für Urlaub muss der Organisator die Optionen aber erst einmal *finden* – genau das ist das Problem. Zudem für Einzeltermine (Stunden) gebaut, nicht für mehrtägige Zeiträume.
  - **When2meet** – Verfügbarkeits-Heatmap, aber nur Stunden-Raster für wenige Tage, keine Mehrtages-Logik, keine Entscheidungsphase, wirkt veraltet, mobil schwach.
  - **Geteilte Kalender** – zeigen Termindetails (Datenschutz!) und keine Auswertung „wann können alle 7 Tage am Stück?“.
  - **Tricount / Splitwise** – lösen nur die Kosten nach der Reise.
- Lücke: **Mehrtägige Verfügbarkeitssuche + Entscheidung + (später) Reiseorganisation in einem Fluss**, privatsphärefreundlich und ohne Konto.

## 3. Zielgruppe & Personas

Primär: Freundesgruppen (3–15 Personen, Kernalter 22–45), die 1–3 gemeinsame Reisen pro Jahr planen (Städtetrip, Ferienhaus, Skiurlaub, JGA, Festival). Sekundär: Familien(-zweige), Vereine, kleine Teams für Offsites. Deutschsprachiger Raum zuerst.

### Persona 1 – Lena, die Organisatorin (31, Projektmanagerin)
- Bringt die Reise ins Rollen, schreibt die Nachricht in die WhatsApp-Gruppe, jagt allen hinterher.
- **Ziel:** schnell einen Termin festzurren, ohne Diktatorin zu sein; Fairness und Transparenz.
- **Frust:** „Wer hat schon geantwortet?“, 80 Chatnachrichten, Termine, die sich nachträglich doch nicht ausgehen.
- **Braucht:** Reise in < 2 Minuten anlegen, Link teilen, Fortschritt sehen, Vorschläge automatisch berechnet, Nachzügler erinnern, Ergebnis verkünden.

### Persona 2 – Jonas, der Mitreisende mit vollem Kalender (36, Berater, zwei Kinder)
- Kalender in Outlook (Job) und Google (privat/Familie), viele Termine, wenig Zeit.
- **Ziel:** mit minimalem Aufwand korrekt angeben, wann er kann – ohne Termindetails preiszugeben.
- **Frust:** Termine abtippen, Firmenkalender darf er nicht freigeben, „vielleicht“-Situationen (Urlaub müsste beantragt werden, Kinder-Betreuung zu klären).
- **Braucht:** Kalender-Import nur als frei/belegt, schnelles Korrigieren, Zustand „ginge zur Not“.

### Persona 3 – Kemal, der Nachzügler (27, Student/Schichtarbeit)
- Klickt den Link erst nach Tagen, auf dem Handy, zwischen zwei Dingen. Hat keine Lust auf Registrierung.
- **Ziel:** in < 3 Minuten dabei sein, ohne Konto, ohne App-Download.
- **Frust:** Login-Zwang, Formulare, „Passwort vergessen“.
- **Braucht:** Name eingeben → Tage antippen → fertig; später über denselben Link zurückkommen; Erinnerung, dass er noch fehlt.

## 4. Ziele & Erfolgskriterien

| Ziel | Messgröße (MVP) | Zielwert |
|---|---|---|
| Gruppen kommen zu einem Ergebnis | Anteil angelegter Reisen (≥ 3 Mitglieder) mit festgelegtem Zeitraum | ≥ 40 % |
| Schnell | Median Zeit von Anlage bis Festlegung | ≤ 7 Tage |
| Niedrige Einstiegshürde | Anteil eingeladener Link-Öffner, die Verfügbarkeit abgeben | ≥ 70 % |
| Mitmachen geht schnell | Median-Zeit Link-Öffnen → Verfügbarkeit abgegeben (mobil) | ≤ 3 Min. |
| Nutzen der Berechnung | Anteil abgeschlossener Reisen, deren Ergebnis aus einem berechneten Vorschlag stammt | ≥ 80 % |
| Wiederkehr / Wachstum | Anteil Organisatoren, die innerhalb 6 Monaten eine 2. Reise anlegen; Anteil Mitglieder, die selbst eine Reise anlegen | ≥ 25 % / ≥ 10 % |

Messung über datensparsame, cookie-freie Ereignis-Statistik (kein Tracking einzelner Personen).

## 5. Produktprinzipien

1. **Kein Konto nötig.** Mitmachen per Link + Name. Konto ist optionaler Komfort.
2. **Privatsphäre by Design.** Aus Kalendern wird nur „frei/belegt pro Tag“ übernommen; Titel, Orte, Teilnehmer werden nie gespeichert.
3. **Mobile first.** Die meisten öffnen den Link aus WhatsApp/Signal auf dem Handy.
4. **Tage statt Stunden.** Urlaubsplanung denkt in Tagen/Nächten.
5. **Die App schlägt vor, die Gruppe entscheidet.** Algorithmus liefert Kandidaten, Abstimmung schafft Legitimität, Organisator schließt ab.

## 6. MVP-Scope

Kernfluss (Details & Akzeptanzkriterien in [features.md](features.md)):

1. **Reise anlegen** (F-001): Name, Suchzeitraum, Mindest- und Wunschdauer.
2. **Einladen per Link** (F-002) und **beitreten ohne Registrierung** (F-003), Rollen Organisator/Mitglied (F-004).
3. **Verfügbarkeit angeben**: manuell pro Tag mit drei Zuständen *geht / ginge zur Not / geht nicht* (F-005) und **ICS-Import** einmalig per Datei oder Kalender-URL, nur frei/belegt (F-006). Teilnahmestatus sichtbar (F-007).
4. **Gemeinsamer Kalender als Heatmap** (F-008) und **automatisch berechnete Kandidaten-Zeiträume** „alle können“ / „fast alle können“ (F-009).
5. **Abstimmung** über ausgewählte Zeiträume mit Ja/Vielleicht/Nein (F-010, F-011), **Festlegung des Ergebnisses** inkl. Kalendereintrag zum Herunterladen (F-012).
6. **Datenschutz-Grundfunktionen**: eigene Daten löschen, Reise löschen, automatische Löschung (F-013).
7. **Teilen-Texte für den Gruppenchat** statt eigener Benachrichtigungs-Infrastruktur (F-002, F-015) – E-Mail-Benachrichtigungen als *Should* (F-014).

**Bewusste MVP-Entscheidung Kalender:** Kein Google/Microsoft-OAuth im MVP. Begründung: Googles Kalender-Scopes sind „sensitive“ und erfordern eine App-Verifizierung (Wochen, Datenschutz-Audit-Aufwand), Microsoft-Firmenkonten erfordern oft Admin-Freigabe, Apple/iCloud bietet gar kein OAuth. ICS (Export-Datei bzw. „geheime iCal-Adresse“) funktioniert bei **allen** drei Anbietern und deckt damit 100 % der Kalender ab – mit etwas mehr Klickaufwand. OAuth folgt in v1 (F-020, F-021), sobald der Kernnutzen validiert ist.

### Kernlogik gemeinsamer Kalender (Kurzfassung)
- Raster: **Kalendertage**. Eine Reise der Dauer *n* Nächte belegt *n+1* aufeinanderfolgende Tage (An- und Abreisetag).
- Pro Mitglied und Tag ein Zustand: *geht* (Standard für nicht markierte Tage nach Abgabe), *ginge zur Not*, *geht nicht*.
- Kandidat = zusammenhängendes Fenster mit Länge ≥ Mindestdauer innerhalb des Suchzeitraums.
  - **„Alle können“**: kein Mitglied hat einen *geht nicht*-Tag im Fenster.
  - **„Fast alle können“**: höchstens *k* Mitglieder (Standard k = 1, einstellbar) haben *geht nicht*-Tage; Fehlende werden namentlich angezeigt.
- Sortierung: (1) Anzahl fehlender Personen ↑, (2) Summe *ginge zur Not*-Tage ↑, (3) Nähe zur Wunschdauer, (4) früheres Datum. Überlappende Fenster werden zu maximalen Zeitspannen zusammengefasst („zwischen 3. und 17. Juli sind 7 Nächte für alle möglich“).
- Nur Mitglieder mit abgegebener Verfügbarkeit fließen ein; offene Mitglieder werden als Warnhinweis angezeigt.

## 7. Nicht-Ziele (MVP)

- Kein stunden-/uhrzeitgenaues Planen (keine Meeting-Planung, Abgrenzung zu Doodle/When2meet).
- Kein Schreibzugriff auf Kalender der Nutzer, kein dauerhafter Abo-Sync (erst v1).
- Keine nativen Apps (responsive Web-App, ggf. PWA später).
- Kein Chat in der App – der Gruppenchat existiert bereits.
- Keine Buchung, keine Zahlungsabwicklung, keine Affiliate-Angebote.
- Keine Zielfindung, Aufgaben, Ausgaben (Ausbaustufen, siehe Roadmap).
- Keine Mehrsprachigkeit (nur Deutsch; Texte aber i18n-fähig anlegen).
- Kein Ranking-/Präferenzwahl-Verfahren (Approval-Voting reicht für 2–6 Optionen).

## 8. Nicht-funktionale Anforderungen

- **Datenschutz/DSGVO:** Datensparsamkeit; Hosting in der EU; Kalender-Rohdaten nur im Arbeitsspeicher verarbeiten und sofort verwerfen; gespeicherte Kalender-URLs (erst v1) verschlüsselt; Reisen werden standardmäßig 90 Tage nach Reiseende bzw. nach 12 Monaten Inaktivität gelöscht. Datenschutzerklärung & Impressum (→ Operations).
- **Sicherheit:** Einladungs- und persönliche Links mit nicht erratbaren Tokens (≥ 128 Bit); Organisator-Rechte nur über eigenen Admin-Link/Session; Rate-Limiting beim Beitreten; keine Indexierung von Reiseseiten (noindex).
- **Mobile & Performance:** voll bedienbar ab 360 px Breite; erste Ansicht < 2 s auf 4G.
- **Barrierefreiheit:** WCAG 2.1 AA; Heatmap nicht nur über Farbe kodiert (Zahl/Muster), Kalender per Tastatur bedienbar.
- **Skalierung:** bis 30 Mitglieder pro Reise, Suchzeitraum bis 12 Monate; Berechnung < 500 ms.
- **Zeitzonen:** Tage werden in der Zeitzone der Reise (Standard: Zeitzone des Organisators) ausgewertet.

## 9. Annahmen (zu validieren)

| # | Annahme | Wie validieren |
|---|---|---|
| A1 | Das größte Problem ist das *Finden* möglicher Zeiträume, nicht das Abstimmen. | Interviews mit 5–8 Organisatoren; Nutzung von F-009 vs. eigenen Zeiträumen. |
| A2 | Nutzer akzeptieren ohne Konto zu arbeiten; Wiederkehr über persönlichen Link reicht. | Quote „Link verloren“-Anfragen, Rückkehrquote. |
| A3 | Manuelle Tageseingabe + ICS-Import reichen fürs MVP; OAuth ist Komfort, kein Muss. | Anteil ICS-Nutzung, Abbruchrate auf der Import-Seite, Feedback. |
| A4 | Kalender-Belegung ≠ Urlaubsmöglichkeit: Viele Tage sind „frei“ im Kalender, aber Arbeitstage. Der Zustand *ginge zur Not* fängt das ab. | Beobachten, wie viele Tage Nutzer nach dem Import manuell ändern. |
| A5 | Ein Approval-Voting (Ja/Vielleicht/Nein) erzeugt genug Konsens; der Organisator entscheidet bei Gleichstand. | Anteil Abstimmungen mit eindeutigem Sieger. |
| A6 | Gruppen kommunizieren weiterhin im eigenen Chat; Teilen-Texte ersetzen Push/E-Mail im MVP weitgehend. | Klickrate auf Teilen-Buttons, Feedback zu fehlenden Benachrichtigungen. |

## 10. Risiken

| Risiko | Auswirkung | Gegenmaßnahme |
|---|---|---|
| Nachzügler geben nie ab → Ergebnis blockiert | Kernversprechen scheitert | Teilnahmestatus sichtbar, Erinnerungs-Text, Berechnung auch ohne alle (Hinweis), Organisator kann Mitglieder entfernen/ignorieren. |
| ICS-Import zu kompliziert (Wo finde ich die URL?) | Nutzer tippen alles manuell oder brechen ab | Schritt-für-Schritt-Anleitungen je Anbieter mit Screenshots; manuelle Eingabe bleibt vollwertig. |
| Datenschutz-Bedenken bei Kalender-Import | Geringe Nutzung, Imageschaden | Klar kommunizieren „nur frei/belegt“, Vorschau vor Übernahme, keine Speicherung der Rohdaten, Löschfunktion. |
| Missbrauch geteilter Links (Fremde treten bei) | Datenmüll, Privatsphäre | Organisator sieht/entfernt Mitglieder, Link kann neu erzeugt werden (F-004), optionale Beitrittssperre. |
| Ganztägige Termine falsch interpretiert (z. B. Geburtstage, „Homeoffice“) | Falsch blockierte Tage | Import-Vorschau mit Korrektur; Option, ganztägige Termine bestimmter Kalender zu ignorieren; nur Termine mit Status „beschäftigt“ werten. |
| Keine Monetarisierung | Betrieb nicht nachhaltig | Kosten minimal halten; Geschäftsmodell als offene Frage (siehe unten). |
| Starke Wettbewerber ergänzen Funktion (z. B. Doodle) | Differenzierung schwindet | Fokus auf Urlaubs-Spezifika (Mehrtägigkeit, Heatmap, später Reise + Kosten in einem Fluss). |

## 11. Wettbewerb & Abgrenzung (Kurzrecherche)

| Tool | Stärke | Lücke für unseren Fall | Was wir übernehmen |
|---|---|---|---|
| Doodle | Bekannt, Ja/Wenn-nötig/Nein-Abstimmung | Optionen müssen vorher bekannt sein; stundenorientiert; viel Werbung/Paywall | Drei-Stufen-Abstimmung („wenn nötig“ ≙ „ginge zur Not“/„vielleicht“) |
| Rallly (Open Source) | Ohne Konto, schlank, modern | Ebenfalls nur Abstimmung über vorgegebene Termine | Gastzugang per Name, Organisator schließt Umfrage ab |
| When2meet | Verfügbarkeits-Heatmap, „paint to select“ | Stunden-Raster, wenige Tage, keine Entscheidung, schwach mobil | Heatmap + Wisch-/Zieh-Auswahl, aber auf Tage übertragen |
| Tricount / Splitwise | Ausgaben teilen, Ausgleich mit minimalen Überweisungen, ohne Konto (Tricount) | Keine Planung vor der Reise | Spätere Ausbaustufe: Ausgaben pro Reise, Ausgleichsvorschlag |
| Geteilter Google-/Outlook-Kalender | Echtzeit | Zeigt Details, keine Gruppenauswertung, Plattform-Silos | Nur Frei/Belegt-Prinzip (wie Free/Busy) |

**Positionierung:** Das einzige Tool, das für **mehrtägige Gruppenreisen** die möglichen Zeiträume *selbst findet* – privatsphärefreundlich, ohne Konto – und später die Reise bis zur Abrechnung begleitet.

## 12. Offene Fragen (Entscheidung Auftraggeber)

Siehe Bericht des PM an den CEO; Entscheidungen werden hier nachgetragen.

| # | Frage | Empfehlung PM | Entscheidung |
|---|---|---|---|
| Q1 | Kalender-Anbindung im MVP nur ICS + manuell, OAuth erst v1? | Ja | offen |
| Q2 | Konto im MVP komplett weglassen (nur Links, optional E-Mail für Admin-Link)? | Ja | offen |
| Q3 | E-Mail-Benachrichtigungen im MVP oder nur Teilen-Texte? | Teilen-Texte Must, E-Mail Should | offen |
| Q4 | Geschäftsmodell (kostenlos/Spenden, Freemium, Affiliate)? | Erst kostenlos, Entscheidung vor v1 | offen |
| Q5 | Zielmarkt/Sprache nur DE oder von Beginn an DE+EN? | DE, i18n-fähig | offen |
| Q6 | Gruppengröße begrenzen (Vorschlag max. 30)? | Ja, 30 | offen |
