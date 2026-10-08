# Abstimmung UI/UX ↔ Design

Stand: 2026-10-08 (Runde 2) · Verantwortlich: UI/UX · Gegenstück: `docs/design/abstimmung-ux.md` (Designer) · Bezug: [ux-spec.md](ux-spec.md), [Wireframes](wireframes/README.md)

## 0. Stand

- **Runde 1** (§1, §2): Punkte D-1–D-13 an den Designer, erstellt auf Basis von `tokens.css` v0.1 und Assets.
- **Runde 2** (§3–§7): Designer hat mit `design-system.md` (v0.2 → v0.3), `tokens.css`, Assets und `docs/design/abstimmung-ux.md` geantwortet. Hier: Prüfung seiner Antworten auf D-1–D-13 (§3), Antworten auf U-1–U-14 (§4), übernommene CEO-Entscheidungen (§5), neue Punkte an den Designer (§6), Gesamttabelle (§7).
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
| EN-Wortmarke mit Unterzeile „Find dates for your group trip“ | App-Name wird nicht übersetzt (ux-spec §10.2) |

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
| **D-12** Dark Mode | Nur System, kein Schalter – CEO-Entscheidung, vorbehaltlich Auftraggeber. | geklärt (Vorbehalt Auftraggeber) |
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

| Thema | Entscheidung | Vorbehalt | Wo verankert |
|---|---|---|---|
| U-1, U-2, U-4, U-14 | siehe §4 | verbindlich | ux-spec, W08, W09 |
| Dark Mode | MVP folgt nur dem System, kein Schalter | vorbehaltlich Auftraggeber | ux-spec §7.1, sitemap, W13 |
| Marke EN | „Wir wollen weg“ bleibt, EN-Untertitel „Find dates for your group trip“ | vorbehaltlich Auftraggeber | ux-spec §10.2, W01 |
| Rolle | „Orga“ / „Organizer“ | vorbehaltlich Auftraggeber | ux-spec §10.2, sitemap |
| Angemeldet bleiben | Standard an | vorbehaltlich Auftraggeber | ux-spec §4.4, user-flows H.1, W02 |
| Hilfe/FAQ | kleine MVP-Seite | vorbehaltlich Auftraggeber | sitemap, ux-spec §7.3, W14, **W15 neu** |
| Abstimmungsergebnisse | erst nach der eigenen Stimme sichtbar; Orga sieht immer alles. UX-Präzisierung: je Option nach der eigenen Stimme zu **dieser** Option, vorher Platzhalter «Stimm ab, um das Ergebnis zu sehen.» | vorbehaltlich Auftraggeber | user-flows D.2, ux-spec §8, W10 |
| Einladungslink teilen | alle Mitglieder, solange der Beitritt offen ist | vorbehaltlich Auftraggeber | sitemap §5, user-flows K |

## 6. Neue Punkte an den Designer (Runde 2)

| # | Punkt | Bitte |
|---|---|---|
| **D-14** | **Gruppenbezeichnungen** in design-system §9.3 und §6.2 („Abgrenzung zu F-009“) von „Alle können / Fast alle können“ auf **„Alle dabei“ / „Fast alle dabei“** (EN „Everyone's in“ / „Almost everyone's in“) umstellen. | Textänderung, keine Optik |
| **D-15** | **Tageslisten-Zeile** für die Heatmap bei großer Schrift (U-5): Zeile mit Datum (Wochentag), Zählzeile „4 von 5: Geht“, Abzeichen-Chips (◐ n Zur Not · ✓ alle · Feiertag · Vorschlag n), Stufe als schmaler Farbbalken links (zusätzlich zur Zahl), Fokus/Ausgewählt-Zustand. Skizze: W09-HTML Frame „Textgröße 200 %“. | Optik nachliefern (design-system §6 oder §9.9) |
| **D-16** | **Sprachumschalter Kopfzeile** (design-system §9.8 „Ghost-Button … Sprachcode DE/EN, öffnet Menü“) widerspricht user-flows F.2: Nicht angemeldet ist es ein **direkter Umschalter in der Zielsprache** (Globus-Icon + „English“ bzw. „Deutsch“, ein Tipp, kein Menü, kein Code „DE/EN“ – Codes sind für viele unverständlich und kosten einen Tipp mehr). Angemeldet: im Avatar-Menü (kein Header-Element). Footer: Segment „Deutsch \| English“ wie von dir vorgeschlagen – übernommen. | §9.8 anpassen; **falls Einwand: CEO entscheidet** (UX-Vorschlag: direkter Umschalter) |
| **D-17** | **Code-Feld (§9.2) Copy & Gewichtung:** Fehlertext bitte aus user-flows A.2 übernehmen («Dieser Code stimmt nicht. Noch 3 Versuche.», Restversuche ab dem 2. Fehlversuch); im Zustand „gesperrt“ ist `[Neuen Code senden]` **primär** (einzige sinnvolle Aktion), nicht sekundär. | Kleinkorrektur §9.2 |
| **D-18** | **Abstimmen-Karte vor eigener Stimme:** Platzhalterzeile anstelle des Ergebnisbalkens «Stimm ab, um das Ergebnis zu sehen.» (`text-muted`, kein Balken, keine Zahlen); Orga sieht immer den Balken. | Zustand in §9.10 ergänzen |

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
| D-12 | Dark Mode | geklärt (Vorbehalt Auftraggeber) | Auftraggeber |
| D-13 | Vorschlagskarte | geklärt | – |
| D-14 | Gruppennamen „Alle dabei / Fast alle dabei“ in design-system | neu | Designer |
| D-15 | Optik Tageslisten-Zeile (U-5) | neu | Designer |
| D-16 | Sprachumschalter Kopfzeile | **Restkonflikt** | Designer, ggf. CEO |
| D-17 | Code-Feld Copy/Gewichtung | neu (klein) | Designer |
| D-18 | Ergebnis-Platzhalter vor eigener Stimme | neu (klein) | Designer |
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

## Changelog
- 2026-10-08 (Runde 2): §0 aktualisiert; §3 Prüfung D-1–D-13; §4 Antworten U-1–U-14; §5 CEO-Entscheidungen; §6 neue Punkte D-14–D-18; §7 Abstimmungsstand.
- 2026-10-08 (Runde 1): Erstfassung D-1–D-13.
