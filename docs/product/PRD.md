# PRD – Wir wollen weg

Stand: 2026-10-08 · Verantwortlich: Product Manager · Status: Entwurf v0.2 (Entscheidungen Q1–Q6 des Auftraggebers eingearbeitet, siehe §12)

Verwandte Dokumente: [features.md](features.md) · [roadmap.md](roadmap.md)

**Änderungen v0.2 (2026-10-08):** Konto-Pflicht im MVP (Q2) · MVP nur manuelle Verfügbarkeit, ICS-Import nach v1, Apple-/iOS-Kalender als eigener Roadmap-Strang (Q1) · keine E-Mail-Benachrichtigungen im MVP, nur Transaktionsmails fürs Konto (Q3) · Freemium (Q4) · Deutsch + Englisch ab MVP (Q5) · max. 30 Mitglieder bestätigt (Q6).

---

## 1. Vision

**„Von ‚Wir müssten mal wieder zusammen weg‘ zum festen Reisedatum – in einer Woche statt in drei Monaten Gruppenchat.“**

„Wir wollen weg“ ist eine Web-App, in der eine Freundesgruppe mit einem schlanken Konto (Registrierung in unter einer Minute, direkt aus dem Einladungslink) ihre Verfügbarkeit zusammenlegt, sofort sieht, wann ein gemeinsamer Urlaub möglich ist, und per Abstimmung verbindlich einen Zeitraum festlegt. Langfristig begleitet die App die ganze Gruppenreise: Ziel, Unterkunft, Aufgaben und Kostenausgleich – auf Deutsch und Englisch.

## 2. Problem

- Gruppenreisen scheitern selten am Wollen, sondern an der Terminfindung: 4–12 Personen mit Job, Schichten, Familie, Hochzeiten, Schulferien.
- Heute läuft das im Gruppenchat: Nachrichten gehen unter, niemand hat den Überblick, die Lauten setzen sich durch, Nachzügler blockieren alles.
- Bestehende Tools passen nicht:
  - **Doodle / Rallly** – man stimmt über *vorgegebene* Termine ab. Für Urlaub muss der Organisator die Optionen aber erst einmal *finden* – genau das ist das Problem. Zudem für Einzeltermine (Stunden) gebaut, nicht für mehrtägige Zeiträume.
  - **When2meet** – Verfügbarkeits-Heatmap, aber nur Stunden-Raster für wenige Tage, keine Mehrtages-Logik, keine Entscheidungsphase, wirkt veraltet, mobil schwach.
  - **Geteilte Kalender** – zeigen Termindetails (Datenschutz!) und keine Auswertung „wann können alle 7 Tage am Stück?“.
  - **Tricount / Splitwise** – lösen nur die Kosten nach der Reise.
- Lücke: **Mehrtägige Verfügbarkeitssuche + Entscheidung + (später) Reiseorganisation in einem Fluss**, privatsphärefreundlich und mit minimaler Einstiegshürde.

## 3. Zielgruppe & Personas

Primär: Freundesgruppen (3–15 Personen, Kernalter 22–45), die 1–3 gemeinsame Reisen pro Jahr planen (Städtetrip, Ferienhaus, Skiurlaub, JGA, Festival). Sekundär: Familien(-zweige), Vereine, kleine Teams für Offsites. Markt: deutschsprachiger Raum zuerst, **Englisch ab MVP** für gemischte/internationale Gruppen und englischsprachige Märkte (siehe Q5, Q9).

### Persona 1 – Lena, die Organisatorin (31, Projektmanagerin)
- Bringt die Reise ins Rollen, schreibt die Nachricht in die WhatsApp-Gruppe, jagt allen hinterher.
- **Ziel:** schnell einen Termin festzurren, ohne Diktatorin zu sein; Fairness und Transparenz.
- **Frust:** „Wer hat schon geantwortet?“, 80 Chatnachrichten, Termine, die sich nachträglich doch nicht ausgehen.
- **Braucht:** Konto + Reise in < 2 Minuten anlegen, Link teilen, Fortschritt sehen, Vorschläge automatisch berechnet, Nachzügler erinnern, Ergebnis verkünden; alle ihre Reisen an einem Ort („Meine Reisen“).

### Persona 2 – Jonas, der Mitreisende mit vollem Kalender (36, Berater, zwei Kinder)
- Kalender in Outlook (Job) und auf dem iPhone (iCloud, privat/Familie), viele Termine, wenig Zeit.
- **Ziel:** mit minimalem Aufwand korrekt angeben, wann er kann – ohne Termindetails preiszugeben.
- **Frust:** Termine abtippen, Firmenkalender darf er nicht freigeben, „vielleicht“-Situationen (Urlaub müsste beantragt werden, Kinder-Betreuung zu klären).
- **Braucht:** im MVP schnelle manuelle Eingabe (Ziehen über Zeiträume, Schnellaktionen, Zustand „ginge zur Not“); ab v1 Kalender-Import nur als frei/belegt – **inklusive Apple-/iPhone-Kalender**.

