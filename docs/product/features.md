# Features – Wir wollen weg

Stand: 2026-10-08 · Verantwortlich: Product Manager · Bezug: [PRD.md](PRD.md), [roadmap.md](roadmap.md)

Priorisierung nach MoSCoW **bezogen auf das MVP**: **M** = Must, **S** = Should, **C** = Could, **W** = Won't (jetzt nicht). Spalte „Phase“ siehe Roadmap.

## Übersicht

| ID | Feature | Prio | Phase |
|---|---|---|---|
| F-001 | Reise anlegen | M | MVP |
| F-002 | Einladungslink & Teilen-Texte | M | MVP |
| F-003 | Beitreten ohne Registrierung & persönlicher Link | M | MVP |
| F-004 | Rollen & Reiseverwaltung | M | MVP |
| F-005 | Verfügbarkeit manuell angeben | M | MVP |
| F-006 | Kalender-Import per ICS (Datei/URL, einmalig) | M | MVP |
| F-007 | Teilnahmestatus | M | MVP |
| F-008 | Gemeinsamer Kalender (Heatmap) | M | MVP |
| F-009 | Kandidaten-Zeiträume berechnen | M | MVP |
| F-010 | Abstimmung erstellen | M | MVP |
| F-011 | Abstimmen (Ja / Vielleicht / Nein) | M | MVP |
| F-012 | Ergebnis festlegen & verkünden | M | MVP |
| F-013 | Datenschutz: Löschen & Aufbewahrung | M | MVP |
| F-014 | E-Mail-Benachrichtigungen (opt-in) | S | MVP |
| F-015 | Nachzügler erinnern | S | MVP |
| F-016 | Feiertage & Wochenenden einblenden | S | MVP |
| F-017 | Abstimmungsfrist | S | MVP |
| F-018 | Optionales Konto & Reiseübersicht | C | v1 |
| F-019 | Kalender-Abo-Sync (ICS-URL automatisch aktualisieren) | C | v1 |
| F-020 | Google-Kalender-Anbindung (OAuth, Free/Busy) | C | v1 |
| F-021 | Microsoft-/Outlook-Anbindung (OAuth) | C | v1 |
| F-022 | Co-Organisatoren | C | v1 |
| F-023 | Pflicht- und optionale Teilnehmer | C | v1 |
| F-024 | Urlaubstage-Optimierung (Brückentage) | C | v1 |
| F-030 | Zielfindung (Vorschläge & Abstimmung) | W | später |
| F-031 | Unterkünfte sammeln & abstimmen | W | später |
| F-032 | Aufgaben & Packliste | W | später |
| F-033 | Reise-Infoseite (Adresse, Anreise, Dokumente) | W | später |
| F-034 | Budget-Abfrage (anonym) | W | später |
| F-035 | Ausgaben erfassen | W | später |
| F-036 | Salden & Ausgleichsvorschlag (Verrechnung) | W | später |
| F-037 | Mehrere Währungen | W | später |
| F-038 | PWA / Push-Benachrichtigungen | W | später |

**Bewusst ausgeschlossen (kein Plan):** In-App-Chat, Buchung/Zahlungsabwicklung, Schreibzugriff auf Nutzerkalender, stundengenaue Terminplanung, Ranking-/Präferenzwahl, native Apps.

### Begriffe
- **Reise**: Planungsobjekt mit Suchzeitraum, Dauer, Mitgliedern.
- **Tageszustand**: pro Mitglied und Tag `geht` | `ginge zur Not` | `geht nicht`.
- **Abgegeben**: Mitglied hat seine Verfügbarkeit bestätigt; erst dann zählen nicht markierte Tage als `geht`.
- **Kandidat**: zusammenhängender Zeitraum (n Nächte = n+1 Tage) im Suchzeitraum.

---

## MUST – MVP

### F-001 Reise anlegen
**Als** Organisatorin **möchte ich** in unter zwei Minuten eine Reiseplanung anlegen, **damit** ich die Gruppe sofort einladen kann.

