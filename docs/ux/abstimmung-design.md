# Abstimmung UI/UX ↔ Design

Stand: 2026-10-08 (Runde 3 – Richtung B, Motion) · Verantwortlich: UI/UX · Gegenstück: `docs/design/abstimmung-ux.md` (Designer) · Bezug: [ux-spec.md](ux-spec.md), [Wireframes](wireframes/README.md)

## 0. Stand

- **Runde 1** (§1, §2): Punkte D-1–D-13 an den Designer, erstellt auf Basis von `tokens.css` v0.1 und Assets.
- **Runde 2** (§3–§7): Designer hat mit `design-system.md` (v0.2 → v0.3), `tokens.css`, Assets und `docs/design/abstimmung-ux.md` geantwortet. Hier: Prüfung seiner Antworten auf D-1–D-13 (§3), Antworten auf U-1–U-14 (§4), übernommene CEO-Entscheidungen (§5), neue Punkte an den Designer (§6), Gesamttabelle (§7).
- **Runde 3** (§8–§10): Look & Feel 2.0 Richtung B (Q18) und Motion (Q17): Entscheidungen zu den offenen Bedienpunkten aus `richtung-b.md` §14 (§8.1), Q17 (§8.2), Usability-Befunde D-20–D-35 an den Designer (§8.3), Antworten an Motion M-U1–M-U11 (§9).
- Angeglichen: [ux-spec.md](ux-spec.md) (§2, §4.3, §4.4, §4.9 neu, §7, §10.2), [user-flows.md](user-flows.md) (B, C, D.2, F.2, H.1, K), [sitemap.md](sitemap.md), Wireframes W01–W04, W08, W09 (md + HTML neu erzeugt), W10, W11, W13, W14, **W15 Hilfe (neu)**.

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
| EN-Wortmarke mit Unterzeile „Find dates for your group trip“ | **Aktualisiert 2026-10-08:** EN-Wortmarke lautet „When do we go?“ (eigener Produktname, Auftraggeber), Unterzeile optional; Bildmarke sprachneutral (ux-spec §10.2, §10.6) |

## 2. Offen für Designer (Runde 1 – Status siehe §3 und §7)

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

## 3. Prüfung der Designer-Antworten auf D-1 bis D-13

Grundlage: `docs/design/abstimmung-ux.md` §1 und design-system v0.3.

| Punkt | Bewertung UX | Status |
|---|---|---|
| **D-1** Heatmap-Zelle | Anatomie mit festen Orten übernommen (ux-spec §4.9, W09). Badge-Abweichung (✓ unten rechts) durch CEO als U-2 entschieden. Zählwert-Regel, `--ww-focus-ring-isolated`, offene Bandkanten an Umbrüchen, nodata/vergangen ≥ 3:1, Chip „aktiver Filter“: passt. ✓-Bedeutung durch U-4 präzisiert (nur x = n); design-system v0.3 §6.2 und `heatmap-legend.svg` sind angepasst. | geklärt |
| **D-2** Meine-Tage-Zelle | 2.1 „Geht“ ohne Häkchen, 2.2 gestrichelte Vorschau je Zeilensegment, 2.3 Ankerpunkt, 2.4 schreibgeschützt ohne Opazität, 2.5 kein Zellunterschied, 2.6 80-ms-Feedback – alles übernommen (W08 md + HTML, user-flows B.2). | geklärt |
| **D-3** Zellbreite 360 px | Designer-Variante 8 px / 4 px → 45,7 px; CEO-Entscheidung U-1. ux-spec §2, §7.2, W08, W09 angepasst. | geklärt |
| **D-4** Code-Feld | Ein `<input>` mit visuellen Kästchen bestätigt; alle Zustände gestaltet. Zwei Kleinigkeiten an Copy/Gewichtung → **D-17** (§6). | geklärt (Kleinkorrektur D-17) |
| **D-5** Werkzeugleiste | Übernommen inkl. Mini-Feld, Punkt-Marke, Speicherstatus, Hinweiszeile, Höhe ≤ 150 px. | geklärt |
| **D-6** Abstimmen-Schalter | Übernommen inkl. Geister-Optik, gesperrt, Rang-Abzeichen, Amber-Warnungen. Ergänzung: Platzhalter „Stimm ab, um das Ergebnis zu sehen.“ (Folge der CEO-Entscheidung Ergebnis-Sichtbarkeit) → **D-18**. | geklärt (Ergänzung D-18) |
| **D-7** Phasen & To-do | Übernommen (Chips, Leiste, Koralle-To-do). | geklärt |
| **D-8** Icons | 41 Icons im Sprite; IDs in UX-Dokumenten referenziert (README Wireframes). Krone immer mit Text. | geklärt |
| **D-9** Illustrationen | Alle geliefert; Wireframes nennen jetzt die Dateinamen (`hero`, `invite`, `code-sent`, `empty-trips`, `empty-nobody`, `no-matches`, `submitted`, `vote-waiting`, `vote-done`, `error`, `goodbye`). | geklärt |
| **D-10** Text & Typo | Budgets, `hyphens`, `overflow-wrap`, Tab-Stil inkl. Scroll-Fallback übernommen. | geklärt |
| **D-11** Sheet & Ebenen | Zwei Rastpunkte (`--ww-size-sheet-half/full`), Schließen-Button, Snackbar über der Leiste via `--ww-sticky-bar-h` (U-7). | geklärt |
| **D-12** Dark Mode | Nur System, kein Schalter – bestätigt (Auftraggeber 2026-10-08). | geklärt |
| **D-13** Vorschlagskarte | Übernommen. Gruppenüberschrift „Alle dabei“ mit Strich-Icon `ww-icon-check` statt Badge (U-14, design-system v0.3 §9.3). Mini-Streifen entfällt im MVP (U-10). | geklärt |

**Ein Restkonflikt außerhalb von D-1–D-13** (beim Lesen von design-system §9.8 gefunden): Sprachumschalter in der Kopfzeile → **D-16** (§6).

## 4. Antworten auf U-1 bis U-14