### Persona 3 – Kemal, der Nachzügler (27, Student/Schichtarbeit)
- Klickt den Link erst nach Tagen, auf dem Handy, im In-App-Browser von WhatsApp, zwischen zwei Dingen. Hat wenig Lust auf Registrierung.
- **Ziel:** in < 4 Minuten dabei sein, ohne App-Download, ohne sich ein Passwort ausdenken zu müssen.
- **Frust:** lange Formulare, „Passwort vergessen“, Bestätigungsmail, die im falschen Browser aufgeht und ihn aus dem Kontext reißt.
- **Braucht:** Reise-Vorschau vor der Registrierung → Name + E-Mail → 6-stelliger Code aus der Mail eintippen (oder Link) → direkt zurück in der Reise → Tage antippen → fertig. Später auf jedem Gerät per Login zurückkommen.

## 4. Ziele & Erfolgskriterien

| Ziel | Messgröße (MVP) | Zielwert |
|---|---|---|
| Gruppen kommen zu einem Ergebnis | Anteil angelegter Reisen (≥ 3 Mitglieder) mit festgelegtem Zeitraum | ≥ 40 % |
| Schnell | Median Zeit von Anlage bis Festlegung | ≤ 7 Tage |
| Niedrige Einstiegshürde trotz Konto | Anteil Einladungs-Link-Öffner (neu, ohne Konto), die die Registrierung abschließen und beitreten | ≥ 65 % |
| Registrierung tut nicht weh | Abschlussquote Registrierung im Einladungsflow (gestartet → verifiziert); Median-Dauer | ≥ 80 % / ≤ 60 s |
| Mitmachen geht schnell | Median-Zeit Link-Öffnen → Verfügbarkeit abgegeben (mobil, inkl. Registrierung) | ≤ 4 Min. |
| Nutzen der Berechnung | Anteil abgeschlossener Reisen, deren Ergebnis aus einem berechneten Vorschlag stammt | ≥ 80 % |
| Wiederkehr / Wachstum | Anteil Organisatoren, die innerhalb 6 Monaten eine 2. Reise anlegen; Anteil Mitglieder, die selbst eine Reise anlegen | ≥ 25 % / ≥ 15 % |
| Zweisprachigkeit trägt | Anteil Reisen mit mind. einem englischsprachigen Mitglied (Beobachtung, kein Zielwert im MVP) | messen |

Messung über datensparsame, cookie-freie Ereignis-Statistik (aggregiert, kein Tracking einzelner Personen, keine Weitergabe an Dritte). Das Konto erleichtert die Messung von Wiederkehr; personenbezogene Auswertungen finden trotzdem nicht statt.

## 5. Produktprinzipien

1. **Konto ja – Hürde minimal.** Wer mitmacht, hat ein Konto (Identität, Wiederkehr auf allen Geräten, keine verlorenen Links). Registrierung direkt im Einladungsflow ohne Kontextverlust, standardmäßig passwortlos (E-Mail-Code/Magic-Link), nur Name + E-Mail.
2. **Mitmachen ist immer kostenlos.** Freemium: Alles, was eine Gruppe zum Finden und Festlegen eines Termins braucht, bleibt gratis. Bezahlt wird später nur Komfort für Organisatoren – nie mit Daten, nie mit Werbung.
3. **Privatsphäre by Design.** Aus Kalendern (ab v1) wird nur „frei/belegt pro Tag“ übernommen; Titel, Orte, Teilnehmer werden nie gespeichert. Konto speichert nur, was nötig ist.
4. **Mobile first.** Die meisten öffnen den Link aus WhatsApp/Signal auf dem Handy – oft im In-App-Browser.
5. **Tage statt Stunden.** Urlaubsplanung denkt in Tagen/Nächten.
6. **Die App schlägt vor, die Gruppe entscheidet.** Algorithmus liefert Kandidaten, Abstimmung schafft Legitimität, Organisator schließt ab.
7. **Zweisprachig von Anfang an.** Deutsch und Englisch sind gleichwertig; Datum, Wochenstart und Feiertage folgen der Region der Person.

## 6. MVP-Scope

Kernfluss (Details & Akzeptanzkriterien in [features.md](features.md)):