Akzeptanzkriterien:
- [ ] Pflichtfelder: Reisename (1–80 Zeichen), Suchzeitraum (Start- und Enddatum), Mindestdauer in Nächten (1–30). Optional: Wunschdauer (≥ Mindestdauer), Beschreibung (≤ 500 Zeichen), eigener Anzeigename, E-Mail-Adresse.
- [ ] Suchzeitraum: Startdatum ≥ heute, Länge ≤ 12 Monate, Länge ≥ Mindestdauer + 1 Tag; sonst verständliche Fehlermeldung am Feld.
- [ ] Kein Konto und kein Passwort nötig.
- [ ] Nach dem Anlegen sieht die Organisatorin den Einladungslink (F-002) und ihren persönlichen Admin-Link mit Hinweis „Speichere diesen Link – damit verwaltest du die Reise“.
- [ ] Ist eine E-Mail angegeben, wird der Admin-Link per E-Mail zugeschickt.
- [ ] Die Organisatorin ist automatisch erstes Mitglied und kann direkt ihre Verfügbarkeit angeben.
- [ ] Suchzeitraum und Dauer sind nachträglich änderbar; Änderungen lösen eine Neuberechnung aus (F-009).

### F-002 Einladungslink & Teilen-Texte
**Als** Organisatorin **möchte ich** einen Link in unseren Gruppenchat teilen, **damit** alle ohne Umwege mitmachen.

Akzeptanzkriterien:
- [ ] Jede Reise hat einen Einladungslink mit nicht erratbarem Token (≥ 128 Bit).
- [ ] Buttons: „Link kopieren“ (mit Bestätigung), „Teilen“ (native Web-Share-API, Fallback: WhatsApp-, Signal-, E-Mail-Link).
- [ ] Vorformulierter Teilen-Text, z. B. „Wir wollen weg! Trag bis <Datum> ein, wann du kannst: <Link>“, editierbar vor dem Teilen.
- [ ] Link-Vorschau (Open-Graph) zeigt Reisename und App-Namen, **keine** Mitgliedernamen oder Daten.
- [ ] Reiseseiten sind mit `noindex` gekennzeichnet.

### F-003 Beitreten ohne Registrierung & persönlicher Link
**Als** Nachzügler **möchte ich** nur mit meinem Namen beitreten, **damit** ich in wenigen Sekunden dabei bin.

Akzeptanzkriterien:
- [ ] Über den Einladungslink sieht man Reisename, Organisator, Suchzeitraum, Dauer und die Liste der bereits beigetretenen Namen.
- [ ] Beitritt erfordert nur einen Anzeigenamen (1–40 Zeichen); doppelte Namen in einer Reise werden mit Hinweis abgelehnt.
- [ ] Bestehende Mitglieder werden nur über Gerät (Session-Cookie) oder ihren persönlichen Link wiedererkannt – es gibt **keine** Auswahl „Ich bin <Name>“, damit niemand eine fremde Identität übernehmen kann. Wer Gerät und Link verloren hat, kann vom Organisator einen neuen persönlichen Link erhalten (F-004).
- [ ] Nach Beitritt erhält das Mitglied einen persönlichen Link (Kopieren/Teilen-an-mich, optional per E-Mail), über den es auf jedem Gerät zurückkommt.
- [ ] Rückkehr auf demselben Gerät über den Einladungslink führt direkt zur eigenen Ansicht (Session ≥ 180 Tage).
- [ ] Rate-Limit: max. 20 Beitritte pro Reise und Stunde pro IP; Maximalgröße 30 Mitglieder.

### F-004 Rollen & Reiseverwaltung
**Als** Organisatorin **möchte ich** die Reise verwalten können, **damit** ich bei Problemen (falsche Person, Link geleakt) eingreifen kann.

Akzeptanzkriterien:
- [ ] Rollen: **Organisator** (genau einer im MVP) und **Mitglied**.
- [ ] Nur der Organisator kann: Reisedaten ändern (F-001), Mitglieder entfernen, persönlichen Link eines Mitglieds neu erzeugen, Einladungslink neu erzeugen (alter Link wird ungültig), Beitritt sperren/öffnen, Abstimmung erstellen/schließen (F-010, F-012), Reise löschen (F-013).
- [ ] Mitglieder können: eigene Verfügbarkeit bearbeiten, abstimmen, eigenen Namen ändern, Reise verlassen, alles Gemeinsame ansehen.
- [ ] Entfernen eines Mitglieds entfernt dessen Verfügbarkeit und Stimmen nach Bestätigungsdialog; Berechnung aktualisiert sich.
- [ ] Organisator-Aktionen sind serverseitig gegen Mitglieder-Sessions abgesichert (nicht nur UI ausgeblendet).