| # | Antwort UX | Status | Umgesetzt in |
|---|---|---|---|
| **U-1** Kalender-Seitenrand 8 px | Übernommen (CEO-Entscheidung): 8 px `--ww-size-cal-inset-sm`, Fuge 4 px `--ww-size-cal-gap`, 45,7 × 52 px bei 360 px, 41 px bei 320 px; ab 600 px 16 px `--ww-size-cal-inset`, 64 px hoch. | übernommen (CEO) | ux-spec §2, §7.2; W08, W09 (md + HTML) |
| **U-2** ✓ unten rechts, ◐ unten links | Übernommen (CEO-Entscheidung): ✓ unten rechts, ◐ unten links (ab 600 px „◐2“), Feiertag-Eselsohr oben rechts. ★/~-Platzhalter aus allen Skizzen entfernt. | übernommen (CEO) | ux-spec §4.9; W09 (md + HTML), README Symbolliste |
| **U-3** Pegel nur ≥ 600 px | Bestätigt. Mobil tragen Zahl + ✓/◐ + Schraffur die Information; ≥ 600 px Pegel als zusätzliche Kodierung. | geklärt | ux-spec §2, §4.9; W09 |
| **U-4** Zählwert | Übernommen (CEO-Entscheidung): Zahl = Anzahl „Geht“ / abgegeben (F-008). ✓ = alle Abgegebenen haben „Geht“ (x = n). Tage ohne „Geht nicht“ mit „Zur Not“ zeigen nur ◐. ✓ und ◐ schließen sich aus; „6/9 ✓ ◐“ gibt es nicht mehr. Wortlaut: Tagesdetail-Kopf „4 von 5: Geht“ + Zusammenfassung («✓ Alle: Geht» · «◐ Alle dabei – 1 nur zur Not» · «✕ Nicht: Jonas»); zugänglicher Name «x von n Geht, k Zur Not» bzw. «x von n Geht – alle»; Legende «4/5 = 4 von 5 haben „Geht“ · ✓ Alle: Geht · ◐ Jemand nur „Zur Not“». | übernommen (CEO) | ux-spec §4.9, §7.3, §10.2; user-flows C.3; W09 |
| **U-5** Textvergrößerung 200 % | **Entscheidung UX:** Heatmap → **Tagesliste**, Meine Tage → **Raster bleibt**, Zellen wachsen in der Höhe. Auslöser: Container-Query in `em` (Zelle < 3,25 em, ≈ ab 175 % Textgröße bei 360 px), damit es auf Schriftgröße statt Pixelbreite reagiert. Begründung: In der Heatmap ist die Zahl die Hauptinformation – abschneiden oder auf „x“ kürzen würde sie entwerten, eine Liste ist bei großer Schrift ohnehin besser lesbar (auch für Screenreader-Nutzung mit Lupe). Beim Eintragen braucht man dagegen das räumliche Raster (Wochen, Ziehen, Bereich); dort stehen nur Datum + ein Symbol, das passt in die Höhe. Kein manueller Umschalter im MVP. **Designer liefert Optik der Tageslisten-Zeile** → D-15. | entschieden (UX) | ux-spec §7.1; W08, W09 (Frame „Textgröße 200 %“) |
| **U-6** Legende | Komponente wie vorgeschlagen (`<details>`, echte Mini-Zellen mit Beispielzahlen der Gruppe). **Zustand:** mobil beim ersten Besuch der Kalenderansicht offen; einmal zugeklappt → bleibt zu (gemerkt pro Gerät, `localStorage`); ≥ 960 px immer sichtbar. Meine Tage: offen bis zur ersten Abgabe. Legende-Texte siehe U-4. | entschieden (UX) | ux-spec §4.9; user-flows B.1, C.3; W08, W09 |
| **U-7** `--ww-sticky-bar-h` | Bestätigt. Layout setzt die Variable per `ResizeObserver` am Seitencontainer (ohne Leiste `0px`); dieselbe Variable speist `scroll-padding-bottom` (WCAG 2.4.11). In W08-HTML demonstriert. | geklärt | ux-spec §4.3, §7.2; W08 HTML |
| **U-8** Abstimmen < 400 px | Übernommen: Icon über Label, Segmente 56 px hoch (Bezug: Viewport-Breite). | übernommen | ux-spec §7.4; user-flows D.2; W10 |
| **U-9** Rang-Abzeichen | Bestätigt: «Platz 1» / «Top choice». Nur Platz 1 erhält ein Abzeichen; bei Gleichstand alle Erstplatzierten. Ins Glossar aufgenommen. | geklärt | ux-spec §7.4, §10.2; W10 |
| **U-10** Mini-Streifen | **Nicht im MVP.** Begründung: Die Karte nennt alles Relevante als Text (Nächte, Urlaubstage, Zur-Not-Anzahl, Fehlende, Feiertage); der Streifen wäre reine Farbkodierung (müsste `aria-hidden` sein), kostet mobil eine Zeile je Karte und doppelt „Im Kalender zeigen“. Kandidat nach Beta-Feedback. | entschieden (UX) | ux-spec §4.9; W09 |
| **U-11** Feiertagsliste | Bestätigt: 13 px `--ww-color-text-muted`, Eselsohr-Dreieck vorn (dekorativ). Struktur: `<ul aria-label="Feiertage im Mai">` unter jedem Monat mit Feiertagen; ohne Feiertag keine Zeile. | geklärt | ux-spec §4.9; W08, W09 |
| **U-12** Hero W01 | **Entscheidung UX:** mobil zentriert **über** der Headline, max. 160 px hoch (Rechnung: CTA bleibt bei 360 × 640 ohne Scrollen sichtbar, ≈ 496 px). Bei Root-Schrift ≥ 20 px rückt die Illustration unter den CTA (Hauptaktion zuerst). Ab 600 px zweispaltig, Illustration rechts. | entschieden (UX) | W01 |
| **U-13** „Noch offen“ im Tagesdetail | Bestätigt: gestrichelter Avatar-Ring + Text „Noch offen (2)“ in `text-muted`. | geklärt | user-flows C.3; W09 |
| **U-14** Benennung „Alle können“ (F-009) | Übernommen (CEO-Entscheidung): Gruppe heißt **„Alle dabei“ / „Everyone's in“**, Überschrift mit Strich-Icon `ww-icon-check` (nicht Badge); Zur-Not-Anteil als Chip «◐ 2× zur Not». **UX-Folgeentscheidung:** zweite Gruppe parallel **„Fast alle dabei“ / „Almost everyone's in“**, damit das Paar sprachlich zusammenpasst. „können“ bleibt nur in Options-/Verfügbarkeitszeilen («8 können · ohne Kemal»), definiert im Glossar als „kein ‚Geht nicht‘ im Zeitraum“. | übernommen (CEO) | ux-spec §4.9, §10.2; user-flows C.2; W09 |

## 5. Übernommene CEO-Entscheidungen (2026-10-08)

