# Abstimmung UI/UX ↔ Design

Stand: 2026-10-08 · Verantwortlich: UI/UX · Gegenstück: `docs/design/abstimmung-ux.md` (Designer) · Bezug: [ux-spec.md](ux-spec.md), [Wireframes](wireframes/README.md)

## 0. Stand

- Beim Schreiben lagen in `docs/design/` bereits `tokens.css` (v0.1) und `assets/` (Logo, Icons, Heatmap-Legenden und -Markierungen, 3 Illustrationen). **`design-system.md` und `abstimmung-ux.md` lagen noch nicht vor** – deren Punkte beantworte ich in der nächsten Runde in §3.
- Grundlage meiner Punkte: Tokens + SVG-Assets. Die Wireframes sind bewusst in Graustufen; maßgeblich für die Optik ist das Design-System.

## 1. Bereits übernommen aus dem Design (keine Aktion nötig)

| Thema | Übernahme in UX-Dokumente |
|---|---|
| Breakpoints 360 · 600 · 960 · 1200 | ux-spec §2 komplett darauf umgestellt; Wireframes „Desktop“ = ≥ 960 px |
| Heatmap-Stufen nach Score s = (geht + ½ zur Not)/abgegeben: nodata · none · few · some · many · all | deckt sich mit F-008 und meiner Spezifikation; Wireframe-Graustufen sind nur Platzhalter |
| „Alle können“ = Häkchen-Badge, unabhängig von der Stufe (niemand „geht nicht“); Halbkreis = jemand „zur Not“ | übernommen (Wireframes nutzen ★ bzw. `~n` als Platzhalter) |
| Markierungen: Wochenende = Spur hinter Sa/So, Feiertag = Eselsohr, Heute = Ring um Datumszahl, Ausgewählt = Doppelrahmen innen, Fokus = Ring außen mit Abstand, Vorschlag = Band mit Endkappen | übernommen; passt zu „nie nur Farbe“ (ux-spec §7.1) |
| Eigene Verfügbarkeit dreifach kodiert (Symbol + Muster + Farbe) | übernommen (F-005) |
| `prefers-reduced-motion`-Tokens | ux-spec §6/§7.1 verweisen darauf |
| Touch-Mindestziel 44 px, Steuerelemente 48 px, Haupt-CTA 56 px | übernommen; „Mitmachen“ (W03) = 56 px |
| Rot nur für Fehler/Destruktiv („Rot heißt Fehler, nicht Nein“) | sehr gut – „Geht nicht“/„Nein“ ist in UX nie Fehlerfarbe; Warnhinweise („Jonas kann nicht“) bitte Amber, nicht Rot |
| EN-Wortmarke mit Unterzeile „Find dates for your group trip“ | App-Name wird nicht übersetzt (ux-spec §10.2) |

## 2. Offen für Designer

### D-1 Heatmap-Zelle: Anatomie und alle Zustände (F-008, F-016)
Bitte eine **Zell-Anatomie** festlegen (Position je Element), die alle Kombinationen ohne Überlappung trägt – Prüffall: *Feiertag + heute + Wochenende + ausgewählt + Fokus + alle können + jemand zur Not* in einer Zelle von **43–46 × 52 px** (mobil) und 64 px (≥ 600 px).

| Element | Inhalt | Anforderung UX |
|---|---|---|
| Datumszahl | 1–31 | oben links; Ring = heute |
| Zählwert | „4/5“ | Kontrast ≥ 4,5:1 auf jeder Stufe (Tokens nennen Werte – bitte für Stufe `many` (4,9) auch mit Muster/Badge darüber bestätigen). **Regel mobil:** „x/n“, solange n ≤ 9; ab 10 Mitgliedern nur „x“ (n steht im Statusband „von 12“), da „28/30“ in 43 px nicht lesbar passt. Bitte bestätigen oder Alternative. |
| Badge „alle können“ | Häkchen | darf nicht mit Eselsohr (oben rechts) kollidieren |
| „jemand zur Not“ | Halbkreis | Position unten; bei Bedarf Zahl „~2“ (Desktop) |
| Feiertag | Eselsohr oben rechts | Name nur im Tagesdetail + Liste unter dem Monat |
| Wochenende | Spalten-Spur | auch in Meine Tage |
| Ausgewählt | Doppelrahmen innen | = Tag, dessen Detail offen ist (Desktop-Seitenpanel) |
| Vorschlag hervorgehoben | Band mit Endkappen | über Zeilen- und Monatsgrenzen fortsetzbar (Ende Zeile → Kappe offen?) – bitte Darstellung für Umbruch definieren |
| Fokus | Ring außen | muss auch auf `all` (teal-800) und neben dem Vorschlagsband ≥ 3:1 sein |
| nodata / außerhalb / vergangen | gestrichelt / ausgegraut | nicht bedienbar, aber Datumszahl lesbar (≥ 4,5:1 nicht Pflicht für deaktiviert, aber bitte ≥ 3:1) |
| Person ausgeblendet (Filter aktiv) | – | kein Zellzustand; nur Hinweis in der Filterzeile. Bitte Chip-Stil „aktiver Filter“ |