### F-005 Verfügbarkeit manuell angeben
**Als** Mitreisender **möchte ich** schnell auf einem Kalender antippen, wann ich kann und wann nicht, **damit** meine Verfügbarkeit ohne Kalender-Anbindung erfasst ist.

Akzeptanzkriterien:
- [ ] Monatsansicht des Suchzeitraums; Tage außerhalb sind nicht wählbar.
- [ ] Drei Zustände pro Tag: `geht` (Standard), `ginge zur Not`, `geht nicht`; Werkzeugwahl (Pinsel-Prinzip) und dann Tippen oder Ziehen/Wischen über mehrere Tage; Bereichsauswahl „von–bis“ als barrierefreie Alternative.
- [ ] Schnellaktionen: „alle Wochentage Mo–Fr als ‚ginge zur Not‘“, „alles zurücksetzen“.
- [ ] Zustände sind nicht nur farblich, sondern auch per Symbol/Muster unterscheidbar.
- [ ] Button „Fertig – Verfügbarkeit abgeben“ setzt den Status *abgegeben* (F-007); spätere Änderungen sind jederzeit möglich und wirken sofort.
- [ ] Optionaler Kommentar pro Mitglied (≤ 200 Zeichen, z. B. „Juli nur mit Kindern“).
- [ ] Auf 360 px Breite ohne horizontales Scrollen bedienbar; Speichern < 1 s spürbar (optimistisches UI).

### F-006 Kalender-Import per ICS (Datei/URL, einmalig)
**Als** Mitreisender mit vollem Kalender **möchte ich** meine Termine importieren, **damit** ich nichts abtippen muss – ohne Details preiszugeben.

Akzeptanzkriterien:
- [ ] Zwei Wege: ICS-Datei hochladen (≤ 5 MB) oder ICS/iCal-URL einfügen (z. B. Google „Geheime Adresse im iCal-Format“, Outlook „Kalender veröffentlichen“, iCloud „Öffentlicher Kalender“).
- [ ] Je Anbieter (Google, Outlook/Microsoft 365, Apple iCloud) gibt es eine kurze Schritt-für-Schritt-Anleitung.
- [ ] Ausgewertet werden nur Termine im Suchzeitraum; wiederkehrende Termine (RRULE inkl. Ausnahmen) werden korrekt expandiert; Termine mit `TRANSP:TRANSPARENT` bzw. Status „frei“ und abgesagte Termine werden ignoriert.
- [ ] Ableitungsregel (Standard): ganztägiger oder ≥ 4 h belegter Tag → Vorschlag `geht nicht`; kürzere Termine → Tag bleibt `geht` (konfigurierbar: „kurze Termine als ‚ginge zur Not‘ werten“).
- [ ] Vor der Übernahme zeigt eine **Vorschau** die betroffenen Tage (ohne Termintitel – der Nutzer sieht nur seine Tage markiert); einzelne Tage können vor dem Übernehmen abgewählt werden.
- [ ] Übernahme überschreibt nur Tage, die der Nutzer nicht bereits manuell gesetzt hat (manuelle Eingabe hat Vorrang), sofern nicht „alles ersetzen“ gewählt wird.
- [ ] **Datenschutz:** Gespeichert werden ausschließlich Datum + Tageszustand. Termintitel, Orte, Beschreibungen, Teilnehmer und die Datei/URL werden nicht persistiert und nicht geloggt. Hinweistext erklärt das vor dem Import.
- [ ] Fehlerfälle (ungültige Datei, URL nicht erreichbar/Timeout 10 s, kein ICS-Inhalt) liefern verständliche Meldungen; nur `https`-URLs, Schutz gegen SSRF (keine internen Adressen).
- [ ] Mehrere Kalender nacheinander importierbar (z. B. Job + privat); Ergebnisse werden vereinigt.