| Thema | Entscheidung | Status | Wo verankert |
|---|---|---|---|
| U-1, U-2, U-4, U-14 | siehe §4 | verbindlich | ux-spec, W08, W09 |
| Dark Mode | MVP folgt nur dem System, kein Schalter | bestätigt (Auftraggeber 2026-10-08) | ux-spec §7.1, sitemap, W13 |
| Marke EN | **geändert durch Auftraggeber:** EN-Produktname „When do we go?“, DE bleibt „Wir wollen weg“; Bildmarke sprachneutral; EN-Untertitel „Find dates for your group trip“ optional | bestätigt (Auftraggeber 2026-10-08) | ux-spec §3, §9, §10.2, §10.3, §10.5, §10.6; sitemap §4; W01, W03, W06 |
| Rolle | „Orga“ / „Organizer“ | bestätigt (Auftraggeber 2026-10-08) | ux-spec §10.2, sitemap |
| Angemeldet bleiben | Standard an | bestätigt (Auftraggeber 2026-10-08) | ux-spec §4.4, user-flows H.1, W02 |
| Hilfe/FAQ | kleine MVP-Seite | bestätigt (Auftraggeber 2026-10-08) | sitemap, ux-spec §7.3, W14, **W15 neu** |
| Abstimmungsergebnisse | erst nach der eigenen Stimme sichtbar; Orga sieht immer alles. UX-Präzisierung: je Option nach der eigenen Stimme zu **dieser** Option, vorher Platzhalter «Stimm ab, um das Ergebnis zu sehen.» | bestätigt (Auftraggeber 2026-10-08) | user-flows D.2, ux-spec §8, W10 |
| Einladungslink teilen | alle Mitglieder, solange der Beitritt offen ist | bestätigt (Auftraggeber 2026-10-08) | sitemap §5, user-flows K |

## 6. Neue Punkte an den Designer (Runde 2)

| # | Punkt | Bitte |
|---|---|---|
| **D-14** | **Gruppenbezeichnungen** in design-system §9.3 und §6.2 („Abgrenzung zu F-009“) von „Alle können / Fast alle können“ auf **„Alle dabei“ / „Fast alle dabei“** (EN „Everyone's in“ / „Almost everyone's in“) umstellen. | Textänderung, keine Optik |
| **D-15** | **Tageslisten-Zeile** für die Heatmap bei großer Schrift (U-5): Zeile mit Datum (Wochentag), Zählzeile „4 von 5: Geht“, Abzeichen-Chips (◐ n Zur Not · ✓ alle · Feiertag · Vorschlag n), Stufe als schmaler Farbbalken links (zusätzlich zur Zahl), Fokus/Ausgewählt-Zustand. Skizze: W09-HTML Frame „Textgröße 200 %“. | Optik nachliefern (design-system §6 oder §9.9) |
| **D-16** | **Sprachumschalter Kopfzeile** (design-system §9.8 „Ghost-Button … Sprachcode DE/EN, öffnet Menü“) widerspricht user-flows F.2: Nicht angemeldet ist es ein **direkter Umschalter in der Zielsprache** (Globus-Icon + „English“ bzw. „Deutsch“, ein Tipp, kein Menü, kein Code „DE/EN“ – Codes sind für viele unverständlich und kosten einen Tipp mehr). Angemeldet: im Avatar-Menü (kein Header-Element). Footer: Segment „Deutsch \| English“ wie von dir vorgeschlagen – übernommen. | §9.8 anpassen; **falls Einwand: CEO entscheidet** (UX-Vorschlag: direkter Umschalter) |
| **D-17** | **Code-Feld (§9.2) Copy & Gewichtung:** Fehlertext bitte aus user-flows A.2 übernehmen («Dieser Code stimmt nicht. Noch 3 Versuche.», Restversuche ab dem 2. Fehlversuch); im Zustand „gesperrt“ ist `[Neuen Code senden]` **primär** (einzige sinnvolle Aktion), nicht sekundär. | Kleinkorrektur §9.2 |
| **D-18** | **Abstimmen-Karte vor eigener Stimme:** Platzhalterzeile anstelle des Ergebnisbalkens «Stimm ab, um das Ergebnis zu sehen.» (`text-muted`, kein Balken, keine Zahlen); Orga sieht immer den Balken. | Zustand in §9.10 ergänzen |
| **D-19** | **EN-Wortmarke „When do we go?“** (Auftraggeber 2026-10-08): Fragezeichen ist fester Teil der Wortmarke (nicht weglassen, nicht hervorheben); `<title>` im SVG = «When do we go?»; DE-/EN-Wortmarke gleich hoch, damit Header-Layouts identisch bleiben (beide 14 Zeichen). In design-system bitte Namensregel je Sprache aufnehmen bzw. auf ux-spec §10.6 verweisen. | Asset/Doku prüfen |

## 7. Abstimmungsstand

| Punkt | Thema | Status | Offen bei |
|---|---|---|---|
| D-1 | Heatmap-Zelle | geklärt | – |
| D-2 | Meine-Tage-Zelle & Interaktionszustände | geklärt | – |
| D-3 | Zellbreite 360 px | geklärt (via U-1) | – |
| D-4 | Code-Feld | geklärt, Kleinkorrektur D-17 | Designer |
| D-5 | Werkzeugleiste | geklärt | – |
| D-6 | Abstimmen-Schalter | geklärt, Ergänzung D-18 | Designer |
| D-7 | Phasen & To-do | geklärt | – |
| D-8 | Icons | geklärt | – |
| D-9 | Illustrationen | geklärt | – |
| D-10 | Text & Typo | geklärt | – |
| D-11 | Sheet & Ebenen | geklärt | – |
| D-12 | Dark Mode | geklärt – bestätigt (Auftraggeber 2026-10-08) | – |
| D-13 | Vorschlagskarte | geklärt | – |
| D-14 | Gruppennamen „Alle dabei / Fast alle dabei“ in design-system | neu | Designer |
| D-15 | Optik Tageslisten-Zeile (U-5) | neu | Designer |
| D-16 | Sprachumschalter Kopfzeile | **Restkonflikt** | Designer, ggf. CEO |
| D-17 | Code-Feld Copy/Gewichtung | neu (klein) | Designer |
| D-18 | Ergebnis-Platzhalter vor eigener Stimme | neu (klein) | Designer |
| D-19 | EN-Wortmarke „When do we go?“ | neu | Designer |
| U-1 | Kalender-Seitenrand 8 px | übernommen (CEO) | – |
| U-2 | Badge-Positionen | übernommen (CEO) | – |
| U-3 | Pegel ab 600 px | geklärt | – |
| U-4 | Zählwert / ✓-Bedeutung | übernommen (CEO) | – |
| U-5 | Textvergrößerung 200 % | entschieden (UX), Optik → D-15 | Designer |
| U-6 | Legende | entschieden (UX) | – |
| U-7 | `--ww-sticky-bar-h` | geklärt | Developer (Umsetzung) |
| U-8 | Abstimmen < 400 px | übernommen | – |
| U-9 | „Platz 1“ / „Top choice“ | geklärt | – |
| U-10 | Mini-Streifen | entschieden: nicht im MVP | – |
| U-11 | Feiertagsliste | geklärt | – |
| U-12 | Hero W01 | entschieden (UX) | – |
| U-13 | „Noch offen“ gestrichelt | geklärt | – |
| U-14 | „Alle dabei“ / „Everyone's in“ | übernommen (CEO), Text in design-system → D-14 | Designer |