### D-2 Meine-Tage-Zelle (F-005) – inkl. neuer Interaktionszustände
Zustände aus `availability-legend.svg` sind übernommen. Zusätzlich benötigt:
1. **„Geht“ als Standard (unmarkiert):** Vorschlag UX: helle Lagune-Fläche (`--ww-avail-yes-bg`) **ohne** Häkchen in jeder Zelle – 60 Häkchen pro Ansicht sind Rauschen; Unterscheidbarkeit bleibt durch Muster+Symbol der beiden anderen Zustände. Häkchen nur in Legende, Pinsel und Tagesdetail. Bitte bestätigen.
2. **Zieh-Vorschau** (Bereich während des Ziehens, vor dem Loslassen) – fortlaufend über Zeilen/Monate, klar unterscheidbar von „ausgewählt“ und vom Vorschlagsband.
3. **Bereichsmodus-Startmarke** (erster Tipp gesetzt, Ende fehlt).
4. **Schreibgeschützt** (Phase 3): Zustände sichtbar, aber als nicht bedienbar erkennbar – ohne Kontrastverlust unter 3:1 (kein pauschales `opacity: .5`).
5. **Entwurf vs. abgegeben** braucht keinen Zellunterschied – nur Statuszeile (W08).
6. Kurzes Puls-/Bestätigungs-Feedback beim Setzen eines Tages (≤ 140 ms, bei reduced motion keines).

### D-3 Zellbreite bei 360 px
Mit 16 px Seitenrand und 4 px Lücke (`--ww-size-cal-gap`) ergeben sich (360 − 32 − 24)/7 ≈ **43,4 px** – knapp unter dem 44-px-Ziel. **Vorschlag:** Kalender unter 600 px mit 12 px Seitenrand und 2 px Lücke → ≈ **46,3 px**. Alternative: Lücke 4 px, Seitenrand 8 px (≈ 45 px). Bitte entscheiden und Token ergänzen (z. B. `--ww-size-cal-gap-sm`).

### D-4 Code-Feld (F-040)
Tokens sehen 6 Kästchen à 48 × 56 px vor. UX-Vorgabe: **technisch genau ein `<input>`** (Autofill `one-time-code`, Einfügen, Screenreader), die Kästchen sind rein visuell (z. B. 6 Hintergrund-Kästchen hinter einem Feld mit `letter-spacing`/Monospace oder aria-hidden-Spans über einem transparenten Input). Benötigte Zustände: leer, Fokus (aktives Kästchen sichtbar), gefüllt, Fehler (alle Kästchen + Text), gesperrt (5 Fehlversuche), Prüfen (Ladezustand). Bitte bestätigen, dass das Design so umsetzbar ist.

### D-5 Werkzeugleiste „Meine Tage“
- Pinsel als Radiogruppe mit drei Segmenten (Symbol + Text): aktiver Pinsel nicht nur farbig (z. B. gefüllt + Rahmen + Häkchen/Unterstrich).
- Werkzeug-Buttons: Bereichsmodus (Toggle mit „gedrückt“-Zustand), Rückgängig (deaktiviert, wenn leer), Schnellaktionen.
- Speicherstatus-Anzeige: „Speichert …“, „Gespeichert“, „Nicht gespeichert“ (mit Aktion).
- Fixierte Leiste unten: Höhe ≤ 150 px inkl. Primärbutton, nach Abgabe kompakt (≈ 100 px); Schatten-Token `--ww-shadow-sticky-bottom` passt.

### D-6 Abstimmen-Schalter (F-011)
Segment Ja / Vielleicht / Nein mit Zuständen: leer, gewählt (je Wert eigene Optik laut `--ww-vote-*`), **unbestätigter Vorschlag** (gestrichelter Rahmen/„Geister“-Optik + Label „Vorschlag aus deinen Tagen“), gesperrt (Phase 3), Fokus. Ergebnisbalken je Option (Ja/Vielleicht/Nein mit Zahl), Rang-Abzeichen „Platz 1“, Kennzeichnung „ohne Jonas“.

### D-7 Phasen-Darstellung
Phasen-Chip (Meine Reisen) und Phasen-Leiste (Übersicht): „Tage sammeln“ · „Abstimmung läuft“ · „Steht fest: 5.–10. Mai“ · „Vergangen“. Immer Text + optional Icon. To-do-Hervorhebung auf Karten (W04) als eigener Stil (Akzent Koralle?).