### F-007 Teilnahmestatus
**Als** Organisatorin **möchte ich** sehen, wer seine Verfügbarkeit schon abgegeben hat, **damit** ich weiß, auf wen wir warten.

Akzeptanzkriterien:
- [ ] Mitgliederliste mit Status: `beigetreten – noch nicht abgegeben`, `abgegeben` (mit Datum der letzten Änderung), später `abgestimmt` (F-011).
- [ ] Fortschrittsanzeige „5 von 7 haben abgegeben“ für alle Mitglieder sichtbar.
- [ ] Organisator kann erwartete, noch nicht beigetretene Personen als Platzhalter anlegen (Name), damit „fehlt noch“ sichtbar ist; Platzhalter können beim Beitritt übernommen werden (über einen persönlichen Einladungslink je Platzhalter).

### F-008 Gemeinsamer Kalender (Heatmap)
**Als** Mitglied **möchte ich** auf einen Blick sehen, wann wie viele aus der Gruppe können, **damit** klar ist, wo ein Urlaub realistisch ist.

Akzeptanzkriterien:
- [ ] Kalenderansicht des Suchzeitraums; jeder Tag zeigt die Anzahl `geht` / Anzahl abgegebener Mitglieder (z. B. „6/7“) und eine Farbintensität entsprechend dem Anteil; `ginge zur Not` zählt halb in der Intensität und wird separat ausgewiesen.
- [ ] Tage, an denen alle können, sind zusätzlich zur Farbe durch ein Symbol markiert.
- [ ] Antippen eines Tages zeigt, wer kann / zur Not / nicht kann (Namen, keine Gründe außer freiwilligem Kommentar).
- [ ] Filter: „Person X ausblenden“ (Was-wäre-wenn), wirkt nur lokal auf die Ansicht und die Berechnung (F-009) für den Betrachter.
- [ ] Hinweisbanner, solange nicht alle abgegeben haben: „Noch offen: Kemal, Sara – Ergebnis kann sich ändern“.
- [ ] Ansicht aktualisiert sich bei Neuladen; Live-Update ist nicht erforderlich.

### F-009 Kandidaten-Zeiträume berechnen
**Als** Organisatorin **möchte ich** automatisch die besten möglichen Reisezeiträume vorgeschlagen bekommen, **damit** ich sie nicht selbst aus dem Kalender herauslesen muss.

Akzeptanzkriterien:
- [ ] Eingaben: Suchzeitraum, Mindestdauer *m* Nächte, Wunschdauer *w* (Standard = *m*), Toleranz *k* fehlende Personen (Standard 1, einstellbar 0–3), nur abgegebene Mitglieder.
- [ ] Ein Fenster aus *d* Nächten belegt *d+1* aufeinanderfolgende Tage. Ein Mitglied **kann** ein Fenster, wenn keiner der Tage `geht nicht` ist.
- [ ] Liste **„Alle können“**: alle Fenster mit Länge ≥ *m*, in denen alle Mitglieder können. Überlappende Fenster werden zu **maximalen Zeitspannen** zusammengefasst und angezeigt als „<Start>–<Ende>: bis zu X Nächte möglich“.
- [ ] Liste **„Fast alle können“**: Fenster, in denen 1 bis *k* Personen nicht können; die fehlenden Personen werden namentlich genannt.
- [ ] Sortierung je Liste: (1) weniger Fehlende, (2) weniger `ginge zur Not`-Personentage, (3) maximale Länge näher an bzw. ≥ Wunschdauer, (4) früheres Startdatum.
- [ ] Gibt es keine Treffer, zeigt die App einen konkreten Hinweis (z. B. „Mit 5 statt 7 Nächten gäbe es 3 Optionen“ / „Toleranz auf 1 erhöhen“).
- [ ] Berechnung ist deterministisch, testbar (reine Funktion) und für 30 Mitglieder × 365 Tage < 500 ms.
- [ ] Testfälle (für Entwicklung/Review) decken ab: Fenster an den Rändern des Suchzeitraums, Mindestdauer = Suchzeitraum − 1, niemand hat abgegeben, ein Mitglied blockiert alles, Gleichstand in der Sortierung.

### F-010 Abstimmung erstellen
**Als** Organisatorin **möchte ich** aus den Vorschlägen eine Abstimmung starten, **damit** die Gruppe gemeinsam entscheidet.