1. **Konto** (F-040–F-044): Registrierung (passwortlos per E-Mail-Code/Magic-Link, optional Passwort), Login/Logout, Passwort & Zugangswiederherstellung, Konto löschen (DSGVO), Übersicht „Meine Reisen“.
2. **Reise anlegen** (F-001): Name, Suchzeitraum, Mindest- und Wunschdauer – nur mit Konto.
3. **Einladen per Link** (F-002) und **Beitreten mit Konto direkt im Einladungsflow** (F-003), Rollen Organisator/Mitglied (F-004).
4. **Verfügbarkeit angeben – nur manuell**: pro Tag mit drei Zuständen *geht / ginge zur Not / geht nicht* (F-005), mit Wochenenden und Feiertagen (F-016). Teilnahmestatus sichtbar (F-007).
5. **Gemeinsamer Kalender als Heatmap** (F-008) und **automatisch berechnete Kandidaten-Zeiträume** „alle können“ / „fast alle können“ (F-009).
6. **Abstimmung** über ausgewählte Zeiträume mit Ja/Vielleicht/Nein (F-010, F-011), **Festlegung des Ergebnisses** inkl. Kalendereintrag zum Herunterladen (F-012).
7. **Datenschutz-Grundfunktionen**: Reise verlassen, Reise löschen, automatische Löschung (F-013), Konto löschen (F-043).
8. **Deutsch & Englisch** (F-046): vollständige Oberfläche, Teilen-Texte und Transaktionsmails in beiden Sprachen, Sprachumschaltung, lokalisierte Datums-/Wochenstart-Formate.
9. **Kommunikation über Teilen-Texte** für den Gruppenchat (F-002, F-015). **Keine** E-Mail-Benachrichtigungen im MVP (F-014 → v1). Transaktionsmails fürs Konto (Code/Magic-Link, Passwort-Reset, E-Mail-Änderung, Konto-/Löschhinweise) sind davon ausgenommen und Teil des MVP.

**Bewusste MVP-Entscheidung Kalender (Q1):** Kein Kalender-Import im MVP. Die manuelle Eingabe wird dafür so schnell wie möglich gestaltet (Ziehen/Wischen, Bereichsauswahl, Schnellaktionen „Mo–Fr = ginge zur Not“, Feiertage sichtbar). Begründung: Der Kernnutzen (Zeiträume finden + entscheiden) lässt sich ohne Import validieren; ICS-Import ist technisch der riskanteste Teil (RRULE, Zeitzonen, SSRF). In v1 folgt der ICS-Import (F-006) **zusammen mit einem eigenen Weg für Apple-/iOS-Kalender** (F-047), danach iCloud-CalDAV (F-048), Abo-Sync (F-019) und Google/Microsoft-OAuth (F-020, F-021). Apple ist explizit priorisiert, weil iCloud kein OAuth bietet und ein großer Teil der Zielgruppe ein iPhone nutzt – ohne eigenen Weg wären diese Nutzer dauerhaft auf Handeingabe angewiesen. Siehe [roadmap.md](roadmap.md), Abschnitt „Strang Apple-/iOS-Kalender“.

### Kernlogik gemeinsamer Kalender (Kurzfassung)
- Raster: **Kalendertage**. Eine Reise der Dauer *n* Nächte belegt *n+1* aufeinanderfolgende Tage (An- und Abreisetag).
- Pro Mitglied und Tag ein Zustand: *geht* (Standard für nicht markierte Tage nach Abgabe), *ginge zur Not*, *geht nicht*.
- Kandidat = zusammenhängendes Fenster mit Länge ≥ Mindestdauer innerhalb des Suchzeitraums.
  - **„Alle können“**: kein Mitglied hat einen *geht nicht*-Tag im Fenster.
  - **„Fast alle können“**: höchstens *k* Mitglieder (Standard k = 1, einstellbar) haben *geht nicht*-Tage; Fehlende werden namentlich angezeigt.
- Sortierung: (1) Anzahl fehlender Personen ↑, (2) Summe *ginge zur Not*-Tage ↑, (3) Nähe zur Wunschdauer, (4) früheres Datum. Überlappende Fenster werden zu maximalen Zeitspannen zusammengefasst („zwischen 3. und 17. Juli sind 7 Nächte für alle möglich“).
- Nur Mitglieder mit abgegebener Verfügbarkeit fließen ein; offene Mitglieder werden als Warnhinweis angezeigt.