## 8. Runde 3 – Look & Feel 2.0, Richtung B „Reise-Cockpit“ (Q18)

Grundlage: Auftraggeber-Entscheidung Q18 (Richtung B, Palette B0 „Indigo & Minze“), Q17 (Schalter „Bewegung reduzieren“, Feier für alle, Android-Vibration), `docs/design/richtungen/b/richtung-b.md` §14 „Offene Punkte“, `index.html` (7 Screens). Design-System v1.0 lag bei Redaktionsschluss noch nicht vor (`design-system.md` = v0.5) – die Entscheidungen hier gelten für v1.0 und sind in ux-spec, user-flows, sitemap und Wireframes eingearbeitet (Abschnitte „Richtung B“).

**Grundsatz:** B ändert die Optik, nicht die Funktionen, Texte und Barrierefreiheitsregeln (PRD §1 Q18). Wo B ein Element weglässt, das funktional gebraucht wird (Filterzeile, Legenden-Zustand, Orga-Primäraktion), gilt weiter die UX-Spezifikation.

### 8.1 Entscheidungen zu den offenen Bedienpunkten aus Richtung B

| # (richtung-b §14) | Thema | Entscheidung UX | Begründung | Verankert in |
|---|---|---|---|---|
| **B-3** | **Kennzahl-Box im Cockpit-Kopf (W09) statt Statusband, Kopf ≈ 268 px** | **Übernommen.** Die Box wird **nicht animiert eingeklappt**, sondern **scrollt mit dem Inhalt weg**. Sticky ist nur der **kompakte Kopf**: Zeile 1 (Zurück · Reisename + Phasenzeile · ⋯, 48 px) + Tab-Leiste (48 px) + 8 px = **≈ 104 px**. Die Phasenzeile im kompakten Kopf trägt die Kennzahl weiter («Tage sammeln · 5/7 fertig»), „Erinnern“ bleibt über das Reisemenü erreichbar. Regel „höchstens eine Kennzahl pro Cockpit“ je Tab: Übersicht = Phase-Kennzahl, Meine Tage = keine, Gruppe = Kennzahl-Box Abgabe, Abstimmen = keine (Kacheln im Inhalt). | Keine Höhen-Animation (Layout-Sprünge, Motion-Regel „kein Layout-Shift“), keine zweite Sticky-Ebene. Fixierte Leisten bleiben ≤ 40 % bei 360 × 640 (104 + 150 W08-Leiste = 254 px). Wer scrollt, will Vorschläge/Kalender sehen – die Zahl bleibt in der Phasenzeile sichtbar. | ux-spec §3, §4.10; user-flows C.1; W07, W09 |
| **B-4** | **Kennzahl-Kacheln (Frist, Beteiligung) statt Frist-Chip + Avatar-Reihe (W10)** | **Übernommen; Avatar-Reihe entfällt im Kopf.** Die Kachel „4 von 7 / haben abgestimmt“ ist ein **Button** (für alle) → Bottom-Sheet „Wer hat abgestimmt?“ mit „Abgestimmt (4)“ / „Noch offen (3)“ (nur Status, **keine** Stimmen) + Orga `[Erinnern]`. Wie jemand gestimmt hat, bleibt in „Wer hat wie gestimmt?“ je Option (Sichtbarkeitsregel D-18). Ohne Frist: nur die Beteiligungs-Kachel, volle Breite. Frist abgelaufen: Kachel «Frist abgelaufen» mit Warn-Icon (Amber, nie Rot). | Eine Avatar-Reihe ohne Namen ist auf 360 px nicht lesbar und doppelt die Zahl; die Namen braucht man nur zum Nachfassen (Orga) – dafür ist das Sheet der bessere Ort. | ux-spec §4.10; user-flows D.2; W10 |
| **B-7** | **„So geht's“ als drei Kacheln (W01) – Umbruch** | **Eine Regel für beide Sprachen** (keine Sprach-Sonderfälle): Container-Query in `em` – drei Kacheln nebeneinander, wenn der Container **≥ 21,5 em** breit ist (≈ 344 px bei 16 px Grundschrift → ab ca. 376 px Viewport, z. B. 390er-Geräte), sonst **Liste untereinander** (Kachel-Icon links, Text rechts). Bei 360 px also Liste – in DE und EN. Kacheltitel max. 3 Zeilen, `hyphens: auto` mit `lang`. Größere Systemschrift schaltet automatisch früher auf Liste. | `em` statt `px` reagiert auf Schriftgröße (wie U-5); „EN zu lang“ ist keine messbare Regel für den Developer. Bei 3 × 94 px Textbreite brechen „Alle tippen ihre freien Tage“ / „Everyone adds their dates“ auf 3 Zeilen – an der Grenze, darunter Liste. | W01 |
| **B-7a** | Hero-Karte unter dem CTA (W01) | **Übernommen**, ersetzt U-12: Bei B steht `[Reise planen]` im Indigo-Cockpit **über** der Hero-Karte (Hauptaktion zuerst, bei 360 × 640 ohne Scrollen sichtbar: ≈ 360 px bis Unterkante CTA-Zusatzzeile). | besser als U-12 (dort Hero über Headline). | W01 |
| **B-6** | **Vorschlag-Leiste unten in der Kalender-Ansicht (W09)** | **Übernommen für < 960 px** (≥ 960 px gibt es die Vorschlagsspalte). Fixierte Leiste (kein Griff, nicht ziehbar), **≤ 120 px** + Safe Area: `[‹]` · Mitte (Rang, Gruppe «Alle dabei · 1 von 5», Zeitraum, «bis zu 5 Nächte · ca. 3 Urlaubstage», höchstens **eine** Chip-Zeile, nicht umbrechend, Überlauf «+1») · `[›]`. Blättern setzt das **Band** im Kalender und scrollt zum Anreisetag (G-08). Mitte ist ein Button → wechselt zur Liste und fokussiert die Karte (dort Details, „Zur Abstimmung“-Checkbox der Orga). **Keine Orga-Auswahl in der Leiste** – nur eine fixierte Leiste pro Ansicht; die Auswahlleiste „2 ausgewählt · Abstimmung erstellen“ gibt es nur in der Listenansicht. Ohne Treffer: Leiste zeigt «Gerade kein passender Zeitraum. [Tipps ansehen]» (→ Liste, Leerzustand mit Filter-Vorschlägen). Ansage beim Blättern (polite): «Vorschlag 2 von 5: Sa., 12. Juni – Sa., 19. Juni, Alle dabei». An den Enden kein Umlauf, Pfeil `aria-disabled` mit sichtbarem, ≥ 3:1-Zustand. | Verbindet Kalender und Vorschläge („Warum dieser Zeitraum?“) ohne Ansichtswechsel – genau der Kernnutzen F-008/F-009. Orga-Auswahl im Kalender hätte eine zweite fixierte Leiste oder eine überladene Leiste erzeugt. | ux-spec §4.11; user-flows C.3; W09 |
| **B-5** | Tages-Balken auf Vorschlagskarten (Dunkel-Screen) | **Bleibt außerhalb des MVP** (U-10 unverändert). Kandidat **MVP+**, dann nur dekorativ (`aria-hidden`), Text auf der Karte bleibt vollständig. | Information steht als Text auf der Karte; mobil kostet es eine Zeile je Karte. | ux-spec §4.9 |
| **W08** | **Werkzeugleiste: Zeitraum als Icon-Button, Höhe vs. Maximum 150 px** | **Icon-Button zulässig unter 600 px**, wenn: (1) Name «Zeitraum wählen» / «Select range» als `aria-label` **und** als Tooltip bei Hover/Fokus, (2) `aria-pressed`; gedrückt = Indigo-Fläche + weißes Icon (nicht nur Farbe: zusätzlich Hinweiszeile «Jetzt den Start antippen.» über der Leiste), (3) die Legende „So funktioniert's“ zeigt das Icon mit Text («⇤⇥ = Zeitraum: Start und Ende antippen»). Ab 600 px Icon + Text. **Höhe ≤ 150 px ohne Safe Area**, Aufbau mobil: Polster 8 · Statuszeile 16 («Gespeichert» / «Speichert …» rechts, links leer bzw. «Entwurf») · 4 · Pinsel-Leiste ≤ 58 · 8 · Werkzeugzeile 48 (3 Kacheln **44 × 48** < 400 px, Lücke 6, `[Fertig – abgeben]` füllt den Rest, 48 px hoch, einzeilig: bei 360 px ≈ 182 px Breite) · 8 = **150 px**. Sichtbares Label „Was markierst du?“ entfällt (nur `aria-label` der Radiogruppe), **kein Griff** (die Leiste ist kein Sheet). Bei großer Schrift Regel aus W08 (nicht fixiert, wenn > 40 % Höhe). | Die B-Leiste misst ≈ 167 px ohne Safe Area (Griff 15, Label-Zeile 24, Tasten 50); das kostet eine Kalenderzeile. Der Griff verspricht eine Ziehgeste, die es nicht gibt. | ux-spec §4.12; user-flows B.1; W08 |
| **Kopf** | Phasenzeile im kompakten Kopf (in B: «Tage sammeln · 5 von 7 fertig») | **Übernommen** mit festen Texten (Glossar ux-spec §10.2): «Tage sammeln · 5/7 fertig» · «Abstimmung läuft · 4/7 fertig» · «Steht fest · 7 dabei» / «Collecting dates · 5/7 done» · «Voting open · 4/7 done» · «It's on · 7 going». Zugänglich als «5 von 7 fertig» (sr-only statt „5/7“). Darf bei großer Schrift auf 2 Zeilen umbrechen, wird nie mit „…“ gekürzt (nur der Reisename). Punkt-Farbe ist Zusatz, Text trägt die Phase. | Stabile Orientierung über alle Tabs; ersetzt den Phasen-Chip im Kopf. | ux-spec §3, §10.2; W07 |
| **Kopf** | Kein globaler Header in der Reise (B: Cockpit ersetzt Logo-/Avatar-Zeile) | **Übernommen.** In Reise-Ansichten entfällt der globale Header; „Hilfe“ wird zusätzlich als letzter Eintrag ins Reisemenü „⋯“ aufgenommen (3.2.6: Footer bleibt auf allen Seiten an gleicher Stelle). Konto/Sprache/Abmelden erreicht man über Meine Reisen (Avatar-Menü). | spart 56 px; das Ausblenden beim Scrollen entfällt. | sitemap §5; ux-spec §2, §3; W07 |
| **Landing-Kopf** | Wortmarke + „English“ + „Anmelden“ bei 360 px (B §12: „eng“) | Rechnerisch ≈ 350 px Bedarf bei 328 px Platz (Plus Jakarta 800 ist breiter als Figtree). **Entscheidung:** < 375 px wird **„Anmelden“ zum Icon-Button** (44 × 44, `aria-label` «Anmelden» / «Sign in», Tooltip); Wortmarke und Sprachlink bleiben als Text. Nicht: Wortmarke weglassen (Name wäre auf der Landing nicht mehr sichtbar). | Der Sprachlink ist für englischsprachige Eingeladene wichtiger als ein Text-„Anmelden“ (Bestandsnutzer sind meist angemeldet, „Angemeldet bleiben“ = an). | W01 |