### D-8 Benötigte Icons (zusätzlich zum vorhandenen Sprite)
Vorhanden: Kalender, Teilen, Abstimmung, Organisator (Krone), Ja/Vielleicht/Nein, Sprache, ICS, Kopieren, Feiertag, Link, Alle können.
**Fehlen:** Zurück (Pfeil links), Chevron links/rechts (Tag/Monat blättern), Mehr (⋯), Schließen (×), Plus, Minus, Rückgängig, Bereichsmodus (Zeitraum), Schnellaktionen/Zauberstab o. ä., Info (ⓘ), Warnung (Dreieck, Amber), Erfolg (Häkchen im Kreis), Kommentar, Filter, Person ausblenden (Auge durchgestrichen), Passwort anzeigen/verbergen (Auge), Erinnern (Glocke oder Megafon), Mail (Code gesendet), Schloss (schreibgeschützt), Uhr/Frist, Mond (Nächte), Personen/Gruppe, Bearbeiten (Stift), Löschen (Papierkorb), Abmelden, Hilfe (?), Avatar-Fallback.
Regel UX: Die Krone für „Orga“ immer **mit** Textlabel „Orga“/„Organizer“.

### D-9 Benötigte Illustrationen (Leerzustände & Momente)
Vorhanden: `empty-trips` (W04), `empty-nobody` (W09 „noch keine Vorschläge“, W07), `vote-done` (W11).
**Fehlen:**
1. Einladungs-Vorschau-Motiv (W03, generisch, da Reisen kein Titelbild haben) – wichtigster Moment für die Beitrittsquote.
2. „Code ist unterwegs“ / Mail (W02/W03, klein, optional).
3. „Keine Treffer“ in Vorschlägen (W09).
4. Abstimmung leer (W10, Mitglied wartet).
5. Link ungültig / Reise nicht gefunden / 404 / Serverfehler (W14, ein gemeinsames Motiv reicht).
6. Konto gelöscht / Abschied (W14).
7. Landing-Hero (W01).
8. Erfolg nach Abgabe der Tage (W08, klein).
Alle dekorativ (`alt=""`), mobil max. 160 px hoch, damit die Primäraktion ohne Scrollen sichtbar bleibt (360 × 640).

### D-10 Textlängen & Typografie
- Längenbudgets: ux-spec §10.4 (Tabs ≤ 11 Zeichen, Pinsel ≤ 10, Primärbutton mobil ≤ 22, Snackbar ≤ 60).
- Nutzerinhalte: Reisename bis 80 Zeichen (Header 1 Zeile mit „…“, Karten 2 Zeilen, Übersicht voll), Anzeigename bis 40 (Listen 1 Zeile).
- Lange deutsche Wörter („Verfügbarkeitsabgabe“ vermeiden wir in Copy, aber Nutzernamen/Reisenamen können lang sein): bitte `hyphens: auto` mit korrektem `lang` und `overflow-wrap: anywhere` für Nutzerinhalte im Design-System verankern.
- Tabs der Reise auf 360 px: „Übersicht | Meine Tage | Gruppe | Abstimmen“ bei 14 px muss passen; Fallback horizontal scrollbar mit Verlaufskante – bitte Tab-Stil liefern.

### D-11 Bottom-Sheet & Ebenen
- Tagesdetail-Sheet: zwei Höhen (½ und fast voll), Griff, Schließen-Button (nicht nur Wischen, WCAG 2.5.7).
- Snackbar liegt **über** der fixierten Werkzeugleiste (nicht davor) – `--ww-z-toast` > `--ww-z-sticky` passt; Position bitte relativ zur Leiste definieren.

### D-12 Dark Mode
Tokens unterstützen System-Theme und `data-theme`. **UX-Vorschlag:** MVP folgt nur dem System (kein Theme-Schalter in Konto/Menü) – weniger Einstellungen, ein Cookie weniger. Bitte bestätigen; falls ein Schalter gewünscht ist, gehört er in Konto → „Sprache & Region“ (dann „Darstellung“).

### D-13 Vorschlagskarte (F-009)
Karte mit: Zeitraum (fett), „bis zu X Nächte · ca. Y Urlaubstage ⓘ“, Zusatz-Chips („2× zur Not“, „ohne Jonas“, „inkl. Pfingstmontag“), Aktionen („Im Kalender zeigen“, Orga-Checkbox „Zur Abstimmung“). Gruppenüberschriften „Alle können“ / „Fast alle können“ visuell klar getrennt (z. B. Badge-Icon „alle können“ an der Überschrift).

## 3. Antworten auf `docs/design/abstimmung-ux.md`

*Datei lag zum Zeitpunkt der Erstellung noch nicht vor.* Antworten folgen, sobald der Designer seine Punkte eingetragen hat (CEO bitte erneut an UI/UX geben).