Akzeptanzkriterien:
- [ ] Organisator wählt 2–6 Optionen; jede Option ist ein konkreter Zeitraum (Anreise- und Abreisedatum). Vorauswahl: die Top-3 aus F-009, als konkrete Zeiträume in Wunschdauer.
- [ ] Optionen können auch manuell im Kalender gewählt werden (Warnhinweis, wenn Personen an diesen Tagen nicht können).
- [ ] Mit Start der Abstimmung wird der Teilen-Text „Abstimmung läuft: <Link>“ angeboten (F-002) und ggf. E-Mail versendet (F-014).
- [ ] Pro Reise ist höchstens eine Abstimmung gleichzeitig offen; Optionen können nach Start nur hinzugefügt, nicht geändert werden (bestehende Stimmen bleiben gültig).
- [ ] Jede Option zeigt, wer laut Verfügbarkeit kann/nicht kann.

### F-011 Abstimmen (Ja / Vielleicht / Nein)
**Als** Mitglied **möchte ich** zu jedem Vorschlag Ja, Vielleicht oder Nein sagen, **damit** meine Präferenz zählt, auch wenn ich mehreres kann.

Akzeptanzkriterien:
- [ ] Pro Option genau eine Stimme: `Ja`, `Vielleicht`, `Nein`; Vorbelegung aus der Verfügbarkeit (`geht nicht` an einem Tag → `Nein`, `ginge zur Not` → `Vielleicht`, sonst keine Vorbelegung) – Vorbelegung ist sichtbar als Vorschlag und muss bestätigt werden.
- [ ] Stimmen sind namentlich für alle Mitglieder sichtbar (Transparenz wie bei Doodle).
- [ ] Ergebnisanzeige: pro Option Anzahl Ja / Vielleicht / Nein, Rang nach (1) Ja, (2) Vielleicht, (3) wenigsten Nein; Option mit Nein einer Person ist als „ohne <Name>“ gekennzeichnet.
- [ ] Stimmen sind bis zum Abschluss änderbar.
- [ ] Status „abgestimmt“ erscheint in der Mitgliederliste (F-007).

### F-012 Ergebnis festlegen & verkünden
**Als** Organisatorin **möchte ich** die Abstimmung abschließen und den Zeitraum festlegen, **damit** alle Klarheit haben und buchen können.

Akzeptanzkriterien:
- [ ] Organisator schließt die Abstimmung und wählt die Gewinner-Option; die App schlägt die bestplatzierte vor, bei Gleichstand muss er aktiv wählen.
- [ ] Abschluss ist auch möglich, wenn nicht alle abgestimmt haben (Bestätigungsdialog mit Namen der Fehlenden).
- [ ] Nach Festlegung zeigt die Reise prominent „Es geht los: <Datum>–<Datum>“; Abstimmen und Verfügbarkeitsänderungen sind gesperrt (Verfügbarkeit wird schreibgeschützt).
- [ ] „Zum Kalender hinzufügen“: ICS-Download (ganztägiger Termin, An- bis Abreisetag) sowie Google-Kalender-Link.
- [ ] Teilen-Text „Fix: Wir fahren vom … bis …!“ wird angeboten; E-Mail an Opt-in-Mitglieder (F-014).
- [ ] Organisator kann die Festlegung wieder aufheben (Abstimmung wird wieder geöffnet, Stimmen bleiben erhalten).

### F-013 Datenschutz: Löschen & Aufbewahrung
**Als** Mitglied **möchte ich** meine Daten löschen können und wissen, dass nichts ewig gespeichert wird, **damit** ich der App vertraue.

Akzeptanzkriterien:
- [ ] Mitglied kann „Reise verlassen & meine Daten löschen“ – entfernt Name, Verfügbarkeit, Stimmen, E-Mail sofort.
- [ ] Organisator kann die Reise vollständig löschen (Bestätigung durch Eintippen des Reisenamens).
- [ ] Automatische Löschung: 90 Tage nach dem festgelegten Reiseende bzw. 12 Monate nach letzter Aktivität; Organisator (bei E-Mail) wird 14 Tage vorher informiert.
- [ ] Datenschutzhinweis kurz und verständlich auf Beitritts- und Import-Seite verlinkt.
- [ ] Keine Third-Party-Tracker, keine Werbe-Cookies; nur technisch notwendige Cookies (kein Cookie-Banner nötig).