### Identität & Zugriff (neu, Q2)
- **Jede Person, die einer Reise beitritt oder eine anlegt, hat ein Konto.** Es gibt keine Gast-Mitgliedschaften, keine persönlichen Links und keinen Admin-Link mehr.
- **Einladung bleibt ein Link** (ein Einladungslink pro Reise, optional persönliche Platzhalter-Links, F-007). Der Link gewährt nur das Recht, die Reise-Vorschau zu sehen und beizutreten – Inhalte (Namen, Verfügbarkeiten, Stimmen) sieht nur, wer angemeldet *und* Mitglied ist.
- **Organisator-Rechte** hängen am Konto des Organisators (serverseitig geprüft), nicht an einem geheimen Link.
- **Zugangsverlust** wird über die E-Mail-Adresse gelöst (neuer Code/Magic-Link, Passwort-Reset) – der Organisator muss nichts mehr „neu erzeugen“.
- **Anmeldemethoden MVP:** E-Mail + Einmal-Code/Magic-Link (Standard, passwortlos) und optional Passwort. **Social Login** (Sign in with Apple, Google) folgt in v1 (F-045).
- **Warum Code *und* Link:** Viele öffnen die Einladung im In-App-Browser von WhatsApp/Instagram; ein Magic-Link aus der Mail-App öffnet dagegen den Standardbrowser → Kontextverlust. Der 6-stellige Code wird im *selben* Fenster eingetippt; der Link funktioniert zusätzlich und führt dank gespeicherter Rücksprungadresse ebenfalls zur Reise zurück.

### Geschäftsmodell: Freemium (Q4)
- **MVP: komplett kostenlos**, keine Bezahlfunktionen, keine Limits außer der technischen Obergrenze von 30 Mitgliedern pro Reise.
- **Free (dauerhaft):** Konto, unbegrenzt Reisen anlegen und beitreten, manuelle Verfügbarkeit, Heatmap, Kandidaten-Berechnung, Abstimmung, Festlegung, einmaliger Kalender-Import (ICS, Apple-Weg), DE/EN, Datenschutzfunktionen. **Mitmachen ist für Mitglieder immer kostenlos.**
- **Premium-Kandidaten (später, zu validieren):** automatische Kalender-Synchronisation (F-019, F-048), One-Click-Kalender per OAuth als Komfort (F-020/F-021, zu prüfen, ob Free oder Premium), Co-Organisatoren und Pflicht-/Optional-Teilnehmer (F-022, F-023), Urlaubstage-/Brückentage-Optimierung (F-024), Erweiterungen der Reiseplanung (Unterkünfte, Aufgaben, Infoseite mit Dateien, F-031–F-033), Ausgaben mit Belegfotos und Fremdwährungen (F-037), Exporte (PDF/CSV), personalisierte Reiseseite (Titelbild, Farbe).
- **Abrechnungseinheit (offen, Q8):** „Reise-Pass“ (Einmalzahlung pro Reise, schaltet Premium für alle Mitglieder dieser Reise frei – passt zu 1–3 Reisen/Jahr) vs. Organisator-Abo (Jahr). PM-Tendenz: Reise-Pass, optional ergänzt um Jahresabo für Vielplaner.
- **Ausgeschlossen:** Werbung, Datenverkauf, Bezahlschranke für Mitglieder, nachträgliches Einschränken bisher kostenloser Kernfunktionen.
- Zahlungsabwicklung (F-050) erst nach v1; Voraussetzung: Kennzahlen aus MVP/v1, Entscheidung Q8, Operations klärt Zahlungsanbieter, Steuern (OSS/USt), AGB/Widerrufsbelehrung.

## 7. Nicht-Ziele (MVP)

- Kein stunden-/uhrzeitgenaues Planen (keine Meeting-Planung, Abgrenzung zu Doodle/When2meet).
- **Kein Kalender-Import im MVP** (ICS, Apple-Weg, CalDAV, OAuth folgen ab v1); kein Schreibzugriff auf Kalender der Nutzer.
- **Keine E-Mail-Benachrichtigungen** über Reise-Ereignisse (nur Teilen-Texte); nur Konto-Transaktionsmails.
- **Kein Social Login** im MVP (v1, F-045).
- **Keine Bezahlfunktionen** im MVP (Freemium ab später, F-050).
- Keine Gast-Teilnahme ohne Konto (bewusste Entscheidung Q2; Rückfallplan siehe Risiken).
- Keine nativen Apps (responsive Web-App; PWA/native Begleiter nur für Apple-Kalender-Zugriff evaluieren, F-049).
- Kein Chat in der App – der Gruppenchat existiert bereits.
- Keine Buchung, keine Abwicklung von Zahlungen zwischen Reisenden, keine Affiliate-Angebote.
- Keine Zielfindung, Aufgaben, Ausgaben (Ausbaustufen, siehe Roadmap).
- Keine weiteren Sprachen außer Deutsch und Englisch (Architektur aber für weitere Sprachen offen).
- Kein Ranking-/Präferenzwahl-Verfahren (Approval-Voting reicht für 2–6 Optionen).