### 8.2 Q17 – eingearbeitet

| Thema | Festlegung UX | Verankert in |
|---|---|---|
| **Schalter „Bewegung reduzieren“** (W13) | Neue Karte **„Darstellung“ / „Appearance“** in /account (zwischen „Sprache & Region“ und „Anmeldung“). Echter Schalter `role="switch"`, Standard **aus = folgt dem Gerät**. Speichert sofort (Snackbar «Gespeichert»), im Konto + `localStorage`, wirkt ohne Neuladen (`data-motion="reduce"` am `<html>`). Meldet das Gerät bereits reduzierte Bewegung: Schalter wird **an** und nicht bedienbar angezeigt, mit Grund daneben (Regel „deaktiviert nur mit sichtbarem Grund“). Texte DE/EN in ux-spec §7.5 und W13. | ux-spec §7.5; user-flows I.1; sitemap; W13; W15 (FAQ) |
| **Feier für alle** | Orga: sofort nach `[Termin festlegen]`. Mitglieder: beim **ersten Öffnen der Übersicht** der Reise nach der Festlegung (Standard-Tab in Phase 3). Öffnet jemand direkt einen anderen Tab: Banner «Der Termin steht fest! [Ansehen]» → Übersicht → Feier. **Einmal pro Person und Festlegung**, serverseitig je Mitgliedschaft gemerkt (geräteübergreifend; In-App-Browser und normaler Browser zählen zusammen); gesetzt, sobald die Feier sichtbar startet (`document.visibilityState = visible`). Neue Festlegung mit **anderem** Zeitraum → erneut (bestätigt PM-Annahme); gleicher Zeitraum → nicht. Wer in Phase 3 beitritt, bekommt die Feier einmal. Reduziert: keine Bewegung, „Es geht los!“ trägt den Moment. | ux-spec §7.5; user-flows D.3; W11 |
| **Vibration** | Nur an zwei Stellen: Ziehen startet nach 300 ms Halten (Meine Tage) und Vorfreude-Ring/Siegel schließt sich (Feier). `navigator.vibrate` nur, wenn vorhanden; best effort (Browser verlangen eine Nutzer-Aktivierung – beim Öffnen per Link aus WhatsApp vibriert die Mitglieder-Feier deshalb meist nicht; das ist in Ordnung). Aus bei reduzierter Bewegung (Gerät **oder** Schalter). Kein eigener Schalter, nie Ton, nie einzige Rückmeldung. | ux-spec §7.5; user-flows B.2, D.3 |