## SHOULD – MVP, wenn Zeit bleibt

### F-014 E-Mail-Benachrichtigungen (opt-in)
**Als** Mitglied **möchte ich** per E-Mail über wichtige Schritte informiert werden, **damit** ich nichts verpasse, ohne ständig nachzusehen.

Akzeptanzkriterien:
- [ ] E-Mail-Angabe ist optional, mit Double-Opt-in-Bestätigung.
- [ ] Ereignisse: Organisator → „alle haben abgegeben“, „neues Mitglied“ (gebündelt max. 1×/Tag); Mitglieder → „Abstimmung gestartet“, „Ergebnis festgelegt“, Erinnerungen (F-015).
- [ ] Jede E-Mail enthält den persönlichen Link und einen Ein-Klick-Abmeldelink.
- [ ] Max. 1 E-Mail pro Ereignistyp pro Tag und Person.

### F-015 Nachzügler erinnern
**Als** Organisatorin **möchte ich** säumige Mitglieder mit einem Klick erinnern, **damit** ich nicht selbst hinterherschreiben muss.

Akzeptanzkriterien:
- [ ] Button „Erinnern“ erzeugt einen Teilen-Text mit den Namen der Fehlenden („@Kemal @Sara, ihr fehlt noch: <Link>“) zum Posten im Gruppenchat.
- [ ] Mitglieder mit E-Mail-Opt-in erhalten zusätzlich eine Erinnerungs-E-Mail; max. 1 Erinnerung pro Person und 48 h.

### F-016 Feiertage & Wochenenden einblenden
**Als** Berufstätiger **möchte ich** Wochenenden und Feiertage im Kalender sehen, **damit** wir Zeiträume mit wenigen Urlaubstagen erkennen.

Akzeptanzkriterien:
- [ ] Wochenenden optisch hervorgehoben.
- [ ] Gesetzliche Feiertage für ein wählbares Land/Bundesland (DE, AT, CH) werden angezeigt; Einstellung pro Mitglied, Standard aus Reise.
- [ ] Bei Kandidaten (F-009) wird „benötigt ca. X Urlaubstage“ angezeigt (Werktage Mo–Fr minus Feiertage des Betrachters).

### F-017 Abstimmungsfrist
**Als** Organisatorin **möchte ich** eine Frist setzen, **damit** die Entscheidung nicht ewig offen bleibt.

Akzeptanzkriterien:
- [ ] Optionales Fristdatum für Verfügbarkeitsabgabe und für Abstimmung; Anzeige „noch 3 Tage“.
- [ ] Nach Fristablauf wird nicht automatisch entschieden; der Organisator wird (E-Mail/Banner) aufgefordert, abzuschließen.

## COULD – v1

### F-018 Optionales Konto & Reiseübersicht
**Als** Vielplaner **möchte ich** ein Konto per E-Mail-Magic-Link, **damit** ich alle meine Reisen an einem Ort und auf allen Geräten habe.
- [ ] Anmeldung ohne Passwort per Magic Link; bestehende Gast-Mitgliedschaften des Geräts können übernommen werden.
- [ ] Übersicht aller Reisen mit Status (Verfügbarkeit offen / Abstimmung / festgelegt).
- [ ] Gespeicherte Standard-Einstellungen (Name, Bundesland, verbundene Kalender).

### F-019 Kalender-Abo-Sync
**Als** Mitglied **möchte ich**, dass neue Kalendertermine automatisch berücksichtigt werden, **damit** meine Verfügbarkeit aktuell bleibt.
- [ ] Opt-in „URL merken und täglich aktualisieren“; URL wird verschlüsselt gespeichert, jederzeit entfernbar.
- [ ] Automatische Updates ändern nur importierte, nie manuell gesetzte Tage; Änderungen werden dem Mitglied angezeigt.
- [ ] Sync endet mit Festlegung des Ergebnisses.