## 8. Nicht-funktionale Anforderungen

- **Datenschutz/DSGVO:** Datensparsamkeit (Konto: Anzeigename, E-Mail, optional Passwort-Hash, Sprache, Region); Hosting in der EU; Reisen werden standardmäßig 90 Tage nach Reiseende bzw. nach 12 Monaten Inaktivität gelöscht; Konten nach 24 Monaten Inaktivität (mit Vorabhinweis per Transaktionsmail) gelöscht; Konto-Löschung jederzeit selbst möglich (F-043). Ab v1: Kalender-Rohdaten nur im Arbeitsspeicher verarbeiten und sofort verwerfen; gespeicherte Kalender-URLs/Zugangsdaten verschlüsselt. Datenschutzerklärung & Impressum auf Deutsch, Datenschutzerklärung zusätzlich auf Englisch (→ Operations).
- **Sicherheit / Authentifizierung:**
  - Einmal-Codes (6 Ziffern) und Magic-Links: einmalig verwendbar, 15 Min. gültig, max. 5 Fehlversuche pro Code, danach neuer Code; Links enthalten Tokens ≥ 128 Bit.
  - Passwörter (optional): min. 10 Zeichen, Hashing mit Argon2id (o. ä. aktueller Standard), Prüfung gegen bekannte geleakte Passwörter wünschenswert.
  - Keine Konto-Enumeration (gleiche Antwort, ob E-Mail existiert oder nicht); Rate-Limiting für Code-Anforderung, Login, Beitritt.
  - Sessions: httpOnly-, Secure-, SameSite-Cookies; „angemeldet bleiben“ rollierend 90 Tage; „überall abmelden“ möglich; Re-Authentifizierung für Konto löschen und E-Mail ändern.
  - Einladungslinks mit nicht erratbaren Tokens (≥ 128 Bit), neu erzeugbar; Organisator-Rechte ausschließlich serverseitig über Konto + Rolle geprüft; keine Indexierung von Reiseseiten (noindex).
- **Transaktionsmails:** zuverlässige Zustellung (EU-Anbieter, SPF/DKIM/DMARC), Zustellung < 1 Min. im Median; Absender und Inhalt in der Sprache des Kontos.
- **Internationalisierung:** alle Texte externalisiert; Locale `de` und `en`; Datums-, Zahlen- und Wochenstart-Formate per Region (z. B. `de-DE`/`en-GB`: Montag, `en-US`: Sonntag), vom Nutzer überschreibbar; Feiertage für DE (inkl. Bundesländer), AT, CH, UK und US über eine gepflegte Open-Source-Feiertagsbibliothek.
- **Mobile & Performance:** voll bedienbar ab 360 px Breite und in In-App-Browsern (WhatsApp, Instagram, Facebook); erste Ansicht < 2 s auf 4G.
- **Barrierefreiheit:** WCAG 2.1 AA; Heatmap nicht nur über Farbe kodiert (Zahl/Muster), Kalender per Tastatur bedienbar; Code-Eingabe mit `autocomplete="one-time-code"`.
- **Skalierung:** **max. 30 Mitglieder pro Reise (bestätigt, Q6)**, Suchzeitraum bis 12 Monate; Berechnung < 500 ms.
- **Zeitzonen:** Tage werden in der Zeitzone der Reise (Standard: Zeitzone des Organisators) ausgewertet.

## 9. Annahmen (zu validieren)