### 8.3 Usability-Check der B-Screens → Punkte an den Designer

Stichprobe am `index.html` (Screens 01–07, CSS gelesen, Maße gerechnet; keine Screenshots). Kontraste nur stichprobenartig nachgerechnet (WCAG-Formel).

| # | Befund | Bitte an den Designer | Gewicht |
|---|---|---|---|
| **D-20** | **Touch-Ziele < 44 px:** Tabs ≈ 33 px hoch (Polster 9 + 14 px Text), Segment „Vorschläge/Kalender“ 40 px, Monats-Sprung-Chips 32 px, „Erinnern“ (`btn-xs`) 40 px, „Anmelden“-Pille 38 px. Checkbox „Zur Abstimmung“ und Filter-Chips nicht gezeigt. | Alle auf **≥ 44 px** Trefferfläche (Tab-Pille 44, Spur 48; Chips/`btn-xs` über Polster oder `::before`-Trefferfläche). ux-spec §7.2. | hoch |
| **D-21** | **Kalenderzelle bei 360 px zu schmal:** Kalender-Karte mit 12 px Außen- + 8 px Innenrand → (360 − 40 − 24) / 7 = **42,3 px** (U-1 verlangt 45,7 px). Höhe 46 px + Fuge 9 px ist ok (≥ 44, gleiche Zeilenhöhe wie 52 + 4), wenn die Anatomie (Datum, Zahl, ◐, Siegel, Eselsohr) ohne Überlappung passt – bitte bestätigen. | Unter 400 px Kalender-Karte mit **8 px Gesamtrand** je Seite (z. B. 4 + 4) oder randlos; Fuge 4 px horizontal beibehalten. | hoch |
| **D-22** | **Fokus auf aktivem Tab:** weißer Fokusring direkt an der weißen Pille ist unsichtbar; Nachbar-Tabs liegen nur 2 px daneben. | Fokus in der Tab-Spur: Hof 2 px Indigo + Ring 3 px Weiß (wie `--ww-focus-ring-isolated`, nur invertiert); fokussierter Tab `z-index: 1`. Gleiches für Minze-Tasten auf Indigo prüfen. | hoch |
| **D-23** | **Kontrast Kennzahl-Box:** Text `#CFC9F2` 13 px auf Weiß 8 % über Indigo = ≈ 6,9 : 1 ✔ – liegt aber der Minze-Lichtfleck (22 %) unter der Box, rechnerisch nur **≈ 4,3 : 1**. | Lichtflecken auf das obere Drittel des Kopfs begrenzen (nie unter Kennzahl-Box/Tabs) oder Box-Text weiß; im Review mit axe nachmessen. | mittel |
| **D-24** | **Countdown nur grafisch:** „noch 23 Tage“ steht nur im `aria-hidden`-Ring (W11); die Ergebnis-Karte nennt „5 Nächte · 7 dabei“. | Countdown als Text in die Ergebnis-Karte («5 Nächte · 7 dabei · noch 23 Tage»); Ring-Text bleibt `aria-hidden`. Zustände: «noch 1 Tag» · «Heute geht's los!» · während der Reise «Gute Reise!» (EN «1 day to go» · «It's today!» · «Have a great trip!»). | hoch |
| **D-25** | **Datenschutz Einladung (W03):** Die Reisekarte zeigt Avatare mit **Initialen** der Mitglieder. F-003/ux-spec §11: Vorschau zeigt keine Namen außer Orga-Vorname. | Neutrale Avatar-Punkte (ohne Initialen, gern in Avatarfarben) + „+1“ für dich; Zahl «6 sind schon dabei» bleibt. | hoch |
| **D-26** | **W09-B lässt Funktionen weg:** Filterzeile (Dauer, Darf fehlen, Personen ausblenden) fehlt; Legende ist dauerhaft offen. | Filterzeile unter dem Segment ergänzen (Chips ≥ 44 px, aktiver Filter-Chip); Legende als `<details>` mit Zustandsregel U-6. | hoch |
| **D-27** | **Griff an fixierten Leisten** (`.sheet-bar::before`) bei W08-Werkzeugleiste, W09-Vorschlag-Leiste und Orga-Auswahlleiste suggeriert ein ziehbares Sheet. | Griff nur an echten Bottom-Sheets (Tagesdetail, Teilen, Reisemenü, Festlegen). Fixierte Leisten: obere Rundung + Schatten genügen. | mittel |
| **D-28** | **W08-Leiste ≈ 167 px** ohne Safe Area (> 150 px, `--ww-size-toolbar-max`). | Aufbau nach §8.1 „W08“ (150 px). „Fertig – abgeben“ muss bei 360 px einzeilig passen. | mittel |
| **D-29** | **Landing-Kopf 360 px** mit Plus Jakarta zu breit (§8.1 „Landing-Kopf“). | Icon für „Anmelden“ (Person + Pfeil, Sprite) und Kopf-Variante < 375 px liefern. | mittel |
| **D-30** | **W11 zeigt nur die Mitglieder-Sicht:** Für die Orga ist direkt nach dem Festlegen `[Allen Bescheid geben]` primär, Kalender sekundär (W11). | Orga-Variante der Ergebnis-Karte (Tasten getauscht). | mittel |
| **D-31** | **Zahlen zählen hoch** (B §10: Kennzahl 4 → 5, Countdown 0 → 23) widerspricht Motion G-16 und F-052 („Zahlen zählen nicht hoch“). | Zahlen stehen sofort; Ring/Balken dürfen wachsen. Bitte B §10 anpassen. | mittel (Konflikt, s. §9 M-U2) |
| **D-32** | **W07 Übersicht fehlt in B**, ebenso W04 Meine Reisen, W13 Konto. | W07 mit Phase-Kennzahl im Cockpit (P1 Ring Abgabe, P2 Ring Abstimmung + Frist, P3 Vorfreude-Ring); W13 Karte „Darstellung“ mit Schalter-Zuständen (aus · an · an durch Gerät, nicht bedienbar + Grund). | mittel |
| **D-33** | **Tab-Leiste < 375 px scrollt** (vorgesehen), aber ohne Hinweis, dass rechts noch „Abstimmen“ kommt. | Verlaufskante rechts/links bei Überlauf; aktiver Tab wird beim Laden in Sicht gescrollt (G-02). | niedrig |
| **D-34** | **Geister-Stimme „Nein?“** (W10): Das Fragezeichen gehört nicht in den zugänglichen Namen. | Sichtbar „Nein?“ ok; zugänglicher Name „Nein“ + Beschreibung „Vorschlag aus deinen Tagen“ (ux-spec §7.4). Nur Hinweis an Developer, keine Optikänderung. | niedrig |
| **D-35** | Textlängen DE/EN geprüft: Pinsel, Kennzahl-Box, Kacheln, Countdown, „Platz 1 / Top choice“, Reisekarte – passen bei 360 px (Chip bricht Datum um, Kacheln zweizeilig). Kritisch nur: Landing-Kopf (D-29), „So geht's“ (§8.1 B-7), Phasenzeile «Abstimmung läuft · 4/7 fertig» (≈ 30 Zeichen bei ≈ 224 px Platz – passt bei 13 px knapp; Umbruch statt Kürzen). | – (zur Kenntnis) | – |

