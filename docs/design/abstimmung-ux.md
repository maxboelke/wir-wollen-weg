# Abstimmung Design ↔ UI/UX

Stand: 2026-10-08 (Runde 3: Design-System v1.0 Richtung B/B0, Antworten D-20–D-35 und M-D1–M-D9 – §5–§8) · Verantwortlich: Designer · Gegenstück: [`docs/ux/abstimmung-design.md`](../ux/abstimmung-design.md) (UI/UX) · Bezug: [design-system.md](design-system.md), [tokens.css](tokens.css), [assets/README.md](assets/README.md)

Grundlage: UX-Spec, Sitemap, Wireframes W01–W14 und `abstimmung-design.md` (Stand 2026-10-08). Vielen Dank für die sehr präzisen Punkte – fast alles ist übernommen. Abweichungen sind mit **⚠ Abweichung** markiert und begründet.

---

## 1. Antworten auf `docs/ux/abstimmung-design.md` §2

| Punkt | Antwort Design | Wo festgelegt |
|---|---|---|
| **D-1 Heatmap-Zelle** | Feste Orte je Element: **Datum + Heute-Ring oben links · Feiertag (Eselsohr) Ecke oben rechts · Zählwert Mitte · ◐ zur Not unten links · ✓ Alle: Geht unten rechts** · Pegel (4 Segmente) nur ≥ 600 px · Auswahl innen · Fokus außen · Vorschlag-Band in der Fuge darunter. Prüffall „Feiertag + heute + Wochenende + ausgewählt + Fokus + ✓ + zur Not" passt in 45,7 × 52 px ohne Überlappung. **⚠ Abweichung:** ✓-Badge sitzt **unten rechts**, nicht oben rechts wie im Wireframe (★), weil oben rechts das Eselsohr liegt. | design-system §6.1 |
| D-1 Zählwert-Regel | **Bestätigt:** mobil „x/n" bis n ≤ 9, ab 10 nur „x" (n im Statusband/Legende); ≥ 600 px immer „x/n". Stufe `many` (Light, Weiß auf `#187E73`): Zahl 4,9:1; auf `many` liegt kein Muster, Badge und ◐ nutzen dieselbe Vordergrundfarbe → ebenfalls 4,9:1. | §6.1, §6.3 |
| D-1 Fokus auf `all` und neben Band | Neuer Token `--ww-focus-ring-isolated`: Hof 2 px + Ring 3 px + Hof 2 px in Hintergrundfarbe. Der Ring grenzt dadurch **nie** an eine Zelle oder das Band → 5,9:1 (L) / 8,6:1 (D) in jeder Lage. Fokussierte Zelle `z-index: 1`. | §6.5, tokens.css |
| D-1 Vorschlag über Umbrüche | Kappen nur an echtem An-/Abreisetag; am Zeilen-/Monatsende läuft das Band **ohne Kappe** bis an den Rasterrand (offene Kante) und beginnt in der nächsten Zeile ebenso offen. | §6.5 |
| D-1 nodata / außerhalb / vergangen | nodata: gestrichelter Rahmen + „–" (4,8 / 6,1). Außerhalb/vergangen: ohne Fläche, Datumszahl `--ww-hm-outside-fg` **3,2:1 (L) / 3,8:1 (D)** – erfüllt ≥ 3:1. | §6.3, §6.5 |
| D-1 Person ausgeblendet | Kein Zellzustand (einverstanden). Chip-Stil „aktiver Filter": `primary-tint` + 2-px-Rahmen `primary` + ✓-Icon + Text („✓ 1 ausgeblendet ▾"). | §9.5 |
| **D-2.1 „Geht" ohne Häkchen** | **Bestätigt.** Glatte Lagune-Fläche, Häkchen nur in Legende, Pinsel, Tagesdetail und im zugänglichen Namen. | §6.6 |
| D-2.2 Zieh-Vorschau | Zellen zeigen schon Fläche + Muster des Pinsels; um den Bereich **gestrichelter 2-px-Umriss in Textfarbe** (`--ww-cal-preview-border`), an Umbrüchen offen. Unterscheidet sich von „ausgewählt" (durchgezogener Doppelrahmen) und vom Vorschlag (Koralle-Band unten). | §6.6 |
| D-2.3 Startmarke | Doppelrahmen + **Ankerpunkt** 8 px (`--ww-cal-anchor`) mit Ring, mittig auf der linken Zellkante; dazu die Hinweiszeile aus W08. | §6.6 |
| D-2.4 Schreibgeschützt | Zustände bleiben voll farbig (keine Opazität); keine Hover/Druck-Reaktion; Erkennbarkeit über ersetzte Werkzeugleiste mit Schloss-Hinweis. | §6.6 |
| D-2.5 Entwurf vs. abgegeben | Einverstanden: kein Zellunterschied. | §6.6 |
| D-2.6 Setz-Feedback | 80 ms `scale(0.94 → 1)` + sofortiger Flächenwechsel; reduced motion: nur Flächenwechsel. | §6.6, §8 |
| **D-3 Zellbreite 360 px** | **⚠ Abweichung:** Fuge bleibt **4 px**, Seitenrand des Kalenders **8 px** (`--ww-size-cal-inset-sm`) → (360 − 16 − 24) / 7 = **45,7 px** (320 px: 41 px). Grund: Die 4-px-Fuge trägt die Wochenend-Spur und das Vorschlag-Band; bei 2 px wären beide kaum sichtbar. Ergebnis liegt zwischen deinen beiden Varianten (≥ 44 px erfüllt). Bitte ux-spec §2 („Kalender: 12 px") entsprechend anpassen. | §7, tokens.css |
| **D-4 Code-Feld** | **Bestätigt: ein `<input>`**, Kästchen rein visuell (Overlay-Variante beschrieben, Alternative mit `letter-spacing`). Alle geforderten Zustände gestaltet: leer, Fokus, gefüllt, Fehler, gesperrt (5 Fehlversuche), Prüfen, Erfolg, „Inhalt markiert". | §9.2 |
| **D-5 Werkzeugleiste** | Pinsel-Segmente mit Mini-Feld (Fläche + Muster) + Symbol + Label; aktiv = Zustandsfläche + 2-px-Rahmen + Punkt-Marke + Fettung. Bereichsmodus-Toggle, Rückgängig (deaktiviert), Schnellaktionen, Speicherstatus (3 Zustände + „Abgegeben · 14:32"), Primärbutton, kompakte Variante. Höhe ≤ 150 px (`--ww-size-toolbar-max`). | §9.13 |
| **D-6 Abstimmen-Schalter** | Zustände leer, gewählt (je Wert), **unbestätigter Vorschlag** (gestrichelter Rahmen, Umriss-Icon, Label „Vorschlag aus deinen Tagen"), gesperrt, Fokus. Ergebnisbalken mit Zahlen, Rang-Abzeichen „Platz 1", „ohne Jonas" als Stein-Chip, Warnhinweise in Amber. Unter 400 px Icon über Label. | §9.10 |
| **D-7 Phasen & To-do** | Phasen-Chips mit Text + Icon: Tage sammeln (Lagune hell) · Abstimmung läuft (Amber) · Steht fest (Lagune kräftig) · Vergangen (Sand). To-do-Zeile in **Koralle** (`--ww-todo-*`, 4-px-Kante links). Phasen-Leiste mit ✓ / Unterstrich / gedämpft. | §9.3, tokens.css |
| **D-8 Icons** | Alle 28 fehlenden Icons im Sprite ergänzt (`assets/icons/icons.svg`, IDs `ww-icon-…`, Liste in assets/README.md). Krone immer mit Label „Orga"/„Organizer" – übernommen. | §11 |
| **D-9 Illustrationen** | Alle 8 geliefert: `invite` (Einladung W03), `code-sent`, `no-matches`, `vote-waiting`, `error` (gemeinsam für W14), `goodbye`, `hero` (W01), `submitted`. Alle dekorativ, mobil max. 160 px hoch. | §11 |
| **D-10 Text & Typo** | Längenbudgets übernommen; `hyphens: auto` + korrektes `lang`, `overflow-wrap: anywhere` für Nutzerinhalte verankert. Tab-Stil: 14/600, Unterstrich, 8 px Innenabstand unter 400 px → „Übersicht · Meine Tage · Gruppe · Abstimmen" passt in 328 px; Fallback horizontal scrollbar mit Verlaufskante. | §9.4, §10 |
| **D-11 Sheet & Ebenen** | Zwei Rastpunkte (½ / fast voll, Tokens), Griff + Schließen-Button. Snackbar über der Leiste: `bottom = --ww-sticky-bar-h + 8 px + Safe-Area`; `--ww-z-toast` (50) > `--ww-z-sticky` (10). Desktop unten links. | §9.6, §9.7 |
| **D-12 Dark Mode** | **Einverstanden:** MVP folgt nur dem System, kein Schalter. `[data-theme]` bleibt für später/Tests. Bestätigt (Auftraggeber 2026-10-08): Dark Mode im MVP, nur System-folgend. | §13 |
| **D-13 Vorschlagskarte** | Gruppenüberschriften „Alle dabei" / „Fast alle dabei" mit Icon (Strich-Häkchen `ww-icon-check` / Personen, U-14) und 32 px Abstand; Zeitraum, Nächte, Urlaubstage ⓘ; Zusatz-Chips „◐ 2× zur Not" (Amber), „✕ ohne Jonas" (Stein), „⚑ inkl. Pfingstmontag" (Koralle hell); Text-Button „Im Kalender zeigen"; Orga-Checkbox. | §9.3 |

### 1a. Antworten auf `docs/ux/abstimmung-design.md` §6 (Runde 2: D-14 bis D-18)

| Punkt | Antwort Design | Wo festgelegt |
|---|---|---|
| **D-14** Gruppennamen | Umgestellt auf **„Alle dabei" / „Fast alle dabei"** („Everyone's in" / „Almost everyone's in"), CEO bestätigt. „können" bleibt nur in Optionszeilen („8 können · ohne Kemal"). SVG-Assets enthalten keine Gruppennamen – keine Änderung nötig. | design-system §6.2, §9.3 |
| **D-15** Tageslisten-Zeile | Optik geliefert: Stufenbalken 6 px links (zusätzliche Kodierung, `aria-hidden`), Datum mit Wochentag (Wochenende fett + Spur-Fläche, heute mit Ring), Zählzeile „4 von 5: Geht", Abzeichen-Chips in fester Reihenfolge ✓ alle · ◐ n Zur Not · Feiertag · Vorschlag n, Hover/Gedrückt/Fokus/Ausgewählt; Maße in `em`, keine neuen Tokens. | design-system §6.8 |
| **D-16** Sprachumschalter | **Entschieden (CEO, 2026-10-08)** zugunsten UX: nicht angemeldet Ein-Tipp-Umschalter mit `ww-icon-language` + „English"/„Deutsch" (mit `lang`), angemeldet im Avatar-Menü, Footer-Segment „Deutsch \| English" bleibt. | design-system §9.8, §9.4 |
| **D-17** Code-Feld | Fehlertext aus user-flows A.2 („Dieser Code stimmt nicht. Noch 3 Versuche.", Restversuche ab 2. Fehlversuch); gesperrt: „Neuen Code senden" als Primärbutton. | design-system §9.2 |
| **D-18** Ergebnis-Platzhalter | Vor der eigenen Stimme zu einer Option statt Balken/Zahlen/Rang/Avataren die Zeile „Stimm ab, um das Ergebnis zu sehen." / „Vote to see the results." (`text-muted`); Orga sieht immer das Ergebnis. | design-system §9.10 |

### 1b. Antwort auf D-19 (EN-Wortmarke „When do we go?", Auftraggeber 2026-10-08)

| Teilpunkt aus D-19 | Antwort Design | Wo festgelegt |
|---|---|---|
| Fragezeichen fester Teil der Wortmarke | **Bestätigt.** „?" steht in derselben Zeile, demselben `<tspan>`, derselben Schrift (Figtree 750, 30 px) direkt am „o", ohne Leerzeichen, ASCII U+003F. Es fehlt in keiner Variante (auch nicht in der mit Untertitel). | `logo-wordmark-en.svg`, `logo-wordmark-en-tagline.svg`, design-system §3.1 |
| Fragezeichen nicht hervorheben | **Bestätigt, mit Präzisierung:** Das „?" bekommt **keine eigene** Hervorhebung (keine andere Farbe, Größe, Sonnen-Amber o. Ä.). Es übernimmt die Farbe des Wortes, an dem es hängt: Die Markenfarbe liegt auf **„go?"** als Einheit – analog zu „weg" in der DE-Marke (letztes Wort = Pointe). Ein „?" in Textfarbe hinter einem farbigen „go" würde als abgetrenntes Zeichen wirken und damit gerade doch auffallen. Falls UI/UX „?" ausdrücklich in Textfarbe möchte: Änderung ist eine Zeile im SVG – bitte dann über CEO. | design-system §3.1 |
| `<title>` = «When do we go?» | **Umgesetzt** (Titel exakt «When do we go?», zusätzlich englische `<desc>`). Variante mit Untertitel: Titel «When do we go? Find dates for your group trip» – entspricht dem Landing-Titel aus ux-spec §3. | beide EN-SVGs |
| DE/EN gleich hoch | **Umgesetzt:** gleiche Box 320 × 72, gleiche Schriftgröße und Grundlinie (y = 46), Bildmarke an identischer Stelle → kein Layoutsprung beim Sprachwechsel. EN-Schriftzug ist bei gleichen 14 Zeichen ca. 8 % breiter (≈ 212 statt ≈ 195 px bei 30 px), liegt aber innerhalb derselben Box. | design-system §3.4 |
| Nur das W groß | **Umgesetzt:** „When do we go?". | `logo-wordmark-en.svg` |
| Namensregel je Sprache / Verweis | **Umgesetzt:** design-system §3.2 nennt die Design-Regeln (UI-Sprache bestimmt Namen, Icons sprachneutral, OG je Sprache) und verweist für Schreibweise/Satzbau verbindlich auf ux-spec §10.6 und §9. | design-system §3.2 |
| EN-Untertitel als Landing-Zusatz | **Einverstanden:** eigene Variante `logo-wordmark-en-tagline.svg` (≥ 300 px) für W01, OG-Bild EN, Mail-Kopf; nie in der Kopfzeile. | design-system §3.4 |

Außerdem übernommen: Glossar ux-spec §10.2 (Legende `availability-legend.svg` jetzt „Geht / Zur Not / Geht nicht" · „Works / If needed / Can't"), keine Emojis in UI-Texten, keine Bottom-Navigation, Reise-Tabs als Links, Segment „Vorschläge | Kalender" (mit 1,5-px-Rahmen am aktiven Segment, damit der Zustand ≥ 3:1 erkennbar ist).

## 2. Offen für UI/UX

**Stand 2026-10-08 (nach Auftraggeber-Entscheidungen): zwei Kleinpunkte offen – U-15, U-16.** U-1 bis U-14 sind von UI/UX beantwortet (`docs/ux/abstimmung-design.md` §4) bzw. vom CEO entschieden; finaler Status in §3. Die Tabelle U-1–U-14 bleibt als Verlauf stehen.

| # | Punkt | Vorschlag Design | Betrifft |
|---|---|---|---|
| **U-15** (neu) | **Kopfzeile/Landing mit EN-Namen:** Kopfzeile plant mit der etwas längeren EN-Wortmarke (gleiche Box 320 × 72, dargestellt 36 px hoch = 160 px Box, Inhalt ≈ 141 px EN / ≈ 133 px DE); Variante mit Untertitel nur auf W01/OG/Mail, nie im Header (design-system §3.4) | W01 und Header kurz gegenprüfen (ux-spec §10.6 Nr. 8 sagt bereits „passt ohne Sonderregel") | W01, ux-spec §10.6 |
| **U-16** (neu) | **`short_name` im Web-App-Manifest:** beide Namen 14 Zeichen, Homescreens kürzen teils ab ca. 12. Vorschlag: voller Name, auf iOS/Android testen; Fallback DE „Wollen weg"; EN nicht kürzen (Fragezeichen muss bleiben, ux-spec §10.6 Nr. 1) | entscheiden bzw. an PM/CEO geben | Manifest, ux-spec §10.6 |

| # | Punkt | Vorschlag Design | Betrifft |
|---|---|---|---|
| **U-1** | **Seitenrand Kalender 8 px statt 12 px** (D-3) | 8 px / Fuge 4 px → 45,7 px Zellbreite; ux-spec §2 und W08/W09-HTML-Skizzen anpassen – **entschieden (CEO, 2026-10-08)** | ux-spec §2, W08, W09 |
| **U-2** | **✓-Badge unten rechts** statt oben rechts (★ im Wireframe); ◐ unten links ohne Zahl (mobil), „◐2" ab 600 px | Wireframe-Legende und HTML-Skizze W09 angleichen – **entschieden (CEO, 2026-10-08)** | W09 |
| **U-3** | **Pegel (4 Segmente) erst ab 600 px** – mobil fehlt der Platz; Information steckt in Zahl + Badges | bestätigen | W09 |
| **U-4** | ~~Zählwert = Anzahl „Geht" … Alternative „können (Geht + Zur Not)"~~ → **entschieden durch CEO (2026-10-08):** Zahl bleibt „Anzahl ‚Geht' / abgegeben"; ✓ = alle Abgegebenen haben „Geht" (x = n); Tage ohne „Geht nicht", aber mit „Zur Not" zeigen ◐, kein ✓. „6/9 ✓ ◐" kann nicht mehr vorkommen. | Bitte W09-Legende, Tagesdetail-Kopf und zugängliche Namen (ux-spec §10.2) auf „x von n Geht" / „alle Geht" angleichen | F-008, W09, ux-spec §10.2 |
| **U-5** | **Textvergrößerung 200 %**: Die Zahl passt bei 200 % nicht mehr in 46 px Breite. Vorschlag: ab Root-Schriftgröße ≥ 24 px (bzw. Container-Query < 52 px Zellbreite) wechselt die Heatmap in eine **Tagesliste** (eine Zeile pro Tag: Datum · „6 von 9" · Badges), Meine Tage in eine Liste mit Zustands-Segmenten. Alternative: Zellen nur in der Höhe wachsen lassen und Zahl auf „x" kürzen. | Entscheidung UX (Verhalten); Optik liefere ich nach | ux-spec §7.1, W08, W09 |
| **U-6** | **Legende** der Heatmap (W09 zeigt „□ ░ ▒ ▓ █ ★ ~ °"): als Komponente mit echten Mini-Zellen (20 × 20 px mit Zahl-Beispiel, Muster, Badge, Eselsohr) in einer umbrechenden Zeile, einklappbar. Beim ersten Besuch aufgeklappt? | Zustand (offen/zu, Merken) entscheidet UX | W09 |
| **U-7** | **Snackbar-Position** braucht die Leistenhöhe als CSS-Variable `--ww-sticky-bar-h` (setzt das Layout, z. B. per ResizeObserver) | bestätigen, an Developer weitergeben | ux-spec §4.3 |
| **U-8** | **Abstimmen unter 400 px:** Icon über Label in den drei Segmenten (sonst passt „Vielleicht" nicht) – Segmente werden dadurch 56 px hoch | in W10 übernehmen | W10 |
| **U-9** | **Rang-Abzeichen-Text** „Platz 1" / „Top choice" (EN nicht „1st place", wirkt nach Wettbewerb) | Copy bestätigen | W10, ux-spec §10.2 |
| **U-10** | **Mini-Streifen** (6-px-Heatmap-Leiste des Zeitraums) auf der Vorschlagskarte – optional; hilft beim Wiedererkennen im Kalender, kostet eine Zeile | aufnehmen ja/nein | W09 |
| **U-11** | **Feiertagsliste unter dem Monat** (W08/W09): Darstellung 13 px `text-muted`, jeder Eintrag mit kleinem Eselsohr-Dreieck vorn (gleiche Form wie in der Zelle) – passt das zur Struktur? | bestätigen | W08, W09 |
| **U-12** | **Hero/Landing W01:** `hero.svg` ist 320 × 200 – mobil auf 160 px Höhe skaliert über oder neben der Headline? | Platzierung entscheidet UX | W01 |
| **U-13** | **Tagesdetail „Noch offen"**: gestrichelter Avatar-Ring (wie Teilnahmestatus F-007) statt nur Grau – bitte in W09 übernehmen | bestätigen | W09 |
| **U-14** (neu, Folge von U-4) | **Begriff „Alle können" in den Vorschlägen (F-009)** meint „niemand ‚Geht nicht'" und ist damit weiter als das ✓-Badge („alle ‚Geht'"). Design trennt optisch: Gruppenüberschrift mit Strich-Häkchen `ww-icon-check`, **nicht** mit dem gefüllten Badge; Zur-Not-Anteil als Chip „◐ 2× zur Not". Offen ist nur die **Benennung**: „Alle können" belassen (Design ok) oder z. B. „Alle dabei" / „Everyone's in"? | Copy-Entscheid UX (ggf. PM); Optik steht | W09, ux-spec §10.2, F-009 |

## 3. Abstimmungsstand (Design-Sicht)

Stand 2026-10-08, **final** (letzte Abstimmungsrunde). Legende: **erledigt** = beidseitig geklärt und in beiden Dokumentsätzen umgesetzt · **entschieden (CEO)** = verbindlich durch CEO · **entschieden (UX)** = Verhaltensentscheid UI/UX, Design hat übernommen · **bestätigt (Auftraggeber 2026-10-08)** = vom Auftraggeber entschieden (PRD §12 Q11–Q13). **Offen zwischen Design und UI/UX: nur der Kleinpunkt U-15 unten.**

| # | Thema | Status | Anmerkung |
|---|---|---|---|
| D-1 | Heatmap-Zelle (Anatomie, Zählwert, Fokus, Band, nodata) | erledigt | Badge-Position via U-2, ✓-Bedeutung via U-4 |
| D-2 | Meine Tage (Geht ohne Häkchen, Vorschau, Startmarke, schreibgeschützt, Feedback) | erledigt | |
| D-3 | Zellbreite 360 px | entschieden (CEO, 2026-10-08) | über U-1: 8 px Rand, 4 px Fuge |
| D-4 | Code-Feld als ein `<input>` | erledigt | Kleinkorrektur über D-17 |
| D-5 | Werkzeugleiste | erledigt | |
| D-6 | Abstimmen-Schalter | erledigt | < 400 px via U-8; Platzhalter via D-18 |
| D-7 | Phasen & To-do | erledigt | |
| D-8 | Icons | erledigt | 41 Icons; Titel `ww-icon-all-available` „Alle: Geht" |
| D-9 | Illustrationen | erledigt | Hero-Platzierung via U-12 |
| D-10 | Text & Typo | erledigt | Figtree: bestätigt (Auftraggeber 2026-10-08) |
| D-11 | Sheet & Ebenen | erledigt | `--ww-sticky-bar-h` via U-7 |
| D-12 | Dark Mode | entschieden (CEO), bestätigt (Auftraggeber 2026-10-08) | nur System-folgend, kein Schalter im MVP |
| D-13 | Vorschlagskarte | erledigt | Überschrift mit `ww-icon-check` (U-14), kein Mini-Streifen (U-10) |
| D-14 | Gruppennamen „Alle dabei" / „Fast alle dabei" | erledigt | CEO bestätigt beide Namen; design-system §6.2, §9.3 |
| D-15 | Optik Tageslisten-Zeile (große Schrift) | erledigt | design-system §6.8 |
| D-16 | Sprachumschalter Kopfzeile | **entschieden (CEO, 2026-10-08)** | zugunsten UX: Ein-Tipp-Umschalter „English"/„Deutsch" (nicht angemeldet), Avatar-Menü (angemeldet), Footer-Segment; design-system §9.8 |
| D-17 | Code-Feld Copy/Gewichtung | erledigt | design-system §9.2 |
| D-18 | Ergebnis-Platzhalter vor eigener Stimme | erledigt | design-system §9.10; Ergebnis-Sichtbarkeit selbst: bestätigt (Auftraggeber 2026-10-08, Q13) |
| D-19 | EN-Wortmarke „When do we go?" | erledigt (Design), Bestätigung UX zur Farbe von „?" erbeten | §1b; „?" Teil der Marke, keine eigene Hervorhebung, Markenfarbe auf „go?" als Einheit |
| U-1 | Kalender-Seitenrand 8 px, Fuge 4 px | entschieden (CEO, 2026-10-08) | in ux-spec §2, §7.2, W08, W09 umgesetzt |
| U-2 | ✓ unten rechts, ◐ unten links (≥ 600 px „◐2") | entschieden (CEO, 2026-10-08) | in ux-spec §4.9, W09 umgesetzt |
| U-3 | Pegel erst ab 600 px | erledigt | von UX bestätigt |
| U-4 | Zählwert / Bedeutung ✓ | entschieden (CEO, 2026-10-08) | Zahl = „Geht"/abgegeben; ✓ nur bei x = n; sonst ◐ |
| U-5 | Textvergrößerung 200 % → Tagesliste | entschieden (UX) | Heatmap → Tagesliste, Meine Tage bleibt Raster; Optik D-15 |
| U-6 | Legende als Komponente, Startzustand | entschieden (UX) | mobil beim ersten Besuch offen, Zustand gemerkt; ≥ 960 px immer sichtbar |
| U-7 | `--ww-sticky-bar-h` | erledigt | Umsetzung Developer (ResizeObserver) |
| U-8 | Abstimmen < 400 px: Icon über Label | erledigt | von UX übernommen |
| U-9 | „Platz 1" / „Top choice" | erledigt | im Glossar |
| U-10 | Mini-Streifen auf Vorschlagskarte | entschieden (UX): nicht im MVP | aus design-system §9.3 entfernt |
| U-11 | Feiertagsliste unter dem Monat | erledigt | von UX bestätigt |
| U-12 | Hero-Platzierung W01 | entschieden (UX) | mobil über der Headline, max. 160 px; ab 600 px rechts |
| U-13 | „Noch offen" mit gestricheltem Ring | erledigt | von UX bestätigt |
| U-14 | Benennung der Vorschlagsgruppen | entschieden (CEO, 2026-10-08) | „Alle dabei" / „Everyone's in"; Folgeentscheid UX „Fast alle dabei" / „Almost everyone's in" (D-14) |

**Bestätigt (Auftraggeber 2026-10-08):** *(Hinweis v1.0: Farben, Schrift und Logo-Einfärbung sind durch Q18 – Richtung B/B0 – abgelöst; Plus Jakarta Sans + Figtree statt Figtree + Systemschrift. Struktur- und Namensregeln gelten weiter. Siehe §5–§7.)*
- **Marke:** zwei Namen, eine Bildmarke – DE „Wir wollen weg", EN **„When do we go?"** (abweichend von der Design-Empfehlung). EN-Wortmarke mit „go?" in Markenfarbe; „Find dates for your group trip" nur noch optionaler Untertitel (design-system §3.1–§3.4, `logo-wordmark-en.svg`, `logo-wordmark-en-tagline.svg`). Schreibregeln: ux-spec §10.6 – design-system verweist darauf.
- **Logo:** Variante A „Sonnenkalender" (§3.3); Favicon/App-Icon/Wortmarken basieren darauf, Icons sprachneutral.
- **Dark Mode:** im MVP nur System-folgend (`prefers-color-scheme`), kein Schalter (§13, D-12).
- **Schrift:** Figtree (selbst gehostet) für Überschriften und Wortmarke, Systemschrift für alles andere (§5).
- **Ergebnis-Sichtbarkeit** erst nach eigener Stimme, Rolle „Orga"/„Organizer" (PRD Q13): unverändert wie in §9.10 gestaltet.
- Offene Kleinpunkte U-15, U-16: siehe §2.

## 4. Bereits erledigt / keine Aktion nötig
- WCAG 2.2 AA als Ziel (ux-spec §7): Design ist darauf ausgelegt (2.4.11 Fokus nicht verdeckt über `scroll-padding`, 2.5.8 Zielgrößen, Fokus-Hof).
- Teilen-Texte ohne Emojis: einverstanden.
- „Rot heißt Fehler, nicht Nein" inkl. Amber für Warnhinweise wie „Jonas kann nicht": verankert in design-system §2, §9.10.

## 5. Richtung B (v1.0): Struktur-Abweichungen gegenüber den Wireframes – Notiz an UI/UX

B ändert die Optik; wo dabei Struktur berührt wird, hier die Liste (Stand nach deiner Runde 3, `docs/ux/abstimmung-design.md` §8 – vieles hast du schon entschieden, ich habe es übernommen):

| # | Abweichung | Wireframe | Stand |
|---|---|---|---|
| S-1 | **Cockpit-Kopf mit Kennzahl-Box** ersetzt Statusband (W09) und Phasen-Chip im Kopf (W07, W10 ohne Box); kein globaler Header in Reisen; sticky nur der kompakte Kopf (104 px) | W07, W09, W10 | übernommen (B-3), design-system §9.2/§9.3 |
| S-2 | **Kennzahl-Kacheln** Frist + Beteiligung statt Frist-Chip + Avatar-Reihe; Beteiligung = Button → Sheet | W10 | übernommen (B-4), §9.5 |
| S-3 | **Kacheln „So geht's“** auf der Startseite, Liste unter 21,5 em; Hero-Karte unter dem CTA | W01 | übernommen (B-7, B-7a), §9.5 |
| S-4 | **Vorschlag-Leiste unten im Kalender** (< 960 px, ≤ 120 px, kein Griff, keine Orga-Auswahl) | W09 | übernommen (B-6), §9.10 |
| S-5 | **Werkzeugleiste W08**: Pinsel als Segment-Spur mit Mini-Feld über Label, Werkzeug-Kacheln 44 × 48 neben der Haupt-Taste, Zeitraum als Icon-Taste < 600 px, Statuszeile oben; **150 px, kein Griff, kein Label** | W08 | übernommen (W08, D-28), §9.9 |
| S-6 | **Einladung W03 als Reisekarte** (Querformat, Indigo-Verlauf) statt Ticket-Illustration; nur Vorname der Orga, neutrale Avatar-Punkte | W03 | übernommen (D-25), §9.6 |
| S-7 | **Feier W11 = Vorfreude-Ring im Cockpit** + Ergebnis-Karte darunter (Countdown auch als Text), Orga-Variante mit „Allen Bescheid geben“ primär | W11 | CEO 2026-10-08, §9.6/§9.12 |
| S-8 | Abstimmungs-Optionen immer Icon über Label (60 px), Rang-Chip Sonne in der Kopfzeile | W10 | übernommen, §9.11 |
| S-9 | Landing-Kopf < 375 px: „Anmelden“ als Icon-Taste | W01 | übernommen (D-29), §3.3 |

Keine weiteren Struktur-Wünsche von meiner Seite.

## 6. Antworten an Motion (M-D1–M-D9)

Bezug: `docs/motion/abstimmung.md` §1. (Ich schreibe nicht in `docs/motion/` – Antworten hier, Motion übernimmt.)

| # | Antwort Design | Wo |
|---|---|---|
| **M-D1** Neue Motion-Tokens | **Übernommen, Namen und Werte 1:1** aus motion-system §3 (Dauern, `ease-emphasized`, Federn als `linear()` im `@supports`-Block mit `cubic-bezier`-Fallback, Distanzen, Skalen, Staffel). Reduced-Motion-Werte gemäß §3.7 **zusätzlich unter `:root[data-motion="reduce"]`** (Konto-Schalter, Q17). | tokens.css §6, design-system §8.1 |
| **M-D2** `duration-fade` bleibt bei reduzierter Bewegung | **Übernommen:** 140 ms in beiden Reduce-Blöcken. | tokens.css §6 |
| **M-D3** Animierbare Illustrationen | **Umgesetzt** für alle 14 Illustrationen (`data-anim`, transformierte Gruppen in äußerer Gruppe, keine Texte, Endzustand statisch, IDs präfixiert). **Abweichung:** `hero.svg` ist in B die Übersichtskarte – Ebenen `plate`, `calendar`, `ring`, `friends`, `cells`, `band`, `sun`, `seal` (kein `sea`). `vote-done.svg` ist jetzt ein kompakter Vorfreude-Ring (`backdrop`, `glow`, `confetti`, `track`, `ring`, `knob`) statt Kalenderblatt mit Band. `invite.svg` hat `letter` (Reisekarte) und `plane`. | assets/README.md |
| **M-D4** Siegel als Komponente | **Umgesetzt** als `illustrations/seal.svg` (Ebenen `disc`, `check`, `sparks`), Größen-Tokens 20/40/64. **Abweichung Farbe:** Minze-Kreis mit Indigo-Häkchen statt Sonne – in B bedeutet Minze „passt/geschafft“, Sonne ist „Platz 1/Freude“; so ist das Siegel dasselbe Zeichen wie das Heatmap-Siegel „Alle: Geht“. **Abweichung Einsatz (CEO):** Das Siegel bleibt für Beitritt und Abgabe; die große Feier F-012 ist der **Vorfreude-Ring**, nicht Siegel + Kalenderblatt → Zeitleiste W11-02 bitte auf `countdown-ring.svg` umstellen. | tokens `--ww-seal-*`, design-system §8.3, §9.12 |
| **M-D5** Konfetti-Material | Formen: abgerundetes Rechteck 8–9 × 12–15 (Radius 3), Kreis Ø 10, Sonnenstrahl 11 × 2,5, Vier-Zack-Funkel 12. Farben `--ww-confetti-1…5` = Minze, Sonne, Lavendel 300, Koralle, Weiß (dunkel Koralle heller). Fällt über dem Indigo-Cockpit, kleine Teilchen ≤ 15 px. | tokens.css, design-system §8.1 |
| **M-D6** Regler | Tempo **1,0**; Federn unverändert (soft ζ 0,75, bouncy ζ 0,5 nur Siegel); Feier-Material wie M-D5. **Zahlen zählen nicht hoch** (CEO) – in B §10 korrigiert. | design-system §8.1/§8.3, richtung-b.md §10 |
| **M-D7** Gleitender Pinsel-Indikator | **Einverstanden:** ein Indikator-Element (weiße Fläche + 2 px `selected` + `shadow-selected`), das gleitet; die Punkt-Marke ● sitzt **im Indikator** oben rechts und gleitet mit; Label-Fettung wechselt sofort. | design-system §9.9 |
| **M-D8** §8 verweisen | **Umgesetzt:** design-system §8 verweist auf motion-system; Heatmap-Überblenden 140 ms ist als Farbwechsel-Ausnahme markiert. | design-system §8 |
| **M-D9** Hover-Schatten | **Übernommen:** Hover-/Druck-Schatten als Pseudo-Element mit `opacity`-Wechsel, nie `box-shadow` animieren. | design-system §7, §9.6 |

## 7. Antworten auf D-20 bis D-35 (`docs/ux/abstimmung-design.md` §8.3) inkl. CEO-Entscheidungen 2026-10-08

| # | Antwort Design | Wo |
|---|---|---|
| **D-20** Touch-Ziele | **Umgesetzt (Pflicht, CEO):** Tab-Pille 44 / Spur 48 (`--ww-size-tab-*`), Segment 44, Monats-Chips sichtbar 36 + Trefferfläche 44, kleine Taste („Erinnern“) 44 (`--ww-size-control-sm`), „Anmelden“ 44, Filter-Chips und Checkbox Trefferfläche 44. | design-system §9.1, §9.4, §9.8, §9.10 |
| **D-21** Kalenderzelle 360 px | **Korrigiert nach U-1 (CEO):** 8 px Rand gesamt (Karte 4 + innen 4), Fuge 4 → 45,7 px; `--ww-size-cal-cell-min-w` 44, neue Tokens `cal-card-gutter-sm`/`-pad-sm`. Höhe 46 + Zeilenfuge 9: Anatomie in 45,7 × 46 geprüft (Datum 5/5, Zahl ab 20 px, ◐ 11 px unten links, Siegel 16 px unten rechts, Eselsohr 13/18 px oben rechts – keine Überlappung). | tokens.css, design-system §6.1 |
| **D-22** Fokus am aktiven Tab | **Umgesetzt (Pflicht):** `--ww-focus-ring-on-brand-isolated` (Hof 2 px Indigo + Ring 3 px Weiß + Hof 2 px), Tab `z-index: 1`; gilt auch für Minze-Tasten im Cockpit. | tokens.css §5, design-system §9.4 |
| **D-23** Kontrast Kennzahl-Box | **Umgesetzt (Pflicht):** Lichtflecken haben feste Höhe 96 px und enden in der Kopfzeile, nie unter Tabs/Box → Box-Text 2 = 6,9 : 1. | tokens `--ww-cockpit-image`, design-system §4.3 |
| **D-24** Countdown als Text | **Umgesetzt (Pflicht):** Meta-Zeile der Ergebnis-Karte „5 Nächte · 7 dabei · noch 23 Tage“, Zustände DE/EN wie von dir vorgeschlagen; Ring-Text `aria-hidden`. | design-system §9.6, §9.12 |
| **D-25** Datenschutz Einladung | **Umgesetzt (Pflicht):** neutrale Avatar-Punkte ohne Initialen + „+1“ + Zahl; nur Vorname der Orga („von Lena“). | design-system §9.6, `trip-card-motif.svg` |
| **D-26** Filterzeile und Legende in W09 | **Umgesetzt:** Filterzeile unter dem Segment (Chips 44, aktiver Filter), Legende als `<details>`. | design-system §9.10 |
| **D-27** Griffe | **Umgesetzt (Pflicht):** Griff nur an echten Bottom-Sheets; Werkzeugleiste, Vorschlag-Leiste, Auswahlleiste ohne Griff. | design-system §9.9, §9.10, §9.16 |
| **D-28** Werkzeugleiste 150 px | **Umgesetzt (CEO):** `--ww-size-toolbar-max` 150 px, Aufbau nach deiner Rechnung (8 · 16 · 4 · 58 · 8 · 48 · 8), Kacheln 44 × 48, kein Griff, kein Label. | tokens.css, design-system §9.9 |
| **D-29** Landing-Kopf 360 px | **Umgesetzt:** neues Icon `ww-icon-login`; < 375 px „Anmelden“ als Icon-Taste 44 × 44. | icons.svg, design-system §3.3 |
| **D-30** Orga-Variante W11 | **Umgesetzt:** Orga primär „Allen Bescheid geben“, sekundär „Zum Kalender hinzufügen“. | design-system §9.6 |
| **D-31** Hochzählen | **Entschieden (CEO): kein Hochzählen**, auch nicht der Countdown; Ringe/Balken wachsen. richtung-b.md §10 angepasst. | design-system §2 Nr. 11, §8.3 |
| **D-32** W07, W04, W13 in B | **Spezifiziert:** W07 Kennzahl je Phase (P1 Abgabe-Ring, P2 Abstimmungs-Ring + Frist, P3 Mini-Vorfreude-Ring); W04 Reisekarten (§9.6); W13 Karte „Darstellung“ mit drei Schalter-Zuständen. Hi-Fi-Mockups liefere ich bei Bedarf nach. | design-system §9.3, §9.6, §9.20 |
| **D-33** Tab-Überlauf | **Umgesetzt:** Verlaufskante 24 px links/rechts nur bei Überlauf, aktiver Tab in Sicht. | design-system §9.4 |
| **D-34** „Nein?“ | Zur Kenntnis, Hinweis an Developer in design-system §9.11. | §9.11 |
| **D-35** Textlängen | Zur Kenntnis; Tabelle in design-system §10 aktualisiert. | §10 |

## 8. Offen für UI/UX
Keine offenen Punkte. Zur Kenntnis: Die Feier-Zeitleiste (Motion W11-02) muss Motion auf den Vorfreude-Ring umstellen (Ebenen siehe assets/README.md, `countdown-ring.svg`).

## 9. Offen für UI/UX – Cockpit-Varianten W16 (Runde 4, 2026-10-22)
Auftrag des Auftraggebers: Mehrere optische Versionen der Reise-Übersicht nach der Festlegung, der Vorfreude-Ring mit Konfetti bleibt in jeder Version. Klickbares Mockup: [`mockups/cockpit-varianten/index.html`](mockups/cockpit-varianten/index.html) (A Bordkarte · B Bento · C Reiseverlauf · D Wallet · E Bühne; hell/dunkel, „Bewegung reduzieren“, „Feier abspielen“, auf Desktop zwei nebeneinander). Inhalte und Demo-Daten wie W16 (Vorbereitung, Sicht Max).

**UI/UX prüft die Varianten noch auf Usability**, bevor der Auftraggeber auswählt. Konkrete Prüfpunkte aus Design-Sicht:

| Nr. | Variante | Punkt |
|---|---|---|
| U-17 | alle | Ring sitzt jetzt **dauerhaft groß** im Cockpit (statt Mini-Ring 64 px aus W16 §2.1); die Feier läuft beim ersten Aufbau je Sitzung bzw. auf Knopfdruck. Passt das zu W16 „Feier nur einmal je Person“? Vorschlag Design: große Feier einmal (W11), danach Ring groß, aber **ohne** Ehrenrunde – nur Konfetti auf Antippen. |
| U-18 | A | Ticket-Kopf ≈ 470 px hoch – erste To-do-Taste liegt bei 844 px knapp im ersten Bildschirm. Reicht das? |
| U-19 | B | Reihenfolge im Bento (Unterkunft hoch links, Kosten/Reisedaten rechts) entspricht nicht der Leserichtung der Dringlichkeit; Regeln je Teilphase nötig. Bei 200 % Schrift einspaltig (Raster `auto-fit`). |
| U-20 | C | Bereiche ohne Zeitbezug (Kosten, Infos) als Stationen; „Als Nächstes“/„Später“ bräuchte eine feste Regel. Seitenlänge ca. 2,5 Bildschirme. |
| U-21 | D | Aufklappen = zusätzlicher Tipp vor dem Bereich; `aria-expanded` + `inert` umgesetzt. Feste Farbe je Bereich (Koralle To-do, Lavendel Unterkunft, Sonne Kosten, Violett Reisedaten, Minze Unterlagen). |
| U-22 | E | Schwebendes Dock mit 5 Bereichen ähnelt Tabs → **Konflikt mit UX-1 „keine Tabs“**. Karussell versteckt To-dos 2–3 (Zähler „1 von 3“ + Punkte vorhanden). |

## 10. Runde 4b – C v2 „Reiseverlauf“: Antworten auf D-36–D-45 und Motion UM-1–UM-7 (2026-10-22)
Klickbare Fassung: [`mockups/cockpit-reiseverlauf/index.html`](mockups/cockpit-reiseverlauf/index.html) (Basis: W16 v2 Teil A; Steuerpanel mit Rolle Max / Lena / Sara „bucht“, Teilphase, Szenarien „Station erledigen“, „Orga hakt ohne App ab“, „Abreisetag“, „Weg neu aufbauen“, „Feier abspielen“; Gerät 390 × 844 / 360 × 740 / 360 × 640 / 320 × 568 / Desktop 1024; Dunkel, Bewegung reduzieren, Schrift 200 %, EN-Labels; **Live-Messung** von Kopfhöhe, Lage von „Heute“ und Primär-Taste). UX-8 und UX-9 sind vom Auftraggeber bestätigt (ja) und im Mockup fester Bestandteil.

### 10.1 Optik D-36 – D-45
| ID | Status | Umsetzung (Mockup = Vorgabe für die Entwicklung) |
|---|---|---|
| **D-36** Ticket-Kopf | **gelöst** | Zeile 1 sticky (Indigo + Lichtflecken 60 px hoch, enden in der Zeile) · Ticket vollflächig, Unterkante Radius 30 · Ring-Kasten `clamp(120px, 21svh, 168px)`, Ausschnitt eng um den Ring (`viewBox 117 158 156 156`), Konfetti-Deko seitlich, nie über Zeitraum/Text · Zahl Jakarta 800 = 30 % des Rings + «Tage» · Zeitraum 18/800 · Abriss-Kante 24 px (Kerben in Grundfarbe, Strichlinie weiß 30 %) · Abschnitt: Crew-Button (3 Avatare + «+3», «6 dabei · 7 Nächte») + **eine** Tastengruppe rechts (Vorbereitung `[Kalender]` Kontur; Unterwegs `[+ Ausgabe]` Minze + `[Tickets]` Kontur; Danach `[Ausgleichen]` Kontur, entfällt wenn ausgeglichen). Gemessen: **≈ 313 px bei 360 × 640** (Budget 340). Unterwegs: Tages-Ring «Tag 3 von 8» (Füllung = vergangene Tage); Danach: voller Ring, «Schön war's!» statt Zahl. |
| **D-37** Linie & Marker | **gelöst** | Linie 3 px: erledigt durchgezogen `accent-strong` (hell 5,0 : 1, dunkel Minze), ab Heute gestrichelt 6/6 `border-strong` (3,1 / 3,4). Marker 32 px: erledigt = Minze + Indigo-Häkchen **mit 1,5-px-Rand `accent-strong`** (sonst nur 1,4 : 1 gegen Grund) · Heute 40 px Sonne + Sonnen-Symbol, Hof 3 px Grund + 3 px Indigo (dunkel Minze) · wartet = Ring 2 px Lavendel-600 + halbe Füllung (6,1 : 1; dunkel Lavendel-400) · als Nächstes = Fläche + 2,5 px Tinte · später = **24 px**, 2 px `border-strong` (bewusst kleiner = gedämpft) · Ziel = Indigo + Sonne (dunkel + 2 px Minze-Rand). Alle Marker/Linien `aria-hidden`. |
| **D-38** Stationskarte | **gelöst** | (a) ausgeklappt: Koralle-Kante 5 px, Chip «Du bist dran» (Koralle-Tint, 12/800 Versalien), Titelzeile = Link mit Icon-Kachel 32 + Chevron (min. 44 px), Text max. 2 Zeilen, Primär-Taste 54 px volle Breite · (b) kompakt ≥ 64 px, ganze Karte ein Link, Balken 6 px · (c) wartet: Karte ohne Kante, darunter `btn-sm` sekundär mit Glocke (44 px) + Text-Tasten, Geschwister des Links · (d) später: schmale Zeile 48 px ohne Fläche (Icon 20 · «Später» · Titel · Zeithinweis rechts) · Ziel: Indigo-Karte, Icon-Kachel Sonne; Danach mit Kontur-Taste «Neue Reise planen» + 13-px-Löschhinweis. Aufgaben ohne Station (A1) tragen den Chip «Du bist dran · Kosten». **Neu:** Termine (Unterwegs) mit Lavendel-Kante + Chip «Termin heute» – sie sind keine Aufgabe, darum nicht Koralle. |
| **D-39** Labels | **gelöst** | Versalien 12/800, Sperrung 0,06 em, `text-muted` (Als Nächstes/Ziel in `text`). Heute = Sonnen-Pille 32 px, 13/800 Versalien, h3 mit `sr-only`-Langform («Heute, Sonntag, 2. Mai»). EN geprüft: «In progress · waiting on others» passt bei 360 px einzeilig (≈ 250 px), bei 200 % zweizeilig – erlaubt, kein Abschneiden. |
| **D-40** Erledigt-Zeile | **gelöst** | Zeile 48 px, 1,5-px-Rand `border-subtle`, Text 14/700 einzeilig mit „…“, Chevron ▾ dreht 180°. **Gestapelte Häkchen = Münzstapel am Marker:** ab 2 bzw. 3 erledigten Stationen lugen 1–2 Minze-Scheiben (mint-500) 5/10 px über dem Marker hervor – kostet keine Breite. «Neu erledigt: … · n erledigt»: Minze-Tint + Rand `accent-strong`, Text fett in `accent-text` (4,9 : 1). Aufgeklappt: Liste kompakter Links 52 px; «ohne App erledigt» als Minze-Chip, Orga sieht Text-Taste «Rückgängig». |
| **D-41** Kacheln | **gelöst** | Raster `minmax(min(100%, 9.5em), 1fr)`, Lücke 12, Kachel ≥ 88 px, Radius 20, Icon-Kachel 32 oben links, Chevron oben rechts, Titel 15/800, Status 14/500, Chip «1 neu» (Lavendel-Tint) unten. Keine Koralle. ≥ 600 px drei Spalten, < 9,5 em einspaltig. |
| **D-42** Mini-Ring | **gelöst** | Punkt (9 px Sonne) und Mini-Ring 20 px (Spur weiß 25 %, Füllung Minze→Sonne, 3 px) liegen übereinander und blenden 140 ms über. Zeile 1 bekommt dabei Radius 0 0 22 22 + Schatten, damit sie über hellem Inhalt nicht wie eine abgeschnittene Fläche wirkt. Dunkel identisch (Indigo-900). |
| **D-43** Schmal / 200 % | **gelöst, Vorschlag** | Statt Linie ganz wegzulassen: **Schiene** 3 px am linken Rand (16 px Einzug statt 46 px), erledigt durchgezogen, danach gestrichelt. Labels werden Chips (Fläche `surface-sunken`) **mit Marker-Symbol 22 px** vorne – so bleibt der Weg lesbar. Ring 120 px, Crew und Tasten untereinander (Tasten volle Breite), Kacheln einspaltig. Bitte UX bestätigen (Schiene statt „Linie entfällt“). |
| **D-44** Ring als Taste | **gelöst** | `<button>` rund, Gedrückt = `scale-press` 0,97 (80 ms), Fokus isoliert auf Indigo (2 px Indigo · 3 px Weiß · 2 px Indigo, rund). **Kein Hinweis/Tooltip** – Entdeckung ist Teil des Spaßes (UX-Vorschlag übernommen). |
| **D-45** Desktop | **gelöst** | Ab 960 px Container: Ticket als Band (Ring 168 links, senkrechte Abriss-Linie, rechts Zeitraum 24/800 + Crew + Tasten), ≈ 215 px hoch. Darunter Raster `minmax(0,600px) minmax(0,320px)`, Lücke 40: Weg links, rechts Kacheln einspaltig + „Mehr zur Reise“. DOM: Weg vor Seitenspalte. Sheets als Dialog 480 px mittig. |

**Token-Vorschlag** (Übernahme in `tokens.css`/design-system nach Freigabe Q26/Q27, beide Dunkel-Blöcke): `--ww-route-line-done: var(--ww-color-accent-strong)`, `--ww-route-line-todo: var(--ww-color-border-strong)`, `--ww-route-line-w: 3px`, `--ww-route-marker: 32px`, `--ww-route-marker-today: 40px`, `--ww-route-marker-later: 24px`, `--ww-route-wait: lavender-600 / dunkel lavender-400`, `--ww-route-today-halo: indigo-800 / dunkel mint-400`, `--ww-route-coin: var(--ww-mint-500)`, `--ww-size-countdown-ring-hero: clamp(120px, 21svh, 168px)`, `--ww-size-mini-ring: 20px`.

### 10.2 Motion UM-1 – UM-7 (umgesetzt im Mockup, Motion Designer bitte gegenprüfen)
| ID | Entscheidung Design | Reduzierte Bewegung |
|---|---|---|
| **UM-1** Konfetti auf Antippen | Nur die 12 SVG-Teilchen fallen neu ein (700–900 ms, Staffel 25 ms, `standard`), Schein 0,4→1 (220 ms), 3 Funkel mit `spring-soft` ab 520 ms – **Ende ≤ 1,2 s**, keine Ehrenrunde, kein Puff, keine Vibration, Sperre 3 s. Teilchen bleiben im Ticket (`overflow: hidden`), nie über Karten-Text. „Feier abspielen“ zeigt die **große** Feier E4 unverändert (Port von `celebration.ts`). | Aufglühen des Rings 140 ms (`brightness` 1→1,35→1), kein Konfetti |
| **UM-2** Weg baut sich auf | Erledigt-Linie `scaleY` 0→1 von oben (480 ms, `standard`), Einträge Fade + 16 px hoch (320 ms, `enter`), Staffel 60 ms, max. 400 ms; Kacheln setzen die Staffel fort. Einmal je Sitzung. | sofort statisch |
| **UM-3** Heute-Puls | Sonnen-Ring 3 px skaliert 1→1,8 und blendet aus, 1,6 s × 3 (4,8 s < 5 s, WCAG 2.2.2), Start nach dem Linienzug (480 ms). Nur beim Aufbau. | kein Puls |
| **UM-4** Neu erledigt | **Abweichung:** Nicht ein zusätzliches 20-px-Siegel, sondern **der Erledigt-Marker selbst wird zum Siegel** (Minze + Indigo-Häkchen + Ring in Flächenfarbe = `seal.svg`-Aufbau, 32 px): Pop von `scale-pop` 0,6 mit `spring-bouncy` (480 ms), Häkchen zeichnet sich (320 ms). Grund: zwei gleich aussehende Minze-Kreise übereinander wirkten doppelt. Kein Umsortieren/FLIP – die Seite blendet nur 140 ms über („Neuladen“). | nur Überblenden 140 ms |
| **UM-5** Aufklappen | `grid-template-rows` 0fr→1fr (`base` 220 ms, `standard`), Einträge Fade 220 ms mit Staffel 40 ms; Chevron dreht 180°. Geschlossen `inert` + `visibility: hidden`. | sofort |
| **UM-6** Mini-Ring | Überblenden 140 ms, ausgelöst per IntersectionObserver (Rand oben = Höhe Zeile 1), nicht scroll-gekoppelt. | bleibt (M-D2) |
| **UM-7** Abreisetag (UX-8 = ja) | Einmal je Person am ersten Tag *Unterwegs*: UM-1-Runde startet 350 ms nach dem Öffnen automatisch; Heute-Satz «Heute geht's los – gute Reise!». | nur Text |

Zahlen zählen nirgends hoch (D-31): Countdown, Fortschritt „1 von 5“ und Beträge stehen sofort.

### 10.3 Offen für UI/UX (bitte bestätigen oder anpassen)
| Nr. | Punkt |
|---|---|
| U-23 | **Heute-Satz Unterwegs mit Terminen** fehlt in H-1–H-5. Mockup-Vorschlag **H-6**: «Heute ein Termin – und eine Sache für dich.» bzw. ohne Aufgabe «Heute ein Termin – sonst genießt den Tag!» (EN: «One plan today – and one thing for you.» / «One plan today – otherwise enjoy!»). |
| U-24 | **Erste Heute-Karte unterwegs ist ein Termin** (nicht „du bist dran“) und trägt die Primär-Taste «Ticket öffnen». Passt das zur Regel „Primär-Taste = erste Du-bist-dran-Station“? Optisch mit Lavendel-Kante statt Koralle. |
| U-25 | **Zwei Primär-Tasten unterwegs:** `[+ Ausgabe]` in Minze im Kopf (W16 v2.2) + Primär-Taste der ersten Heute-Karte. Vorschlag Design: so lassen (Kopf-Minze ist auf Indigo eigene Ebene), oder Heute-Termin nur als kompakte Karte ohne Taste. |
| U-26 | **Weg-Überschrift je Teilphase:** Mockup nutzt «Euer Weg nach Kroatien» / «Eure Tage in Kroatien» / «Nach der Reise». Bitte festlegen. |
| U-27 | **Danach – Unterlagen doppelt:** Kachel „Unterlagen“ (v2.4 Kacheln Danach) und Station D2 „Unterlagen sichern“ gleichzeitig – widerspricht „ein Bereich mit offener Station hat keine Kachel“ (v2.6). Mockup zeigt beides; Vorschlag: so lassen (Kachel = Ablage, D2 = Hinweis mit Frist). |
| U-28 | **D-43 Schiene statt „Linie entfällt“** (s. 10.1) bestätigen. |
| U-29 | **Siegel = Marker (UM-4)** statt separatem 20-px-Siegel bestätigen. |
| U-30 | Im Mockup vereinfacht: Orga Danach «Abrechnung abschließen?» (D1, freiwillig) nicht gezeigt; Rolle „Sara bucht“ ist eine Demo-Variante der Daten (Lena bleibt Orga ohne „bucht“). |

## 11. Runde 5 – Inkrement 9 Unterkünfte: Antworten auf D-46 – D-55 (2026-10-23)

Grundlage: `docs/ux/abstimmung-design.md` §14, W18 E, W17 F, W16 v2.14. Spezifikation der Optik: [design-system.md §9.21](design-system.md#921-unterkünfte-f-031-inkrement-9--v11-2026-10-23). Tokens: tokens.css v1.1 (`--ww-stay-*`, `--ww-stamp-*`, `--ww-pattern-stay-placeholder`). Bewertung **zweistufig** übernommen (kein „Vielleicht“, kein dritter Stempel).

| ID | Antwort Design | Status |
|---|---|---|
| **D-46** Swipe-Karte | Angenommen: Bild **16:10**, `max-height: 34svh` (< 22 em: 28 svh, < 20 em ohne Bild). Domain-Chip unten links auf Verlauf `--ww-stay-image-scrim` (Chip Weiß auf Tinte 72 % ≥ 7,3 : 1 auch über reinem Weiß; Bilder sind in beiden Modi gleich, daher theme-unabhängig). Karte Radius 28, `shadow-2`; zweite Karte 95 %, 8 px versetzt, **volle Deckkraft** (Mockup hat .85 – bitte angleichen, sonst scheint Text durch). Typo §9.21. | erledigt |
| **D-47** Stempel / Farbe ♥ | Schräg ja (♥ −8° links oben, ✕ +8° rechts oben), Icon + Text, 40 px, Jakarta 17/800. **Abgleich U-25:** Minze-*Fläche* bleibt Ring/Linie/erledigt/Siegel. ♥ gehört zur **Ja-Familie** (wie „Ja“ in F-011: `vote-yes-*` = Minze-Tönung + Minze-700) – das ist dieselbe Bedeutung („passt mir“), daher Minze statt Lavendel (Lavendel = Abstimmung/Links/Info, wäre mehrdeutig). Gefüllte Minze nur am **Stempel auf dem Bild** (flüchtig, `aria-hidden`, braucht Signal auf Fotos). Tasten ♥ und ✕ **gleich gewichtet** (beide getönt + Rahmen, keine Primär-Optik) – keine Lenkung zur Zustimmung. ✕ neutral Weiß/Tinte, nie Rot/Koralle. | erledigt |
| **D-48** Platzhalter | `assets/unterkuenfte/stay-placeholder.svg` (Streifen 135° + Bett-Plakette, hell/dunkel über Tokens, `slice` → passt für 64 px, 16:10, 16:9) und CSS-Muster `--ww-pattern-stay-placeholder`. Domain steht als normaler Chip «Keine Vorschau · airbnb.de» unten links (gleiche Optik wie bei Bildern, kein Sonderfall-Look); der längere W17-Satz steht unter der Karte, nicht auf dem Bild. Text auf Streifen ≥ 6,0 / 8,9. | erledigt |
| **D-49** Bewertungstasten | 64 · 48 · 64, Label darunter. Liste: Paar 44 px; gedrückt = **gefülltes Herz + 2-px-Rahmen + Tönung** bzw. ✕ mit Tönung + 2-px-Rahmen; nicht gedrückt = Kontur 1,5 px + Kontur-Icon; „offen“ als Wort davor. `cross` reicht für ✕ (Strich 2,6, gleiche Form wie „Nein“ in F-011). | erledigt |
| **D-50** Ranglisten-Zeile | Rang-Kreis 32 px **überlappt die linke obere Bildecke** (spart 40 px bei 360 px Breite); Rang 1 Sonne, sonst `surface-sunken`. Chips «★ Platz 1» (Sonne, wie W10) / «Gleichauf» (Info). «♥ 5 · ✕ 0» 14/800 tabular, Namen 13 `text-muted`. `[Das wird's]` Sekundär klein 44 px. 200 %: Tasten unter den Titel. | erledigt (U-32 bestätigen) |
| **D-51** Eure Unterkunft | Karte mit randlosem Bild 16:9, Chips «◷ noch nicht gebucht» (`warning-*`) / «✓ gebucht» (`accent-*`) + «am … von …», Primär `[Als gebucht markieren]`, Sekundär `[Ansehen ↗]` `[Teilen]`, Text-Tasten. Siegel 40 an der Bildecke (Festlegen) bzw. 20 am Chip (gebucht), kein Konfetti. | erledigt |
| **D-52** Icons | **Im Sprite ergänzt** (`docs/design/assets/icons/icons.svg` v1.1): `bed`, `heart` (Kontur, Duoton), `heart-filled`, `external`. `cross` bleibt für ✕. Referenzblatt: `assets/unterkuenfte/icons-unterkuenfte.svg`. **Developer:** `public/icons.svg` per `scripts/sync-design-assets.ts` neu erzeugen und `ICON_NAMES` (`src/components/ui/icon-names`) um die vier IDs ergänzen – bis dahin schlägt der Drift-Test `scripts/design-assets.test.ts` fehl. | erledigt |
| **D-53** Demo-Bilder + Leerzustand | 8 eigene Demo-Bilder `assets/unterkuenfte/demo-*.svg` (4:3, < 7 KB, keine fremden Assets) + Kopie `public/demo/stays/`; Leerzustand `illustrations/empty-stays.svg` (Stil B, `data-anim`). **Developer:** `illustrations.json` per Sync neu erzeugen (Drift-Test). Zuordnung zu den Mockup-Daten: Villa Mare → `demo-villa-pool`, Apartment Lavanda → `demo-altstadtwohnung`, Kamena Kuća → **ohne Bild** (zeigt den Platzhalter, wie im Prototyp), Casa Azul → `demo-apartment-hafen`, Ferienwohnung Bačvice → `demo-strandhaus-duenen`; übrige für weitere Demo-Reisen. | erledigt |
| **D-54** Hinweise | Sperrhinweis `surface-sunken` + Schloss, ohne Balken/Zahlen/verwischte Zeilen; «Basiert auf …» Info wie U-20; «Termin hat sich geändert» Amber + Schließen 44 px nur Orga; „ohne App erledigt“ Info + Siegel 20. | erledigt |
| **D-55** Desktop / Kachel | `/stays` zweispaltig wie das Cockpit (600 + 320, rechte Spalte sticky); `/stays/swipe` nur Stapel 420 zentriert. Kachel „Unterkunft“: **Lavendel** + `bed`; nach Festlegung ersetzt das Bild der Unterkunft (34 px) die Icon-Kachel. | erledigt (U-34 bestätigen) |

### 11.1 Offen für UI/UX (bitte bestätigen oder anpassen)
| Nr. | Punkt |
|---|---|
| U-31 | **Prototyp angleichen:** zweite Karte volle Deckkraft; Platzhalter mit Chip «Keine Vorschau · Domain» unten links statt zentriertem Satz auf dem Bild; Ort-Zeile raus (W18 E.0). |
| U-32 | **Rang-Kreis auf der Bildecke** statt eigener Spalte – bestätigen (Lesereihenfolge bleibt: sr «Platz 1» vor dem Titel). |
| U-33 | **♥-Taste unter dem Stapel getönt** (`vote-yes-bg` + Minze-Rahmen) statt gefüllter Minze wie im Prototyp (`.swipe-btns .like`) – gleiche Gewichtung wie ✕, passt zu U-25. |
| U-34 | **Kachel nach Festlegung mit Unterkunftsbild** statt Bett-Icon – bestätigen (Bild ist dekorativ, Titel steht als Text). |

## 12. Runde 6 – Inkrement 10 Kosten: Antworten auf D-56 – D-63 (2026-10-23)

Grundlage: `docs/ux/abstimmung-design.md` §15, W19 D, W16 v2.15, features.md R.8. Optik: [design-system.md §9.22](design-system.md). Tokens: tokens.css v1.2 (`--ww-cost-*`, hell + beide Dunkel-Blöcke). Saldo-Wortlaut übernommen: «Du bekommst / Du schuldest / Du bist ausgeglichen ✓», kein Minuszeichen, Schulden nie Rot/Koralle/Amber; Amber nur für den Rest bei „Nach Beträgen“.

| ID | Antwort Design | Status |
|---|---|---|
| **D-56** Bereichsfarbe | **Sonne bestätigt** (`cost-area-*`, 6,2 / 9,6) + `wallet` – nur als Icon-Kachel (Kachel, Kopf, A1/D1), nie als Fläche hinter Beträgen, damit sie nicht mit dem Amber der Hinweise verwechselt wird. Keine Koralle, keine Minze-Fläche. Kategorie-Kacheln eigene Töne (s. §9.22): Unterkunft Lavendel, Anreise Lavendel-200/Indigo, Essen Sonne, Aktivitäten Minze-*Tönung* (Kachel, keine Primärfläche – passt zu U-25), Sonstiges/ohne neutral. | erledigt |
| **D-57** Dein Stand + Salden | Karte mit Eyebrow, Icon-Kachel 40 bzw. Siegel 40 links, Saldo-Satz 26/800 tabular, 2 Erklärzeilen 14. Drei Zustände nur über Icon + Textfarbe (bekommt Minze-Text, schuldet Tinte, ausgeglichen Minze-Text + Siegel). **Balken: ja, leise** – Spur 6 px mit Mittelachse, bekommt nach rechts (Minze-700 / dunkel Minze), schuldet nach links (Tinte 4, neutral, 3,4 / 3,9), Länge relativ zum größten Saldo, `aria-hidden`, entfällt bei 200 % / < 20 em. | erledigt |
| **D-58** Icons | **Im Sprite ergänzt** (icons.svg v1.2): `wallet`, `food`, `tag`, `receipt` + zusätzlich `transfer` (Ausgleich, optional für „Dein Stand – schuldet“), `car`, `ticket` (Kategorie-Alternativen, s. U-35). Kein `euro`-Icon: Reisen haben auch GBP/CHF/… – `wallet` ist währungsneutral. **Developer:** `node scripts/sync-design-assets.ts` ausführen und `ICON_NAMES` (`src/components/ui/icon-names.ts`) um `wallet`, `transfer`, `receipt`, `food`, `car`, `ticket`, `tag` ergänzen – sonst schlägt `scripts/design-assets.test.ts` fehl. | erledigt |
| **D-59** Avatar ehemalig | Kreis `cost-former-bg` (vertieft) + Icon `user` 60 % in Tinte 2 (6,0 / 7,1), keine Initialen, **kein** gestrichelter Rand (gestrichelt = „noch offen“). Nummer nur im Text. | erledigt |
| **D-60** Leerzustand | `illustrations/empty-costs.svg` (240 × 180, Stil B): Reisekasse in Indigo, Beleg dahinter, Sonnen-Münzen, Sonne + Minze-Wellen; ohne Text, ohne Koralle; Ebenen `plate`, `sun`, `sea`, `receipt`, `wallet`, `coins`, `sparks`. Wird per Sync in `illustrations.json` übernommen. | erledigt |
| **D-61** Formular | Betragsfeld 56 px, Jakarta 28/800, Währungszeichen dekorativ (DE rechts / EN links). Kategorie-Chips: Icon in Kategorie-Farbe; gedrückt = `primary-tint` + 2 px `selected` + Häkchen statt Icon + 800. Für-wen-Chips: Avatar 24, Häkchen am Ende (Platz reserviert). Segment wie W09. Live-Zeile Amber + `info` (nicht Rot), «Passt genau» Minze-Text + `check`. Felder je Person 44 px, rechtsbündig, max. 128 px. | erledigt |
| **D-62** Ausgleichszeile | «Du → Kemal 86,00 €» 17/800, Pfeil `arrow-right` in Tinte 3. IBAN maskiert in Vierergruppen mit `•` – **Figtree tabular statt Monospace** (bleibt im Schrift-System, Ziffern stehen trotzdem bündig); Gruppen `nowrap`; Anzeigen (`eye`/`eye-off`) + Kopieren als Text-Tasten 44 px, bei < 22 em darunter. Anderer Weg als reiner Text. Tasten: Primär nur erste eigene Schuld, sonst Sekundär klein; markiert → Chip «✓ Bezahlt · 86,00 €» (`cost-paid-*`) + «Zurücknehmen». Hinweise: abgeschlossen Info + Schloss, „an dich bezahlt“ Info + `wallet`, Konflikt Amber. Dunkel alle ≥ 5,9. | erledigt |
| **D-63** Siegel klein | **Vorhandenes `seal.svg`** in 20 px („Dein Stand“ bei schmalem Container) und 40 px („Dein Stand“ ausgeglichen, Karte «Alles ausgeglichen ✓») – keine neue Datei: gleiche Bedeutung „kleiner Meilenstein“, gleiche Motion (`disc`/`check`), schon im Code. Karte «Alles ausgeglichen» auf `cost-settled-bg` (Minze-100 / `#133C3B`), Siegel-Ring in Flächenfarbe trennt es von der Tönung. Kein Konfetti. | erledigt |

### 12.1 Offen für UI/UX (bitte bestätigen oder anpassen)
| Nr. | Punkt |
|---|---|
| U-35 | **Kategorie-Icons Anreise/Aktivitäten:** `plane` bedeutet in der App „Reise“ (Reisekarte, Einladung), `sparkle` „Vorschlag“ (W09). Empfehlung Design: Anreise = **`car`**, Aktivitäten = **`ticket`** (beide jetzt im Sprite). Wenn UX bei `plane`/`sparkle` bleibt, ist das baubar – bitte festlegen, Developer mappt nur in einer Tabelle. |
| U-36 | **A1/D1 mit Koralle-Kante:** Die Aufgabe «Du schuldest Kemal 86,00 €» trägt die To-do-Kante (Koralle = *du bist dran*), der Betrag selbst steht in Tinte. Design hält das für richtig (eine Aufgabenoptik im ganzen Cockpit); falls CEO/UX „Schulden nie Koralle“ auch auf die Kante beziehen, Kante für A1 in `cost-area-fg` (Sonne-700) – bitte entscheiden. |
| U-37 | **Zahlungsinfo:** R.8 und UX §15 sprechen von IBAN-Feld + „anderer Weg“ (Freitext); W19 D.8.4 beschreibt noch **ein** Freitextfeld. Optik §9.22 geht von zwei Feldern aus (IBAN maskiert, Freitext als Text) – bitte W19 D.8.4 angleichen. |
| U-38 | **Balken in den Salden** (D-57) sind spezifiziert, aber optional – UX entscheidet, ob sie in Inkrement 10 gebaut werden (Empfehlung Design: ja, ab 3 Personen in der Abrechnung). |

## 13. Runde 7 – Inkrement 11 „Bucht“ + Reisedaten: Antworten auf D-64 – D-71 (2026-10-23)

Grundlage: `docs/ux/abstimmung-design.md` §16 (D-64 – D-71), W20 Abschnitt H, features.md R.9, W16 v2.16. Die blockierenden Punkte D-64 und D-67 sind geliefert. Optik: [design-system.md §9.23](design-system.md). Tokens: tokens.css v1.3 (`--ww-travel-*`, `--ww-pattern-travel-demo`, hell + beide Dunkel-Blöcke).

| ID | Antwort Design | Status |
|---|---|---|
| **D-64** Chip «Bucht» + Icon | **`id-card` neu im Sprite** (v1.3) zusammen mit `shield`, `history`, `key` (eye/eye-off/lock/copy gab es schon). Chip Lavendel-200 / Indigo (9,3; dunkel Violett/Weiß 6,5), 22 px in Listen, 26 px im Karten-Kopf, immer Icon **+ Text**; Platz direkt nach dem Namen, Reihenfolge Name · Orga · Bucht, beide Chips brechen gemeinsam um. Kein Avatar-Badge (Krone bleibt Orga). | erledigt |
| **D-65** Vorschau-Hinweis, Dokument-Warnung, Masken dunkel | **Vorschau-Hinweis:** Amber-Familie wie gewünscht (`travel-demo-*`), aber mit **Etikett «VORSCHAU»** und **gestreifter Kante links** statt größerer Fläche/Rot – auffällig, nicht alarmierend; nicht schließbar, kein Schatten. Icon `warning`. **Dokument-Warnung:** Amber-Box `travel-warn-*` unter dem Schalter, Icon `warning`, Text in Tinte (14,9 / 11,5). **Masken:** `travel-mask-fg` 5,1 / 5,9 (≥ 4,5 auch dunkel) – nur auf `surface`. | erledigt |
| **D-66** Formular + Einwilligungs-Karte | **Schritt-Balken** 2 Segmente (§9.13). **Geburtsdatum/Ablaufdatum als drei Felder** Tag 4 em · Monat 4 em · Jahr 6 em, Inputs §9.7 mit sichtbaren Labels 13/700, Ziffern tabular 17/700, Lücke 8; < 22 em Tag+Monat / Jahr zweizeilig; Fehler-Rahmen nur an fehlerhaften Feldern, eine Meldung unter der Gruppe. **«Fantasiedaten einsetzen»** (nur Vorschau) als Text-Taste mit `sparkle` 16 in `link` **innerhalb** des Vorschau-Hinweises (6,2 / 8,1), ≥ 44 – gehört sichtbar zur Vorschau, nicht zum echten Formular. Zusammenfassung als `<dl>`. **Einwilligung:** Ganze Karte = `<label>`, 1,5 px Rahmen (bewusste Ausnahme von „keine Konturen“, wie Optionen), Checkbox 24 nie vorangekreuzt; gesetzt = Indigo-Checkbox mit weißem Haken + Karte Lavendel-Tönung + 2 px Rahmen (dunkel Minze). Fokus-Ring um die Karte. Fehler = 2 px Kirsche + Meldung §9.7. Primär «An Lena freigeben» mit `shield`, immer aktiv. | erledigt |
| **D-67** Illustration Leerzustand | **Zwei Dateien** (statt einer – „nichts zu tun“ und „gelöscht“ brauchen verschiedene Stimmungen): `empty-travel-data.svg` (Ausweiskarte ohne Inhalt + Indigo-Schild mit Minze-Haken) für „Bucht“ ohne Anfrage **und** Mitglied „Gerade nichts zu tun“; `travel-data-deleted.svg` (blasse, leere Karte + Minze-Siegel, kein Papierkorb) für W20 G / D3. Stil wie empty-costs, `data-anim`-Ebenen für Motion. | erledigt |
| **D-68** Bereichsfarbe | **Lavendel/Indigo** (laut CEO von UX bestätigt): `travel-area-*` = Lavendel-200 / Indigo (9,3), dunkel Violett `#5B48C9` / Weiß (6,5) – der in §16 genannte „Violett“-Ton ist damit im Dunkelmodus genau erfüllt. + `id-card` für Kachel, V4/D3, Kopf, Aufgaben-Kachel. Kräftiger als Unterkunft (Lavendel-100 / Lavendel-600 + `bed`), klar getrennt von Kosten (Sonne); nicht Koralle, nicht Amber. Chip «Bucht» mit denselben Werten. | erledigt |
| **D-69** Personen-Karte | Wie gewünscht: Kopf Avatar 32 · h4 · Status-Chip; Chips freigegeben Minze + `check`, offen Lavendel + `clock`, klärt es direkt neutral + `comment`, noch nicht dabei gestrichelt + `user`. `<dl>`-Zeilen ≥ 48 mit Kopieren 44 rechts; «Anzeigen/Verbergen» Sekundär klein + 13 px «geändert am …». **Zusatz:** Zustand „sichtbar“ (Innenring + Etikett, U-40). Masken in `travel-mask-fg` (Tinte 3 = `text-subtle`, 5,1 / 5,9 – etwas heller als `text-muted`, damit „verborgen“ als solches erkennbar ist; ≥ 4,5 erfüllt). Zählkarte ohne Felder/Tasten. 2 Spalten ab 960. | erledigt |
| **D-70** Freigegeben + Protokoll | **Vorhandenes `seal.svg` 40** neben dem h3 (Pop nur beim Freigeben, UM-20; < 22 em: 20 px) – keine neue Datei. Protokoll als ruhige Liste: runde Plakette 28 mit `eye`/`copy` 16, Satz 14/600, Zeit 13 darunter bzw. rechts; Kopf mit `history`. «Freigabe zurückziehen …» destruktiv-leise (Text-Taste `text-muted` + `trash`), Kirsche erst im Sheet. | erledigt |
| **D-71** „Wer bucht?“ | Schalter wie §9.20 in Zeilen ≥ 56 mit Avatar 32 links; gesperrt mit Grund 13 px; Zähler 13/700 tabular; Info «Noch niemand bucht …» mit `id-card`; Reisemenü-Punkt mit `id-card`. Chip blendet beim Einschalten ein (UM-24). | erledigt |

### 13.1 Offen für UI/UX (bitte bestätigen oder anpassen)
| Nr. | Punkt |
|---|---|
| U-39 | **Icon der Löschfrist:** W20 zeigt 🛡 vor «Wird am … gelöscht». Design trennt: `shield` = „wer sieht was“, `clock` = Frist (wie überall im System). In Karte A stehen beide Aussagen in **einer** Schutz-Box mit `shield`; die Löschfrist-Zeile allein (Karte D, Kopfkarte, Fußzeile) trägt `clock`. Bitte bestätigen. |
| U-40 | **Zustand „sichtbar“** in der Personen-Karte („Bucht“ hat «Anzeigen» getippt): Design ergänzt Innenring + Etikett «sichtbar» (eye) im Kopf – Schulterblick-Bewusstsein, nicht nur über den Tastentext. Text-Schlüssel nötig (`travelData.visible` «sichtbar» / «visible»). Bitte in W20 H.7/H.16 aufnehmen oder ablehnen. |
| U-41 | **Status-Chips (D-69):** Icon für „klärt es direkt“ = `comment` (direkt miteinander reden) und „offen“ in Lavendel (Info), **nicht** Amber – es ist kein Problem. Bitte bestätigen. |
| U-42 | **Bestätigung „Dokumentnummer wirklich anfragen?“:** Primär-Taste nicht destruktiv (es löscht nichts), Kopf mit `key` in Amber-Kachel. Bitte bestätigen. |
| U-43 | **Etikett «VORSCHAU» / «PREVIEW»** im Vorschau-Hinweis ist ein neuer Text (Schlüssel z. B. `travelData.demo.tag`). Bitte in H.16 aufnehmen. |

## Changelog
- 2026-10-23 (Runde 7, Inkrement 11): §13 – Antworten D-64–D-71, offene Punkte U-39–U-43; Icons v1.3 (`shield`, `id-card`, `history`, `key`), `empty-travel-data.svg`, `travel-data-deleted.svg`, Tokens v1.3 `--ww-travel-*`, design-system §9.23.
- 2026-10-23 (Runde 6, Inkrement 10): §12 – Antworten D-56–D-63, offene Punkte U-35–U-38; Icons v1.2, `empty-costs.svg`, Tokens v1.2 `--ww-cost-*`, design-system §9.22.
- 2026-10-23 (Runde 5, Inkrement 9): §11 – Antworten D-46–D-55, offene Punkte U-31–U-34; Icons, Platzhalter, Demo-Bilder, Leerzustand, Tokens v1.1, design-system §9.21.
- 2026-10-22 (Runde 4b): §10 C v2 „Reiseverlauf“ – Mockup `mockups/cockpit-reiseverlauf/`, Antworten D-36–D-45, Motion-Umsetzung UM-1–UM-7, Token-Vorschlag, offene Punkte U-23–U-30. UX-8/UX-9 als bestätigt umgesetzt.
- 2026-10-22 (Runde 4): §9 Cockpit-Varianten A–E (Mockup `mockups/cockpit-varianten/`), Prüfpunkte U-17–U-22 für UI/UX.
- 2026-10-08 (Runde 3, v1.0): §5 Struktur-Abweichungen von Richtung B, §6 Antworten an Motion M-D1–M-D9, §7 Antworten D-20–D-35 mit CEO-Entscheidungen (Hochzählen, Kalender U-1, Werkzeugleiste 150 px, Pflichtpunkte, Feier = Vorfreude-Ring), §8 offen: keine.
- 2026-10-08 (Auftraggeber-Entscheidungen): alle Vorbehalte zu Marke, Logo A, Dark Mode, Figtree, Ergebnis-Sichtbarkeit → „bestätigt (Auftraggeber 2026-10-08)"; EN-Name „When do we go?" eingearbeitet; §1b Antwort auf D-19; neue Kleinpunkte U-15, U-16 (§2).
- 2026-10-08 (letzte Runde): §1a Antworten auf D-14–D-18; §2 als erledigt markiert; §3 finaler Status aller D-1–D-18 und U-1–U-14 (D-16 entschieden durch CEO). Abstimmung Design ↔ UI/UX abgeschlossen.
- 2026-10-08 (Abstimmungsrunde): CEO-Entscheide U-1, U-2, U-4 eingearbeitet; U-14 neu; Abschnitt 3 „Abstimmungsstand (Design-Sicht)" mit Status D-1–D-13 / U-1–U-14 und Auftraggeber-Vorbehalten.
- 2026-10-08: Erstfassung; beantwortet D-1 bis D-13 aus `docs/ux/abstimmung-design.md`, neue Punkte U-1 bis U-13.

## CEO-Entscheidungen 2026-10-08 (nach Abstimmung EN-Name)
- **D-19:** „go?“ wird als Einheit in Markenfarbe hervorgehoben (Fragezeichen ohne eigene Farbe/Größe) – Designer-Umsetzung gilt.
- **U-15:** Kopfzeile und W01 mit EN-Namen gelten als geprüft (beide Namen 14 Zeichen, Header-Box 160 px passt bei 360 px).
- **U-16:** `short_name` im Manifest = voller Name je Sprache; Kürzung erst, falls Gerätetests Abschneiden zeigen (Fallback DE „Wollen weg“, EN ungekürzt).