| # | Annahme | Wie validieren |
|---|---|---|
| A1 | Das größte Problem ist das *Finden* möglicher Zeiträume, nicht das Abstimmen. | Interviews mit 5–8 Organisatoren; Nutzung von F-009 vs. eigenen Zeiträumen. |
| A2 | Eingeladene akzeptieren eine Kontopflicht, wenn die Registrierung passwortlos, im Einladungsflow und in ≤ 60 s erledigt ist; das Konto steigert Wiederkehr und eigene Reiseanlagen. | Funnel Link-Öffnen → Registrierung → Beitritt (Ziel ≥ 65 %), Abbruchstelle, Anteil Mitglieder, die eigene Reise anlegen. |
| A3 | Manuelle Tageseingabe reicht fürs MVP; Kalender-Import ist Komfort, der die Abgabezeit senkt, aber kein Muss für den Kernnutzen. | Median-Abgabezeit, Feedback „ich will meinen Kalender importieren“, Abbrüche auf der Verfügbarkeitsseite. |
| A4 | Kalender-Belegung ≠ Urlaubsmöglichkeit: Viele Tage sind „frei“ im Kalender, aber Arbeitstage. Der Zustand *ginge zur Not* fängt das ab. | Ab v1: wie viele Tage Nutzer nach dem Import manuell ändern. |
| A5 | Ein Approval-Voting (Ja/Vielleicht/Nein) erzeugt genug Konsens; der Organisator entscheidet bei Gleichstand. | Anteil Abstimmungen mit eindeutigem Sieger. |
| A6 | Gruppen kommunizieren weiterhin im eigenen Chat; Teilen-Texte ersetzen E-Mail-Benachrichtigungen im MVP. | Klickrate auf Teilen-/Erinnern-Buttons, Feedback zu fehlenden Benachrichtigungen. |
| A7 | Ein relevanter Teil der Zielgruppe (≥ 40 %) nutzt iPhone/iCloud-Kalender; ohne Apple-Weg bleibt der Kalender-Import für sie wertlos. | Geräte-/Browser-Statistik (aggregiert) im MVP, Umfrage „Welchen Kalender nutzt du?“ beim Beta-Test. |
| A8 | Organisatoren zahlen für Komfort (Sync, Optimierung, Planungs-Extras), wenn der Kern kostenlos bleibt; Reise-Pass passt besser als Abo. | Interviews/Umfrage nach v1, Zahlungsbereitschaft (Van-Westendorp), Nachfrage nach Premium-Kandidaten. |
| A9 | Englisch erweitert die Zielgruppe (gemischte Gruppen, internationale Freundeskreise) ohne nennenswerten Mehraufwand im Betrieb. | Anteil Konten mit Sprache `en`, Anteil gemischtsprachiger Reisen. |

## 10. Risiken

| Risiko | Auswirkung | Gegenmaßnahme |
|---|---|---|
| **Kontopflicht senkt Beitrittsquote** (Nachzügler brechen bei Registrierung ab) | Kernversprechen „alle machen mit“ scheitert | Reise-Vorschau vor Registrierung; nur Name + E-Mail; passwortloser Code im selben Fenster; Rücksprung zur Reise garantiert; Funnel-Messung ab Beta; **Rückfallplan:** Gast-Beitritt mit späterer Konto-Umwandlung als vorbereitete Option, falls Beitrittsquote in Beta < 50 % (Entscheidung CEO/Auftraggeber). |
| **Transaktionsmails landen im Spam oder kommen verspätet** | Registrierung/Login blockiert | Etablierter EU-Mailanbieter, SPF/DKIM/DMARC, kurzer Text ohne Tracking-Links, „Code erneut senden“ nach 30 s, Hinweis „Spam-Ordner prüfen“, Monitoring der Zustellrate (→ Operations). |
| Magic-Link öffnet im anderen Browser (In-App-Browser vs. Standardbrowser) | Kontextverlust, doppelte Anmeldung | Code als Primärweg im selben Fenster; Link setzt Session im geöffneten Browser und führt per gespeicherter Rücksprungadresse zur Reise. |
| Konto-Übernahme / Missbrauch | Fremde sehen Reisedaten | Einmal-Codes mit kurzer Laufzeit und Versuchslimit, Rate-Limiting, Re-Auth für sensible Aktionen, Benachrichtigung bei E-Mail-Änderung an alte Adresse. |
| Nachzügler geben nie ab → Ergebnis blockiert | Kernversprechen scheitert | Teilnahmestatus sichtbar, Erinnerungs-Teilen-Text, Berechnung auch ohne alle (Hinweis), Organisator kann Mitglieder entfernen. |
| Ohne Kalender-Import ist die Eingabe zu mühsam (Persona Jonas) | Abbruch, ungenaue Angaben | Schnelle manuelle Eingabe (Ziehen, Bereich, Schnellaktionen, Feiertage); ICS + Apple-Weg früh in v1; Feedback-Frage im MVP. |
| **Apple-Kalender schwer anzubinden** (kein OAuth; öffentlicher iCloud-Link legt Termindetails für jeden mit dem Link offen; CalDAV braucht app-spezifisches Passwort) | iPhone-Nutzer bleiben bei Handeingabe oder geben sensible Daten preis | Gestufter Apple-Strang (F-047 → F-048 → F-049) mit klaren Datenschutzhinweisen: Freigabe nach Import wieder deaktivieren; CalDAV-Zugang nur verschlüsselt und widerrufbar; Spike On-Device-Lösung (Kurzbefehl), die nur Tage überträgt. |
| Datenschutz-Bedenken bei Kalender-Import (v1) | Geringe Nutzung, Imageschaden | Klar kommunizieren „nur frei/belegt“, Vorschau vor Übernahme, keine Speicherung der Rohdaten, Löschfunktion. |
| Missbrauch geteilter Einladungslinks (Fremde treten bei) | Datenmüll, Privatsphäre | Beitritt nur mit verifiziertem Konto; Organisator sieht/entfernt Mitglieder, erneuert Link, sperrt Beitritt (F-004). |
| Zweisprachigkeit verdoppelt Text-/Testaufwand, Übersetzungen veralten | Inkonsistente UI, Rechtstexte falsch | i18n-Gerüst ab Inkrement 1; Build schlägt bei fehlenden Schlüsseln fehl; Reviewer prüft beide Sprachen; Rechtstexte DE verbindlich, EN als Übersetzung (→ Operations). |
| Freemium: Premium-Abgrenzung verärgert Nutzer oder konvertiert nicht | Kein Umsatz oder Vertrauensverlust | Kern bleibt dauerhaft frei (Prinzip 2); Premium nur Komfort; Validierung vor Bau (A8); Kosten im Betrieb minimal halten. |
| Starke Wettbewerber ergänzen Funktion (z. B. Doodle) | Differenzierung schwindet | Fokus auf Urlaubs-Spezifika (Mehrtägigkeit, Heatmap, später Reise + Kosten in einem Fluss). |