Ohne Befund: Minze nie als Text auf Hell, Indigo-Tasten 12,4 : 1 gegen Nebel, Stimm-Segmente 60 px mit Icon über Label (≥ U-8), Pinsel gewählt = Rahmen + Punkt + fett, Code-Feld als ein Input mit Fokus-Ring am aktiven Kästchen, Heatmap mit Zahl in jeder Zelle + Siegel + ◐ + Eselsohr.

## 9. Antworten an Motion (`docs/motion/abstimmung.md` §2)

| # | Thema | Antwort UX | Status | Verankert in |
|---|---|---|---|---|
| **M-U1** | Schalter „Bewegung reduzieren“ | **Ja** (Auftraggeber Q17 a). W13, Karte „Darstellung“; Standard aus = folgt Gerät; sofort wirksam; Konto + `localStorage`; kann nur reduzieren. Präzisierung: Meldet das Gerät „reduzieren“, erscheint der Schalter **an und nicht bedienbar** mit Grund («Ist an, weil dein Gerät Bewegung reduziert …»), statt „aus“ bei trotzdem reduzierter Bewegung (sonst widersprüchlich). | entschieden | ux-spec §7.5, W13, user-flows I.1 |
| **M-U2** | Dauer großer Erfolgsmomente | **Übernommen mit Präzisierung:** Kernanimation ≤ 1 s; nur F-012 mit Ausklang (Konfetti) bis **2,6 s**; Text und Tasten ab spätestens **300 ms** lesbar und bedienbar; jede Interaktion (Tipp, Scroll, Taste) und `visibilitychange` beendet die Animation; nichts wiederholt sich; **Zahlen zählen nicht hoch** (auch nicht der Countdown – Richtung B §10 bitte anpassen, D-31). ux-spec §6 „≤ 600 ms“ ersetzt. | entschieden | ux-spec §6, §7.5 |
| **M-U3** | Umsortieren der Abstimmungskarten | **Variante 2: kein Umsortieren während man auf der Seite ist.** Nach Rang sortiert wird beim **nächsten Öffnen** des Tabs (neuer Seitenaufruf bzw. Tab-Wechsel). Unmittelbar nach der letzten Stimme zeigt die Statuszeile den Dank; „Platz 1“ ist an der Karte bereits sichtbar. Begründung: Auch mit Scroll-Ausgleich bewegen sich die übrigen Karten, und die DOM-Reihenfolge ändert sich, während Fokus/Screenreader in der Liste sind – wer gleich noch eine Stimme korrigieren will, sucht seine Karte. FLIP-Animation daher nicht nötig. | entschieden | user-flows D.2 (6), W10 |
| **M-U4** | Sticky „Reise planen“ auf der Landing | **Nicht im MVP.** Stattdessen am Seitenende eine Wiederholung `[Reise planen]` (gleiche Aktion, gleiche Beschriftung). Begründung: Die Landing ist kurz (≈ 2 Bildschirme), der CTA steht oben im Cockpit; eine zusätzliche fixierte Leiste kollidiert mit der unteren Leiste der In-App-Browser. Wiedervorlage, falls die Landing wächst. | entschieden | W01 |
| **M-U5** | Code-Schritt optimistisch zeigen | **Übernommen**, mit Bedingungen: (1) Formatprüfung der E-Mail **vor** dem Wechsel (ungültig → kein Wechsel, Fehler am Feld). (2) Wechsel und Fokus ins Code-Feld synchron im Tipp-Ereignis; Überschrift «Schau in dein Postfach», Statuszeile `role="status"` «Code wird gesendet …» → nach Server-OK «Code an kemal@… gesendet». (3) „Neuen Code senden“-Countdown startet erst nach Server-OK. (4) Fehler (Rate-Limit, Netz, Server): zurück zum E-Mail-Schritt **per `history.replaceState`** (kein toter Zurück-Eintrag), E-Mail bleibt, Meldung am Feld, Fokus ins E-Mail-Feld. (5) Antwort bleibt neutral (keine Enumeration). | entschieden | user-flows A.1 (3), H.1; W02, W03 |
| **M-U6** | Feier auch für Mitglieder | **Ja** (Q17 b). Präzisiert: einmal pro Person **und Festlegung**, **serverseitig** je Mitgliedschaft (nicht nur `localStorage` – sonst zweimal bei In-App-Browser + Browser). Ausgelöst beim ersten Öffnen der **Übersicht** nach der Festlegung (bzw. über Banner „Ansehen“ / Konflikt-Banner W14-03); Merker wird gesetzt, wenn die Feier sichtbar startet. Neue Festlegung mit anderem Zeitraum → erneut. | entschieden | ux-spec §7.5, user-flows D.3, W11 |
| **M-U7** | Vorschlag im Kalender – was bleibt | **Übernommen:** Umriss + Label verschwinden nach 4 s bzw. bei der nächsten Interaktion; das **Band bleibt**, solange der Vorschlag in der neuen **Vorschlag-Leiste** gewählt ist (B-6) – also bis man blättert oder die Ansicht verlässt. Öffnet man den Kalender direkt, zeigt die Leiste Vorschlag 1 mit Band, aber **ohne** Umriss/Label und ohne Scroll-Sprung. | entschieden | user-flows C.3, ux-spec §4.11, W09 |
| **M-U8** | Heatmap-Aufbau nur über das Segment | **Einverstanden.** Zusätzlich: nur beim ersten Öffnen in der Sitzung, nicht bei Blättern in der Vorschlag-Leiste. | geklärt | user-flows C.3 |
| **M-U9** | Geste-Hinweis | **Übernommen** (600 ms nach Willkommens-Hinweis, 2 Durchläufe, ≤ 2,8 s, jede Berührung/Scroll/Taste stoppt, Tage unverändert). **Änderung für reduziert:** statische Skizze **ohne Zeitlimit** im Willkommens-Hinweis, bis dieser geschlossen wird (Inhalte verschwinden nicht zeitgesteuert). Nur beim ersten Besuch, nicht bei Tastatur-Fokus im Kalender. | entschieden | user-flows B.4 |
| **M-U10** | Fokus bei der Feier | **Übernommen:** Orga – Sheet schließt, Fokus **sofort** (nicht nach der Animation) auf h1 «Es geht los!» (`tabindex="-1"`), h1 mit `aria-describedby` auf die Datumszeile, damit der Zeitraum mit angesagt wird; keine zusätzliche Live-Ansage (doppelt). Mitglieder beim ersten Öffnen: normaler Seitenaufruf, **kein** Fokus-Sprung (Fokus startet oben, h1 ist die erste Überschrift). Konfetti-Ebene `aria-hidden`, `pointer-events: none`. | entschieden | ux-spec §4.2, §7.5; user-flows D.3; W11 |
| **M-U11** | Tab-Richtung | Kein Einwand. Gilt nur für Tipp auf einen Tab (nicht bei Direktaufruf, Zurück-Taste oder Standard-Tab-Weiterleitung); reduziert: Fade. | geklärt | – |

