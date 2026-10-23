# Abstimmung UI/UX ↔ Design

Stand: 2026-10-23 (Runde 7 – Inkrement 11 „Bucht“ + Reisedaten, §16; Runde 4 – Cockpit Variante C „Reiseverlauf“, §12; vorher Runde 3 – Richtung B, Motion) · Verantwortlich: UI/UX · Gegenstück: `docs/design/abstimmung-ux.md` (Designer) · Bezug: [ux-spec.md](ux-spec.md), [Wireframes](wireframes/README.md)

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
| **D-21** | **Kalenderzelle bei 360 px zu schmal:** Kalender-Karte mit 12 px Außen- + 8 px Innenrand → (360 − 40 − 24) / 7 = **42,3 px** (U-1 verlangt 45,7 px). Höhe 46 px + Fuge 9 px ist ok (≥ 44, gleiche Zeilenhöhe wie 52 + 4), wenn die Anatomie (Datum, Zahl, ◐, Siegel, Eselsohr) ohne Überlappung passt – bitte bestätigen. | Unter 400 px Kalender-Karte mit **8 px Gesamtrand** je Seite (z. B. 4 + 4) oder randlos; Fuge 4 px horizontal beibehalten. **tokens.css v1.0** (WIP) setzt `--ww-size-cal-inset-sm` als „Karte 12 + 8“ und `--ww-size-cal-cell-min-w: 40px` – beides widerspricht U-1 (CEO-Entscheidung); bitte auf 8 px gesamt bzw. 44 px korrigieren. | hoch |
| **D-22** | **Fokus auf aktivem Tab:** weißer Fokusring direkt an der weißen Pille ist unsichtbar; Nachbar-Tabs liegen nur 2 px daneben. | Fokus in der Tab-Spur: Hof 2 px Indigo + Ring 3 px Weiß (wie `--ww-focus-ring-isolated`, nur invertiert); fokussierter Tab `z-index: 1`. Gleiches für Minze-Tasten auf Indigo prüfen. | hoch |
| **D-23** | **Kontrast Kennzahl-Box:** Text `#CFC9F2` 13 px auf Weiß 8 % über Indigo = ≈ 6,9 : 1 ✔ – liegt aber der Minze-Lichtfleck (22 %) unter der Box, rechnerisch nur **≈ 4,3 : 1**. | Lichtflecken auf das obere Drittel des Kopfs begrenzen (nie unter Kennzahl-Box/Tabs) oder Box-Text weiß; im Review mit axe nachmessen. | mittel |
| **D-24** | **Countdown nur grafisch:** „noch 23 Tage“ steht nur im `aria-hidden`-Ring (W11); die Ergebnis-Karte nennt „5 Nächte · 7 dabei“. | Countdown als Text in die Ergebnis-Karte («5 Nächte · 7 dabei · noch 23 Tage»); Ring-Text bleibt `aria-hidden`. Zustände: «noch 1 Tag» · «Heute geht's los!» · während der Reise «Gute Reise!» (EN «1 day to go» · «It's today!» · «Have a great trip!»). | hoch |
| **D-25** | **Datenschutz Einladung (W03):** Die Reisekarte zeigt Avatare mit **Initialen** der Mitglieder. F-003/ux-spec §11: Vorschau zeigt keine Namen außer Orga-Vorname. | Neutrale Avatar-Punkte (ohne Initialen, gern in Avatarfarben) + „+1“ für dich; Zahl «6 sind schon dabei» bleibt. | hoch |
| **D-26** | **W09-B lässt Funktionen weg:** Filterzeile (Dauer, Darf fehlen, Personen ausblenden) fehlt; Legende ist dauerhaft offen. | Filterzeile unter dem Segment ergänzen (Chips ≥ 44 px, aktiver Filter-Chip); Legende als `<details>` mit Zustandsregel U-6. | hoch |
| **D-27** | **Griff an fixierten Leisten** (`.sheet-bar::before`) bei W08-Werkzeugleiste, W09-Vorschlag-Leiste und Orga-Auswahlleiste suggeriert ein ziehbares Sheet. | Griff nur an echten Bottom-Sheets (Tagesdetail, Teilen, Reisemenü, Festlegen). Fixierte Leisten: obere Rundung + Schatten genügen. | mittel |
| **D-28** | **W08-Leiste ≈ 167 px** ohne Safe Area (> 150 px, `--ww-size-toolbar-max`). | Aufbau nach §8.1 „W08“ (150 px). „Fertig – abgeben“ muss bei 360 px einzeilig passen. **tokens.css v1.0** (WIP) hebt `--ww-size-toolbar-max` auf 160 px – mit Kopf 104 px wären das 264 px = 41 % bei 640 px Höhe (Regel ≤ 40 %, ux-spec §2). Bitte 150 px; falls nicht machbar → CEO. | mittel |
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
| W08 | Werkzeugleiste | entschieden (UX): Icon-Button mit Bedingungen, 150 px – **Konflikt** mit tokens v1.0 (160 px) | Designer (D-28), ggf. CEO |
| D-21 | Kalender-Rand 360 px | **Konflikt** mit tokens v1.0 (Rand 20 px, Zelle min. 40 px) vs. U-1 | Designer, ggf. CEO |
| D-20 – D-34 | Usability-Befunde B | neu | Designer |
| D-31 | Hochzählen von Zahlen | **Konflikt** Designer B ↔ Motion/PM | CEO (UX-Empfehlung: kein Hochzählen) |
| M-U1 – M-U11 | Motion-Punkte | beantwortet | Motion (Zeitleiste Feier an B anpassen) |
| Q17 | Schalter, Feier, Vibration | eingearbeitet | – |

## 11. Feedback-Runde 1 (Auftraggeber, 2026-10-20) – Punkte an den Designer

Struktur und Texte sind in [ux-spec §14](ux-spec.md) festgelegt und können ohne diese Punkte gebaut werden – mit vorhandenen Tokens und Komponenten. Die Punkte betreffen nur den Feinschliff der Optik. Der Auftraggeber wünscht sich eine „richtig schöne“, aufgeräumte Übersicht.