## 11. Wettbewerb & Abgrenzung (Kurzrecherche)

| Tool | Stärke | Lücke für unseren Fall | Was wir übernehmen |
|---|---|---|---|
| Doodle | Bekannt, Ja/Wenn-nötig/Nein-Abstimmung | Optionen müssen vorher bekannt sein; stundenorientiert; viel Werbung/Paywall | Drei-Stufen-Abstimmung („wenn nötig“ ≙ „ginge zur Not“/„vielleicht“) |
| Rallly (Open Source) | Ohne Konto, schlank, modern | Ebenfalls nur Abstimmung über vorgegebene Termine | Schlanker Beitritt, Organisator schließt Umfrage ab |
| When2meet | Verfügbarkeits-Heatmap, „paint to select“ | Stunden-Raster, wenige Tage, keine Entscheidung, schwach mobil | Heatmap + Wisch-/Zieh-Auswahl, aber auf Tage übertragen |
| Tricount / Splitwise | Ausgaben teilen, Ausgleich mit minimalen Überweisungen; Freemium-Modell (Splitwise Pro) | Keine Planung vor der Reise | Spätere Ausbaustufe: Ausgaben pro Reise, Ausgleichsvorschlag; Freemium-Abgrenzung als Referenz |
| Geteilter Google-/Outlook-/iCloud-Kalender | Echtzeit | Zeigt Details, keine Gruppenauswertung, Plattform-Silos | Nur Frei/Belegt-Prinzip (wie Free/Busy) |

**Positionierung:** Das einzige Tool, das für **mehrtägige Gruppenreisen** die möglichen Zeiträume *selbst findet* – privatsphärefreundlich, zweisprachig, mit einem Konto, das in einer Minute erstellt ist – und später die Reise bis zur Abrechnung begleitet. Mitmachen ist immer kostenlos.

## 12. Offene Fragen & Entscheidungen

Entscheidungen des Auftraggebers vom 2026-10-08 sind eingetragen. Neue bzw. verbleibende Fragen ab Q7.