### F-020 Google-Kalender-Anbindung (OAuth)
**Als** Google-Nutzer **möchte ich** meinen Kalender mit einem Klick verbinden, **damit** ich keine iCal-Adresse suchen muss.
- [ ] OAuth mit minimalem Scope (`calendar.freebusy`, ggf. `calendar.calendarlist.readonly` zur Kalenderauswahl); Free/Busy-Abfrage für den Suchzeitraum.
- [ ] Gleiche Ableitungsregeln und Vorschau wie F-006; Token widerrufbar, Verbindung trennbar.
- [ ] Voraussetzung: abgeschlossene Google-App-Verifizierung (→ Operations).

### F-021 Microsoft-/Outlook-Anbindung (OAuth)
**Als** Outlook-Nutzer **möchte ich** meinen Kalender verbinden, **damit** auch mein Arbeitskalender berücksichtigt wird.
- [ ] Microsoft Graph mit `Calendars.ReadBasic`; nur Start/Ende/ShowAs werden gelesen.
- [ ] Bei Admin-Consent-Pflicht im Firmenkonto: verständlicher Hinweis + Fallback auf ICS-Anleitung.

### F-022 Co-Organisatoren
- [ ] Organisator kann Mitglieder zu Co-Organisatoren mit gleichen Rechten (außer Reise löschen) machen.

### F-023 Pflicht- und optionale Teilnehmer
- [ ] Organisator markiert Mitglieder als „muss dabei sein“ (z. B. Geburtstagskind) oder „optional“; F-009 lässt nur optionale Mitglieder in die Toleranz *k* fallen.

### F-024 Urlaubstage-Optimierung
- [ ] Sortieroption „wenigste Urlaubstage“ für Kandidaten (nutzt F-016); Hinweis auf Brückentage.

## WON'T (jetzt) – spätere Ausbaustufen

Nur grob beschrieben; werden vor Umsetzung detailliert.

| ID | Feature | Kern-User-Story | Notizen |
|---|---|---|---|
| F-030 | Zielfindung | Als Gruppe wollen wir Reiseziele vorschlagen und darüber abstimmen, damit wir uns auf ein Ziel einigen. | Gleiche Abstimmungsmechanik wie F-011 wiederverwenden (Optionen = Ziele mit Link/Bild). |
| F-031 | Unterkünfte | Als Mitglied will ich Unterkunfts-Links (Airbnb, Booking …) sammeln und bewerten, damit wir gemeinsam auswählen. | Link-Vorschau, Preis pro Person, Abstimmung; keine Buchung. |
| F-032 | Aufgaben & Packliste | Als Organisator will ich Aufgaben verteilen („Mietwagen buchen“), damit Arbeit fair verteilt ist. | Zuständige, Fälligkeit, Abhaken. |
| F-033 | Reise-Infoseite | Als Mitglied will ich alle Infos (Adresse, Anreise, Check-in) an einem Ort, damit ich nicht im Chat suchen muss. | Freitext + Links; Dateiupload erst später (Datenschutz). |
| F-034 | Budget-Abfrage | Als Mitglied will ich anonym meine Budgetspanne angeben, damit niemand unter Druck gerät. | Nur aggregiert anzeigen (Min/Median), ab 3 Antworten. |
| F-035 | Ausgaben erfassen | Als Mitreisender will ich Ausgaben eintragen (wer hat bezahlt, für wen, wie aufgeteilt), damit wir den Überblick behalten. | Aufteilung gleich/Anteile/Beträge; Belegfoto später. Vorbild Tricount. |
| F-036 | Salden & Verrechnung | Als Gruppe wollen wir sehen, wer wem wie viel schuldet, mit möglichst wenigen Überweisungen. | Greedy-Schuldenvereinfachung; Ausgleich als „bezahlt“ markieren; PayPal/IBAN-Hinweis, keine Zahlungsabwicklung. |
| F-037 | Mehrere Währungen | Als Reisender im Ausland will ich Ausgaben in Fremdwährung erfassen. | Tageskurs oder manueller Kurs; Basiswährung pro Reise. |
| F-038 | PWA / Push | Als Mitglied will ich die App aufs Handy legen und Push erhalten. | Erst nach Nachweis, dass E-Mail/Teilen-Texte nicht reichen. |