| ID | Thema | Bitte |
|---|---|---|
| U-17 | **WhatsApp-Taste** im Erinnern-Sheet (primär) | Darf die WhatsApp-Glyphe (Markenrichtlinie „Share on WhatsApp“) neben dem Text stehen, oder bleibt es bei `share` + Text «Per WhatsApp senden»? Farbe: unsere Primär-Taste (Indigo), **kein** WhatsApp-Grün (Markenbruch, Kontrast). Bis zur Antwort: `share`-Icon + Text. |
| U-18 | **Kennzahl-Box als Button** (W07, W09) | Chevron rechts (20 px, Weiß 70 %), Gedrückt-Zustand (`scale-press`, Fläche Weiß 12 %), Fokus `--ww-focus-ring-on-brand`. Die Minze-Taste [Erinnern] entfällt in der Box. |
| U-19 | **Personen-Zeilen** „Fehlt noch / Eingetragen“ (Sheet + Übersicht) | Avatar 40: offen gestrichelt + Uhr-Icon in der Statuszeile, eingetragen gefüllt + Minze-Siegel (§9.17). Zwischenüberschriften (Stil? Vorschlag 13/800 Versalien `text-muted`), Trennlinie zwischen den Gruppen, [Erinnern] als `btn-sm` sekundär mit `remind`-Icon. Bitte prüfen, dass Name + [Erinnern] + [⋯] bei 360 px in eine Zeile passen. |
| U-20 | **Hinweis „Basiert auf 5 von 9 …“** unter „Alle dabei“ + Chip «Bisher 5 von 9» in der Vorschlag-Leiste | Kompakte Info-Variante von §9.18 (Polster 8/12, Icon `users` 16) mit Text-Taste rechts unten. Chip in `info-*`. Bewusst nicht Amber. |
| U-21 | **Phase 3 ohne Tabs** + Reise-Hub | (a) Höhe/Unterkante des kompakten Cockpits ohne Tab-Spur (Zeile 1 + Polster; Radius 30 bleibt?). (b) Kacheln «So habt ihr entschieden» (Icon-Kachel 40 + Titel + Meta + Chevron, zwei nebeneinander). (c) Modul-Kachel für die Andockfläche «Als Nächstes» (später Unterkünfte, Kosten, Reisedaten, Dokumente; To-do-Kante wie F-044) – jetzt schon als Muster festlegen, damit spätere Module einheitlich andocken. |

Motion (zur Info an den Motion Designer über den CEO): Schrittwechsel im Erinnern-Sheet wie W09-08. Tab-Spur nach „Festlegung aufheben“ nur Fade (W11-07). Keine neuen Feier-Momente.

## 12. Runde 4 – Cockpit-Varianten, Auswahl C „Reiseverlauf“ (2026-10-22)

Der Auftraggeber hat **Variante C „Reiseverlauf“** gewählt und um Ausarbeitung gebeten. UX-Konzept: [W16 v2, Teil A](wireframes/w16-cockpit.md) (gültig; v1 als Teil B abgelöst). Die Designer-Empfehlung (Ticket-Kopf aus A, Bereiche ohne Zeitbezug als kompakte Kacheln unter dem Weg) ist **übernommen**.

**Hinweis Nummern:** Die Punkte U-17–U-22 in `docs/design/abstimmung-ux.md` §9 überschneiden sich mit meinen U-17–U-21 aus §11 oben (anderer Inhalt). Ich bezeichne die Designer-Punkte hier als **R4-U-17 … R4-U-22**. Meine §11-Punkte bleiben unter ihren Nummern; sie sind im Design-Dokument noch unbeantwortet (niedrige Priorität, der Bau nutzt die dort genannten Standardwerte). Neue Punkte an den Designer laufen ab **D-36**, an den Motion Designer als **UM-1 …** (damit es keine Überschneidung mit M-U aus `docs/motion/abstimmung.md` gibt).

### 12.1 Antworten auf `docs/design/abstimmung-ux.md` §9

| Punkt | Antwort UX | Wo |
|---|---|---|
| **R4-U-17** Ring dauerhaft groß | **Einverstanden mit deinem Vorschlag:** große Feier einmal (W11, je Person und Festlegung), danach Ring groß, **statisch, ohne Ehrenrunde**; Antippen = kleine Konfetti-Runde (≤ 1,2 s, Sperre 3 s). Ring als `<button>` «Vorfreude: noch 41 Tage». **Neu:** Durchmesser gedeckelt `clamp(120px, 21svh, 168px)`. | W16 v2.2 |
| **R4-U-18** Ticket-Kopf 470 px | **Reicht nicht.** Zeile 1 + Ticket ≤ **340 px** bei 360 × 640; Heute-Marker im ersten Bildschirm (360 × 640), erste Primär-Taste im ersten Bildschirm bei 360 × 740 und 390 × 844. Dafür ohne Felder-Reihe und Ticket-Nummer (s. D-36). | W16 v2.2 |
| R4-U-19 Bento | entfällt (nicht gewählt) | – |
| **R4-U-20** Stationen ohne Zeitbezug, Regeln, Länge | **Gelöst:** Stationen nur für Schritte mit Ende oder Datum; Kosten/Unterlagen/Infos = Kacheln „Immer griffbereit“, ihre Aufgaben stehen unter „Heute“. Feste Regeln für Zustände (erledigt / du bist dran / wartet auf andere / als Nächstes / später), genau eine Station „Als Nächstes“, Erledigtes eingeklappt, „Später“ max. 2 schmale Zeilen → typisch 1,9, max. 2,5 Bildschirme. | W16 v2.1, v2.3–v2.6 |
| R4-U-21 Wallet | entfällt (nicht gewählt) | – |
| R4-U-22 Dock | entfällt (nicht gewählt); bestätigt: kein Dock, keine Tabs in Phase 3 (UX-1) | – |

### 12.2 Neue Punkte an den Designer (D-36 – D-45)

Struktur, Zustände und Texte stehen in W16 v2. Bitte Optik festlegen (Tokens/Komponenten), möglichst im Varianten-Mockup als „C v2“ nachziehen, damit der Auftraggeber die ausgefeilte Fassung sieht.