**Offene Konflikte Motion ↔ Design (für CEO):** (1) Zahlen-Hochzählen (Designer B §10) vs. G-16/F-052 – UX stützt G-16 (D-31). (2) Motion W11-02 beschreibt Siegel + Kalenderblatt (`vote-done.svg`), B einen Vorfreude-Ring mit Countdown – die Zeitleiste muss an B angepasst werden (Motion), die Regeln aus M-U2/M-U10 gelten unverändert. (3) W03-06 „Initiale reiht sich in Avatar-Reihe ein“ – in B gibt es in Meine Tage keine Avatar-Reihe; entfällt.

## 10. Abstimmungsstand Runde 3

| Punkt | Thema | Status | Offen bei |
|---|---|---|---|
| B-3 | Kennzahl-Box W09 | entschieden (UX): mitscrollen, kompakter Kopf sticky | Designer (kompakter Kopf zeichnen) |
| B-4 | Kennzahl-Kacheln W10 | entschieden (UX): Kacheln, Avatar-Reihe → Sheet | – |
| B-5 | Tages-Balken | nicht MVP (U-10) | – |
| B-6 | Vorschlag-Leiste W09 | entschieden (UX): übernehmen < 960 px, ohne Orga-Auswahl | Designer (Leeren-Zustand, ≤ 120 px) |
| B-7 | „So geht's“ W01 | entschieden (UX): `em`-Container-Query 21,5 em | – |
| W08 | Werkzeugleiste | entschieden (UX): Icon-Button mit Bedingungen, 150 px | Designer (D-28) |
| D-20 – D-34 | Usability-Befunde B | neu | Designer |
| D-31 | Hochzählen von Zahlen | **Konflikt** Designer B ↔ Motion/PM | CEO (UX-Empfehlung: kein Hochzählen) |
| M-U1 – M-U11 | Motion-Punkte | beantwortet | Motion (Zeitleiste Feier an B anpassen) |
| Q17 | Schalter, Feier, Vibration | eingearbeitet | – |

## Changelog
- 2026-10-08 (Runde 3, Richtung B): §8 Entscheidungen zu den offenen Punkten aus richtung-b §14 und Q17, Usability-Befunde D-20–D-35; §9 Antworten an Motion M-U1–M-U11; §10 Abstimmungsstand.
- 2026-10-08 (Runde 2): §0 aktualisiert; §3 Prüfung D-1–D-13; §4 Antworten U-1–U-14; §5 CEO-Entscheidungen; §6 neue Punkte D-14–D-18; §7 Abstimmungsstand.
- 2026-10-08 (Runde 1): Erstfassung D-1–D-13.

## CEO-Entscheidungen 2026-10-08 (nach Abstimmung EN-Name)
- **D-19:** „go?“ wird als Einheit in Markenfarbe hervorgehoben (Fragezeichen ohne eigene Farbe/Größe) – Designer-Umsetzung gilt.
- **U-15:** Kopfzeile und W01 mit EN-Namen gelten als geprüft (beide Namen 14 Zeichen, Header-Box 160 px passt bei 360 px).
- **U-16:** `short_name` im Manifest = voller Name je Sprache; Kürzung erst, falls Gerätetests Abschneiden zeigen (Fallback DE „Wollen weg“, EN ungekürzt).