| # | Frage | Empfehlung PM | Entscheidung (Datum) |
|---|---|---|---|
| Q1 | Kalender-Anbindung im MVP nur ICS + manuell, OAuth erst v1? | Ja (ICS + manuell im MVP) | **MVP ohne Kalender-Import, nur manuelle Eingabe; ICS-Import (F-006) → v1. Apple-/iOS-Kalender muss explizit auf die Roadmap** → eigener Strang F-047/F-048/F-049. (2026-10-08) |
| Q2 | Konto im MVP komplett weglassen (nur Links, optional E-Mail für Admin-Link)? | Ja, kein Konto | **Abweichend: Konten im MVP.** Einladung per Link, Beitritt erfordert Konto; Registrierung im Einladungsflow, passwortlos per Code/Magic-Link, optional Passwort; Social Login v1. Persönliche Links und Admin-Link entfallen. Neue Must-Features F-040–F-044; F-018 ersetzt. (2026-10-08) |
| Q3 | E-Mail-Benachrichtigungen im MVP oder nur Teilen-Texte? | Teilen-Texte Must, E-Mail Should | **Nur Teilen-Texte im MVP;** E-Mail-Benachrichtigungen (F-014) → v1. Konto-Transaktionsmails (Code, Magic-Link, Passwort-Reset, E-Mail-Änderung, Lösch-/Inaktivitätshinweis) sind unberührt und Teil des MVP. (2026-10-08) |
| Q4 | Geschäftsmodell (kostenlos/Spenden, Freemium, Affiliate)? | Erst kostenlos, Entscheidung vor v1 | **Freemium.** MVP komplett kostenlos; Premium-Funktionen erst später (F-050); Abgrenzung siehe §6 „Geschäftsmodell“. (2026-10-08) |
| Q5 | Zielmarkt/Sprache nur DE oder von Beginn an DE+EN? | DE, i18n-fähig | **Deutsch und Englisch ab MVP** (F-046 Must; F-016 Feiertage zu Must hochgestuft mit DE/AT/CH + UK/US). (2026-10-08) |
| Q6 | Gruppengröße begrenzen (Vorschlag max. 30)? | Ja, 30 | **Bestätigt: max. 30 Mitglieder pro Reise.** (2026-10-08) |
| Q7 | Priorität der Ausgabenverrechnung (F-035–F-037) gegenüber Planungs-Features (F-030–F-034)? | Nach Auswertung v1 entscheiden; Tendenz: Verrechnung früh in Phase 3, da starkes Bindungs- und Premium-Potenzial | **offen** – vom Auftraggeber nicht beantwortet; bleibt „später“ (Phase 3). |
| Q8 | Premium-Abrechnungseinheit und Preis: Reise-Pass (einmalig pro Reise) oder Organisator-Abo? Welche Kandidaten sind Premium? | Reise-Pass, optional Jahresabo; Entscheidung nach v1-Kennzahlen und Zahlungsbereitschafts-Umfrage | offen (Entscheidung vor Bau von F-050) |
| Q9 | Englischsprachiger Fokusmarkt: UK/Irland (EU-nah, Montag als Wochenstart) oder auch USA? | Sprache EN für alle; Feiertage UK + US anbieten; aktives Marketing zunächst nur DACH + UK/IE | offen (betrifft Marketing, Rechtstexte, ggf. Hosting-/Rechtsfragen → Operations) |
| Q10 | Rückfallplan Gast-Beitritt: Bei Beitrittsquote < 50 % in der Beta Gast-Beitritt ohne Konto zulassen? | Ja, als vorbereitete Option, Entscheidung nach Beta-Daten | offen |
| Q11 | Marke & Logo: Bleibt „Wir wollen weg“ auch auf Englisch (mit EN-Untertitel „Find dates for your group trip“)? Welche Logo-Variante (A Sonnenkalender / B Weg-Haken / C Treffpunkt)? | CEO/Designer: Name bleibt Marke in beiden Sprachen; Logo A | **Logo A „Sonnenkalender“ bestätigt; Design insgesamt abgenommen** (2026-10-08). Name auf Englisch noch offen. |
| Q12 | Dark Mode im MVP (nur System-Einstellung folgen, kein Schalter) und Überschriften-Schrift Figtree (selbst gehostet, ~35 KB)? | CEO: ja, beides | offen (Konzeptphase, 2026-10-08) |
| Q13 | Produktregeln aus der UX-Konzeption: (a) Abstimmungsergebnis einer Option erst nach eigener Stimme sichtbar (Orga sieht immer alles); (b) alle Mitglieder dürfen den Einladungslink teilen, solange Beitritt offen; (c) Rollenname „Orga“/„Organizer“; (d) „Angemeldet bleiben“ standardmäßig an; (e) kleine Hilfe-/FAQ-Seite im MVP | CEO: ja zu (a)–(e); in den Docs als „CEO-Entscheidung, vorbehaltlich Auftraggeber“ markiert | offen (Konzeptphase, 2026-10-08) |
| Q14 | Betreiber & Impressum: Privatperson oder UG/GmbH, ladungsfähige Anschrift (privat oder Geschäftsadresse) – Blocker B1 | Ops/CEO: für Beta als Privatperson mit Geschäfts-/Serviceadresse; Gesellschaft spätestens vor Bezahlfunktionen (F-050) prüfen | offen – **blockiert Staging, Mailversand, Rechtstexte** |
| Q15 | Domain und Accounts: Domain (z. B. wirwollenweg.de), Hosting Hetzner (DE), Mail Lettermint (NL), Postfach – Blocker B2/B3 | Ops/CEO: Hetzner + Lettermint, ca. 30–40 €/Monat netto im MVP | offen – **blockiert Staging, Mailversand** |
| Q16 | Rechtstexte: Generator-Abo mit Abmahnschutz oder Anwalt? – Blocker B4 | Ops/CEO: Generator zur Beta, anwaltliche Prüfung vor öffentlichem Launch (M2) | offen |