| ID | Thema | Bitte |
|---|---|---|
| **D-36** | **Ticket-Kopf kompakt** | Ticket aus A mit Ring aus C: Zeile 1 (sticky) · Ring `clamp(120px, 21svh, 168px)` mit Zahl + «Tage» · Zeitraum 18/800 · Abriss-Kante · Abschnitt mit Crew-Button (3 Avatare + «+3» + «6 dabei · 7 Nächte») und **einer** Taste rechts (je Teilphase: Kalender / + Ausgabe + Tickets / Ausgleichen). Budget ≤ 340 px bei 360 × 640. Varianten Unterwegs (Tages-Ring «Tag 3») und Danach (voller Ring «Schön war's!»). |
| **D-37** | **Weg: Linie und Marker** | Linie durchgezogen Minze bis zum Heute-Marker, danach gestrichelt (`border`). Marker 32 px: erledigt (Minze + Häkchen), Heute (Sonne mit Indigo-Hof, größer 40 px), wartet (Halbkreis ◔), als Nächstes (leerer Kreis, kräftiger Rand), später (leerer Kreis, gedämpft), Ziel (Indigo + Sonne). Kontraste der Ränder ≥ 3:1 hell/dunkel (1.4.11). |
| **D-38** | **Stationskarte – 4 Varianten** | (a) **ausgeklappt** „du bist dran“: Koralle-Kante links, Label-Chip, Titelzeile mit Chevron, 2 Zeilen Text, Primär-Taste volle Breite; (b) **kompakt** (≥ 64 px, ganze Karte Link, optional Balken 6 px); (c) **wartet** = kompakt ohne Kante + Erinnern-Taste `btn-sm` **unter** der Karte (nicht in der Karte, keine verschachtelten Ziele); (d) **später** = schmale Zeile 48 px ohne Fläche (Icon 24 · Titel · Zeithinweis). Plus Ziel-Karte Indigo (wie Mockup C). |
| **D-39** | **Zustands-Labels** | Text-Labels «HEUTE · So., 2. Mai», «Du bist dran», «Läuft · wartet auf andere», «Als Nächstes», «Später», «Ziel» – Stil (Versalien 12/800 wie Mockup?), Heute-Label als Sonnen-Pille. EN: «TODAY», «Your turn», «In progress · waiting on others», «Up next», «Later», «Destination» – Längen prüfen. |
| **D-40** | **Erledigt-Zeile (eingeklappt)** | Eine Zeile 48 px: gestapelte Mini-Häkchen (max. 3) + «2 erledigt: Termin steht, …» + Chevron ▾ (dreht bei offen). Variante «Neu erledigt: Unterkunft gebucht» (einmalig hervorgehoben, z. B. Minze-Tint). |
| **D-41** | **Kacheln „Immer griffbereit“** | Kompakt ≥ 88 px, Icon 32, Titel 15/800, eine Statuszeile, optional Chip («1 neu»), **keine** Koralle-Kante. 2 Spalten mobil, 3 ab 600 px, einspaltig < 9,5 em. |
| **D-42** | **Sticky Zeile 1 mit Mini-Ring** | Wenn der große Ring aus dem Bild ist, wird der Punkt der Phasenzeile zu einem Mini-Ring 20 px (gleiche Füllung). Bitte Optik + dunkel. |
| **D-43** | **Schmal / 200 %** | Container < 22 em: Linie und Marker-Spalte entfallen, Zustands-Label als Chip über der Karte; Ring 120 px; Crew und Taste untereinander. Bitte prüfen, ob die Karten ohne Linie noch als „Weg“ lesbar sind (z. B. Label-Chips mit Marker-Symbol). |
| **D-44** | **Ring als Konfetti-Taste** | Gedrückt-Zustand (`scale-press`?), Fokus isoliert auf Indigo (D-22), kein sichtbarer Hinweis nötig – optional Tooltip «Tippen für Konfetti» nur beim ersten Besuch? (UX: lieber ohne Hinweis, Entdeckung ist Teil des Spaßes.) |
| **D-45** | **Desktop ≥ 960 px** | Ticket als breites Band (Ring links, Rest rechts, ≤ 240 px), darunter Weg (≈ 600) + Seitenspalte (Kacheln einspaltig, Mehr zur Reise). |

### 12.3 Punkte an den Motion Designer (UM-1 – UM-7, über den CEO)

| ID | Moment | Vorschlag UX | Reduzierte Bewegung |
|---|---|---|---|
| **UM-1** | **Konfetti auf Antippen** des Rings (nach der großen Feier) | Kleine Variante von E4: nur Konfetti + Funkel, ≤ 1,2 s, keine Ehrenrunde, kein Puff, keine Vibration, Sperre 3 s | kurzes Aufglühen 140 ms, kein Konfetti |
| **UM-2** | **Weg baut sich auf** (erster Aufbau je Sitzung) | Linie „zeichnet“ sich von oben bis zum Heute-Marker (`moderate`), Stationen mit Staffel 60 ms (max. 400 ms) | sofort statisch |
| **UM-3** | **Heute-Marker** | Puls 3× wie im Mockup C, nur beim ersten Aufbau je Sitzung, danach ruhig | kein Puls |
| **UM-4** | **Station neu erledigt** (seit letztem Besuch) | Siegel-Plopp (Siegel 20 px) am Häkchen der Erledigt-Zeile, einmalig; **kein** Umsortieren/FLIP auf der Seite (Zustände wechseln beim Laden, M-U3-Prinzip) | nur Überblenden |
| **UM-5** | **Aufklappen** Erledigt / „+ n weitere“ | Höhe über `grid-template-rows` 0fr→1fr (`base`) + Fade der Einträge | sofort |
| **UM-6** | **Mini-Ring in Zeile 1** | Fade 140 ms beim Ein-/Ausblenden (IntersectionObserver, nicht scroll-gekoppelt) | Fade 140 ms bleibt (M-D2) |
| **UM-7** | **Abreisetag** (nur falls UX-8 = ja) | Einmal je Person am ersten Tag *Unterwegs*: UM-1-Konfetti automatisch beim Öffnen + Heute-Satz «Heute geht's los – gute Reise!» | nur Text |

Seitenwechsel Weg ↔ Bereich wie bisher (horizontal `distance-lg` + Fade). Keine neue große Feier.

### 12.4 Abstimmungsstand Runde 4

| Punkt | Status | Offen bei |
|---|---|---|
| R4-U-17, R4-U-18, R4-U-20 | entschieden (UX), Designer-Vorschlag zu U-17 übernommen | – |
| R4-U-19, R4-U-21, R4-U-22 | entfallen (Variante nicht gewählt) | – |
| D-36 – D-45 | neu | Designer |
| UM-1 – UM-7 | neu (UM-7 abhängig von UX-8) | Motion Designer |
| UX-8 (Feier am Abreisetag), UX-9 (Station „ohne App erledigt“) | Frage | Auftraggeber über CEO |

## 13. Runde 4b – Antworten auf `docs/design/abstimmung-ux.md` §10 (C v2 „Reiseverlauf“, 2026-10-22)

Geprüft gegen das Mockup [`cockpit-reiseverlauf/index.html`](../design/mockups/cockpit-reiseverlauf/index.html). **D-36 – D-45 sind aus UX-Sicht abgenommen** (Optik im Mockup = Vorgabe für die Entwicklung), ebenso der Token-Vorschlag (§10.1) – Übernahme in `tokens.css`/design-system jetzt möglich, da Q26/Q27 freigegeben sind. Ausführlich mit Begründungen: [W16 v2.12](wireframes/w16-cockpit.md) und [v2.13 Inkrement-8-Schnitt](wireframes/w16-cockpit.md).

| Nr. | Antwort UX | Änderung am Mockup nötig? |
|---|---|---|
| **U-23** Heute-Satz H-6 | **Übernommen** mit ICU-Plural; zusätzlich **H-7** «Heute geht's los – gute Reise!» / «Today's the day – have a great trip!» (ganzer erster Reisetag) und **H-5b** «Schön war's – bis zur nächsten Reise!» (Danach ohne Ausgaben). Vorrang H-7 → H-6 → H-1 → H-2 → Rest. | nein (EN H-7 optional nachziehen) |
| **U-24** Termin als erste Heute-Karte | **Bestätigt.** Primär-Taste = erste Heute-Karte; unterwegs = erster **anstehender** Termin (vergangene Termine des Tages kompakt mit «vorbei» ans Ende). Lavendel-Kante + Chip «Termin heute» passt; **EN-Chip «Today's plan»** statt «Today» (doppelt neben TODAY). | EN-Chip ändern |
| **U-25** Zwei Primär-Tasten | **Entschieden: `[+ Ausgabe]` als Kontur-Taste (`on-ck`)** wie alle Kopf-Tasten, Plus-Icon, erste in der Gruppe. Die Termin-Karte behält die einzige Primär-Taste. Grund: ux-spec §1.1, zwei gefüllte Flächen im selben ersten Bildschirm, einheitlicher Kopf; Minze bleibt Ring/Linie/erledigt. | **ja**: `.btn.mint` → `.btn.on-ck` |
| **U-26** Weg-Überschrift | **Ohne Reiseziel** (es gibt kein Zielfeld, nur den freien Reisenamen – «nach {Name}» bricht die Grammatik): «Euer Weg bis zur Abreise» / «Eure Reise, Tag für Tag» / «Nach der Reise» · EN «The road to departure» / «Your trip, day by day» / «After the trip». Meta «{done} von {total} geschafft», bei total = 0 entfällt sie. | **ja**: Überschriften |
| **U-27** Unterlagen doppelt (Danach) | **Nicht beides.** D2 erscheint erst **7 Tage vor der Löschung** (als Nächstes, «jetzt herunterladen»); bis dahin nur die Kachel mit «gelöscht am 19. Juli» im Status. Regel „ein Einstieg je Bereich“ bleibt ohne Ausnahme. | ja (Danach: D2 nur im 7-Tage-Fenster, sonst Kachel) – niedrig, betrifft Inkr. 12 |
| **U-28** Schiene (D-43) | **Bestätigt**, in W16 v2.9 eingearbeitet. | nein |
| **U-29** Siegel = Marker | **Bestätigt** (s. UM-4). | nein |
| **U-30** Abrechnung abschließen | **Bestätigt** als Mockup-Vereinfachung; gebaut wird nach W16 v2.4 (D1). `[Abschließen]` ist immer sekundär, auch als erste Heute-Karte. „Sara bucht“ = Demo-Daten. | nein |
| **UM-4** Marker wird Siegel | **Einverstanden** (ein Objekt statt zwei Minze-Kreise, keine Layout-Verschiebung). Bedingungen: einmal je neu erledigter Station, bei mehreren nur ein Pop, keine Live-Ansage, reduziert = Überblenden 140 ms, kein FLIP. Gegenprüfung Motion Designer noch offen (nicht blockierend). | nein |

**Hinweis an Design (Inkrement 8):** Ohne die Bereiche aus Inkr. 9–12 hat der Kopf unterwegs und danach **keine** Tastengruppe (nur der Crew-Button) – bitte prüfen, dass der Abschnitt unter der Abriss-Kante dann nicht leer wirkt (Crew-Button links, rechts nichts; kein Platzhalter). Nur **eine** Kachel („Infos“) unter „Immer griffbereit“: halbe Breite mobil, nicht strecken. Details W16 v2.13.

### 13.1 Abstimmungsstand Runde 4b

| Punkt | Status | Offen bei |
|---|---|---|
| D-36 – D-45, Token-Vorschlag | abgenommen (UX) | Designer: Tokens übernehmen |
| U-23, U-24, U-28, U-29, U-30 | geklärt | – |
| U-25, U-26, U-27 | entschieden (UX); kleine Mockup-Anpassungen | Designer (nicht blockierend für Inkr. 8 – W16 gilt) |
| UM-1 – UM-7 | aus UX-Sicht abgenommen (UM-4 mit Bedingungen) | Motion Designer: Gegenprüfung |
| UX-1, UX-2, UX-8, UX-9 | entschieden (Auftraggeber 2026-10-22): ja | – |

## 14. Runde 5 – Inkrement 9 „Unterkünfte“ (W17/W18, 2026-10-23)

Struktur, Zustände und Texte: [W18 E](wireframes/w18-unterkunft-swipen.md), [W17 F](wireframes/w17-unterkunft-vorschlagen.md), Cockpit [W16 v2.14](wireframes/w16-cockpit.md), Infos [W22 D](wireframes/w22-infoseite.md). Prototyp-Stand: [`mockups/reise-managen/index.html`](mockups/reise-managen/index.html) `#/stay`, `#/stay/swipe`, `#/stay/new` (Ort-Zeile dort ist überholt, entfällt). Alle Punkte sind mit vorhandenen Tokens baubar; die Bitten betreffen Feinschliff und fehlende Assets. **Blockierend für den Bau sind nur D-52 (Icons) und D-53 (Demo-Bilder + Platzhalter), weil R.7 sie als Voraussetzung nennt.**

### 14.1 Punkte an den Designer (D-46 – D-55)
| ID | Thema | Bitte |
|---|---|---|
| **D-46** | **Swipe-Karte** | Anatomie: Bild 16:10 (max. 34 svh), Domain-Chip auf dem Bild mit Verlauf darunter (lesbar hell/dunkel), h2 Titel, Preiszeile, Notiz-Zitat mit Name, Text-Link «Auf … ansehen ↗». Zweite Karte dahinter (95 %, 8 px versetzt). Radius/Schatten passend zu §9.6. |
| **D-47** | **Stempel** «♥ Gefällt mir» / «✕ Eher nicht» | Icon + Text, schräg wie Stempel? Farbe: ♥ – Vorschlag Minze-Ton **nur als Stempel/Taste**, ✕ neutral (`text-muted`/`border-strong`), **nie Rot/Koralle** (Ablehnung ist kein Fehler). Bitte mit U-25 abgleichen (Minze sonst Ring/Linie/erledigt) – falls Minze hier nicht passt, Lavendel vorschlagen. |
| **D-48** | **Platzhalterkarte / -bild** (keine Vorschau) | Gestreiftes Feld + Bett-Icon + Domain, freundlich, kein Fehlerton; Varianten 64 px (Zeile), Karte 16:10, „Eure Unterkunft“ 16:9; hell/dunkel. |
| **D-49** | **Bewertungstasten** | Swipe: 64 · 48 · 64 px rund mit Label darunter; Liste: Paar `[✕][♥]` je 44 px, gedrückt (`aria-pressed`) klar unterscheidbar ohne Farbe allein (gefülltes Icon vs. Kontur), Zustand „offen“ mit Wort. |
| **D-50** | **Ranglisten-Zeile** | Rang-Kreis 32 px, Chip «Gleichauf», Sonnen-Chip «Platz 1» (wie W10), «♥ 5 · ✕ 0», Namenszeile, `[Das wird's]` `btn-sm` sekundär; bei 200 % Paar unter dem Titel. |
| **D-51** | **„Eure Unterkunft“** | große Karte mit Bild 16:9, Chips «◷ noch nicht gebucht» (Amber) / «✓ gebucht» (Minze) + Zeile «am … von …», Primär `[Als gebucht markieren]`, Text-Tasten. |
| **D-52** | **Icons** (fehlen im Sprite) | `bed` (Unterkunft, Kachel/Station/Platzhalter), `heart` (♥, gefüllt + Kontur), `external` (↗ für Portal-Links); prüfen, ob `cross` für ✕ reicht. **Blockierend.** |
| **D-53** | **Demo-Bilder + Leerzustand** | 6–8 eigene Demo-Bilder für Unterkünfte (R.7 Demo-Seed, keine fremden Fotos) und Illustration Leerzustand «Noch keine Unterkünfte». **Blockierend (Demo).** |
| **D-54** | **Hinweise im Bereich** | Sperrhinweis (Schloss, ohne Platzhalter-Balken), Hinweis «Basiert auf …» (Info, wie U-20), Hinweis «Termin hat sich geändert» (Amber, mit `×` nur für Orga), Hinweis „ohne App erledigt“ (Info). |
| **D-55** | **Desktop ≥ 960 px** | `/stays` zweispaltig (links Aufforderung/„Eure Unterkunft“ + Liste, rechts Rangliste); `/stays/swipe` Stapel 420 px zentriert **ohne** Rangliste daneben (Abweichung vom alten W18-Entwurf, bewusst: unbeeinflusst). Kachel „Unterkunft“ im Cockpit: Ton Lavendel (wie R4-Bereichsfarben). |

### 14.2 Punkte an den Motion Designer (UM-8 – UM-13, über den CEO)
| ID | Moment | Vorschlag UX | Reduziert |
|---|---|---|---|
| **UM-8** | Ziehen + Stempel | Karte folgt dem Finger, Rotation dx/18° (max. 12°), Stempel-Deckkraft ∝ Distanz; Start ab 8 px, nicht in 16 px Randzone | folgt dem Finger ohne Rotation |
| **UM-9** | Auslösen / Ausfliegen + nächste Karte | Flug mit Restgeschwindigkeit (`base`, `ease-exit`); nächste Karte 95 → 100 % (`base`, `spring-soft`); nächste Karte sofort bedienbar | Überblenden 140 ms |
| **UM-10** | Zurückfedern + Rückgängig | Zurückfedern `slow`/`spring-soft`; Rückgängig: Karte kommt aus ihrer Ausflugrichtung zurück | sofort / Überblenden |
| **UM-11** | Stapel-Ende «Geschafft!» | Siegel-Plopp (`spring-bouncy`, erlaubt – Siegel), danach Rangliste beim ersten Aufruf gestaffelt (`stagger-card`, ≤ 400 ms) | statisch |
| **UM-12** | Festlegen / gebucht | Siegel-Plopp an „Eure Unterkunft“ bzw. am Chip + Snackbar; **kein Konfetti** (Termin bleibt der große Moment) | statisch |
| **UM-13** | Haptik | **keine** zusätzliche Vibration (Q17: nur zwei Stellen) – bitte bestätigen oder begründet als Q17-Erweiterung vorschlagen | – |

### 14.3 Frage an den Auftraggeber (über den CEO, nicht blockierend)
| Nr. | Frage | Empfehlung UX |
|---|---|---|
| **UX-10** | Bewertung beim Swipen nur **zweistufig** (♥ Gefällt mir / ✕ Eher nicht) – oder zusätzlich „Vielleicht“? | **Zweistufig** (so in F-031 freigegeben): zwei Richtungen sind eindeutig und gelernt, eine dritte (hoch wischen) ist schwer zu entdecken; „Vielleicht“ würde zur Ausweichstufe und die Rangliste verwässern; „Eher nicht“ ist schon weich. Gebaut wird zweistufig, solange nichts anderes entschieden ist. |

### 14.4 Abstimmungsstand Runde 5
| Punkt | Status | Offen bei |
|---|---|---|
| D-46 – D-51, D-54, D-55 | neu (Feinschliff, Bau mit vorhandenen Tokens möglich) | Designer |
| D-52, D-53 | neu, **blockierend** (Icons, Demo-Bilder) | Designer |
| UM-8 – UM-13 | neu | Motion Designer |
| UX-10 | Bestätigung | Auftraggeber über CEO (nicht blockierend) |

## 15. Runde 6 – Inkrement 10 „Kosten teilen“ (W19 D, W16 v2.15, 2026-10-23)

Struktur, Zustände und Texte: [W19 D](wireframes/w19-kosten.md) (gilt vor W19 A–C), Cockpit [W16 v2.15](wireframes/w16-cockpit.md), Daten/Rechte `docs/product/features.md` R.8. Prototyp-Stand `mockups/reise-managen/index.html` `#/costs*` ist **überholt** in: Kategorie-Vorauswahl, Teilzahlung (gibt es nicht), Zahlungsinfo als ein Freitext (jetzt IBAN + anderer Weg), Segment-Label. **Blockierend für den Bau: D-58 (Icons), D-60 (Leer-Illustration), D-63 (Siegel klein)** – R.8 nennt sie als Voraussetzung.

### 15.1 Punkte an den Designer (D-56 – D-63)
| ID | Thema | Bitte |
|---|---|---|
| **D-56** | **Bereichsfarbe Kosten** | Kachel, Kategorie-Icon-Kacheln, Kopf-Icon. Prototyp/Mockup nutzen Sonne (`t-sun`) – bitte bestätigen oder Alternative; Bedingung: **nicht** Koralle (= „du bist dran“), **nicht** Minze-Fläche (U-25), Schulden nie in Warn-/Fehlerfarbe. |
| **D-57** | **„Dein Stand“ + Salden-Liste** | Karte mit Saldo-Satz 26/800 tabular (bekommt = `accent-text`, schuldet = `text`, ausgeglichen = `accent-text` + ✓), 2 Erklärzeilen 14 px. Salden-Zeilen: Avatar · Name · Chip · Saldo rechts. **Optional** Balken je Person (Tricount-Stil, `aria-hidden`): bekommt nach rechts in Minze-Tönung, schuldet nach links neutral (`border-strong`) – Vorschlag oder bewusst weglassen. |
| **D-58** | **Icons** (fehlen im Sprite) | `wallet` (Bereich Kosten, Kachel, A1/D1, Kopf `[Ausgleichen]`), `food` (Essen), `tag` (Sonstiges), `receipt` (Ausgabe ohne Kategorie). Vorhanden und verwendet: `bed` (Unterkunft), `plane` (Anreise), `sparkle` (Aktivitäten), `arrow-right` (Ausgleich «→»), `copy`, `eye`/`eye-off` (IBAN anzeigen/verbergen), `lock` (abgeschlossen), `comment` (Notiz). **Blockierend.** |
| **D-59** | **Avatar „ehemaliges Mitglied“** | neutral (`surface-sunken`, Icon `user` oder «?»), ohne Initialen; bei Nummer nur im Text. Platzhalter-Avatar unverändert. |
| **D-60** | **Leerzustand** `empty-costs.svg` | Stil B wie `empty-stays`, Motiv z. B. Kassenzettel + Münzen, ohne Text, `data-anim`. **Blockierend.** |
| **D-61** | **Formular „Ausgabe“** | Betragsfeld groß (56 px, 28/800, Währungszeichen DE Suffix / EN Präfix, dekorativ); Kategorie-Umschalt-Chips (gedrückt ohne Farbe allein erkennbar: Rahmen 2 px + Häkchen), Für-wen-Chips mit Avatar 24 + Haken; Segment „Gleich / Nach Beträgen“ (wie W09-Segment); Live-Zeile: Amber-Text + Info-Icon (zu wenig/zu viel, **nicht Rot**), Minze-Text + ✓ (passt); Betragsfelder je Person rechtsbündig 44 px. 360 px + 200 % prüfen. |
| **D-62** | **Ausgleichszeile + Zahlungsinfo** | Zeile «Du → Kemal · 86,00 €» (Pfeil-Icon, Betrag 17/800 tabular), maskierte IBAN in Monospace/tabular Vierergruppen mit `•`, Text-Tasten Anzeigen/Kopieren (44 px, bei 360 px unter der IBAN), Freitext-Zeile, Tasten «Als bezahlt/erhalten markieren» (Primär nur die erste eigene Schuld), Zustand «✓ Bezahlt»-Chip (Minze) + «Zurücknehmen»; „Bereits bezahlt“ eingeklappt; Hinweise „abgeschlossen“ (Info + Schloss), „an dich bezahlt“ (Info), Konflikt (Amber). Dark Mode ≥ 4,5 : 1. |
| **D-63** | **Siegel klein „Alles ausgeglichen“** | Variante des vorhandenen Siegels (20 px in „Dein Stand“ neben «Du bist ausgeglichen ✓», 40 px auf der Karte «Alles ausgeglichen ✓»). **Blockierend** (R.8). |

### 15.2 Punkte an den Motion Designer (UM-14 – UM-19, über den CEO)
| ID | Moment | Vorschlag UX | Reduziert |
|---|---|---|---|
| **UM-14** | Saldo/Summen ändern sich | **kein Hochzählen** (G-16) – ganzer Satz `fade` 140 ms | sofort |
| **UM-15** | Als bezahlt markiert → „Bereits bezahlt“ | Häkchen-Pop am Chip «✓ Bezahlt» (`fast`, `spring-soft`); die Zeile bleibt an Ort und Stelle (Rückgängig bleibt greifbar), Umzug nach „Bereits bezahlt“ beim nächsten Laden. R.8 wünscht ein sichtbares „Wandern“ – **bitte prüfen**, ob das ohne Verstoß gegen motion-system §5.10 geht (Vorschlag: erst nach Ablauf der Snackbar, Zeile klappt `base` zu, Zähler «Bereits bezahlt (n)» blendet um; Fokus bleibt stabil). | sofort |
| **UM-16** | **Ausgleich-Moment:** eigener Saldo wird 0 durch meine Aktion | Siegel 20 ploppt in „Dein Stand“ (`celebrate`, `spring-bouncy`), einmal | Überblenden |
| **UM-17** | Alle ausgeglichen (letzte Zahlung durch meine Aktion) | Karte «Alles ausgeglichen ✓» mit Siegel 40 ploppt; **kein Konfetti** | Überblenden |
| **UM-18** | Liste: neue Ausgabe / gelöscht / Rückgängig | neu: kurze Tönung (`slow`), kein Einfliegen; löschen: Zeile klappt zu (`fast`), Rückgängig klappt auf | sofort |
| **UM-19** | Haptik | **keine** (Q17) – bitte bestätigen | – |
Alle Momente nur bei eigener Aktion im Client, nie beim Laden von Server-HTML.

### 15.3 Fragen
Keine an den Auftraggeber. An den CEO (Umfang, Empfehlung UX): **Notiz** zur Ausgabe aufnehmen (R.8 hat kein Feld – W19 D.15 Nr. 2, Empfehlung ja) · Could «Als Ausgabe eintragen» bei der gebuchten Unterkunft (W19 D.17, Empfehlung ja, wenn Luft).

### 15.4 Abstimmungsstand Runde 6
| Punkt | Status | Offen bei |
|---|---|---|
| D-56, D-57, D-59, D-61, D-62 | neu (Feinschliff, mit vorhandenen Tokens baubar) | Designer |
| D-58, D-60, D-63 | neu, **blockierend** | Designer |
| UM-14 – UM-19 | neu (UM-15 mit Prüfauftrag) | Motion Designer |
| Notiz, „Als Ausgabe eintragen“ | Empfehlung | CEO |

## 16. Runde 7 – Inkrement 11 „Bucht“ + Reisedaten (W20 H, W16 v2.16, W22 E, W18 E.16, 2026-10-23)

Struktur, Zustände und Texte: [W20 H](wireframes/w20-reisedaten.md) (gilt vor W20 A–G), Cockpit [W16 v2.16](wireframes/w16-cockpit.md), Infos [W22 E](wireframes/w22-infoseite.md), Unterkunft [W18 E.16](wireframes/w18-unterkunft-swipen.md); Daten/Rechte `docs/product/features.md` R.9. Prototyp `mockups/reise-managen/index.html` `#/data*` ist **überholt** in: Geburtsdatum (jetzt drei Felder), Einwilligungstext (Regel + „derzeit am …“), Demo-Hinweis (nicht wegklickbar, `DEMO`-Präfix), „Wer bucht?“ (jetzt Unterschritt von „Wer ist dabei?“), Maskierung Dokumentnummer. **Blockierend für den Bau (R.9 „Voraussetzung“): D-64 (Icons + Chip), D-67 (Leer-Illustration); Motion UM-20, UM-21.**

### 16.1 Punkte an den Designer (D-64 – D-71)
| ID | Thema | Bitte |
|---|---|---|
| **D-64** | **Icons + Chip «Bucht»** | Neu im Sprite: `id-card` (Bereich Reisedaten, V4/D3, Kachel, Chip, Reisemenü «Wer bucht? …») und `shield` (Datenschutz-Hinweise, Einwilligung, Taste «An Lena freigeben»). Chip «Bucht» / «Booking» mit `id-card` 16 + Text, unterscheidbar vom Orga-Chip (Krone) ohne Farbe allein. **Blockierend.** |
| **D-65** | **Hinweis-Stile** | (a) `note demo` – Amber + `warning`, **nicht schließbar**, auch Dark Mode ≥ 4,5 : 1; (b) Warnhinweis Dokumentnummer (Amber, direkt unter dem Schalter); (c) Verantwortungs-Hinweis „Bucht“ und „Wer sieht was?“ (Info + `shield`). Masken «K•••», «••.••.••••», «C••••7»: Figtree tabular wie D-62, Punkte in `text-muted` mit ≥ 4,5 : 1. |
| **D-66** | **Formular „Angaben“ / „Freigeben“** | Schritt-Balken (2 Segmente, wie vorhandene Zwei-Schritt-Abläufe); Datum als **drei Felder** Tag 4 em · Monat 4 em · Jahr 6 em mit sichtbaren Labels, bei < 22 em zweizeilig; Einwilligung als **Karte mit Checkbox** (ganze Karte klickbar, angehakt: 2 px `selected`-Rand + Tönung, nicht nur Farbe); Zusammenfassung „Das gibst du frei“ als `<dl>`. |
| **D-67** | **Leer-Illustration** `empty-travel-data.svg` | Stil B wie `empty-costs`, Motiv z. B. Ausweiskarte mit Schild/Schloss, Minze-Wellen; ohne Text, ohne Gesicht/Foto auf der Karte; Ebenen `data-anim`. Für „Reisedaten gelöscht“ und „Gerade nichts zu tun“. **Blockierend** (R.9). |
| **D-68** | **Bereichsfarbe Reisedaten** | design-system §9.23 (Entwurf, parallel) nennt Lavendel-200 / Indigo (`travel-area-*`) – **UX einverstanden**, Bedingung: Unterkunft nutzt ebenfalls Lavendel, also müssen Kacheln/Stationen sich über Icon (`bed` vs. `id-card`) und Titel unterscheiden (tun sie). Nicht Koralle (Aufgabe), nicht Amber (Warnung). |
| **D-69** | **Personen-Karte (Sicht „Bucht“)** | Kopf Avatar · Name (h4) · Status-Chip (freigegeben = Minze + ✓, offen = Uhr, klärt es direkt = neutral, noch nicht dabei = wie Platzhalter); `<dl>`-Zeilen Label/Wert + Kopieren-Icon-Taste 44 px rechts; «Anzeigen»/«Verbergen» (`eye`/`eye-off`) sekundär klein + 13 px «geändert am …»; ab 960 px zwei Spalten. Zählkarte für fremde Anfragen (nur Zahl + Chips). |
| **D-70** | **Zugriffsprotokoll + Karte „Freigegeben an …“** | Siegel 40 (vorhandenes `seal.svg`, wie D-63) neben h3; Protokoll als ruhige Liste (Icon `eye` bzw. `copy` 16, Text, Zeit rechts oder darunter), keine Tabellenoptik; destruktiv-leise Text-Taste «Freigabe zurückziehen …». |
| **D-71** | **Unterschritt „Wer bucht?“** | Schalter-Zeilen wie Bewegungs-Schalter (design-system Schalter), Avatar links, gesperrt mit Grund; Zähler «2 von 3 vergeben»; Info-Zeile «Noch niemand bucht …» für die Orga. Reisemenü-Punkt mit `id-card`. |

### 16.2 Punkte an den Motion Designer (UM-20 – UM-24, über den CEO)
| ID | Moment | Vorschlag UX | Reduziert |
|---|---|---|---|
| **UM-20** | Freigegeben | Karte „Freigegeben an …“ tritt ein, **Siegel 40 ploppt** (wie Festlegen der Unterkunft), **kein Konfetti** (R.9: kein Konfetti in diesem Bereich) | ohne Bewegung (Überblenden) |
| **UM-21** | Anzeigen ↔ Verbergen | je Feld **Überblenden 140 ms**, keine Buchstaben-/„Entschlüsseln“-Animation (R.9) | sofort |
| **UM-22** | Kopieren | Icon `copy` → `check` mit Pop (`fast`), 1,2 s, zurück | Wechsel ohne Pop |
| **UM-23** | Widerruf / Abschließen / Löschung / Markierung entzogen | Karte überblendet in den neuen Zustand; **kein** Schredder-/Auflösungseffekt | sofort |
| **UM-24** | Schalter „Wer bucht?“, Chip «Bucht» | Standard-Schalter; Chip blendet in der Liste ein/aus (`fast`); keine Haptik | sofort |
Alle Momente nur bei eigener Aktion im Client. **M-U14** (Fokus nach «Als gebucht markieren») ist in W18 E.16 bestätigt.

### 16.3 Fragen
Keine an den Auftraggeber. An PM/CEO (nicht blockierend): Widerruf, solange die Festlegung aufgehoben ist (W20 H.17 – Empfehlung Zeile im Konto).

### 16.4 Abstimmungsstand Runde 7
| Punkt | Status | Offen bei |
|---|---|---|
| D-64, D-67 | neu, **blockierend** | Designer |
| D-65, D-66, D-68 – D-71 | neu (mit vorhandenen Tokens baubar) | Designer |
| UM-20, UM-21 | neu, **blockierend** (R.9) | Motion Designer |
| UM-22 – UM-24 | neu | Motion Designer |
| M-U14 | von UX bestätigt (W18 E.16) | – |
| Widerruf in Phase 2 | Empfehlung | PM/CEO |

## Changelog
- 2026-10-23 (Runde 7, Inkrement 11): §16 – Punkte D-64–D-71 (Designer), UM-20–UM-24 (Motion), M-U14 bestätigt; W20 H, W16 v2.16, W22 E, W18 E.16 (an R.9 angeglichen).
- 2026-10-23 (Runde 6, Inkrement 10): §15 – Punkte D-56–D-63 (Designer), UM-14–UM-19 (Motion), CEO-Fragen Notiz/„Als Ausgabe eintragen“; W19 D, W16 v2.15 (an R.8 und CEO-Entscheidungen a/b angeglichen).
- 2026-10-23 (Runde 5, Inkrement 9): §14 – Punkte D-46–D-55 (Designer), UM-8–UM-13 (Motion), Frage UX-10; W17 F, W18 E, W16 v2.14, W22 D.
- 2026-10-22 (Runde 4b): §13 – Antworten U-23–U-30, Bewertung UM-4, Abnahme D-36–D-45; W16 v2.12/v2.13 (Inkrement-8-Schnitt), W22 baureif.
- 2026-10-22 (Runde 4): §12 – Auswahl Variante C, Antworten R4-U-17–R4-U-22, neue Punkte D-36–D-45 (Designer) und UM-1–UM-7 (Motion), Fragen UX-8/UX-9; Konzept in W16 v2.
- 2026-10-20 (Feedback-Runde 1): §11 Punkte U-17–U-21 (WhatsApp-Taste, Kennzahl-Box als Button, Personen-Zeilen, Hinweis „Basiert auf x von n“, Phase 3 ohne Tabs + Reise-Hub).
- 2026-10-08 (Runde 3, Richtung B): §8 Entscheidungen zu den offenen Punkten aus richtung-b §14 und Q17, Usability-Befunde D-20–D-35; §9 Antworten an Motion M-U1–M-U11; §10 Abstimmungsstand.
- 2026-10-08 (Runde 2): §0 aktualisiert; §3 Prüfung D-1–D-13; §4 Antworten U-1–U-14; §5 CEO-Entscheidungen; §6 neue Punkte D-14–D-18; §7 Abstimmungsstand.
- 2026-10-08 (Runde 1): Erstfassung D-1–D-13.

## CEO-Entscheidungen 2026-10-08 (nach Abstimmung EN-Name)
- **D-19:** „go?“ wird als Einheit in Markenfarbe hervorgehoben (Fragezeichen ohne eigene Farbe/Größe) – Designer-Umsetzung gilt.
- **U-15:** Kopfzeile und W01 mit EN-Namen gelten als geprüft (beide Namen 14 Zeichen, Header-Box 160 px passt bei 360 px).
- **U-16:** `short_name` im Manifest = voller Name je Sprache; Kürzung erst, falls Gerätetests Abschneiden zeigen (Fallback DE „Wollen weg“, EN ungekürzt).
